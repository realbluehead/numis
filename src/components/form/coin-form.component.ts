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
    <div class="p-2 rounded border border-amazon-border bg-amazon-card shadow-sm">
      <!-- Header -->
      <h3 class="text-base font-display text-amazon-textLight mb-2">
        {{ editingCoin() ? ('form.editCoin' | translate) : ('form.newCoin' | translate) }}
      </h3>

      <!-- Import Field -->
      <div class="space-y-0.5 mb-2">
        <label class="text-xs font-semibold text-amazon-text">
          {{ 'form.import' | translate }}
        </label>
        <input
          type="text"
          [(ngModel)]="importData"
          (ngModelChange)="onImportDataChange($event)"
          name="import"
          class="w-full"
          [placeholder]="'form.importPlaceholder' | translate"
        />
      </div>

      <form (ngSubmit)="submitForm()" class="space-y-1.5">
        <!-- Reference Field -->
        <div class="space-y-0.5">
          <label class="text-xs font-semibold text-amazon-text">
            {{ 'form.reference' | translate }}
          </label>
          <input
            type="text"
            [ngModel]="reference()"
            (ngModelChange)="reference.set($event)"
            name="reference"
            maxlength="10"
            class="w-full"
            placeholder="e.g., ABC-123-XYZ"
          />
        </div>

        <!-- Images Section -->
        <fieldset class="border border-amazon-border p-1.5 rounded bg-amazon-surface space-y-1">
          <legend class="text-xs font-semibold text-amazon-text px-1">
            {{ 'form.imagesTitle' | translate }}
          </legend>

          <div class="space-y-2">
            <!-- Images list -->
            <div
              *ngFor="let i of imageIndices(); let isLast = last; trackBy: trackByImage"
              class="flex gap-2 items-center"
            >
              <!-- Thumbnail placeholder -->
              <div
                class="relative rounded border border-amazon-border bg-amazon-surface p-0.5 flex-shrink-0 flex items-center justify-center"
                [style.width]="'60px'"
                [style.height]="'60px'"
              >
                <img
                  *ngIf="images()[i]?.trim()"
                  [src]="images()[i]"
                  [alt]="'Thumbnail'"
                  class="w-full h-full rounded"
                  [style.objectFit]="'cover'"
                  (error)="onImageError(i)"
                />
                <span *ngIf="!images()[i]?.trim()" class="text-2xl text-amazon-textMuted">📷</span>
              </div>

              <!-- Input -->
              <input type="url" [(ngModel)]="images()[i]" [name]="'image' + i" class="flex-1" />

              <!-- Delete button -->
              <button
                *ngIf="images().length > 1"
                type="button"
                (click)="removeImage(i)"
                class="btn-sm bg-transparent text-amazon-orange hover:text-amazon-text px-1.5 flex-shrink-0"
              >
                ✕
              </button>

              <!-- Add button (on last row) -->
              <button
                *ngIf="isLast"
                type="button"
                (click)="addImage()"
                [disabled]="!images()[i]?.trim()"
                class="btn-sm bg-transparent text-amazon-orange hover:text-amazon-text px-1.5 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
        </fieldset>

        <!-- Tags Section -->
        <fieldset class="border border-amazon-border p-1.5 rounded bg-amazon-surface space-y-1">
          <legend class="text-xs font-semibold text-amazon-text px-1">
            {{ 'form.tagsTitle' | translate }}
          </legend>

          <!-- Add Tag Form -->
          <div class="space-y-1">
            <p class="text-xs text-amazon-textMuted font-medium">{{ 'form.addTag' | translate }}</p>
            <div class="grid grid-cols-2 gap-1 items-end">
              <!-- Category input with autocomplete -->
              <div class="relative w-full">
                <input
                  type="text"
                  [(ngModel)]="newTag().category"
                  (ngModelChange)="onCategoryChange($event)"
                  (focus)="showCategorySuggestions.set(true)"
                  (blur)="onCategoryBlur()"
                  name="tagCategory"
                  class="w-full"
                />
                <!-- Suggestions Dropdown for Categories -->
                <div
                  *ngIf="showCategorySuggestions() && categorySuggestions().length > 0"
                  class="absolute z-10 top-full mt-0.5 w-full bg-amazon-card border border-amazon-border rounded shadow-lg max-h-24 overflow-y-auto"
                >
                  <button
                    *ngFor="let cat of categorySuggestions()"
                    type="button"
                    (click)="selectCategory(cat)"
                    class="w-full px-2 py-1 text-left text-xs text-amazon-text hover:bg-amazon-surface transition-colors border-b border-amazon-border last:border-b-0"
                  >
                    {{ cat }}
                  </button>
                </div>
              </div>

              <!-- Value input with autocomplete -->
              <div class="relative w-full">
                <input
                  type="text"
                  [(ngModel)]="newTag().value"
                  (ngModelChange)="onValueChange($event)"
                  (focus)="showValueSuggestions.set(newTag().category.trim().length > 0)"
                  (blur)="onValueBlur()"
                  name="tagValue"
                  [disabled]="!newTag().category.trim()"
                  class="w-full"
                />
                <!-- Suggestions Dropdown for Values -->
                <div
                  *ngIf="showValueSuggestions() && valueSuggestions().length > 0"
                  class="absolute z-10 top-full mt-0.5 w-full bg-amazon-card border border-amazon-border rounded shadow-lg max-h-24 overflow-y-auto"
                >
                  <button
                    *ngFor="let val of valueSuggestions()"
                    type="button"
                    (click)="selectValue(val)"
                    class="w-full px-2 py-1 text-left text-xs text-amazon-text hover:bg-amazon-surface transition-colors border-b border-amazon-border last:border-b-0"
                  >
                    {{ val }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Existing Tags -->
          <div *ngIf="tags().length > 0" class="border-t border-amazon-border pt-1 space-y-1">
            <p class="text-xs text-amazon-textMuted mb-2 font-medium">
              {{ 'form.addedTags' | translate }}
            </p>
            <div class="flex flex-wrap gap-1">
              <div
                *ngFor="let tagId of tags(); let i = index"
                class="inline-flex items-center gap-1 px-2 py-1 bg-amazon-orangeActive text-white rounded-full text-xs font-medium"
              >
                <span *ngIf="getTagInfo(tagId) as tagInfo">
                  {{ tagInfo.category | tagCategory }}:
                  {{ tagInfo.value | tagValue }}
                </span>
                <button
                  type="button"
                  (click)="removeTag(i)"
                  class="ml-0.5 bg-transparent text-white hover:opacity-70 transition-opacity flex items-center justify-center w-4 h-4"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        <!-- Description Fields -->
        <fieldset class="border border-amazon-border p-1.5 rounded bg-amazon-surface space-y-1">
          <legend class="text-xs font-semibold text-amazon-text px-1">
            {{ 'form.descriptionsTitle' | translate }}
          </legend>

          <div class="grid grid-cols-2 gap-2">
            <!-- Anvers -->
            <div class="space-y-0.5">
              <label class="block text-xs text-amazon-textMuted">
                {{ 'form.anvers' | translate }}
              </label>
              <textarea
                [ngModel]="anvers()"
                (ngModelChange)="anvers.set($event)"
                name="anvers"
                class="w-full min-h-[60px] resize-none"
              ></textarea>
            </div>

            <!-- Revers -->
            <div class="space-y-0.5">
              <label class="block text-xs text-amazon-textMuted">
                {{ 'form.revers' | translate }}
              </label>
              <textarea
                [ngModel]="revers()"
                (ngModelChange)="revers.set($event)"
                name="revers"
                class="w-full min-h-[60px] resize-none"
              ></textarea>
            </div>
          </div>

          <!-- General -->
          <div class="space-y-0.5">
            <label class="block text-xs text-amazon-textMuted">
              {{ 'form.general' | translate }}
            </label>
            <textarea
              [ngModel]="general()"
              (ngModelChange)="general.set($event)"
              name="general"
              class="w-full min-h-[60px] resize-none"
            ></textarea>
          </div>
        </fieldset>

        <!-- Physical & Acquisition Fields (4 columns) -->
        <div class="grid grid-cols-4 gap-2">
          <!-- Weight -->
          <div class="space-y-0.5">
            <label class="block text-xs text-amazon-textMuted">
              {{ 'form.weight' | translate }}
            </label>
            <input
              type="number"
              step="0.01"
              [ngModel]="weight()"
              (ngModelChange)="weight.set($event)"
              name="weight"
              class="w-full px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-bg text-amazon-text"
              [placeholder]="'form.weightPlaceholder' | translate"
            />
          </div>

          <!-- Diameter -->
          <div class="space-y-0.5">
            <label class="block text-xs text-amazon-textMuted">
              {{ 'form.diameter' | translate }}
            </label>
            <input
              type="number"
              step="0.1"
              [ngModel]="diameter()"
              (ngModelChange)="diameter.set($event)"
              name="diameter"
              class="w-full px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-bg text-amazon-text"
              [placeholder]="'form.diameterPlaceholder' | translate"
            />
          </div>

          <!-- Seller -->
          <div class="space-y-0.5">
            <label class="block text-xs text-amazon-textMuted">Seller</label>
            <input
              type="text"
              [ngModel]="seller()"
              (ngModelChange)="seller.set($event)"
              name="seller"
              class="w-full px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-bg text-amazon-text"
            />
          </div>

          <!-- Added to Collection Date -->
          <div class="space-y-0.5">
            <label class="block text-xs text-amazon-textMuted">
              {{ 'form.addedToCollectionAt' | translate }}
            </label>
            <input
              type="date"
              [ngModel]="addedToCollectionAt()"
              (ngModelChange)="addedToCollectionAt.set($event)"
              name="addedToCollectionAt"
              class="w-full px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-bg text-amazon-text"
            />
          </div>

          <!-- Price Paid -->
          <div class="space-y-0.5">
            <label class="block text-xs text-amazon-textMuted">
              {{ 'form.pricePaid' | translate }}
            </label>
            <input
              type="number"
              step="0.01"
              [ngModel]="pricePaid()"
              (ngModelChange)="pricePaid.set($event)"
              name="pricePaid"
              class="w-full px-2 py-1 text-sm border border-amazon-border rounded bg-amazon-bg text-amazon-text"
              [placeholder]="'form.pricePaidPlaceholder' | translate"
            />
          </div>
        </div>

        <div class="flex gap-1 pt-1 justify-end">
          <button type="button" (click)="resetForm()" class="btn-sm btn-secondary">
            {{ 'form.cancel' | translate }}
          </button>
          <button type="submit" class="btn-sm btn-primary">
            {{
              editingCoin() ? ('form.submitUpdate' | translate) : ('form.submitCreate' | translate)
            }}
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
  images = signal<string[]>(['']);
  tags = signal<string[]>([]);
  newTag = signal({ category: '', value: '' });
  reference = signal('');
  anvers = signal('');
  revers = signal('');
  general = signal('');
  weight = signal('');
  diameter = signal('');
  seller = signal('');
  addedToCollectionAt = signal('');
  pricePaid = signal('');
  importData = signal('');
  editingCoin = signal<Coin | null>(null);

  // Computed indices for images
  imageIndices = computed(() => {
    return Array.from({ length: this.images().length }, (_, i) => i);
  });

  // Typeahead state
  showCategorySuggestions = signal(false);
  showValueSuggestions = signal(false);

  // Computed suggestions
  categorySuggestions = computed(() => {
    const allCategories = this.tagService.searchCategories(this.newTag().category);
    // Filter out categories that don't have any available values
    // AND filter out categories that already have all values used in this coin's tags
    return allCategories.filter((category) => {
      const availableValues = this.tagService.searchValuesByCategory(category, '');
      if (availableValues.length === 0) return false;

      // Check if there are any values in this category not yet used in current tags
      const usedValuesInCategory: string[] = [];
      this.tags().forEach((tagId) => {
        const tag = this.tagService.getTag(tagId);
        if (tag && tag.category === category) {
          usedValuesInCategory.push(tag.value);
        }
      });

      const unusedValues = availableValues.filter((val) => !usedValuesInCategory.includes(val));
      return unusedValues.length > 0;
    });
  });

  valueSuggestions = computed(() => {
    const category = this.newTag().category.trim();
    if (!category) return [];
    const suggestions = this.tagService.searchValuesByCategory(category, this.newTag().value);
    // Filter out values that already exist as tags with the current category
    return suggestions.filter((value) => {
      return !this.tags().some((tagId) => {
        const tag = this.tagService.getTag(tagId);
        return tag && tag.category === category && tag.value === value;
      });
    });
  });

  isTagDuplicate = computed(() => {
    const { category, value } = this.newTag();
    return this.tags().some((tagId) => {
      const tag = this.tagService.getTag(tagId);
      return tag && tag.category === category.trim() && tag.value === value.trim();
    });
  });

  constructor() {
    // Watch for coin input changes
    effect(() => {
      const coin = this.coinToEdit();
      if (coin) {
        this.editingCoin.set(coin);
        this.images.set([...coin.images, '']);
        this.tags.set([...coin.tags]);
        this.reference.set(coin.reference || '');
        this.anvers.set(coin.anvers || '');
        this.revers.set(coin.revers || '');
        this.general.set(coin.general || '');
        this.weight.set(coin.weight ? String(coin.weight) : '');
        this.diameter.set(coin.diameter ? String(coin.diameter) : '');
        this.seller.set(coin.seller || '');
        this.addedToCollectionAt.set(
          coin.addedToCollectionAt ? this.formatDateForInput(coin.addedToCollectionAt) : '',
        );
        this.pricePaid.set(coin.pricePaid ? String(coin.pricePaid) : '');
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

  onImportDataChange(value: string): void {
    this.importData.set(value);
    if (value.trim()) {
      const parsed = this.parseCSV(value);
      console.log('Parsed CSV fields:', parsed);
      if (parsed.length > 0) {
        // Clear existing tags before importing
        this.tags.set([]);

        if (parsed[0].length > 1) {
          this.reference.set(parsed[0][1]);
        }
        if (parsed[0].length > 2) {
          const dateValue = parsed[0][2].trim();
          if (dateValue) {
            this.addedToCollectionAt.set(this.formatDateForInput(dateValue));
          }
        }
        if (parsed[0].length > 3) {
          this.seller.set(parsed[0][3]);
        }
        if (parsed[0].length > 4) {
          const facturaValue = parsed[0][4].trim().toLowerCase();
          if (facturaValue) {
            const matchingTag = this.tagService
              .tags()
              .find((t) => t.category === 'FACTURA' && t.value.toLowerCase() === facturaValue);
            if (matchingTag) {
              this.tags.update((t) => [...t, matchingTag.id]);
            }
          }
        }
        if (parsed[0].length > 8) {
          const areaValue = parsed[0][8].trim().toLowerCase();
          if (areaValue) {
            const matchingTag = this.tagService
              .tags()
              .find((t) => t.category === 'AREA' && t.value.toLowerCase() === areaValue);
            if (matchingTag) {
              this.tags.update((t) => [...t, matchingTag.id]);
            }
          }
        }
        if (parsed[0].length > 9) {
          const cecaValue = parsed[0][9].trim().toLowerCase();
          if (cecaValue) {
            const matchingTag = this.tagService
              .tags()
              .find((t) => t.category === 'CECA' && t.value.toLowerCase() === cecaValue);
            if (matchingTag) {
              this.tags.update((t) => [...t, matchingTag.id]);
            }
          }
        }
        if (parsed[0].length > 10) {
          const denominacioValue = parsed[0][10].trim().toLowerCase();
          if (denominacioValue) {
            const matchingTag = this.tagService
              .tags()
              .find(
                (t) => t.category === 'DENOMINACIÓ' && t.value.toLowerCase() === denominacioValue,
              );
            if (matchingTag) {
              this.tags.update((t) => [...t, matchingTag.id]);
            }
          }
        }
        if (parsed[0].length > 11) {
          this.general.set(parsed[0][11]);
        }
        if (parsed[0].length > 12) {
          this.weight.set(parsed[0][12].replace(',', '.'));
        }
        if (parsed[0].length > 13) {
          this.diameter.set(parsed[0][13].replace(',', '.'));
        }
        if (parsed[0].length > 14) {
          this.pricePaid.set(parsed[0][14].replace(',', '.'));
        }
        if (parsed[0].length > 15) {
          this.anvers.set(parsed[0][15]);
        }
        if (parsed[0].length > 16) {
          this.revers.set(parsed[0][16]);
        }
      }
      // Clear the import field after processing with a small delay
      setTimeout(() => {
        this.importData.set('');
      }, 0);
    }
  }

  parseCSV(csvString: string): string[][] {
    const lines = csvString.split('\n').filter((line) => line.trim());
    return lines.map((line) => line.split('\t').map((field) => field.trim()));
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
    // Auto-add tag when value is selected
    setTimeout(() => this.addTag(), 0);
  }

  addTag(): void {
    const tag = this.newTag();
    if (tag.category.trim() && tag.value.trim()) {
      // Find the tag ID from TagService
      const matchingTag = this.tagService
        .tags()
        .find((t) => t.category === tag.category.trim() && t.value === tag.value.trim());
      if (matchingTag) {
        this.tags.update((t) => [...t, matchingTag.id]);
        this.newTag.set({ category: '', value: '' });
      }
    }
  }

  getTagInfo(tagId: string): { category: string; value: string } | null {
    return this.tagService.getTag(tagId) || null;
  }

  removeTag(index: number): void {
    this.tags.update((t) => t.filter((_, i) => i !== index));
  }

  addImage(): void {
    // Only add a new image if the last one is not empty
    const lastImage = this.images()[this.images().length - 1];
    if (lastImage?.trim().length > 0) {
      this.images.update((imgs) => [...imgs, '']);
    }
  }

  removeImage(index: number): void {
    this.images.update((imgs) => imgs.filter((_, i) => i !== index));
  }

  onImageError(index: number): void {
    console.warn(`Image at index ${index} failed to load`);
  }

  submitForm(): void {
    const imageUrls = this.images().filter((img) => img.trim());

    // Validation: at least one image required
    if (imageUrls.length === 0) {
      alert(this.i18n.t('form.errorImage'));
      return;
    }

    const weightValue = String(this.weight()).trim();
    const diameterValue = String(this.diameter()).trim();
    const pricePaidValue = String(this.pricePaid()).trim();

    const coinInput: CoinInput = {
      reference: this.reference().trim() || undefined,
      images: imageUrls,
      tags: this.tags(),
      anvers: this.anvers().trim() || undefined,
      revers: this.revers().trim() || undefined,
      general: this.general().trim() || undefined,
      weight: weightValue ? parseFloat(weightValue) : undefined,
      diameter: diameterValue ? parseFloat(diameterValue) : undefined,
      seller: this.seller().trim() || undefined,
      addedToCollectionAt: this.addedToCollectionAt()
        ? new Date(this.addedToCollectionAt())
        : undefined,
      pricePaid: pricePaidValue ? parseFloat(pricePaidValue) : undefined,
    };

    try {
      if (this.editingCoin()) {
        this.store.updateCoin(this.editingCoin()!.id, coinInput);
        console.log('Coin updated successfully');
      } else {
        this.store.addCoin(coinInput);
        console.log('Coin added successfully');
      }

      this.resetForm();
    } catch (error) {
      console.error('Error saving coin:', error);
      alert('Error al guardar la moneda: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  resetForm(): void {
    this.editingCoin.set(null);
    this.images.set(['']);
    this.tags.set([]);
    this.newTag.set({ category: '', value: '' });
    this.reference.set(this.store.getNextReference());
    this.anvers.set('');
    this.revers.set('');
    this.general.set('');
    this.weight.set('');
    this.diameter.set('');
    this.seller.set('');
    this.addedToCollectionAt.set('');
    this.pricePaid.set('');
    this.importData.set('');
    this.formReset.emit();
  }

  trackByImage(index: number): number {
    return index;
  }

  private formatDateForInput(date: Date | string): string {
    if (!date) return '';
    let d: Date;

    if (typeof date === 'string') {
      // Check if it's in dd/mm/yyyy format
      const ddmmyyyyMatch = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        d = new Date(date);
      }
    } else {
      d = date;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
