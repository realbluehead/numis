import { Injectable, inject } from '@angular/core';
import { effect, signal, computed } from '@angular/core';
import { Coin, CoinInput, Tag } from '../models/coin.model';
import { TagService } from './tag.service';

@Injectable({
  providedIn: 'root',
})
export class CoinStore {
  private readonly STORAGE_KEY = 'numis-coins';
  private tagService = inject(TagService);

  // Signals
  private coinsSignal = signal<Coin[]>(this.loadFromStorage());
  private selectedFiltersSignal = signal<{ category: string; values: string[] }[]>([]);
  private weightRangeSignal = signal<{ min: number; max: number }>({ min: 0, max: 1000 });
  private diameterRangeSignal = signal<{ min: number; max: number }>({ min: 0, max: 1000 });

  // Computed
  coins = this.coinsSignal.asReadonly();
  selectedFilters = this.selectedFiltersSignal.asReadonly();
  weightRange = this.weightRangeSignal.asReadonly();
  diameterRange = this.diameterRangeSignal.asReadonly();

  allTags = computed(() => {
    const tags = new Map<string, Set<string>>();

    this.coinsSignal().forEach((coin) => {
      coin.tags.forEach((tagId) => {
        const tag = this.tagService.getTag(tagId);
        if (tag) {
          if (!tags.has(tag.category)) {
            tags.set(tag.category, new Set());
          }
          tags.get(tag.category)!.add(tag.value);
        }
      });
    });

    const result: { category: string; values: string[] }[] = [];
    tags.forEach((values, category) => {
      result.push({ category, values: Array.from(values).sort() });
    });

    return result.sort((a, b) => a.category.localeCompare(b.category));
  });

  // Available tags based on current tag filters (for cascading/dependent filters)
  availableTags = computed(() => {
    const filters = this.selectedFiltersSignal();
    const tags = new Map<string, Set<string>>();

    // Get coins that match the current tag filters
    const coinsMatchingFilters = this.coinsSignal().filter((coin) => {
      if (filters.length === 0) return true;

      return filters.every((filter) => {
        return filter.values.some((value) => {
          return coin.tags.some((tagId) => {
            const tag = this.tagService.getTag(tagId);
            return tag && tag.category === filter.category && tag.value === value;
          });
        });
      });
    });

    // Extract tags from filtered coins
    coinsMatchingFilters.forEach((coin) => {
      coin.tags.forEach((tagId) => {
        const tag = this.tagService.getTag(tagId);
        if (tag) {
          if (!tags.has(tag.category)) {
            tags.set(tag.category, new Set());
          }
          tags.get(tag.category)!.add(tag.value);
        }
      });
    });

    const result: { category: string; values: string[] }[] = [];
    tags.forEach((values, category) => {
      result.push({ category, values: Array.from(values).sort() });
    });

    return result.sort((a, b) => a.category.localeCompare(b.category));
  });

  filteredCoins = computed(() => {
    const filters = this.selectedFiltersSignal();
    const weightRange = this.weightRangeSignal();
    const diameterRange = this.diameterRangeSignal();

    return this.coinsSignal()
      .filter((coin) => {
        // Check tag filters
        const tagsMatch =
          filters.length === 0 ||
          filters.every((filter) => {
            return filter.values.some((value) => {
              return coin.tags.some((tagId) => {
                const tag = this.tagService.getTag(tagId);
                return tag && tag.category === filter.category && tag.value === value;
              });
            });
          });

        // Check weight range
        const weightMatches =
          !coin.weight || (coin.weight >= weightRange.min && coin.weight <= weightRange.max);

        // Check diameter range
        const diameterMatches =
          !coin.diameter ||
          (coin.diameter >= diameterRange.min && coin.diameter <= diameterRange.max);

        return tagsMatch && weightMatches && diameterMatches;
      })
      .sort((a, b) => {
        const refA = a.reference || '';
        const refB = b.reference || '';
        return refB.localeCompare(refA);
      });
  });

  constructor() {
    // Persist to localStorage when coins change
    effect(() => {
      const coins = this.coinsSignal();
      this.saveToStorage(coins);
    });
  }

  // CRUD Operations
  addCoin(input: CoinInput): void {
    const newCoin: Coin = {
      ...input,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.coinsSignal.update((coins) => [...coins, newCoin]);
  }

  updateCoin(id: string, input: CoinInput): void {
    this.coinsSignal.update((coins) =>
      coins.map((coin) =>
        coin.id === id ? { ...input, id, createdAt: coin.createdAt!, updatedAt: new Date() } : coin,
      ),
    );
  }

  deleteCoin(id: string): void {
    this.coinsSignal.update((coins) => coins.filter((coin) => coin.id !== id));
  }

  getCoinById(id: string): Coin | undefined {
    return this.coinsSignal().find((coin) => coin.id === id);
  }

  getNextReference(): string {
    const references = this.coinsSignal()
      .map((coin) => coin.reference)
      .filter((ref): ref is string => !!ref && ref.match(/^M\d{5}$/) !== null);

    if (references.length === 0) {
      return 'M00001';
    }

    // Extract the numeric part, find the max, and increment
    const numbers = references.map((ref) => parseInt(ref.substring(1), 10));
    const maxNumber = Math.max(...numbers);
    const nextNumber = Math.min(maxNumber + 1, 99999);

    return `M${String(nextNumber).padStart(5, '0')}`;
  }

  // Filter operations
  toggleFilter(category: string, value: string): void {
    this.selectedFiltersSignal.update((filters) => {
      const existing = filters.find((f) => f.category === category);

      if (!existing) {
        return [...filters, { category, values: [value] }];
      }

      const updatedFilters = filters
        .map((f) => {
          if (f.category === category) {
            const values = f.values.includes(value)
              ? f.values.filter((v) => v !== value)
              : [...f.values, value];

            return values.length > 0 ? { ...f, values } : null;
          }
          return f;
        })
        .filter((f): f is { category: string; values: string[] } => f !== null);

      return updatedFilters;
    });
  }

  clearFilters(): void {
    this.selectedFiltersSignal.set([]);
  }

  setWeightRange(min: number, max: number): void {
    this.weightRangeSignal.set({ min, max });
  }

  setDiameterRange(min: number, max: number): void {
    this.diameterRangeSignal.set({ min, max });
  }

  getWeightRange(): { min: number; max: number } {
    const weights = this.coinsSignal()
      .map((coin) => coin.weight)
      .filter((w): w is number => w !== undefined);

    if (weights.length === 0) {
      return { min: 0, max: 100 };
    }

    return {
      min: Math.floor(Math.min(...weights)),
      max: Math.ceil(Math.max(...weights)),
    };
  }

  getDiameterRange(): { min: number; max: number } {
    const diameters = this.coinsSignal()
      .map((coin) => coin.diameter)
      .filter((d): d is number => d !== undefined);

    if (diameters.length === 0) {
      return { min: 0, max: 100 };
    }

    return {
      min: Math.floor(Math.min(...diameters)),
      max: Math.ceil(Math.max(...diameters)),
    };
  }

  // Import/Export
  exportToJSON(): string {
    return JSON.stringify(this.coinsSignal(), null, 2);
  }

  importFromJSON(jsonData: string): boolean {
    try {
      const coins = JSON.parse(jsonData) as Coin[];

      // Validate structure
      if (!Array.isArray(coins)) {
        throw new Error('Invalid format: must be an array');
      }

      coins.forEach((coin) => {
        if (!coin.id || !Array.isArray(coin.images) || !Array.isArray(coin.tags)) {
          throw new Error('Invalid coin structure');
        }
      });

      this.coinsSignal.set(coins);
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }

  clearAll(): void {
    this.coinsSignal.set([]);
    this.clearFilters();
  }

  // Private methods
  private loadFromStorage(): Coin[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Load from storage error:', error);
      return [];
    }
  }

  private saveToStorage(coins: Coin[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(coins));
    } catch (error) {
      console.error('Save to storage error:', error);
    }
  }

  private generateId(): string {
    return `coin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
