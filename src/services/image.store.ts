import { Injectable } from '@angular/core';

/**
 * ImageStore manages image blobs using IndexedDB with CouchDB sync support.
 * Images are stored locally in IndexedDB and synchronized to CouchDB as attachments.
 */
@Injectable({
  providedIn: 'root',
})
export class ImageStore {
  private readonly DB_NAME = 'numis-db';
  private readonly STORE_NAME = 'images';
  private readonly METADATA_STORE_NAME = 'image-metadata';
  private readonly DB_VERSION = 2;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase>;

  constructor() {
    this.initPromise = this.initDatabase();
  }

  /**
   * Initializes IndexedDB database with image metadata store
   */
  private initDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Create image store
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
        // Create metadata store for tracking sync status
        if (!db.objectStoreNames.contains(this.METADATA_STORE_NAME)) {
          db.createObjectStore(this.METADATA_STORE_NAME);
        }
      };
    });
  }

  /**
   * Fetches an image from URL and stores it as a blob in IndexedDB.
   * Returns a reference ID for the stored image.
   * @param imageUrl - The URL to fetch the image from
   * @returns Promise<string> - The reference ID of the stored image
   */
  async saveImageFromUrl(imageUrl: string): Promise<string> {
    if (!imageUrl || !this.isValidUrl(imageUrl)) {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }

    // If it's already a local reference, return it as is
    if (this.isLocalReference(imageUrl)) {
      return imageUrl;
    }

    try {
      // Fetch the image
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // Get blob directly (no need for base64 conversion!)
      const blob = await response.blob();

      // Generate a reference ID
      const refId = this.generateRefId(imageUrl);

      // Store blob in IndexedDB
      await this.storeImage(refId, blob);

      return refId;
    } catch (error) {
      console.error(`Error saving image from URL ${imageUrl}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves a stored image blob by reference ID and converts to data URL.
   * @param refId - The reference ID of the stored image
   * @returns The data URL if found, null otherwise
   */
  async getImage(refId: string): Promise<string | null> {
    if (!this.isLocalReference(refId)) {
      return null;
    }

    try {
      const blob = await this.getImageBlob(refId);
      if (!blob) {
        return null;
      }
      return await this.blobToDataUrl(blob);
    } catch (error) {
      console.error(`Error retrieving image ${refId}:`, error);
      return null;
    }
  }

  /**
   * Get the raw blob for an image
   */
  async getImageBlob(refId: string): Promise<Blob | null> {
    if (!this.isLocalReference(refId)) {
      return null;
    }

    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(refId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Stores an image blob in IndexedDB (public wrapper for imports)
   */
  async storeImageBlob(refId: string, blob: Blob): Promise<void> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(blob, refId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Stores an image blob in IndexedDB (private for internal use)
   */
  private async storeImage(refId: string, blob: Blob): Promise<void> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(blob, refId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Deletes an image from IndexedDB
   */
  async deleteImage(refId: string): Promise<void> {
    if (!this.isLocalReference(refId)) {
      return;
    }

    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(refId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Gets all image keys in IndexedDB
   */
  async getAllImageKeys(): Promise<string[]> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve((request.result as string[]) || []);
    });
  }

  /**
   * Clears all images from IndexedDB
   */
  async clearAll(): Promise<void> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Generates a unique reference ID based on URL and timestamp
   */
  private generateRefId(imageUrl: string): string {
    const hash = this.simpleHash(imageUrl);
    const timestamp = Date.now();
    return `img_${hash}_${timestamp}`;
  }

  /**
   * Simple hash function for URLs
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Checks if a string is a local image reference
   */
  private isLocalReference(ref: string): boolean {
    return ref.startsWith('img_');
  }

  /**
   * Validates if a string is a valid URL
   */
  private isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Converts a Blob to a data URL
   */
  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Gets metadata for sync status of an image
   */
  private async getMetadata(refId: string): Promise<any> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.METADATA_STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.METADATA_STORE_NAME);
      const request = store.get(refId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Saves metadata for sync status
   */
  private async saveMetadata(refId: string, metadata: any): Promise<void> {
    const db = await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.METADATA_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.METADATA_STORE_NAME);
      const request = store.put(metadata, refId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Gets all images that need to be synced to CouchDB
   */
  async getImagesPendingSync(): Promise<Array<{ refId: string; blob: Blob; coinId?: string }>> {
    const db = await this.initPromise;
    const keys = await this.getAllImageKeys();
    const pendingImages: Array<{ refId: string; blob: Blob; coinId?: string }> = [];

    for (const refId of keys) {
      const metadata = await this.getMetadata(refId);
      // Only include if not yet synced or if it's been updated since last sync
      if (!metadata?.synced) {
        const blob = await this.getImageBlob(refId);
        if (blob) {
          pendingImages.push({ refId, blob, coinId: metadata?.coinId });
        }
      }
    }

    return pendingImages;
  }

  /**
   * Marks an image as synced to CouchDB
   */
  async markImageSynced(refId: string, attachmentId: string): Promise<void> {
    const metadata = (await this.getMetadata(refId)) || {};
    metadata.synced = true;
    metadata.attachmentId = attachmentId;
    metadata.syncedAt = new Date().toISOString();
    await this.saveMetadata(refId, metadata);
  }

  /**
   * Marks all images as synced
   */
  async markAllImagesSynced(): Promise<void> {
    const db = await this.initPromise;
    const keys = await this.getAllImageKeys();

    for (const refId of keys) {
      const metadata = (await this.getMetadata(refId)) || {};
      metadata.synced = true;
      metadata.syncedAt = new Date().toISOString();
      await this.saveMetadata(refId, metadata);
    }
  }

  /**
   * Saves a blob from a CouchDB attachment
   */
  async saveImageFromAttachment(refId: string, blob: Blob, attachmentId: string): Promise<void> {
    await this.storeImageBlob(refId, blob);
    await this.markImageSynced(refId, attachmentId);
  }
}
