import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CLIENT_ID = 'd3c37bda845744a7b6df516d40d10cec';
  private readonly REDIRECT_URI = this.getRedirectUri();
  private readonly SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
  private readonly SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

  private readonly TOKEN_STORAGE_KEY = 'spotify_token';
  private readonly REFRESH_STORAGE_KEY = 'spotify_refresh_token';
  private readonly EXPIRY_STORAGE_KEY = 'spotify_token_expiry';

  private getRedirectUri(): string {
    const origin = window.location.origin;
    const port = window.location.port || '4200';

    // Replace localhost with 127.0.0.1 for development
    // Also handle IPv6 localhost [::1]
    if (origin.includes('localhost') || origin.includes('[::1]')) {
      return `http://127.0.0.1:${port}/callback`;
    }

    return `${origin}/callback`;
  }

  private readonly accessToken = signal<string | null>(null);
  private readonly refreshToken = signal<string | null>(null);
  private readonly tokenExpiry = signal<number | null>(null);

  readonly isAuthenticated = computed(() => {
    const token = this.accessToken();
    const expiry = this.tokenExpiry();
    if (!token || !expiry) return false;
    return Date.now() < expiry;
  });

  readonly getAccessToken = () => this.accessToken();
  readonly getRefreshToken = () => this.refreshToken();
  readonly getTokenExpiry = () => this.tokenExpiry();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    try {
      const token = sessionStorage.getItem(this.TOKEN_STORAGE_KEY);
      const refresh = sessionStorage.getItem(this.REFRESH_STORAGE_KEY);
      const expiry = sessionStorage.getItem(this.EXPIRY_STORAGE_KEY);

      if (token && refresh && expiry) {
        const expiryTime = parseInt(expiry, 10);

        if (Date.now() < expiryTime || refresh) {
          this.accessToken.set(token);
          this.refreshToken.set(refresh);
          this.tokenExpiry.set(expiryTime);
        } else {
          this.clearStoredTokens();
        }
      }
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
      this.clearStoredTokens();
    }
  }

  private clearStoredTokens(): void {
    sessionStorage.removeItem(this.TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(this.REFRESH_STORAGE_KEY);
    sessionStorage.removeItem(this.EXPIRY_STORAGE_KEY);
  }

  private saveTokensToStorage(token: string, refresh: string, expiry: number): void {
    try {
      sessionStorage.setItem(this.TOKEN_STORAGE_KEY, token);
      sessionStorage.setItem(this.REFRESH_STORAGE_KEY, refresh);
      sessionStorage.setItem(this.EXPIRY_STORAGE_KEY, expiry.toString());
    } catch (error) {
      console.error('Error saving tokens to storage:', error);
    }
  }

  private async generateCodeVerifier(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);

    const base64 = btoa(String.fromCharCode(...array));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);

    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async login(): Promise<void> {
    try {
      const codeVerifier = await this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      sessionStorage.setItem('pkce_code_verifier', codeVerifier);

      const params = new URLSearchParams({
        client_id: this.CLIENT_ID,
        response_type: 'code',
        redirect_uri: this.REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        scope: 'user-read-private user-read-email'
      });

      window.location.href = `${this.SPOTIFY_AUTH_URL}?${params.toString()}`;
    } catch (error) {
      console.error('Error initiating login:', error);
      throw error;
    }
  }

  async handleCallback(code: string): Promise<void> {
    try {
      const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }

      sessionStorage.removeItem('pkce_code_verifier');

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.REDIRECT_URI,
        client_id: this.CLIENT_ID,
        code_verifier: codeVerifier
      });

      const response = await this.http.post<TokenResponse>(
        this.SPOTIFY_TOKEN_URL,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      ).toPromise();

      if (response) {
        this.setTokens(response);
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    const refresh = this.refreshToken();
    if (!refresh) {
      return null;
    }

    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh,
        client_id: this.CLIENT_ID
      });

      const response = await this.http.post<TokenResponse>(
        this.SPOTIFY_TOKEN_URL,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      ).toPromise();

      if (response) {
        const refreshToken = response.refresh_token || this.refreshToken() || '';
        this.setTokens({
          ...response,
          refresh_token: refreshToken
        });
        return this.accessToken();
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
      return null;
    }
  }

  private setTokens(response: TokenResponse): void {
    const expiryTime = Date.now() + (response.expires_in - 60) * 1000;

    this.accessToken.set(response.access_token);
    this.refreshToken.set(response.refresh_token);
    this.tokenExpiry.set(expiryTime);

    this.saveTokensToStorage(response.access_token, response.refresh_token, expiryTime);
  }

  logout(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.tokenExpiry.set(null);
    this.clearStoredTokens();
    this.router.navigate(['/']);
  }
}
