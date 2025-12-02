# When Do You Need to Rebuild?

## Quick Answer

**Not every time!** It depends on what you changed:

## Scenario 1: Changed Frontend Code (React/Next.js Pages/Components)

**Examples:**
- Changed a page layout
- Updated UI components
- Modified styles
- Changed routing

**Steps needed:**
```bash
npm run build              # Rebuild Next.js
npm run cap:sync          # Sync with Capacitor
# Then rebuild APK in Android Studio
npm run cap:copy-apk       # Copy the new APK
```

**Why:** Frontend changes need to be bundled into the app.

---

## Scenario 2: Changed Backend/API Code Only

**Examples:**
- Modified API routes (`app/api/*`)
- Changed database logic
- Updated server-side code

**Steps needed:**
```bash
# Just deploy your server changes
# NO need to rebuild the app!
```

**Why:** If you're using the server URL approach (configured in `capacitor.config.ts`), API calls go to your server. The app doesn't need to be rebuilt.

**Note:** Make sure `capacitor.config.ts` has:
```typescript
server: {
  url: 'https://your-production-url.com'
}
```

---

## Scenario 3: Changed Capacitor Config or Native Features

**Examples:**
- Modified `capacitor.config.ts`
- Added new Capacitor plugins
- Changed app name/ID

**Steps needed:**
```bash
npm run cap:sync          # Sync changes
# Then rebuild APK in Android Studio
npm run cap:copy-apk       # Copy the new APK
```

**Why:** Native configuration changes need to be synced.

---

## Scenario 4: Changed Environment Variables or API URLs

**Examples:**
- Changed API endpoint URLs
- Updated environment variables

**Steps needed:**
```bash
npm run build              # Rebuild to include new env vars
npm run cap:sync          # Sync
# Then rebuild APK in Android Studio
npm run cap:copy-apk       # Copy the new APK
```

**Why:** Environment variables are baked into the build.

---

## Development Workflow Tips

### For Rapid Development:

1. **Test in browser first** - Make changes and test at `http://localhost:3000`
2. **Only rebuild app when needed** - Use the scenarios above
3. **Use server URL approach** - This way API changes don't require app rebuilds

### Quick Commands Reference:

```bash
# Full rebuild (when frontend changes)
npm run build && npm run cap:sync

# Just sync (when config changes)
npm run cap:sync

# Copy APK after building in Android Studio
npm run cap:copy-apk

# Open Android Studio
npm run cap:open:android
```

---

## Summary Table

| What Changed | Build Next.js | Sync Capacitor | Rebuild APK | Copy APK |
|-------------|---------------|----------------|-------------|----------|
| Frontend (UI/Pages) | ✅ | ✅ | ✅ | ✅ |
| Backend/API only | ❌ | ❌ | ❌ | ❌ |
| Capacitor config | ❌ | ✅ | ✅ | ✅ |
| Environment vars | ✅ | ✅ | ✅ | ✅ |
| Native plugins | ❌ | ✅ | ✅ | ✅ |

---

## Pro Tip 💡

**For most changes during development:**
- Test in browser first (`npm run dev`)
- Only rebuild the app when you're ready to test on a real device
- Use the server URL approach so API changes don't require app rebuilds

