import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoinStore } from '../../services/coin.store';
import { TagService } from '../../services/tag.service';
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
  imports: [CommonModule, FormsModule, TranslatePipe, TagCategoryPipe, TagValuePipe],
  template: `
    <div class="space-y-1 p-2 rounded bg-amazon-card border border-amazon-border shadow-xs">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-amazon-border pb-1">
        <h3 class="text-xs font-display text-amazon-text">{{ 'filters.title' | translate }}</h3>
        <button
          *ngIf="store.selectedFilters().length > 0"
          (click)="clearFilters()"
          class="text-xs btn-sm btn-danger"
        >
          {{ 'filters.clearAll' | translate }}
        </button>
      </div>

      <!-- Search Input -->
      <input
        type="text"
        [ngModel]="searchQuery()"
        (ngModelChange)="searchQuery.set($event)"
        placeholder="Buscar categoria..."
        class="w-full"
      />

      <!-- Filter Groups -->
      <div *ngIf="filteredTagGroups().length > 0; else noTags" class="space-y-1">
        <div
          *ngFor="let tagGroup of filteredTagGroups()"
          class="p-1.5 rounded bg-amazon-surface border border-amazon-border"
        >
          <!-- Category Title -->
          <h4 class="text-xs font-semibold text-amazon-text mb-1">
            {{ tagGroup.category | tagCategory }}
          </h4>

          <!-- Value Toggles -->
          <div class="space-y-1">
            <label
              *ngFor="let value of getVisibleValues(tagGroup.values, tagGroup.category)"
              class="flex items-center gap-1.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                [checked]="isFilterActive(tagGroup.category, value)"
                (change)="toggleFilter(tagGroup.category, value)"
                class="w-3 h-3 rounded border-amazon-border bg-amazon-surface checked:bg-amazon-orange cursor-pointer"
              />
              <span
                class="text-xs text-amazon-textMuted group-hover:text-amazon-text transition-colors"
              >
                {{ value | tagValue }}
                <span class="text-amazon-textMuted"
                  >({{ countCoinsWithTag(tagGroup.category, value) }})</span
                >
              </span>
            </label>

            <!-- Show More/Less Button -->
            <span
              *ngIf="shouldShowMoreButton(tagGroup.values)"
              (click)="toggleCategoryExpansion(tagGroup.category)"
              class="text-xs text-amazon-textMuted hover:text-amazon-text mt-1 cursor-pointer transition-colors"
            >
              {{
                isCategoryExpanded(tagGroup.category)
                  ? '- mostrar menys'
                  : '+ mostrar més (' + (tagGroup.values.length - 5) + ')'
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- No Tags -->
      <ng-template #noTags>
        <p class="text-amazon-textMuted text-xs italic text-center py-2 font-medium">
          {{ 'filters.noTags' | translate }}
        </p>
      </ng-template>

      <!-- Active Filters Display -->
      <div
        *ngIf="store.selectedFilters().length > 0"
        class="mt-1 p-1.5 rounded bg-amazon-surface border border-amazon-border"
      >
        <p class="text-xs text-amazon-text mb-1 font-semibold">
          {{ 'filters.activeFilters' | translate }}
        </p>
        <div class="space-y-0.5">
          <div *ngFor="let filter of store.selectedFilters()" class="text-xs text-amazon-textMuted">
            <span class="font-semibold text-amazon-orange"
              >{{ filter.category | tagCategory }}:</span
            >
            <span class="ml-1" *ngFor="let value of filter.values; let last = last"
              >{{ value | tagValue }}<span *ngIf="!last">, </span></span
            >
          </div>
        </div>
      </div>

      <!-- Physical Characteristics Filters -->
      <div class="p-1.5 rounded bg-amazon-surface border border-amazon-border space-y-2">
        <h4 class="text-xs font-semibold text-amazon-text mb-1">
          {{ 'filters.physicalTitle' | translate }}
        </h4>

        <!-- Weight Range -->
        <div class="space-y-0.5">
          <label class="block text-xs text-amazon-textMuted font-semibold">
            {{ 'filters.weight' | translate }}
          </label>
          <div class="flex gap-1 items-center">
            <input
              type="number"
              [ngModel]="weightRange().min"
              (ngModelChange)="onWeightMinChange($event)"
              class="flex-1 px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-bg text-amazon-text"
              [min]="0"
              [max]="store.getWeightRange().max"
            />
            <span class="text-xs text-amazon-textMuted">-</span>
            <input
              type="number"
              [ngModel]="weightRange().max"
              (ngModelChange)="onWeightMaxChange($event)"
              class="flex-1 px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-bg text-amazon-text"
              [min]="0"
              [max]="store.getWeightRange().max"
            />
            <span class="text-xs text-amazon-textMuted whitespace-nowrap">g</span>
          </div>
        </div>

        <!-- Diameter Range -->
        <div class="space-y-0.5">
          <label class="block text-xs text-amazon-textMuted font-semibold">
            {{ 'filters.diameter' | translate }}
          </label>
          <div class="flex gap-1 items-center">
            <input
              type="number"
              [ngModel]="diameterRange().min"
              (ngModelChange)="onDiameterMinChange($event)"
              class="flex-1 px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-bg text-amazon-text"
              [min]="0"
              [max]="store.getDiameterRange().max"
            />
            <span class="text-xs text-amazon-textMuted">-</span>
            <input
              type="number"
              [ngModel]="diameterRange().max"
              (ngModelChange)="onDiameterMaxChange($event)"
              class="flex-1 px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-bg text-amazon-text"
              [min]="0"
              [max]="store.getDiameterRange().max"
            />
            <span class="text-xs text-amazon-textMuted whitespace-nowrap">mm</span>
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
  tagService = inject(TagService);
  i18n = inject(I18nService);

  searchQuery = signal('');
  weightRange = signal({ min: 0, max: 100 });
  diameterRange = signal({ min: 0, max: 100 });
  expandedCategories = signal<Set<string>>(new Set());

  constructor() {
    // Initialize ranges based on available data
    const weightRange = this.store.getWeightRange();
    const diameterRange = this.store.getDiameterRange();
    this.weightRange.set({ min: 0, max: weightRange.max });
    this.diameterRange.set({ min: 0, max: diameterRange.max });
    this.store.setWeightRange(0, weightRange.max);
    this.store.setDiameterRange(0, diameterRange.max);
  }

  filteredTagGroups = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const availableTags = this.store.availableTags();

    if (!query) {
      return availableTags;
    }

    return availableTags
      .map((tagGroup) => {
        const categoryMatch = tagGroup.category.toLowerCase().includes(query);
        const filteredValues = tagGroup.values.filter((value) =>
          value.toLowerCase().includes(query),
        );

        // If category matches, show all values
        if (categoryMatch) {
          return tagGroup;
        }

        // If some values match, show only those values
        if (filteredValues.length > 0) {
          return { ...tagGroup, values: filteredValues };
        }

        // If neither category nor values match, filter out this group
        return null;
      })
      .filter((tagGroup): tagGroup is (typeof availableTags)[number] => tagGroup !== null);
  });

  toggleFilter(category: string, value: string): void {
    this.store.toggleFilter(category, value);
  }

  toggleCategoryExpansion(category: string): void {
    this.expandedCategories.update((expanded) => {
      const newExpanded = new Set(expanded);
      if (newExpanded.has(category)) {
        newExpanded.delete(category);
      } else {
        newExpanded.add(category);
      }
      return newExpanded;
    });
  }

  isCategoryExpanded(category: string): boolean {
    return this.expandedCategories().has(category);
  }

  getVisibleValues(values: string[], category: string): string[] {
    if (this.isCategoryExpanded(category)) {
      return values;
    }
    return values.slice(0, 5);
  }

  shouldShowMoreButton(values: string[]): boolean {
    return values.length > 5;
  }

  clearFilters(): void {
    this.store.clearFilters();
    const weightRange = this.store.getWeightRange();
    const diameterRange = this.store.getDiameterRange();
    this.weightRange.set({ min: 0, max: weightRange.max });
    this.diameterRange.set({ min: 0, max: diameterRange.max });
    this.store.setWeightRange(0, weightRange.max);
    this.store.setDiameterRange(0, diameterRange.max);
  }

  onWeightMinChange(value: string | number): void {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    this.weightRange.update((range) => ({ ...range, min: numValue }));
    this.store.setWeightRange(numValue, this.weightRange().max);
  }

  onWeightMaxChange(value: string | number): void {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    this.weightRange.update((range) => ({ ...range, max: numValue }));
    this.store.setWeightRange(this.weightRange().min, numValue);
  }

  onDiameterMinChange(value: string | number): void {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    this.diameterRange.update((range) => ({ ...range, min: numValue }));
    this.store.setDiameterRange(numValue, this.diameterRange().max);
  }

  onDiameterMaxChange(value: string | number): void {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    this.diameterRange.update((range) => ({ ...range, max: numValue }));
    this.store.setDiameterRange(this.diameterRange().min, numValue);
  }

  isFilterActive(category: string, value: string): boolean {
    return this.store
      .selectedFilters()
      .some((f) => f.category === category && f.values.includes(value));
  }

  countCoinsWithTag(category: string, value: string): number {
    const filters = this.store.selectedFilters();

    return this.store.coins().filter((coin) => {
      // Check if coin matches current tag filters
      const tagsMatch =
        filters.length === 0 ||
        filters.every((filter) => {
          return filter.values.some((filterValue) => {
            return coin.tags.some((tagId) => {
              const tag = this.tagService.getTag(tagId);
              return tag && tag.category === filter.category && tag.value === filterValue;
            });
          });
        });

      // Check if coin has the specific tag we're counting
      const hasTag = coin.tags.some((tagId) => {
        const tag = this.tagService.getTag(tagId);
        return tag && tag.category === category && tag.value === value;
      });

      return tagsMatch && hasTag;
    }).length;
  }
}
