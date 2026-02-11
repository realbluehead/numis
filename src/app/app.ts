import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoinStore } from '../services/coin.store';
import { TagService } from '../services/tag.service';
import { I18nService } from '../services/i18n.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { GalleryComponent } from '../components/gallery/gallery.component';
import { FiltersComponent } from '../components/filters/filters.component';
import { CoinFormComponent } from '../components/form/coin-form.component';
import { TagManagerComponent } from '../components/tag-manager/tag-manager.component';
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
  ],
  template: `
    <div class="min-h-screen bg-velvet-950">
      <!-- Header -->
      <header
        class="sticky top-0 z-40 border-b border-velvet-800 bg-velvet-900/95 backdrop-blur-md shadow-soft"
      >
        <div class="max-w-7xl mx-auto px-4 py-3">
          <!-- Top Row: Title (left) + Export/Import/Language (right) -->
          <div class="flex items-center justify-between mb-3">
            <!-- Title -->
            <div>
              <h1 class="text-3xl font-display text-white mb-0.5">
                {{ 'header.title' | translate }}
              </h1>
            </div>

            <!-- Right Controls: Export/Import + Language Selector -->
            <div class="flex items-center gap-2">
              <button
                (click)="exportData()"
                class="px-3 py-1 bg-velvet-700 hover:bg-velvet-600 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {{ 'header.export' | translate }}
              </button>
              <button
                (click)="importFile.click()"
                class="px-3 py-1 bg-velvet-700 hover:bg-velvet-600 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {{ 'header.import' | translate }}
              </button>

              <!-- Language Selector Dropdown -->
              <select
                (change)="onLanguageChange($event)"
                class="px-3 py-1 rounded-lg text-xs font-semibold bg-velvet-700 hover:bg-velvet-600 text-white border border-velvet-600 focus:outline-none focus:ring-2 focus:ring-velvet-500 transition-colors cursor-pointer"
              >
                <option
                  *ngFor="let lang of i18n.getLanguages()"
                  [value]="lang.code"
                  [selected]="lang.code === i18n.language()"
                >
                  {{ lang.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex gap-6 text-sm border-t border-velvet-800 pt-2">
            <button
              (click)="setActiveTab('form')"
              [class.text-white]="activeTab() === 'form'"
              [class.border-b-2]="activeTab() === 'form'"
              [class.border-velvet-500]="activeTab() === 'form'"
              class="pb-1.5 text-velvet-500 hover:text-velvet-400 transition-colors font-semibold"
            >
              {{ 'header.newCoin' | translate }}
            </button>
            <button
              (click)="setActiveTab('gallery')"
              [class.text-white]="activeTab() === 'gallery'"
              [class.border-b-2]="activeTab() === 'gallery'"
              [class.border-velvet-500]="activeTab() === 'gallery'"
              class="pb-1.5 text-velvet-500 hover:text-velvet-400 transition-colors font-semibold"
            >
              {{ 'header.gallery' | translate }}
            </button>
            <button
              (click)="setActiveTab('tags')"
              [class.text-white]="activeTab() === 'tags'"
              [class.border-b-2]="activeTab() === 'tags'"
              [class.border-velvet-500]="activeTab() === 'tags'"
              class="pb-1.5 text-velvet-500 hover:text-velvet-400 transition-colors font-semibold"
            >
              {{ 'header.tags' | translate }}
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="relative max-w-7xl mx-auto px-4 py-3">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <!-- Filters Sidebar -->
          <aside class="lg:col-span-1 h-fit sticky top-16">
            <app-filters></app-filters>
          </aside>

          <!-- Content Area -->
          <div class="lg:col-span-3">
            <!-- Form Tab -->
            <div *ngIf="activeTab() === 'form'">
              <app-coin-form [coinToEdit]="coinToEdit()" (formReset)="onFormReset()">
              </app-coin-form>
            </div>

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

  activeTab = signal<'form' | 'gallery' | 'tags'>('gallery');
  coinToEdit = signal<Coin | null>(null);

  onLanguageChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value as any;
    this.i18n.setLanguage(lang);
  }

  setActiveTab(tab: 'form' | 'gallery' | 'tags'): void {
    this.activeTab.set(tab);
  }

  editCoin(coin: Coin): void {
    this.coinToEdit.set(coin);
    this.activeTab.set('form');
  }

  deleteCoin(coinId: string): void {
    this.store.deleteCoin(coinId);
  }

  onFormReset(): void {
    this.coinToEdit.set(null);
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
            alert(this.i18n.t('message.importSuccess'));
          } else {
            alert(this.i18n.t('message.importError'));
          }
        } else if (data.coins && data.tags) {
          // New format - coins and tags
          const coinsOk = this.store.importFromJSON(JSON.stringify(data.coins));
          try {
            this.tagService.importTags(JSON.stringify(data.tags));
          } catch (tagError) {
            console.error('Error importing tags:', tagError);
          }
          if (coinsOk) {
            alert(this.i18n.t('message.importSuccess'));
          } else {
            alert(this.i18n.t('message.importError'));
          }
        } else {
          alert(this.i18n.t('message.importError'));
        }
      } catch (error) {
        alert(this.i18n.t('message.importError'));
      }
    };
    reader.readAsText(file);
  }

  clearAllData(): void {
    if (confirm(this.i18n.t('message.clearConfirm'))) {
      this.store.clearAll();
      this.tagService.clearAllTags();
    }
  }
}
