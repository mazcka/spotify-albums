import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Album } from '../../../services/album-data.service';

@Component({
    selector: 'app-album-card',
    
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './album-card.component.html',
    styleUrl: './album-card.component.scss'
})
export class AlbumCardComponent {
    private router = inject(Router);

    album = input.required<Album>();

    navigateToAlbum(): void {
        this.router.navigate(['/album', this.album().id]);
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
}

