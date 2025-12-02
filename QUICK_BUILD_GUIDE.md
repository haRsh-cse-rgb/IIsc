# Quick Build Guide - One Page Reference

## For Android (Windows/Mac/Linux)

Run these commands in your terminal:

```bash
npm run build              # Build Next.js app (creates .next directory)
npm run cap:sync          # Prepares out directory and syncs with Capacitor
npm run cap:open:android  # Open Android Studio
```

**Note:** `cap:sync` automatically runs `cap:prepare` which creates the `out` directory that Capacitor needs.

Then in Android Studio:
1. Wait for Gradle sync
2. **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. After building, run in terminal: `npm run cap:copy-apk`

**That's it!** The APK will be automatically copied to `public/apps/app-release.apk` and users can download the Android app.

**Alternative:** You can manually copy the APK from `android/app/build/outputs/apk/release/app-release.apk` to `public/apps/app-release.apk`

---

## For iOS (Mac Only - Requires Xcode)

Run these commands in your terminal:

```bash
npm run build              # Build Next.js app (creates .next directory)
npm run cap:sync          # Prepares out directory and syncs with Capacitor
npm run cap:open:ios      # Open Xcode
```

**Note:** `cap:sync` automatically runs `cap:prepare` which creates the `out` directory that Capacitor needs.

Then in Xcode:
1. Select your development team
2. **Product > Archive**
3. Click **Distribute App**
4. Choose distribution method
5. Export the IPA file
6. Copy it to: `public/apps/STIS-Conference.ipa`

**That's it!** Now users can download the iOS app.

---

## Important Notes

- **Android**: Can be built on Windows, Mac, or Linux
- **iOS**: Can ONLY be built on Mac (requires Xcode)
- Both platforms use the **same first 2 commands** (`npm run build` and `npm run cap:sync`)
- The difference is the 3rd command: `cap:open:android` vs `cap:open:ios`
- After building, place the APK/IPA files in `public/apps/` folder
- Once files are in place, the download button will work automatically!

---

## One-Time Setup (if not done already)

If you haven't added the iOS platform yet:

```bash
npm run cap:add:ios       # Add iOS platform (Mac only)
```

Android platform is already added, so you don't need to run `cap:add:android`.

---

## After Making Code Changes

**You don't need to rebuild every time!** It depends on what changed:

- **Frontend changes (UI/pages)**: Need full rebuild
- **Backend/API changes**: Just deploy server (no app rebuild needed if using server URL)
- **Config changes**: Just sync and rebuild APK

See `WHEN_TO_REBUILD.md` for detailed guide on when each step is needed.

