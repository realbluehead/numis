import { Injectable } from '@angular/core';
import { signal, computed, effect } from '@angular/core';
import { Tag } from '../models/coin.model';

export interface TagTemplate extends Tag {
  id: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly STORAGE_KEY = 'numis-tags';

  private tagsSignal = signal<TagTemplate[]>(this.loadFromStorage());
  tags = this.tagsSignal.asReadonly();

  // Get unique categories
  categories = computed(() => {
    return Array.from(new Set(this.tagsSignal().map((t) => t.category))).sort();
  });

  // Get tags by category
  getTagsByCategory = (category: string) => {
    return computed(() =>
      this.tagsSignal()
        .filter((t) => t.category === category)
        .sort((a, b) => a.value.localeCompare(b.value)),
    );
  };

  constructor() {
    // Auto-save to localStorage whenever tags change
    effect(() => {
      this.tagsSignal();
      this.saveToStorage();
    });
  }

  addTag(tag: Tag): void {
    const newTag: TagTemplate = {
      ...tag,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.tagsSignal.update((tags) => [...tags, newTag]);
  }

  updateTag(id: string, tag: Tag): void {
    this.tagsSignal.update((tags) =>
      tags.map((t) => (t.id === id ? { ...t, category: tag.category, value: tag.value } : t)),
    );
  }

  deleteTag(id: string): void {
    this.tagsSignal.update((tags) => tags.filter((t) => t.id !== id));
  }

  getTag(id: string): TagTemplate | undefined {
    return this.tagsSignal().find((t) => t.id === id);
  }

  exportTags(): string {
    return JSON.stringify(this.tagsSignal(), null, 2);
  }

  importTags(jsonData: string): void {
    try {
      const imported = JSON.parse(jsonData) as TagTemplate[];

      // Validate structure
      if (!Array.isArray(imported)) {
        throw new Error('Invalid format');
      }

      // Map to ensure IDs are unique
      const newTags = imported.map((tag) => ({
        ...tag,
        id: this.generateId(),
        createdAt: new Date(tag.createdAt || Date.now()),
      }));

      this.tagsSignal.set([...this.tagsSignal(), ...newTags]);
    } catch (error) {
      throw new Error('Error importing tags: ' + (error as Error).message);
    }
  }

  clearAllTags(): void {
    this.tagsSignal.set([]);
  }

  // Typeahead helpers
  searchCategories(query: string): string[] {
    if (!query.trim()) {
      return this.categories();
    }

    const lowerQuery = query.toLowerCase();
    return Array.from(
      new Set(
        this.tagsSignal()
          .filter((t) => t.category.toLowerCase().includes(lowerQuery))
          .map((t) => t.category),
      ),
    ).sort();
  }

  searchValuesByCategory(category: string, query: string): string[] {
    const tags = this.tagsSignal().filter((t) => t.category === category);

    if (!query.trim()) {
      return tags.map((t) => t.value).sort();
    }

    const lowerQuery = query.toLowerCase();
    return Array.from(
      new Set(tags.filter((t) => t.value.toLowerCase().includes(lowerQuery)).map((t) => t.value)),
    ).sort();
  }

  private loadFromStorage(): TagTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const tags = JSON.parse(stored) as TagTemplate[];
        return tags.map((tag) => ({
          ...tag,
          createdAt: new Date(tag.createdAt),
        }));
      }
    } catch (error) {
      console.error('Error loading tags from localStorage:', error);
    }
    return [];
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tagsSignal()));
    } catch (error) {
      console.error('Error saving tags to localStorage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
