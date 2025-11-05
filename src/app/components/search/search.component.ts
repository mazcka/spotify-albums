import { Component, signal, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AlbumDataService, Album } from '../../services/album-data.service';
import { SearchHistoryService } from '../../services/search-history.service';
import { AuthService } from '../../services/auth.service';
import { SearchHistoryComponent } from './search-history/search-history.component';
import { AlbumCardComponent } from '../album/album-card/album-card.component';
import { SearchWelcomeComponent } from './search-welcome/search-welcome.component';

@Component({
  selector: 'app-search',

  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    SearchHistoryComponent,
    AlbumCardComponent,
    SearchWelcomeComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  private router = inject(Router);
  private albumDataService = inject(AlbumDataService);
  private searchHistoryService = inject(SearchHistoryService);
  private authService = inject(AuthService);

  readonly searchQuery = signal('');
  readonly searchResults = this.albumDataService.searchResults;
  readonly isLoading = this.albumDataService.isLoading;
  readonly error = this.albumDataService.error;
  readonly hasMore = this.albumDataService.hasMore;
  readonly history = this.searchHistoryService.searchHistory;
  readonly isAuthenticated = this.authService.isAuthenticated;

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(query => {
      if (query.trim()) {
        this.performSearch(query);
      }
    });

    effect(() => {
      const query = this.searchQuery();
      const currentServiceQuery = this.albumDataService.currentQuery();
      if (query !== currentServiceQuery) {
        this.searchSubject.next(query);
      }
    });
  }

  ngOnInit(): void {
    const savedQuery = this.albumDataService.currentQuery();

    if (savedQuery && savedQuery.trim()) {
      this.searchQuery.set(savedQuery);
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.albumDataService.searchResults.set([]);
    this.albumDataService.currentQuery.set('');
    this.albumDataService.hasMore.set(false);
  }

  onHistoryQuerySelect(query: string): void {
    this.searchQuery.set(query);
    this.performSearch(query);
  }

  onHistoryQueryRemove(query: string): void {
    this.searchHistoryService.removeFromHistory(query);
  }

  private async performSearch(query: string): Promise<void> {
    try {
      await this.albumDataService.searchAlbums(query);
      this.searchHistoryService.addToHistory(query);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  readonly isLoadingMore = signal<boolean>(false);

  loadMore(): void {
    if (this.isLoadingMore() || this.isLoading()) {
      return;
    }

    this.isLoadingMore.set(true);
    this.albumDataService.loadMoreAlbums().finally(() => {
      this.isLoadingMore.set(false);
    });
  }

  onScrolled(event: Event): void {
    const element = event.target as HTMLElement;
    if (!element) return;

    const threshold = 300; // Load more when 300px from bottom
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      if (this.hasMore() && !this.isLoading() && !this.isLoadingMore()) {
        this.loadMore();
      }
    }
  }

  login(): void {
    this.authService.login();
  }
}
