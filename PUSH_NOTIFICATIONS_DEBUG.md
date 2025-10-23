# Push Notifications - Debugging Guide

## Błąd 400 Bad Request

### Sprawdź w konsoli przeglądarki:

1. Otwórz DevTools (F12) → Console
2. Kliknij "Nowa kampania" → Wypełnij formularz → "Wyślij teraz"
3. Szukaj logów `[OneSignalRepository]`

### Częste przyczyny:

#### 1. Błędne credentials
```
OneSignal API error: {"errors":["Invalid app_id"]}
```
**Rozwiązanie:** Sprawdź VITE_ONESIGNAL_APP_ID i VITE_ONESIGNAL_REST_API_KEY w `.env`

#### 2. Brak subskrybentów
```
OneSignal API error: {"errors":["No recipients found"]}
```
**Rozwiązanie:** Musisz najpierw zasubskrybować użytkownika w `user-app`

#### 3. Błędne filters
```
OneSignal API error: {"errors":["Invalid filter field"]}
```
**Rozwiązanie:** Sprawdź czy tagi są poprawnie ustawione

### Test Mode (bez filters):

Zmodyfikuj `buildFilters()` w `onesignal.repository.ts`:

```typescript
// TEMPORARY: For testing without subscribers
private buildFilters(tenantId: string, segmentType?: string) {
  // COMMENT OUT filters for testing:
  // return [{ field: 'tag', key: `tenant_${tenantId}`, relation: '=', value: 'true' }];
  
  // Use "All" segment instead:
  return undefined; // Will use included_segments: ["All"] in API call
}
```

### Sprawdź OneSignal Dashboard:

1. Idź na https://onesignal.com/apps
2. Kliknij swoją aplikację
3. **Audience** → **All Users** → sprawdź czy masz subskrybentów
4. **Delivery** → **View All Notifications** → sprawdź historię

### Zasubskrybuj test użytkownika:

1. Otwórz `user-app` (localhost:5173)
2. Otwórz Console → zobaczysz `[NotificationService] OneSignal initialization started`
3. Kliknij "Włącz powiadomienia" (jeśli pojawi się prompt)
4. Sprawdź w OneSignal Dashboard czy pojawił się nowy subscriber

### Debug Request Payload:

W konsoli powinieneś zobaczyć:
```javascript
[OneSignalRepository] OneSignal request payload: {
  app_id: "your-app-id",
  headings: { en: "Test" },
  contents: { en: "Test message" },
  filters: [
    { field: "tag", key: "tenant_xxx", relation: "=", value: "true" }
  ]
}
```

### Jeśli nic nie działa:

1. Sprawdź czy OneSignal App jest w trybie "Live" (nie "Development Only")
2. Dodaj domenę localhost w OneSignal → Settings → Web Push → Allowed Origins
3. Sprawdź czy REST API Key ma uprawnienia do wysyłania notyfikacji

