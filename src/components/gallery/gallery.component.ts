import { Component, inject, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinStore } from '../../services/coin.store';
import { TagService } from '../../services/tag.service';
import { I18nService } from '../../services/i18n.service';
import { DialogService } from '../../services/dialog.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TagCategoryPipe, TagValuePipe } from '../../pipes/tag-format.pipe';
import { Coin } from '../../models/coin.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TagCategoryPipe, TagValuePipe],
  template: `
    <div class="space-y-1.5">
      <!-- Header -->
      <div class="border-b border-amazon-border pb-1.5">
        <h2 class="text-lg font-display text-amazon-textLight mb-0.5">
          {{ 'gallery.title' | translate }}
        </h2>
        <p class="text-amazon-textMuted text-xs font-medium">
          {{ store.filteredCoins().length }} {{ 'gallery.coinsCount' | translate }}
        </p>
      </div>

      <!-- Columns Slider -->
      <div class="flex items-center gap-2 py-1.5">
        <label class="text-xs text-amazon-textMuted font-medium">Columnas:</label>
        <input
          type="range"
          min="1"
          max="16"
          [value]="columnsCount()"
          (input)="columnsCount.set(+$event.target.value)"
          class="flex-1"
        />
        <span class="text-xs text-amazon-text font-semibold w-6 text-center">{{
          columnsCount()
        }}</span>
      </div>

      <!-- Gallery Grid -->
      <div
        *ngIf="store.filteredCoins().length > 0; else emptyState"
        class="gap-1.5"
        [ngStyle]="{ display: 'grid', gridTemplateColumns: 'repeat(' + columnsCount() + ', 1fr)' }"
      >
        <div
          *ngFor="let coin of store.filteredCoins()"
          class="group relative rounded overflow-hidden bg-amazon-card border border-amazon-border shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer hover:border-amazon-orange"
          (click)="selectCoin(coin)"
        >
          <!-- Image Container -->
          <div
            class="aspect-video overflow-hidden bg-amazon-surface relative flex items-center justify-center"
          >
            <img
              *ngIf="coin.images.length > 0"
              [src]="coin.images[0]"
              alt="Moneda"
              class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <div
              *ngIf="coin.images.length === 0"
              class="w-full h-full flex items-center justify-center text-amazon-textMuted"
            >
              <span class="text-xs font-medium">{{ 'gallery.noImage' | translate }}</span>
            </div>
          </div>

          <!-- Info Overlay -->
          <div class="p-1.5 space-y-1 bg-amazon-card">
            <!-- Reference -->
            <div class="flex flex-wrap gap-1">
              <span
                *ngIf="coin.reference"
                class="inline-block text-xs px-2 py-0.5 bg-gray-700 text-gray-100 rounded-full font-medium"
              >
                {{ coin.reference }}
              </span>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1">
              <span
                *ngFor="let tagId of coin.tags"
                class="inline-block text-xs px-1.5 py-0.5 badge"
              >
                <ng-container *ngIf="getTagInfo(tagId) as tagInfo">
                  {{ tagInfo.category | tagCategory }}: {{ tagInfo.value | tagValue }}
                </ng-container>
              </span>
            </div>

            <!-- Actions -->
            <div class="flex gap-1 pt-1 divider">
              <button (click)="editCoin($event, coin)" class="flex-1 btn-sm btn-primary">
                {{ 'gallery.edit' | translate }}
              </button>
              <button (click)="deleteCoin($event, coin.id)" class="flex-1 btn-sm btn-danger">
                {{ 'gallery.delete' | translate }}
              </button>
            </div>
          </div>

          <!-- Multi-image indicator -->
          <div
            *ngIf="coin.images.length > 1"
            class="absolute top-1 right-1 bg-amazon-surface/90 text-amazon-text text-xs px-1.5 py-0.5 rounded-full font-medium"
          >
            +{{ coin.images.length - 1 }}
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <ng-template #emptyState>
        <div
          class="flex flex-col items-center justify-center py-8 px-4 rounded border border-dashed border-amazon-border bg-amazon-surface/30"
        >
          <p class="text-amazon-text text-base mb-1 font-semibold">
            {{ 'gallery.empty' | translate }}
          </p>
          <p class="text-amazon-textMuted text-xs">{{ 'gallery.emptyHint' | translate }}</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: `
    :host {
      @apply block;
    }
  `,
})
export class GalleryComponent {
  private readonly COLUMNS_STORAGE_KEY = 'numis-gallery-columns';

  store = inject(CoinStore);
  tagService = inject(TagService);
  i18n = inject(I18nService);
  dialogService = inject(DialogService);

  columnsCount = signal(this.loadColumnsFromStorage());

  editRequested = output<Coin>();
  deleteRequested = output<string>();

  constructor() {
    // Save to localStorage when columnsCount changes
    effect(() => {
      const columns = this.columnsCount();
      localStorage.setItem(this.COLUMNS_STORAGE_KEY, String(columns));
    });
  }

  private loadColumnsFromStorage(): number {
    const stored = localStorage.getItem(this.COLUMNS_STORAGE_KEY);
    if (stored) {
      const value = parseInt(stored, 10);
      if (value >= 1 && value <= 16) {
        return value;
      }
    }
    return 8; // Default to 8 columns
  }

  getTagInfo(tagId: string): { category: string; value: string } | null {
    return this.tagService.getTag(tagId) || null;
  }

  selectCoin(coin: Coin): void {
    // Could display a modal or detailed view
  }

  editCoin(event: Event, coin: Coin): void {
    event.stopPropagation();
    this.editRequested.emit(coin);
  }

  deleteCoin(event: Event, coinId: string): void {
    event.stopPropagation();
    this.dialogService
      .confirm(
        this.i18n.t('gallery.deleteConfirm'),
        this.i18n.t('gallery.deleteConfirmMessage'),
        this.i18n.t('dialog.delete'),
        this.i18n.t('dialog.cancel'),
        true,
      )
      .then((confirmed) => {
        if (confirmed) {
          this.store.deleteCoin(coinId);
        }
      });
  }
}
