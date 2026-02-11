import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinStore } from '../../services/coin.store';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TagCategoryPipe, TagValuePipe } from '../../pipes/tag-format.pipe';
import { Coin } from '../../models/coin.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TagCategoryPipe, TagValuePipe],
  template: `
    <div class="space-y-3">
      <!-- Header -->
      <div class="border-b border-velvet-800 pb-3">
        <h2 class="text-2xl font-display text-white mb-1">
          {{ 'gallery.title' | translate }}
        </h2>
        <p class="text-velvet-400 text-xs font-medium">
          {{ store.filteredCoins().length }} {{ 'gallery.coinsCount' | translate }}
        </p>
      </div>

      <!-- Gallery Grid -->
      <div
        *ngIf="store.filteredCoins().length > 0; else emptyState"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3"
      >
        <div
          *ngFor="let coin of store.filteredCoins()"
          class="group relative rounded-lg overflow-hidden bg-velvet-800 border border-velvet-700 shadow-soft hover:shadow-gentle transition-all duration-300 cursor-pointer hover:border-velvet-600"
          (click)="selectCoin(coin)"
        >
          <!-- Image Container -->
          <div
            class="aspect-video overflow-hidden bg-velvet-900 relative flex items-center justify-center"
          >
            <img
              *ngIf="coin.images.length > 0"
              [src]="coin.images[0]"
              alt="Moneda"
              class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
            <div
              *ngIf="coin.images.length === 0"
              class="w-full h-full flex items-center justify-center text-velvet-700"
            >
              <span class="text-xs font-medium">{{ 'gallery.noImage' | translate }}</span>
            </div>
          </div>

          <!-- Info Overlay -->
          <div class="p-3 space-y-2 bg-gradient-to-b from-velvet-800 to-velvet-900">
            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5">
              <span
                *ngFor="let tag of coin.tags"
                class="inline-block text-xs px-2 py-0.5 bg-velvet-700/60 text-velvet-200 rounded-full border border-velvet-600 font-medium"
              >
                {{ tag.category | tagCategory }}: {{ tag.value | tagValue }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex gap-1.5 pt-1.5 border-t border-velvet-700">
              <button
                (click)="editCoin($event, coin)"
                class="flex-1 px-2.5 py-1.5 text-xs bg-velvet-700 hover:bg-velvet-600 text-white rounded-lg transition-colors font-medium"
              >
                {{ 'gallery.edit' | translate }}
              </button>
              <button
                (click)="deleteCoin($event, coin.id)"
                class="flex-1 px-2.5 py-1.5 text-xs bg-velvet-700/60 hover:bg-velvet-700 text-velvet-200 rounded-lg transition-colors font-medium"
              >
                {{ 'gallery.delete' | translate }}
              </button>
            </div>
          </div>

          <!-- Multi-image indicator -->
          <div
            *ngIf="coin.images.length > 1"
            class="absolute top-2 right-2 bg-velvet-700/90 text-white text-xs px-2 py-0.5 rounded-full font-medium"
          >
            +{{ coin.images.length - 1 }}
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <ng-template #emptyState>
        <div
          class="flex flex-col items-center justify-center py-12 px-6 rounded-lg border-2 border-dashed border-velvet-700 bg-velvet-900/40"
        >
          <p class="text-velvet-300 text-lg mb-1 font-semibold">
            {{ 'gallery.empty' | translate }}
          </p>
          <p class="text-velvet-500 text-xs">{{ 'gallery.emptyHint' | translate }}</p>
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
  store = inject(CoinStore);
  i18n = inject(I18nService);

  editRequested = output<Coin>();
  deleteRequested = output<string>();

  selectCoin(coin: Coin): void {
    // Could display a modal or detailed view
  }

  editCoin(event: Event, coin: Coin): void {
    event.stopPropagation();
    this.editRequested.emit(coin);
  }

  deleteCoin(event: Event, coinId: string): void {
    event.stopPropagation();
    if (confirm(this.i18n.t('gallery.deleteConfirm'))) {
      this.store.deleteCoin(coinId);
    }
  }
}
