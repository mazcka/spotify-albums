import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { AlbumDataService, AlbumDetails } from '../../../services/album-data.service';

@Component({
  selector: 'app-album-details',
  
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule
  ],
  templateUrl: './album-details.component.html',
  styleUrl: './album-details.component.scss'
})
export class AlbumDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private albumDataService = inject(AlbumDataService);

  readonly album = signal<AlbumDetails | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAlbumDetails(id);
    } else {
      this.error.set('Album ID not found');
    }
  }

  private async loadAlbumDetails(id: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const album = await this.albumDataService.getAlbumDetails(id);
      if (!album) {
        this.error.set('Album not found');
      } else {
        this.album.set(album);
      }
    } catch (error: any) {
      this.error.set(error?.message || 'Failed to load album details');
    } finally {
      this.isLoading.set(false);
    }
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  }

  getArtistsNames(artists: Array<{ name: string }>): string {
    if (!artists || artists.length === 0) return '';
    return artists.map(artist => artist.name).join(', ');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
