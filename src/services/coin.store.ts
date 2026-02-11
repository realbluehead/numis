import { Injectable } from '@angular/core';
import { effect, signal, computed } from '@angular/core';
import { Coin, CoinInput, Tag } from '../models/coin.model';

@Injectable({
  providedIn: 'root',
})
export class CoinStore {
  private readonly STORAGE_KEY = 'numis-coins';

  // Signals
  private coinsSignal = signal<Coin[]>(this.loadFromStorage());
  private selectedFiltersSignal = signal<{ category: string; values: string[] }[]>([]);

  // Computed
  coins = this.coinsSignal.asReadonly();
  selectedFilters = this.selectedFiltersSignal.asReadonly();

  allTags = computed(() => {
    const tags = new Map<string, Set<string>>();

    this.coinsSignal().forEach((coin) => {
      coin.tags.forEach((tag) => {
        if (!tags.has(tag.category)) {
          tags.set(tag.category, new Set());
        }
        tags.get(tag.category)!.add(tag.value);
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

    if (filters.length === 0) {
      return this.coinsSignal();
    }

    // AND logic: coin must have ALL selected tag combinations
    return this.coinsSignal().filter((coin) => {
      return filters.every((filter) => {
        return filter.values.some((value) =>
          coin.tags.some((tag) => tag.category === filter.category && tag.value === value),
        );
      });
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
