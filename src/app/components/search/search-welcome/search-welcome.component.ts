import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-welcome',

  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './search-welcome.component.html',
  styleUrl: './search-welcome.component.scss'
})
export class SearchWelcomeComponent {
}
