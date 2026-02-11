import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinStore } from '../../services/coin.store';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TagCategoryPipe, TagValuePipe } from '../../pipes/tag-format.pipe';
import { Pipe, PipeTransform } from '@angular/core';

// Simple pipe for joining arrays
@Pipe({
  name: 'join',
  standalone: true,
})
export class JoinPipe implements PipeTransform {
  transform(value: string[], separator: string = ', '): string {
    return value.join(separator);
  }
}

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, JoinPipe, TranslatePipe, TagCategoryPipe, TagValuePipe],
  template: `
    <div class="space-y-2 p-4 rounded-lg bg-velvet-800 border border-velvet-700 shadow-soft">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-velvet-700 pb-2">
        <h3 class="text-sm font-display text-white">{{ 'filters.title' | translate }}</h3>
        <button
          *ngIf="store.selectedFilters().length > 0"
          (click)="clearFilters()"
          class="text-xs px-2 py-0.5 bg-velvet-700/60 hover:bg-velvet-700 text-velvet-200 rounded-lg transition-colors font-medium"
        >
          {{ 'filters.clearAll' | translate }}
        </button>
      </div>

      <!-- Filter Groups -->
      <div *ngIf="store.allTags().length > 0; else noTags" class="space-y-2">
        <div
          *ngFor="let tagGroup of store.allTags()"
          class="p-3 rounded-lg bg-velvet-900 border border-velvet-700"
        >
          <!-- Category Title -->
          <h4 class="text-xs font-semibold text-white mb-2">{{ tagGroup.category | tagCategory }}</h4>

          <!-- Value Toggles -->
          <div class="space-y-1.5">
            <label
              *ngFor="let value of tagGroup.values"
              class="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                [checked]="isFilterActive(tagGroup.category, value)"
                (change)="toggleFilter(tagGroup.category, value)"
                class="w-3.5 h-3.5 rounded border-velvet-600 bg-velvet-800 checked:bg-velvet-600 cursor-pointer"
              />
              <span class="text-xs text-velvet-300 group-hover:text-white transition-colors">
                {{ value | tagValue }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- No Tags -->
      <ng-template #noTags>
        <p class="text-velvet-500 text-xs italic text-center py-3 font-medium">
          {{ 'filters.noTags' | translate }}
        </p>
      </ng-template>

      <!-- Active Filters Display -->
      <div
        *ngIf="store.selectedFilters().length > 0"
        class="mt-2 p-3 rounded-lg bg-velvet-700/40 border border-velvet-700"
      >
        <p class="text-xs text-white mb-1.5 font-semibold">
          {{ 'filters.activeFilters' | translate }}
        </p>
        <div class="space-y-1">
          <div *ngFor="let filter of store.selectedFilters()" class="text-xs text-velvet-300">
            <span class="font-semibold">{{ filter.category | tagCategory }}:</span>
            <span class="ml-2" *ngFor="let value of filter.values; let last = last">{{ value | tagValue }}<span *ngIf="!last">, </span></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      @apply block;
    }
  `,
})
export class FiltersComponent {
  store = inject(CoinStore);
  i18n = inject(I18nService);

  toggleFilter(category: string, value: string): void {
    this.store.toggleFilter(category, value);
  }

  clearFilters(): void {
    this.store.clearFilters();
  }

  isFilterActive(category: string, value: string): boolean {
    return this.store
      .selectedFilters()
      .some((f) => f.category === category && f.values.includes(value));
  }
}
