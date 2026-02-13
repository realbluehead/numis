import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { I18nService } from '../../services/i18n.service';
import { TagCategoryPipe, TagValuePipe } from '../../pipes/tag-format.pipe';
import { Tag } from '../../models/coin.model';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, TagCategoryPipe, TagValuePipe],
  template: `
    <div class="p-2 rounded border border-amazon-border bg-amazon-card shadow-sm space-y-1">
      <!-- Header -->
      <div class="border-b border-amazon-border pb-1">
        <h3 class="text-base font-display text-amazon-textLight mb-0.5">Gestor d'Etiquetes</h3>
        <p class="text-amazon-textMuted text-xs">{{ tagService.tags().length }} etiquetes</p>
      </div>

      <!-- Add New Tag Form -->
      <div class="p-1.5 rounded bg-amazon-surface border border-amazon-border space-y-1">
        <h4 class="font-semibold text-amazon-text text-xs">Afegir etiqueta</h4>
        <div class="grid grid-cols-2 gap-1">
          <input type="text" [(ngModel)]="newTag().category" />
          <input type="text" [(ngModel)]="newTag().value" />
        </div>
        <button
          (click)="addTag()"
          [disabled]="!newTag().category.trim() || !newTag().value.trim()"
          class="w-full btn-sm btn-primary"
        >
          + Afegir Etiqueta
        </button>
      </div>

      <!-- Tags List by Category -->
      <div *ngIf="tagService.tags().length > 0; else noTags" class="space-y-1">
        <div
          *ngFor="let category of tagService.categories()"
          class="p-1.5 rounded bg-amazon-surface border border-amazon-border space-y-1"
        >
          <!-- Category Title with Fix Button -->
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <!-- View mode -->
              <h5
                *ngIf="editingCategoryName() !== category"
                (click)="startEditCategory(category)"
                class="font-semibold text-amazon-text text-xs cursor-pointer hover:opacity-80 transition-opacity"
              >
                {{ category | tagCategory }}
              </h5>
              <!-- Edit mode -->
              <input
                *ngIf="editingCategoryName() === category"
                type="text"
                [ngModel]="editingCategoryValue()"
                (ngModelChange)="editingCategoryValue.set($event)"
                (keydown.enter)="saveEditCategory(category)"
                (keydown.escape)="cancelEditCategory()"
                (blur)="saveEditCategory(category)"
                class="bg-white text-black px-1 py-0.5 rounded text-xs w-full"
                autofocus
              />
            </div>
            <!-- Fix Button -->
            <button
              *ngIf="editingCategoryName() !== category && hasDuplicatesInCategory(category)"
              (click)="fixDuplicatesInCategory(category)"
              title="Eliminar duplicats d'aquesta categoria"
              class="ml-2 px-2 py-1 text-xs bg-amazon-warning text-white rounded hover:opacity-80 transition-opacity font-semibold"
            >
              fix
            </button>
          </div>

          <!-- Values as Pills -->
          <div class="flex flex-wrap gap-1">
            <div
              *ngFor="let tag of getTagsByCategory(category)()"
              class="inline-flex items-center gap-1 px-2 py-1 bg-amazon-orangeActive text-white rounded-full text-xs font-medium"
            >
              <!-- View mode -->
              <span
                *ngIf="editingTagId() !== tag.id"
                (click)="startEditTag(tag.id, tag.value)"
                class="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {{ tag.value | tagValue }}
              </span>
              <!-- Edit mode -->
              <input
                *ngIf="editingTagId() === tag.id"
                type="text"
                [ngModel]="editingTagValue()"
                (ngModelChange)="editingTagValue.set($event)"
                (keydown.enter)="saveEditTag(tag.id, tag.category)"
                (keydown.escape)="cancelEditTag()"
                (blur)="saveEditTag(tag.id, tag.category)"
                class="bg-white text-black px-1 py-0.5 rounded w-24"
                autofocus
              />
              <button
                type="button"
                (click)="deleteTag(tag.id)"
                class="ml-0.5 bg-transparent text-white hover:opacity-70 transition-opacity flex items-center justify-center w-4 h-4"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Add New Value Input -->
          <div class="flex gap-1 pt-1 border-t border-amazon-border mt-1">
            <input
              type="text"
              [ngModel]="getNewValueForCategory(category)"
              (ngModelChange)="setNewValueForCategory(category, $event)"
              (keydown.enter)="addValueToCategory(category)"
              class="flex-1"
              placeholder="Afegir valor..."
            />
          </div>
        </div>
      </div>

      <!-- No Tags -->
      <ng-template #noTags>
        <div
          class="p-2 text-center rounded bg-amazon-surface border border-dashed border-amazon-border"
        >
          <p class="text-amazon-text font-semibold text-xs">No hi ha etiquetes</p>
          <p class="text-amazon-textMuted text-xs mt-0.5">
            Afegeix la primera etiqueta per començar
          </p>
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
export class TagManagerComponent {
  tagService = inject(TagService);
  i18n = inject(I18nService);

  newTag = signal<Tag>({ category: '', value: '' });
  newValueByCategory = signal<Map<string, string>>(new Map());
  editingTagId = signal<string | null>(null);
  editingTagValue = signal('');
  editingCategoryName = signal<string | null>(null);
  editingCategoryValue = signal('');

  getTagsByCategory = (category: string) => {
    return this.tagService.getTagsByCategory(category);
  };

  startEditCategory(categoryName: string): void {
    this.editingCategoryName.set(categoryName);
    this.editingCategoryValue.set(categoryName);
  }

  saveEditCategory(oldCategoryName: string): void {
    const newCategoryName = this.editingCategoryValue().trim();
    if (newCategoryName && newCategoryName !== oldCategoryName) {
      // Update all tags in this category
      const tagsInCategory = this.tagService.getTagsByCategory(oldCategoryName)();
      tagsInCategory.forEach((tag) => {
        this.tagService.updateTag(tag.id, { category: newCategoryName, value: tag.value });
      });
    }
    this.cancelEditCategory();
  }

  cancelEditCategory(): void {
    this.editingCategoryName.set(null);
    this.editingCategoryValue.set('');
  }

  startEditTag(tagId: string, currentValue: string): void {
    // Only start editing tag if not already editing a category
    if (this.editingCategoryName() === null) {
      this.editingTagId.set(tagId);
      this.editingTagValue.set(currentValue);
    }
  }

  saveEditTag(tagId: string, category: string): void {
    const newValue = this.editingTagValue().trim();
    if (newValue && newValue !== this.tagService.getTag(tagId)?.value) {
      this.tagService.updateTag(tagId, { category, value: newValue });
    }
    this.cancelEditTag();
  }

  cancelEditTag(): void {
    this.editingTagId.set(null);
    this.editingTagValue.set('');
  }

  getNewValueForCategory(category: string): string {
    return this.newValueByCategory().get(category) || '';
  }

  setNewValueForCategory(category: string, value: string): void {
    const map = new Map(this.newValueByCategory());
    if (value.trim()) {
      map.set(category, value);
    } else {
      map.delete(category);
    }
    this.newValueByCategory.set(map);
  }

  addValueToCategory(category: string): void {
    const value = this.getNewValueForCategory(category);
    if (value.trim()) {
      this.tagService.addTag({
        category: category.trim(),
        value: value.trim(),
      });
      this.setNewValueForCategory(category, '');
    }
  }

  addTag(): void {
    const tag = this.newTag();
    if (tag.category.trim() && tag.value.trim()) {
      this.tagService.addTag({
        category: tag.category.trim(),
        value: tag.value.trim(),
      });
      this.newTag.set({ category: '', value: '' });
    }
  }

  deleteTag(id: string): void {
    this.tagService.deleteTag(id);
  }

  hasDuplicatesInCategory(category: string): boolean {
    const tags = this.tagService.getTagsByCategory(category)();
    const values = tags.map((tag) => tag.value.toLowerCase());
    return values.length !== new Set(values).size;
  }

  fixDuplicatesInCategory(category: string): void {
    const tags = this.tagService.getTagsByCategory(category)();
    const seenValues = new Set<string>();
    const tagsToDelete: string[] = [];

    // Iterate through tags and mark duplicates for deletion
    tags.forEach((tag) => {
      const lowerValue = tag.value.toLowerCase();
      if (seenValues.has(lowerValue)) {
        tagsToDelete.push(tag.id);
      } else {
        seenValues.add(lowerValue);
      }
    });

    // Delete the duplicate tags
    tagsToDelete.forEach((id) => {
      this.tagService.deleteTag(id);
    });

    console.log(
      `Fixed duplicates in category "${category}": deleted ${tagsToDelete.length} duplicates`,
    );
  }
}
