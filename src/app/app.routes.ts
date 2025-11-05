import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/search/search.component').then(m => m.SearchComponent),
    data: { title: 'חיפוש אלבומים' }
  },
  {
    path: 'album/:id',
    loadComponent: () => import('./components/album/album-details/album-details.component').then(m => m.AlbumDetailsComponent),
    data: { title: 'פרטי אלבום' }
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    data: { title: 'הרשמה' }
  },
  {
    path: 'callback',
    loadComponent: () => import('./components/callback/callback.component').then(m => m.CallbackComponent),
    data: { title: 'חיפוש אלבומים' }
  },
  {
    path: '**',
    redirectTo: '',
    data: { title: 'חיפוש אלבומים' }
  }
];
