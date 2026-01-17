'use client';

/**
 * Project Storage Service - IndexedDB Persistence
 *
 * Provides persistent storage for:
 * - Project state (files, settings, results)
 * - Analysis results (cached for quick reload)
 * - User annotations and metadata
 * - Mixer settings and configurations
 *
 * Uses IndexedDB via idb-keyval pattern for simplicity
 */

const DB_NAME = 'streamlit-audio-research';
const DB_VERSION = 1;

// Store names
const STORES = {
  PROJECTS: 'projects',
  ANNOTATIONS: 'annotations',
  SETTINGS: 'settings',
  CACHE: 'cache',
} as const;

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  files: ProjectFile[];
  settings: ProjectSettings;
  annotations: Annotation[];
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data?: ArrayBuffer; // Stored separately for large files
  metadata: FileMetadata;
}

export interface FileMetadata {
  duration?: number;
  sampleRate?: number;
  channels?: number;
  geolocation?: GeolocationData;
  recordedAt?: Date;
  notes?: string;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: Date;
  placeName?: string;
}

export interface Annotation {
  id: string;
  fileId: string;
  startTime: number;
  endTime: number;
  label: string;
  category?: string;
  color?: string;
  notes?: string;
  createdAt: Date;
}

export interface ProjectSettings {
  tempo?: number;
  key?: string;
  timeSignature?: string;
  mixerState?: MixerState;
}

export interface MixerState {
  tracks: TrackState[];
  masterVolume: number;
}

export interface TrackState {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
}

let db: IDBDatabase | null = null;

/**
 * Initialize the database
 */
async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Projects store
      if (!database.objectStoreNames.contains(STORES.PROJECTS)) {
        const projectStore = database.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Annotations store
      if (!database.objectStoreNames.contains(STORES.ANNOTATIONS)) {
        const annotationStore = database.createObjectStore(STORES.ANNOTATIONS, { keyPath: 'id' });
        annotationStore.createIndex('fileId', 'fileId', { unique: false });
        annotationStore.createIndex('projectId', 'projectId', { unique: false });
      }

      // Settings store
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }

      // Cache store (for analysis results)
      if (!database.objectStoreNames.contains(STORES.CACHE)) {
        const cacheStore = database.createObjectStore(STORES.CACHE, { keyPath: 'key' });
        cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
}

/**
 * Save a project
 */
export async function saveProject(project: Project): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.PROJECTS, 'readwrite');
    const store = transaction.objectStore(STORES.PROJECTS);

    project.updatedAt = new Date();

    const request = store.put(project);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load a project by ID
 */
export async function loadProject(id: string): Promise<Project | null> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.PROJECTS, 'readonly');
    const store = transaction.objectStore(STORES.PROJECTS);

    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * List all projects
 */
export async function listProjects(): Promise<Project[]> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.PROJECTS, 'readonly');
    const store = transaction.objectStore(STORES.PROJECTS);
    const index = store.index('updatedAt');

    const request = index.openCursor(null, 'prev'); // Most recent first
    const projects: Project[] = [];

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        projects.push(cursor.value);
        cursor.continue();
      } else {
        resolve(projects);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.PROJECTS, 'readwrite');
    const store = transaction.objectStore(STORES.PROJECTS);

    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save annotations for a file
 */
export async function saveAnnotations(annotations: Annotation[]): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.ANNOTATIONS, 'readwrite');
    const store = transaction.objectStore(STORES.ANNOTATIONS);

    annotations.forEach(annotation => {
      store.put(annotation);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Load annotations for a file
 */
export async function loadAnnotations(fileId: string): Promise<Annotation[]> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.ANNOTATIONS, 'readonly');
    const store = transaction.objectStore(STORES.ANNOTATIONS);
    const index = store.index('fileId');

    const request = index.getAll(fileId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a setting
 */
export async function saveSetting(key: string, value: unknown): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.SETTINGS, 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);

    const request = store.put({ key, value, updatedAt: new Date() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load a setting
 */
export async function loadSetting<T>(key: string, defaultValue: T): Promise<T> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.SETTINGS, 'readonly');
    const store = transaction.objectStore(STORES.SETTINGS);

    const request = store.get(key);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.value : defaultValue);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Cache analysis results
 */
export async function cacheResult(
  key: string,
  value: unknown,
  ttlMs: number = 24 * 60 * 60 * 1000 // Default 24 hours
): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.CACHE);

    const request = store.put({
      key,
      value,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + ttlMs),
    });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get cached result
 */
export async function getCachedResult<T>(key: string): Promise<T | null> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.CACHE, 'readonly');
    const store = transaction.objectStore(STORES.CACHE);

    const request = store.get(key);
    request.onsuccess = () => {
      const result = request.result;
      if (!result) {
        resolve(null);
        return;
      }

      // Check expiry
      if (new Date(result.expiresAt) < new Date()) {
        // Expired - delete and return null
        deleteCache(key);
        resolve(null);
        return;
      }

      resolve(result.value);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete cached item
 */
async function deleteCache(key: string): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.CACHE);

    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear expired cache entries
 */
export async function cleanupCache(): Promise<number> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.CACHE);
    const index = store.index('expiresAt');

    const now = new Date();
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);
    let deletedCount = 0;

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        deletedCount++;
        cursor.continue();
      } else {
        resolve(deletedCount);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new project
 */
export function createProject(name: string): Project {
  return {
    id: generateId(),
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
    files: [],
    settings: {},
    annotations: [],
  };
}

const projectStorage = {
  saveProject,
  loadProject,
  listProjects,
  deleteProject,
  saveAnnotations,
  loadAnnotations,
  saveSetting,
  loadSetting,
  cacheResult,
  getCachedResult,
  cleanupCache,
  generateId,
  createProject,
};

export default projectStorage;
