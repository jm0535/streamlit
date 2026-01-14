/**
 * ZIP File Utilities
 * Handles creating and downloading ZIP archives
 */

import JSZip from 'jszip';

export interface FileToZip {
  filename: string;
  data: string | Uint8Array | Blob;
  type?: string;
}

/**
 * Create a ZIP file from multiple files
 */
export async function createZip(files: FileToZip[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    if (typeof file.data === 'string') {
      zip.file(file.filename, file.data);
    } else if (file.data instanceof Blob) {
      const arrayBuffer = await file.data.arrayBuffer();
      zip.file(file.filename, arrayBuffer);
    } else {
      zip.file(file.filename, file.data);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Download ZIP file
 */
export function downloadZip(zipBlob: Blob, filename: string): void {
  const link = document.createElement('a');
  const url = URL.createObjectURL(zipBlob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create and download ZIP file from multiple files
 */
export async function createAndDownloadZip(
  files: FileToZip[],
  filename: string
): Promise<void> {
  const zipBlob = await createZip(files);
  downloadZip(zipBlob, filename);
}
