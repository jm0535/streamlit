import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Local Storage Service for Audio Data Management
export interface StoredAudioFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: ArrayBuffer;
  metadata: {
    duration?: number;
    sampleRate?: number;
    bitDepth?: number;
    channels?: number;
    format?: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    notes?: string;
  };
}

export interface StoredProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    audioFormat: string;
    quality: string;
    sampleRate: number;
    bitDepth: number;
  };
  files: string[];
  metadata: {
    genre?: string;
    tempo?: number;
    key?: string;
    artist?: string;
    album?: string;
    year?: number;
    tags: string[];
  };
}

export interface StoredSettings {
  audio: {
    sampleRate: number;
    bitDepth: number;
    bufferSize: number;
    inputDevice?: string;
    outputDevice?: string;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    autoSave: boolean;
    showTooltips: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    usageStats: boolean;
  };
}

class LocalStorageService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'streamlit_audio_db';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Audio files store
        if (!db.objectStoreNames.contains('audioFiles')) {
          const audioStore = db.createObjectStore('audioFiles', { keyPath: 'id' });
          audioStore.createIndex('name', 'name');
          audioStore.createIndex('createdAt', 'metadata.createdAt');
        }

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('name', 'name');
          projectStore.createIndex('createdAt', 'createdAt');
          projectStore.createIndex('updatedAt', 'updatedAt');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  async storeAudioFile(file: File, metadata: Partial<StoredAudioFile['metadata']>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const reader = new FileReader();

      reader.onload = () => {
        const audioFile: StoredAudioFile = {
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result as ArrayBuffer,
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            ...metadata,
          },
        };

        const request = this.db!.transaction(['audioFiles'], 'readwrite')
          .objectStore('audioFiles')
          .put(audioFile);

        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  async getAudioFile(id: string): Promise<StoredAudioFile | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const request = this.db!.transaction(['audioFiles'], 'readonly')
        .objectStore('audioFiles')
        .get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAudioFiles(): Promise<StoredAudioFile[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const request = this.db!.transaction(['audioFiles'], 'readonly')
        .objectStore('audioFiles')
        .getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAudioFile(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const request = this.db!.transaction(['audioFiles'], 'readwrite')
        .objectStore('audioFiles')
        .delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async createProject(project: Omit<StoredProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newProject: StoredProject = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      const request = this.db!.transaction(['projects'], 'readwrite')
        .objectStore('projects')
        .put(newProject);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProjects(): Promise<StoredProject[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const request = this.db!.transaction(['projects'], 'readonly')
        .objectStore('projects')
        .getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveSettings(settings: StoredSettings): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const request = this.db!.transaction(['settings'], 'readwrite')
        .objectStore('settings')
        .put({ ...settings, id: 'user' });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSettings(): Promise<StoredSettings | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const request = this.db!.transaction(['settings'], 'readonly')
        .objectStore('settings')
        .get('user');

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageInfo(): Promise<{
    used: number;
    available: number;
    files: number;
    projects: number;
  }> {
    const files = await this.getAllAudioFiles();
    const projects = await this.getAllProjects();
    
    const used = files.reduce((total, file) => total + file.size, 0);
    
    // Estimate available storage
    const estimate = await navigator.storage.estimate();
    const available = (estimate.quota || 0) - used;

    return {
      used,
      available,
      files: files.length,
      projects: projects.length,
    };
  }
}

export const localStorageService = new LocalStorageService();

export const initializeLocalStorage = async (): Promise<void> => {
  try {
    await localStorageService.init();
    console.log('Local storage initialized successfully');
  } catch (error) {
    console.error('Failed to initialize local storage:', error);
    console.warn('Falling back to localStorage for basic functionality');
  }
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const checkStorageQuota = async (): Promise<{
  used: number;
  quota: number;
  available: number;
  percentage: number;
}> => {
  const estimate = await navigator.storage.estimate();
  const used = estimate.usage || 0;
  const quota = estimate.quota || 0;
  const available = quota - used;
  const percentage = quota > 0 ? (used / quota) * 100 : 0;

  return { used, quota, available, percentage };
};
