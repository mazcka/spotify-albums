# Spotify Albums Application

אפליקציית Angular v20+ לחיפוש וצפייה באלבומי Spotify.

## תכונות

- **אימות PKCE מאובטח** - שימוש ב-Authorization Code Flow עם PKCE
- **חיפוש אלבומים** - חיפוש אלבומים ב-Spotify עם debounce
- **היסטוריית חיפושים** - שמירת 5 חיפושים אחרונים
- **פרטי אלבום** - צפייה מלאה בפרטי אלבום ורשימת שירים
- **הרשמה** - טופס הרשמה עם ולידציה מלאה
- **UI/UX מעולה** - עיצוב מודרני ורספונסיבי עם Angular Material

## דרישות

- Node.js 18+
- npm או yarn

## התקנה

```bash
npm install
```

## הגדרת Spotify Client ID

עליך להגדיר את ה-Client ID שלך ב-`src/app/services/auth.service.ts`:

```typescript
private readonly CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
```

כמו כן, ודא שהגדרת את ה-Redirect URI ב-Spotify Dashboard:
- `http://localhost:4200/callback` (לפיתוח)
- `https://yourdomain.com/callback` (לייצור)

## הרצה

```bash
npm start
```

האפליקציה תרוץ על `http://localhost:4200`

## מבנה הפרויקט

- `src/app/services/` - שירותים (Auth, AlbumData, SearchHistory, Security)
- `src/app/components/` - קומפוננטות (Header, Search, AlbumDetails, Register, Callback)
- `src/app/interceptors/` - HTTP Interceptors (Auth, Error)
- `src/app/app.routes.ts` - הגדרת Routes
- `src/main.ts` - Bootstrap של האפליקציה

## טכנולוגיות

- Angular v20+
- Angular Material
- RxJS
- SCSS
- Signals (State Management)
- Standalone Components
- New Control Flow (@if, @for, @switch)

