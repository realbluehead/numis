import { Injectable, inject } from '@angular/core';
import { signal, effect } from '@angular/core';
import PouchDB from 'pouchdb-browser';
import { CoinStore } from './coin.store';
import { TagService } from './tag.service';
import { I18nService } from './i18n.service';

interface SyncData {
  coins: any[];
  tags: any[];
}

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private store = inject(CoinStore);
  private tagService = inject(TagService);
  private i18n = inject(I18nService);

  private db: PouchDB.Database | null = null;
  syncing = signal(false);
  lastSyncTime = signal<Date | null>(null);
  syncError = signal<string | null>(null);
  username = signal<string>('');
  password = signal<string>('');

  private readonly DB_NAME = 'numis-local';
  private readonly REMOTE_URL_BASE = 'http://localhost:5984/numis';

  constructor() {
    this.loadCredentials();
    this.initializeDatabase();

    // Auto-sync to PouchDB when coins or tags change
    effect(() => {
      // Touch coins and tags to track changes
      this.store.coins();
      this.tagService.getTags();

      // Debounce the sync to avoid too frequent saves
      // Only save if database is initialized
      if (this.db && !this.syncing()) {
        setTimeout(() => {
          this.saveLocally().catch((error) => {
            console.error('Auto-sync error:', error);
          });
        }, 500); // Debounce for 500ms
      }
    });

    // Auto-sync to server periodically (every 30 seconds)
    let serverSyncTimeout: any;
    effect(() => {
      // Touch coins and tags to track changes
      this.store.coins();
      this.tagService.getTags();

      // Clear existing timeout if it exists
      if (serverSyncTimeout) {
        clearTimeout(serverSyncTimeout);
      }

      // Set a new timeout for server sync
      if (this.db && !this.syncing()) {
        serverSyncTimeout = setTimeout(() => {
          this.syncWithServerInternal().catch((error) => {
            console.error('Server auto-sync error:', error);
          });
        }, 30000); // Server sync every 30 seconds
      }

      return () => {
        if (serverSyncTimeout) {
          clearTimeout(serverSyncTimeout);
        }
      };
    });
  }

  private loadCredentials(): void {
    const saved = localStorage.getItem('numis-couchdb-credentials');
    if (saved) {
      try {
        const { username, password } = JSON.parse(saved);
        this.username.set(username);
        this.password.set(password);
      } catch (e) {
        console.error('Error loading credentials:', e);
      }
    }
  }

  setCredentials(username: string, password: string): void {
    this.username.set(username);
    this.password.set(password);
    localStorage.setItem('numis-couchdb-credentials', JSON.stringify({ username, password }));
  }

  private getRemoteURL(): string {
    const username = this.username();
    const password = this.password();

    if (username && password) {
      return `http://${encodeURIComponent(username)}:${encodeURIComponent(password)}@localhost:5984/numis`;
    }

    return this.REMOTE_URL_BASE;
  }

  private initializeDatabase(): void {
    try {
      this.db = new PouchDB(this.DB_NAME);
      console.log('PouchDB initialized successfully');
    } catch (error) {
      console.error('Error initializing PouchDB:', error);
      this.syncError.set('Failed to initialize local database');
    }
  }

  async saveLocally(): Promise<void> {
    if (!this.db) {
      this.syncError.set('Local database not initialized');
      return;
    }

    try {
      // Get current data
      const coins = this.store.coins();
      const tags = this.tagService.getTags();

      // Create a document with all data
      const docId = 'numis-data';
      let existingDoc: any = null;

      try {
        existingDoc = await this.db.get(docId);
      } catch (err: any) {
        if (err.status !== 404) {
          throw err;
        }
      }

      const syncData: SyncData & { _id: string; _rev?: string } = {
        _id: docId,
        coins,
        tags,
      };

      if (existingDoc?._rev) {
        syncData._rev = existingDoc._rev;
      }

      await this.db.put(syncData);
    } catch (error: any) {
      console.error('Error saving to PouchDB:', error);
      this.syncError.set(`Failed to save locally: ${error.message || error}`);
    }
  }

  async saveLocallyWithNotification(): Promise<void> {
    this.syncing.set(true);
    this.syncError.set(null);

    try {
      await this.saveLocally();
      this.lastSyncTime.set(new Date());
      this.syncing.set(false);
    } catch (error: any) {
      console.error('Error saving to PouchDB:', error);
      this.syncError.set(`Failed to save locally: ${error.message || error}`);
      this.syncing.set(false);
    }
  }

  async syncWithServer(): Promise<void> {
    if (!this.db) {
      this.syncError.set('Local database not initialized');
      return;
    }

    try {
      this.syncing.set(true);
      this.syncError.set(null);

      console.log('Starting manual sync...');

      // First save locally
      await this.saveLocally();
      console.log('✓ Local data saved');

      // Then replicate with server
      const replicateOptions = {
        live: false,
        retry: false,
      };

      // Pull from server (get latest data)
      console.log('Pulling changes from CouchDB server...');
      const pullResult = await this.db.replicate.from(this.getRemoteURL(), replicateOptions);
      console.log('Pull result:', pullResult);

      // Always reload data from local after pull
      console.log('Reloading UI data from local database...');
      await this.loadFromLocal();

      // Push to server (send local data)
      console.log('Pushing local changes to CouchDB server...');
      const pushResult = await this.db.replicate.to(this.getRemoteURL(), replicateOptions);
      console.log('Push result:', pushResult);

      this.lastSyncTime.set(new Date());
      this.syncing.set(false);
      console.log('✓ Sync complete');
    } catch (error: any) {
      console.error('Error syncing with server:', error);
      this.syncError.set(`Sync failed: ${error.message || error}`);
      this.syncing.set(false);

      // If sync fails, still keep local data saved
      if (error.message?.includes('403') || error.message?.includes('401')) {
        this.syncError.set('Authentication required for server sync');
      } else if (error.message?.includes('ECONNREFUSED')) {
        this.syncError.set('Cannot connect to CouchDB server at localhost:5984');
      }
    }
  }

  private async syncWithServerInternal(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      this.syncError.set(null);

      // First save locally to ensure local changes are persisted
      await this.saveLocally();

      // Then replicate with server
      const replicateOptions = {
        live: false,
        retry: false,
      };

      // Pull from server (get latest data)
      const pullResult = await this.db.replicate.from(this.getRemoteURL(), replicateOptions);
      console.log('Auto-sync pull:', {
        docs_read: pullResult?.docs_read,
        docs_written: pullResult?.docs_written,
      });

      // Always reload data from local after pull to catch any changes
      await this.loadFromLocal();

      // Push to server (send local data)
      const pushResult = await this.db.replicate.to(this.getRemoteURL(), replicateOptions);
      console.log('Auto-sync push:', {
        docs_read: pushResult?.docs_read,
        docs_written: pushResult?.docs_written,
      });

      this.lastSyncTime.set(new Date());
    } catch (error: any) {
      console.error('Auto-sync error:', error);
      // Silently fail for auto-sync
    }
  }

  private hasCoinsChanged(newCoins: any[]): boolean {
    const currentCoins = this.store.coins();

    // Different lengths means data changed
    if (currentCoins.length !== newCoins.length) {
      return true;
    }

    // Compare JSON strings for deep equality
    return JSON.stringify(currentCoins) !== JSON.stringify(newCoins);
  }

  private hasTagsChanged(newTags: any[]): boolean {
    const currentTags = this.tagService.getTags();

    // Different lengths means data changed
    if (currentTags.length !== newTags.length) {
      return true;
    }

    // Compare JSON strings for deep equality
    return JSON.stringify(currentTags) !== JSON.stringify(newTags);
  }

  async loadFromLocal(): Promise<boolean> {
    if (!this.db) {
      this.syncError.set('Local database not initialized');
      return false;
    }

    try {
      const doc: any = await this.db.get('numis-data');

      if (doc && doc.coins && doc.tags) {
        console.log(
          'Loading data from local database... Coins:',
          doc.coins.length,
          'Tags:',
          doc.tags.length,
        );

        // Only import coins if they have actually changed
        if (this.hasCoinsChanged(doc.coins)) {
          console.log('Coins have changed, updating...');
          this.store.importFromJSON(JSON.stringify(doc.coins));
        } else {
          console.log('No changes in coins');
        }

        // Only import tags if they have actually changed
        if (this.hasTagsChanged(doc.tags)) {
          console.log('Tags have changed, updating...');
          this.tagService.replaceTags(JSON.stringify(doc.tags));
        } else {
          console.log('No changes in tags');
        }

        return true;
      }
    } catch (error: any) {
      if (error.status !== 404) {
        console.error('Error loading from PouchDB:', error);
        this.syncError.set(`Failed to load from local: ${error.message || error}`);
      }
    }

    return false;
  }

  async syncNow(): Promise<void> {
    console.log('Manual sync triggered by user');
    this.syncing.set(true);
    try {
      await this.syncWithServer();
    } finally {
      this.syncing.set(false);
    }
  }

  async forceFullRefresh(): Promise<void> {
    console.log('Force refresh: Clearing local data and pulling fresh from server...');
    if (!this.db) {
      return;
    }

    this.syncing.set(true);
    try {
      // Delete local document to force full refresh
      try {
        const doc: any = await this.db.get('numis-data');
        await this.db.remove(doc);
        console.log('Deleted local numis-data document');
      } catch (err: any) {
        if (err.status !== 404) {
          console.error('Error removing document:', err);
        }
      }

      // Pull everything fresh from server
      const replicateOptions = {
        live: false,
        retry: false,
      };

      console.log('Pulling all data from CouchDB server...');
      await this.db.replicate.from(this.getRemoteURL(), replicateOptions);

      // Load the fresh data into UI
      console.log('Loading fresh data into UI...');
      await this.loadFromLocal();
      console.log('Force refresh complete');
      this.lastSyncTime.set(new Date());
    } catch (error: any) {
      console.error('Error in force refresh:', error);
      this.syncError.set(`Force refresh failed: ${error.message || error}`);
    } finally {
      this.syncing.set(false);
    }
  }

  async startContinuousSync(): Promise<void> {
    if (!this.db) {
      this.syncError.set('Local database not initialized');
      return;
    }

    try {
      this.syncing.set(true);

      // Start continuous sync
      const handler = this.db.sync(this.getRemoteURL(), {
        live: true,
        retry: true,
      });

      handler
        .on('change', (info) => {
          console.log('Sync change:', info);
          this.lastSyncTime.set(new Date());
        })
        .on('error', (error: any) => {
          console.error('Sync error:', error);
          this.syncError.set(`Continuous sync error: ${error.message || error}`);
        })
        .on('complete', () => {
          console.log('Sync complete');
          this.syncing.set(false);
        });
    } catch (error: any) {
      console.error('Error starting continuous sync:', error);
      this.syncError.set(`Failed to start continuous sync: ${error.message || error}`);
      this.syncing.set(false);
    }
  }

  async clearLocalDatabase(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      await this.db.destroy();
      this.db = null;
      this.initializeDatabase();
    } catch (error) {
      console.error('Error clearing local database:', error);
      this.syncError.set('Failed to clear local database');
    }
  }
}
