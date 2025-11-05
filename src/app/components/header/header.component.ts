import { Component, computed, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly currentRoute = signal<string>('');
  private readonly routeData = signal<any>(null);

  readonly pageTitle = computed(() => {
    const data = this.routeData();
    if (data && data.title) {
      return data.title;
    }
    return 'חיפוש אלבומים';
  });

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.iconRegistry.addSvgIcon(
      'spotify',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/spotify.svg')
    );

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.urlAfterRedirects);
        this.updateRouteData();
      });

    this.currentRoute.set(this.router.url);
    this.updateRouteData();
  }

  private updateRouteData(): void {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    this.routeData.set(route.snapshot.data);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}
