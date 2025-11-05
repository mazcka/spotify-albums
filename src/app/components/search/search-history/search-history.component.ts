import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-history',
  
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './search-history.component.html',
  styleUrl: './search-history.component.scss'
})
export class SearchHistoryComponent {
  history = input.required<string[]>();
  onQuerySelect = output<string>();
  onQueryRemove = output<string>();

  selectQuery(query: string): void {
    this.onQuerySelect.emit(query);
  }

  removeQuery(query: string, event: Event): void {
    event.stopPropagation();
    this.onQueryRemove.emit(query);
  }
}

