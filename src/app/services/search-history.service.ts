import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchHistoryService {
  private readonly STORAGE_KEY = 'spotify_search_history';
  private readonly MAX_HISTORY = 5;

  readonly searchHistory = signal<string[]>([]);

  constructor() {
    this.loadHistory();

    effect(() => {
      const history = this.searchHistory();
      if (history.length > 0) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      }
    });
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored) as string[];
        this.searchHistory.set(history.slice(0, this.MAX_HISTORY));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }

  addToHistory(query: string): void {
    if (!query.trim()) return;

    const current = this.searchHistory();
    const trimmedQuery = query.trim();

    const filtered = current.filter(q => q !== trimmedQuery);

    const updated = [trimmedQuery, ...filtered].slice(0, this.MAX_HISTORY);
    this.searchHistory.set(updated);
  }

  removeFromHistory(query: string): void {
    const current = this.searchHistory();
    const filtered = current.filter(q => q !== query);
    this.searchHistory.set(filtered);
    
    if (filtered.length === 0) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  clearHistory(): void {
    this.searchHistory.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

