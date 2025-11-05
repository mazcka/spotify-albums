import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Album {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  images: Array<{ url: string }>;
  release_date: string;
  total_tracks: number;
}

export interface AlbumSearchResponse {
  albums: {
    items: Album[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  };
}

export interface Track {
  id: string;
  name: string;
  duration_ms: number;
  track_number: number;
  artists: Array<{ name: string }>;
}

export interface AlbumDetails extends Album {
  tracks: {
    items: Track[];
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AlbumDataService {
  private readonly SPOTIFY_API_URL = 'https://api.spotify.com/v1';

  readonly searchResults = signal<Album[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly hasMore = signal<boolean>(false);
  readonly currentQuery = signal<string>('');
  private currentOffset = 0;
  private readonly limit = 20;

  constructor(private http: HttpClient) { }

  async searchAlbums(query: string, offset: number = 0): Promise<void> {
    if (!query.trim()) {
      this.searchResults.set([]);
      this.hasMore.set(false);
      this.currentQuery.set('');
      return;
    }

    if (offset === 0) {
      this.currentQuery.set(query.trim());
      this.currentOffset = 0;
      this.searchResults.set([]);
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.http.get<AlbumSearchResponse>(
        `${this.SPOTIFY_API_URL}/search`,
        {
          params: {
            q: this.currentQuery(),
            type: 'album',
            limit: this.limit.toString(),
            offset: offset.toString()
          }
        }
      ).toPromise();

      if (response) {
        if (offset === 0) {
          this.searchResults.set(response.albums.items);
        } else {
          const current = this.searchResults();
          this.searchResults.set([...current, ...response.albums.items]);
        }

        this.hasMore.set(!!response.albums.next);
        this.currentOffset = offset + response.albums.items.length;
      }
    } catch (error: any) {
      this.error.set(error?.message || 'Failed to search albums');
      if (offset === 0) {
        this.searchResults.set([]);
      }
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMoreAlbums(): Promise<void> {
    const query = this.currentQuery();
    if (!query || this.isLoading() || !this.hasMore()) {
      return;
    }

    await this.searchAlbums(query, this.currentOffset);
  }

  async getAlbumDetails(id: string): Promise<AlbumDetails | null> {
    try {
      const album = await this.http.get<AlbumDetails>(
        `${this.SPOTIFY_API_URL}/albums/${id}`
      ).toPromise();

      return album || null;
    } catch (error: any) {
      throw error;
    }
  }
}

