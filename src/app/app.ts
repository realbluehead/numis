import { Component, inject, signal, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoinStore } from '../services/coin.store';
import { TagService } from '../services/tag.service';
import { SyncService } from '../services/sync.service';
import { I18nService } from '../services/i18n.service';
import { NotificationService } from '../services/notification.service';
import { DialogService } from '../services/dialog.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { GalleryComponent } from '../components/gallery/gallery.component';
import { FiltersComponent } from '../components/filters/filters.component';
import { CoinFormComponent } from '../components/form/coin-form.component';
import { TagManagerComponent } from '../components/tag-manager/tag-manager.component';
import { NotificationComponent } from '../components/notification/notification.component';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { Coin } from '../models/coin.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    GalleryComponent,
    FiltersComponent,
    CoinFormComponent,
    TagManagerComponent,
    NotificationComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <app-notification></app-notification>
    <app-confirm-dialog></app-confirm-dialog>
    <div class="min-h-screen bg-amazon-bg">
      <!-- Header -->
      <header
        class="sticky top-0 z-40 border-b border-amazon-border bg-amazon-bg backdrop-blur-md shadow-xs"
      >
        <div class="w-full px-3 py-2">
          <!-- Top Row: Title (left) + Export/Import/Language (right) -->
          <div class="flex items-center justify-between mb-1.5">
            <!-- Title -->
            <div>
              <h1 class="text-2xl font-display text-amazon-textLight mb-0">
                {{ 'header.title' | translate }}
              </h1>
            </div>

            <!-- Right Controls: Export/Import + Sync + Language Selector -->
            <div class="flex items-center gap-1">
              <button (click)="exportData()" class="btn-sm btn-primary">
                {{ 'header.export' | translate }}
              </button>
              <button (click)="importFile.click()" class="btn-sm btn-primary">
                {{ 'header.import' | translate }}
              </button>

              <!-- Sync Status Indicator -->
              <div class="flex items-center gap-2 px-2 py-1 rounded bg-amazon-surface text-xs">
                <span *ngIf="syncService.syncing()" class="animate-spin">⟳</span>
                <span
                  *ngIf="!syncService.syncing() && syncService.lastSyncTime()"
                  class="text-amazon-success"
                  >✓</span
                >
                <span
                  *ngIf="!syncService.syncing() && !syncService.lastSyncTime()"
                  class="text-amazon-textMuted"
                  >◯</span
                >
                <div class="flex flex-col">
                  <span *ngIf="syncService.syncing()" class="text-amazon-text">{{
                    'header.syncing' | translate
                  }}</span>
                  <span
                    *ngIf="!syncService.syncing() && syncService.lastSyncTime()"
                    class="text-amazon-success"
                  >
                    {{ 'header.lastSync' | translate }}:
                    {{ syncService.lastSyncTime() | date: 'short' }}
                  </span>
                  <span
                    *ngIf="!syncService.syncing() && !syncService.lastSyncTime()"
                    class="text-amazon-textMuted"
                  >
                    {{ 'header.neverSynced' | translate }}
                  </span>
                </div>
              </div>

              <!-- Error Alert -->
              <span
                *ngIf="syncService.syncError()"
                class="text-xs text-amazon-danger px-2 py-1 rounded cursor-pointer hover:bg-amazon-card"
                (click)="dismissSyncError()"
                title="Click to dismiss"
              >
                ⚠️ {{ syncService.syncError() }}
              </span>

              <!-- Sync Now Button -->
              <button
                (click)="syncNow()"
                [disabled]="syncService.syncing()"
                class="btn-sm bg-amazon-orange hover:bg-amazon-orangeHover border-0 disabled:opacity-50"
                [title]="syncService.syncing() ? 'Syncing...' : 'Sync now'"
              >
                {{ syncService.syncing() ? '⟳' : '↻' }}
              </button>

              <!-- Force Refresh Button -->
              <button
                (click)="forceRefresh()"
                [disabled]="syncService.syncing()"
                class="btn-sm bg-blue-700 hover:bg-blue-600 border-0 disabled:opacity-50"
                [title]="syncService.syncing() ? 'Syncing...' : 'Force refresh from server'"
              >
                ⬇️
              </button>

              <!-- CouchDB Credentials Button -->
              <button
                (click)="openCredentialsModal()"
                class="btn-sm bg-gray-700 hover:bg-gray-600 border-0"
                title="CouchDB credentials"
              >
                ⚙️
              </button>

              <!-- Language Selector Dropdown -->
              <select
                (change)="onLanguageChange($event)"
                class="btn-sm bg-amazon-orange hover:bg-amazon-orangeHover border-0"
              >
                <option
                  *ngFor="let lang of i18n.getLanguages()"
                  [value]="lang.code"
                  [selected]="lang.code === i18n.language()"
                  class="bg-amazon-card"
                >
                  {{ lang.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex gap-4 text-xs border-t border-amazon-border pt-1">
            <button
              type="button"
              (click)="openFormModal()"
              class="pb-1 font-semibold bg-transparent text-amazon-textMuted hover:text-amazon-textLight border-0 px-0 py-0 rounded-none cursor-pointer"
            >
              {{ 'header.newCoin' | translate }}
            </button>
            <button
              (click)="setActiveTab('gallery')"
              [class.text-amazon-textLight]="activeTab() === 'gallery'"
              [class.border-b-2]="activeTab() === 'gallery'"
              [class.border-amazon-orange]="activeTab() === 'gallery'"
              class="pb-1 btn-tab font-semibold"
            >
              {{ 'header.gallery' | translate }}
            </button>
            <button
              (click)="setActiveTab('tags')"
              [class.text-amazon-textLight]="activeTab() === 'tags'"
              [class.border-b-2]="activeTab() === 'tags'"
              [class.border-amazon-orange]="activeTab() === 'tags'"
              class="pb-1 btn-tab font-semibold"
            >
              {{ 'header.tags' | translate }}
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="relative w-full px-3 py-1.5">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <!-- Filters Sidebar -->
          <aside class="lg:col-span-1 h-fit sticky top-12">
            <app-filters></app-filters>
          </aside>

          <!-- Content Area -->
          <div class="lg:col-span-4">
            <!-- Gallery Tab -->
            <div *ngIf="activeTab() === 'gallery'">
              <app-gallery
                (editRequested)="editCoin($event)"
                (deleteRequested)="deleteCoin($event)"
              >
              </app-gallery>
            </div>

            <!-- Tags Manager Tab -->
            <div *ngIf="activeTab() === 'tags'">
              <app-tag-manager></app-tag-manager>
            </div>
          </div>
        </div>
      </main>

      <!-- Form Modal -->
      <div
        [style.display]="showFormModal() ? 'flex' : 'none'"
        [style.position]="'fixed'"
        [style.inset]="'0'"
        [style.zIndex]="'9999'"
        [style.alignItems]="'center'"
        [style.justifyContent]="'center'"
        [style.backgroundColor]="'rgba(0, 0, 0, 0.5)'"
        [style.width]="'100%'"
        [style.height]="'100%'"
        (click)="closeFormModal()"
      >
        <div
          [style.backgroundColor]="'#0f1419'"
          [style.borderRadius]="'0.5rem'"
          [style.boxShadow]="'0 20px 25px -5px rgba(0, 0, 0, 0.1)'"
          [style.maxWidth]="'75rem'"
          [style.width]="'100%'"
          [style.margin]="'0 1rem'"
          [style.maxHeight]="'90vh'"
          [style.overflowY]="'auto'"
          [style.border]="'1px solid #3d464d'"
          (click)="$event.stopPropagation()"
        >
          <div [style.padding]="'1rem'">
            <app-coin-form [coinToEdit]="coinToEdit()" (formReset)="onFormReset()"> </app-coin-form>
          </div>
        </div>
      </div>

      <!-- Credentials Modal -->
      <div
        *ngIf="showCredentialsModal()"
        [style.position]="'fixed'"
        [style.top]="'0'"
        [style.left]="'0'"
        [style.zIndex]="'50'"
        [style.display]="'flex'"
        [style.alignItems]="'center'"
        [style.justifyContent]="'center'"
        [style.backgroundColor]="'rgba(0, 0, 0, 0.5)'"
        [style.width]="'100%'"
        [style.height]="'100%'"
        (click)="closeCredentialsModal()"
      >
        <div
          [style.backgroundColor]="'#0f1419'"
          [style.borderRadius]="'0.5rem'"
          [style.boxShadow]="'0 20px 25px -5px rgba(0, 0, 0, 0.1)'"
          [style.maxWidth]="'28rem'"
          [style.width]="'100%'"
          [style.margin]="'0 1rem'"
          [style.border]="'1px solid #3d464d'"
          (click)="$event.stopPropagation()"
        >
          <div [style.padding]="'1.5rem'">
            <h2 class="text-lg font-semibold text-amazon-textLight mb-3">CouchDB Credentials</h2>

            <div class="space-y-3">
              <!-- Username Input -->
              <div>
                <label class="block text-xs text-amazon-textMuted mb-1">Username</label>
                <input
                  type="text"
                  [(ngModel)]="credentialsUsername"
                  class="w-full px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-surface text-amazon-text"
                  placeholder="Enter CouchDB username"
                />
              </div>

              <!-- Password Input -->
              <div>
                <label class="block text-xs text-amazon-textMuted mb-1">Password</label>
                <input
                  type="password"
                  [(ngModel)]="credentialsPassword"
                  class="w-full px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-surface text-amazon-text"
                  placeholder="Enter CouchDB password"
                />
              </div>

              <!-- Buttons -->
              <div class="flex gap-2 pt-3">
                <button (click)="closeCredentialsModal()" class="flex-1 btn-sm btn-secondary">
                  Cancel
                </button>
                <button (click)="saveCredentials()" class="flex-1 btn-sm btn-primary">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden file input for import -->
      <input
        #importFile
        type="file"
        accept=".json"
        (change)="handleFileImport($event)"
        class="hidden"
      />
    </div>
  `,
  styles: `
    :host {
      @apply block;
    }
  `,
})
export class App {
  store = inject(CoinStore);
  tagService = inject(TagService);
  i18n = inject(I18nService);
  syncService = inject(SyncService);
  notificationService = inject(NotificationService);
  dialogService = inject(DialogService);
  cdr = inject(ChangeDetectorRef);

  activeTab = signal<'gallery' | 'tags'>('gallery');
  coinToEdit = signal<Coin | null>(null);
  showFormModal = signal(false);
  showCredentialsModal = signal(false);
  credentialsUsername = signal('');
  credentialsPassword = signal('');

  constructor() {
    effect(() => {
      this.showFormModal();
      this.cdr.markForCheck();
    });
  }

  onLanguageChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value as any;
    this.i18n.setLanguage(lang);
  }

  setActiveTab(tab: 'gallery' | 'tags'): void {
    this.activeTab.set(tab);
  }

  openFormModal(): void {
    this.coinToEdit.set(null);
    this.showFormModal.set(true);
    this.cdr.markForCheck();
  }

  editCoin(coin: Coin): void {
    this.coinToEdit.set(coin);
    this.showFormModal.set(true);
    this.cdr.markForCheck();
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.coinToEdit.set(null);
    this.cdr.markForCheck();
  }

  openCredentialsModal(): void {
    this.credentialsUsername.set(this.syncService.username());
    this.credentialsPassword.set(this.syncService.password());
    this.showCredentialsModal.set(true);
  }

  closeCredentialsModal(): void {
    this.showCredentialsModal.set(false);
  }

  saveCredentials(): void {
    const username = this.credentialsUsername();
    const password = this.credentialsPassword();

    if (username && password) {
      this.syncService.setCredentials(username, password);
      this.closeCredentialsModal();
      this.notificationService.success('CouchDB credentials saved successfully');
    } else {
      this.notificationService.warning('Please enter both username and password');
    }
  }

  deleteCoin(coinId: string): void {
    this.store.deleteCoin(coinId);
  }

  onFormReset(): void {
    this.coinToEdit.set(null);
    this.closeFormModal();
  }

  exportData(): void {
    const exportData = {
      coins: JSON.parse(this.store.exportToJSON()),
      tags: JSON.parse(this.tagService.exportTags()),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `numis-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  handleFileImport(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Handle both old format (just array) and new format (with coins/tags)
        if (Array.isArray(data)) {
          // Old format - just coins
          if (this.store.importFromJSON(JSON.stringify(data))) {
            this.notificationService.success(this.i18n.t('message.importSuccess'));
          } else {
            this.notificationService.error(this.i18n.t('message.importError'));
          }
        } else if (data.coins && data.tags) {
          // New format - coins and tags
          // Import tags first to get the ID mapping (old → new)
          let idMapping: Map<string, string> = new Map();
          try {
            idMapping = this.tagService.importTags(JSON.stringify(data.tags));
          } catch (tagError) {
            console.error('Error importing tags:', tagError);
          }

          // Remap the tag IDs in coins before importing
          const remappedCoins = data.coins.map((coin: any) => ({
            ...coin,
            tags: coin.tags.map((oldTagId: string) => idMapping.get(oldTagId) || oldTagId),
          }));

          const coinsOk = this.store.importFromJSON(JSON.stringify(remappedCoins));
          if (coinsOk) {
            this.notificationService.success(this.i18n.t('message.importSuccess'));
          } else {
            this.notificationService.error(this.i18n.t('message.importError'));
          }
        } else {
          this.notificationService.error(this.i18n.t('message.importError'));
        }
      } catch (error) {
        this.notificationService.error(this.i18n.t('message.importError'));
      }
    };
    reader.readAsText(file);
  }

  clearAllData(): void {
    this.dialogService
      .confirm(
        this.i18n.t('message.clearConfirm'),
        this.i18n.t('message.clearConfirmMessage'),
        this.i18n.t('dialog.delete'),
        this.i18n.t('dialog.cancel'),
        true,
      )
      .then((confirmed) => {
        if (confirmed) {
          this.store.clearAll();
          this.tagService.clearAllTags();
          this.notificationService.success(this.i18n.t('message.cleared'));
        }
      });
  }

  dismissSyncError(): void {
    this.syncService.syncError.set(null);
  }

  syncNow(): void {
    this.syncService.syncNow().catch((error) => {
      console.error('Manual sync error:', error);
    });
  }

  forceRefresh(): void {
    this.syncService.forceFullRefresh().catch((error) => {
      console.error('Force refresh error:', error);
    });
  }
}
