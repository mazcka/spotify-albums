import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParams['code'];
    const error = this.route.snapshot.queryParams['error'];

    if (error) {
      console.error('Authorization error:', error);
      window.location.href = '/';
      return;
    }

    if (code) {
      this.authService.handleCallback(code).catch(err => {
        console.error('Callback error:', err);
        window.location.href = '/';
      });
    } else {
      window.location.href = '/';
    }
  }
}

