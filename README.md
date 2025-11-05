# Spotify Albums Application

An Angular v20 application for searching and viewing Spotify albums.

## Features

- **Secure PKCE Authentication** - Implements the Authorization Code Flow with PKCE for secure client-side authentication
- **Album Search** - Allows searching for Spotify albums with built-in debounce logic for performance
- **Search History** - Saves and displays the last 5 unique search queries.
- **Album Details** - Provides full viewing of selected album details, including track listings and core metadata.
- **User Registration** - A dedicated registration form complete with comprehensive client-side validation (including Regex).
- **Advanced UI/UX** - Modern, responsive design utilizing Angular Material components.

## Requirements

- Node.js 22
- npm or yarn

## Installation

```bash
npm run install
```

## Spotify Client ID Setup

You must configure your Spotify application's Client ID in the following service file: `src/app/services/auth.service.ts`

```typescript
private readonly CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
```

In addition, ensure the Redirect URI is configured in your Spotify Developer Dashboard:
- `http://127.0.0.1:4200/callback` (לפיתוח)

## Running the Application

```bash
npm run start
```

The application will be accessible at `http://127.0.0.1:4200`

## Project Structure

- `src/app/services/` - Core services (Auth, AlbumData, SearchHistory, Security)
- `src/app/components/` - Application components (Header, Search, Album, Register, Callback...)
- `src/app/interceptors/` - HTTP Interceptors (Auth, Error)
- `src/app/app.routes.ts` - Application routeing definitions
- `src/main.ts` - Application bootstrap

## Technologies

- Angular v20
- Standalone Components
- Angular Material
- RxJS
- SCSS
- Signals (State Management)
- New Control Flow (`@if`, `@for`, `@switch`, `@let`)
