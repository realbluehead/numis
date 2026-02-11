import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService, TagTemplate } from '../../services/tag.service';
import { I18nService } from '../../services/i18n.service';
import { TagCategoryPipe, TagValuePipe } from '../../pipes/tag-format.pipe';
import { Tag } from '../../models/coin.model';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, TagCategoryPipe, TagValuePipe],
  template: `
    <div class="p-4 rounded-lg border border-velvet-700 bg-velvet-800 shadow-soft space-y-3">
      <!-- Header -->
      <div class="border-b border-velvet-700 pb-2">
        <h3 class="text-xl font-display text-white mb-1">Gestor d'Etiquetes</h3>
        <p class="text-velvet-400 text-xs">{{ tagService.tags().length }} etiquetes</p>
      </div>

      <!-- Add New Tag Form -->
      <div class="p-3 rounded-lg bg-velvet-900 border border-velvet-700 space-y-2">
        <h4 class="font-semibold text-white text-xs">Afegir etiqueta</h4>
        <div class="grid grid-cols-2 gap-2">
          <input
            type="text"
            [(ngModel)]="newTag().category"
            placeholder="Categoria"
            class="px-3 py-1.5 bg-velvet-800 border border-velvet-700 rounded-lg text-xs text-white placeholder-velvet-500 focus:outline-none focus:border-velvet-600 focus:ring-2 focus:ring-velvet-700"
          />
          <input
            type="text"
            [(ngModel)]="newTag().value"
            placeholder="Valor"
            class="px-3 py-1.5 bg-velvet-800 border border-velvet-700 rounded-lg text-xs text-white placeholder-velvet-500 focus:outline-none focus:border-velvet-600 focus:ring-2 focus:ring-velvet-700"
          />
        </div>
        <button
          (click)="addTag()"
          [disabled]="!newTag().category.trim() || !newTag().value.trim()"
          class="w-full px-3 py-1.5 bg-velvet-700 hover:bg-velvet-600 disabled:bg-velvet-700/40 disabled:cursor-not-allowed text-white disabled:text-velvet-600 rounded-lg transition-colors font-semibold text-xs"
        >
          + Afegir Etiqueta
        </button>
      </div>

      <!-- Tags List by Category -->
      <div *ngIf="tagService.tags().length > 0; else noTags" class="space-y-2">
        <div *ngFor="let category of tagService.categories()" class="space-y-1.5">
          <h5 class="font-semibold text-white text-xs">{{ category }}</h5>
          <div class="space-y-1">
            <div
              *ngFor="let tag of getTagsByCategory(category)()"
              class="flex items-center gap-2 p-2.5 bg-velvet-900 rounded-lg border border-velvet-700 hover:border-velvet-600 transition-colors"
            >
              <!-- Display Mode -->
              <div *ngIf="editingId() !== tag.id" class="flex-1 flex items-center justify-between">
                <div>
                  <p class="text-xs text-white">
                    <span class="font-semibold text-velvet-300"
                      >{{ tag.category | tagCategory }}:</span
                    >
                    {{ tag.value | tagValue }}
                  </p>
                  <p class="text-xs text-velvet-600 mt-0.5">
                    {{ formatDate(tag.createdAt) }}
                  </p>
                </div>
                <div class="flex gap-1.5">
                  <button
                    (click)="startEdit(tag)"
                    class="px-2 py-1 text-xs bg-velvet-700 hover:bg-velvet-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Editar
                  </button>
                  <button
                    (click)="deleteTag(tag.id)"
                    class="px-2 py-1 text-xs bg-velvet-700/60 hover:bg-velvet-700 text-velvet-200 rounded-lg transition-colors font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <!-- Edit Mode -->
              <div *ngIf="editingId() === tag.id" class="flex-1 flex gap-1.5">
                <input
                  type="text"
                  [(ngModel)]="editingTag().category"
                  class="flex-1 px-2.5 py-1.5 bg-velvet-800 border border-velvet-700 rounded-lg text-xs text-white focus:outline-none focus:border-velvet-600 focus:ring-2 focus:ring-velvet-700"
                />
                <input
                  type="text"
                  [(ngModel)]="editingTag().value"
                  class="flex-1 px-2.5 py-1.5 bg-velvet-800 border border-velvet-700 rounded-lg text-xs text-white focus:outline-none focus:border-velvet-600 focus:ring-2 focus:ring-velvet-700"
                />
                <button
                  (click)="saveEdit()"
                  class="px-2 py-1.5 bg-velvet-700 hover:bg-velvet-600 text-white rounded-lg transition-colors text-xs font-medium"
                >
                  Guardar
                </button>
                <button
                  (click)="cancelEdit()"
                  class="px-2 py-1.5 bg-velvet-700/60 hover:bg-velvet-700 text-velvet-200 rounded-lg transition-colors text-xs font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Tags -->
      <ng-template #noTags>
        <div
          class="p-4 text-center rounded-lg bg-velvet-900 border-2 border-dashed border-velvet-700"
        >
          <p class="text-velvet-300 font-semibold text-xs">No hi ha etiquetes</p>
          <p class="text-velvet-600 text-xs mt-0.5">Afegeix la primera etiqueta per començar</p>
        </div>
      </ng-template>

      <!-- Actions -->
      <div *ngIf="tagService.tags().length > 0" class="border-t border-velvet-700 pt-2 flex gap-2">
        <button
          (click)="clearAll()"
          class="w-full px-3 py-1.5 bg-velvet-700/60 hover:bg-velvet-700 text-velvet-200 rounded-lg font-semibold transition-colors text-xs"
        >
          Netejar tots
        </button>
      </div>
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
  editingId = signal<string | null>(null);
  editingTag = signal<Tag>({ category: '', value: '' });

  getTagsByCategory = (category: string) => {
    return this.tagService.getTagsByCategory(category);
  };

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

  startEdit(tag: TagTemplate): void {
    this.editingId.set(tag.id);
    this.editingTag.set({ category: tag.category, value: tag.value });
  }

  saveEdit(): void {
    const id = this.editingId();
    const tag = this.editingTag();

    if (id && tag.category.trim() && tag.value.trim()) {
      this.tagService.updateTag(id, {
        category: tag.category.trim(),
        value: tag.value.trim(),
      });
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editingTag.set({ category: '', value: '' });
  }

  deleteTag(id: string): void {
    if (confirm('Estàs segur que vols eliminar aquesta etiqueta?')) {
      this.tagService.deleteTag(id);
    }
  }

  clearAll(): void {
    if (confirm('Estàs segur que vols eliminar TOTES les etiquetes?')) {
      this.tagService.clearAllTags();
    }
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
