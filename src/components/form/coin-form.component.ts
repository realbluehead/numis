import { Component, inject, input, output, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoinStore } from '../../services/coin.store';
import { TagService } from '../../services/tag.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TagCategoryPipe, TagValuePipe } from '../../pipes/tag-format.pipe';
import { Coin, CoinInput, Tag } from '../../models/coin.model';

@Component({
  selector: 'app-coin-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, TagCategoryPipe, TagValuePipe],
  template: `
    <div class="p-4 rounded-lg border border-velvet-700 bg-velvet-800 shadow-soft">
      <!-- Header -->
      <h3 class="text-xl font-display text-white mb-4">
        {{ editingCoin() ? ('form.editCoin' | translate) : ('form.newCoin' | translate) }}
      </h3>

      <form (ngSubmit)="submitForm()" class="space-y-3">
        <!-- Images Section -->
        <fieldset class="border border-velvet-700 p-3 rounded-lg bg-velvet-900 space-y-2">
          <legend class="text-xs font-semibold text-white px-2">
            {{ 'form.imagesTitle' | translate }}
          </legend>

          <div *ngFor="let i of [0, 1]; trackBy: trackByImage" class="space-y-1.5">
            <label class="block text-xs text-velvet-300">
              {{ 'form.image' | translate }} {{ i + 1 }}
              <span *ngIf="i === 0" class="text-velvet-400 font-medium"
                >({{ 'form.required' | translate }})</span
              >
            </label>
            <input
              type="url"
              [(ngModel)]="images()[i]"
              [name]="'image' + i"
              [placeholder]="i18n.t('form.imagePlaceholder')"
              class="w-full px-3 py-2 bg-velvet-800 border border-velvet-700 rounded-lg text-white placeholder-velvet-500 focus:outline-none focus:border-velvet-600 focus:ring-2 focus:ring-velvet-700"
            />
            <p class="text-xs text-velvet-500">
              {{ images()[i] ? ('form.validUrl' | translate) : ('form.optional' | translate) }}
            </p>
          </div>
        </fieldset>

        <!-- Tags Section -->
        <fieldset class="border border-velvet-700 p-3 rounded-lg bg-velvet-900 space-y-2">
          <legend class="text-xs font-semibold text-white px-2">
            {{ 'form.tagsTitle' | translate }}
          </legend>

          <!-- Existing Tags -->
          <div *ngIf="tags().length > 0" class="space-y-1.5">
            <p class="text-xs text-velvet-400 mb-2 font-medium">
              {{ 'form.addedTags' | translate }}
            </p>
            <div
              *ngFor="let tag of tags(); let i = index"
              class="flex items-center gap-2 p-2.5 bg-velvet-800 rounded-lg border border-velvet-700"
            >
              <span class="flex-1 text-xs text-white">
                <span class="font-semibold text-velvet-300">{{ tag.category | tagCategory }}:</span>
                {{ tag.value | tagValue }}
              </span>
              <button
                type="button"
                (click)="removeTag(i)"
                class="px-2.5 py-1 text-xs bg-velvet-700/60 hover:bg-velvet-700 text-velvet-200 rounded-lg transition-colors font-medium"
              >
                {{ 'form.remove' | translate }}
              </button>
            </div>
          </div>

          <!-- Add Tag Form -->
          <div class="border-t border-velvet-700 pt-2.5 space-y-2">
            <p class="text-xs text-velvet-400 font-medium">{{ 'form.addTag' | translate }}</p>
            <div class="grid grid-cols-2 gap-2">
              <!-- Category input with autocomplete -->
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="newTag().category"
                  (ngModelChange)="onCategoryChange($event)"
                  (focus)="showCategorySuggestions.set(true)"
                  (blur)="onCategoryBlur()"
                  name="tagCategory"
                  [placeholder]="i18n.t('form.tagCategoryPlaceholder')"
                  class="w-full px-3 py-1.5 bg-velvet-800 border border-velvet-700 rounded-lg text-xs text-white placeholder-velvet-500 focus:outline-none focus:border-velvet-600 focus:ring-2 focus:ring-velvet-700"
                />
                <!-- Suggestions Dropdown for Categories -->
                <div
                  *ngIf="showCategorySuggestions() && categorySuggestions().length > 0"
                  class="absolute z-10 top-full mt-1 w-full bg-velvet-800 border border-velvet-700 rounded-lg shadow-lg max-h-32 overflow-y-auto"
                >
                  <button
                    *ngFor="let cat of categorySuggestions()"
                    type="button"
                    (click)="selectCategory(cat)"
                    class="w-full px-3 py-1.5 text-left text-xs text-velvet-200 hover:bg-velvet-700 transition-colors border-b border-velvet-700 last:border-b-0"
                  >
                    {{ cat }}
                  </button>
                </div>
              </div>

              <!-- Value input with autocomplete -->
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="newTag().value"
                  (ngModelChange)="onValueChange($event)"
                  (focus)="showValueSuggestions.set(newTag().category.trim().length > 0)"
                  (blur)="onValueBlur()"
                  name="tagValue"
                  [placeholder]="i18n.t('form.tagValuePlaceholder')"
                  [disabled]="!newTag().category.trim()"
                  class="w-full px-3 py-1.5 bg-velvet-800 border border-velvet-700 rounded-lg text-xs text-white placeholder-velvet-500 focus:outline-none focus:border-velvet-600 focus:ring-2 focus:ring-velvet-700 disabled:bg-velvet-900/40 disabled:text-velvet-600"
                />
                <!-- Suggestions Dropdown for Values -->
                <div
                  *ngIf="showValueSuggestions() && valueSuggestions().length > 0"
                  class="absolute z-10 top-full mt-1 w-full bg-velvet-800 border border-velvet-700 rounded-lg shadow-lg max-h-32 overflow-y-auto"
                >
                  <button
                    *ngFor="let val of valueSuggestions()"
                    type="button"
                    (click)="selectValue(val)"
                    class="w-full px-3 py-1.5 text-left text-xs text-velvet-200 hover:bg-velvet-700 transition-colors border-b border-velvet-700 last:border-b-0"
                  >
                    {{ val }}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              (click)="addTag()"
              [disabled]="!newTag().category.trim() || !newTag().value.trim()"
              class="w-full px-3 py-1.5 bg-velvet-700 hover:bg-velvet-600 disabled:bg-velvet-700/40 disabled:cursor-not-allowed text-white disabled:text-velvet-600 rounded-lg transition-colors text-xs font-semibold"
            >
              {{ 'form.submitAddTag' | translate }}
            </button>
          </div>
        </fieldset>

        <!-- Actions -->
        <div class="flex gap-2 pt-2">
          <button
            type="submit"
            [disabled]="!images()[0].trim()"
            class="flex-1 px-4 py-2 bg-velvet-700 hover:bg-velvet-600 disabled:bg-velvet-700/40 disabled:cursor-not-allowed text-white disabled:text-velvet-600 rounded-lg font-semibold transition-colors text-xs"
          >
            {{
              editingCoin() ? ('form.submitUpdate' | translate) : ('form.submitCreate' | translate)
            }}
          </button>
          <button
            type="button"
            (click)="resetForm()"
            class="flex-1 px-4 py-2 bg-velvet-700/60 hover:bg-velvet-700 text-velvet-200 rounded-lg font-semibold transition-colors text-xs"
          >
            {{ 'form.cancel' | translate }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host {
      @apply block;
    }
  `,
})
export class CoinFormComponent {
  store = inject(CoinStore);
  i18n = inject(I18nService);
  tagService = inject(TagService);

  coinToEdit = input<Coin | null>(null);
  formReset = output<void>();

  // Form state
  images = signal(['', '']);
  tags = signal<Tag[]>([]);
  newTag = signal({ category: '', value: '' });
  editingCoin = signal<Coin | null>(null);

  // Typeahead state
  showCategorySuggestions = signal(false);
  showValueSuggestions = signal(false);

  // Computed suggestions
  categorySuggestions = computed(() => {
    return this.tagService.searchCategories(this.newTag().category);
  });

  valueSuggestions = computed(() => {
    const category = this.newTag().category.trim();
    if (!category) return [];
    return this.tagService.searchValuesByCategory(category, this.newTag().value);
  });

  constructor() {
    // Watch for coin input changes
    effect(() => {
      const coin = this.coinToEdit();
      if (coin) {
        this.editingCoin.set(coin);
        this.images.set([...coin.images, ...Array(2 - coin.images.length).fill('')]);
        this.tags.set([...coin.tags]);
      } else {
        this.resetForm();
      }
    });
  }

  onCategoryChange(value: string): void {
    this.newTag.update((tag) => ({ ...tag, category: value }));
  }

  onValueChange(value: string): void {
    this.newTag.update((tag) => ({ ...tag, value }));
  }

  onCategoryBlur(): void {
    // Close suggestions after a brief delay to allow click detection
    setTimeout(() => this.showCategorySuggestions.set(false), 150);
  }

  onValueBlur(): void {
    // Close suggestions after a brief delay to allow click detection
    setTimeout(() => this.showValueSuggestions.set(false), 150);
  }

  selectCategory(category: string): void {
    this.newTag.update((tag) => ({ ...tag, category }));
    this.showCategorySuggestions.set(false);
  }

  selectValue(value: string): void {
    this.newTag.update((tag) => ({ ...tag, value }));
    this.showValueSuggestions.set(false);
  }

  addTag(): void {
    const tag = this.newTag();
    if (tag.category.trim() && tag.value.trim()) {
      this.tags.update((t) => [...t, { category: tag.category.trim(), value: tag.value.trim() }]);
      this.newTag.set({ category: '', value: '' });
    }
  }

  removeTag(index: number): void {
    this.tags.update((t) => t.filter((_, i) => i !== index));
  }

  submitForm(): void {
    const imageUrls = this.images().filter((img) => img.trim());

    if (imageUrls.length === 0) {
      alert(this.i18n.t('form.errorImage'));
      return;
    }

    const coinInput: CoinInput = {
      images: imageUrls,
      tags: this.tags(),
    };

    if (this.editingCoin()) {
      this.store.updateCoin(this.editingCoin()!.id, coinInput);
    } else {
      this.store.addCoin(coinInput);
    }

    this.resetForm();
  }

  resetForm(): void {
    this.editingCoin.set(null);
    this.images.set(['', '']);
    this.tags.set([]);
    this.newTag.set({ category: '', value: '' });
    this.formReset.emit();
  }

  trackByImage(index: number): number {
    return index;
  }
}
