# Clarra — local setup

One-time setup to get the dev server running end-to-end (auth + Firestore + pair flow).

## 1. Create a Firebase project

1. Go to <https://console.firebase.google.com> → **Add project**. Name it `clarra-dev` (or whatever).
2. **Authentication → Get started** → enable **Google** and **Email/Password** providers.
3. **Firestore Database → Create database** → start in **Production mode**, pick the region closest to you.
4. **Project Settings** (gear icon top-left) → **General** tab → **Your apps** → **Add app → Web** (`</>`). Name it `clarra-web`. Copy the `firebaseConfig` object values.

## 2. Generate a service-account key (server-side)

1. **Project Settings → Service accounts → Generate new private key** → downloads a JSON file.
2. You'll paste the *entire file contents as one line* into `.env.local` below.

   ```bash
   cat ~/Downloads/clarra-dev-*.json | tr -d '\n' | pbcopy
   ```

## 3. Fill `.env.local`

Open [.env.local](./.env.local) and paste:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=<apiKey from step 1.4>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<authDomain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<projectId>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<storageBucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId>
NEXT_PUBLIC_FIREBASE_APP_ID=<appId>

FIREBASE_SERVICE_ACCOUNT=<paste the single-line JSON from step 2>
FIREBASE_SESSION_SECRET=<run: openssl rand -base64 48>
```

Leave `R2_*` and `STRIPE_*` blank for now — they're wired in Phase 3 and 2.3.

## 4. Deploy Firestore rules (optional but recommended)

Install the Firebase CLI if you don't have it:

```bash
npm i -g firebase-tools
firebase login
firebase use <projectId>            # or: firebase use --add
firebase deploy --only firestore
```

This ships [firestore.rules](./firestore.rules) and [firestore.indexes.json](./firestore.indexes.json) to the project. You can skip this if you're only testing locally with the dashboard, but cross-workspace reads will NOT be blocked until rules are deployed.

## 5. Add the localhost auth origin

In Firebase Console → **Authentication → Settings → Authorized domains** add `localhost` if it isn't already there. This is what makes Google sign-in redirect work in dev.

## 6. Run it

```bash
cd "/Users/ahmaadharrison/Chaos Digital Software/clarra"
pnpm dev
```

Open <http://localhost:3000>.

## 7. Phase 1 smoke test

1. **Landing** (<http://localhost:3000>) → **Start free** → `/signup`.
2. Sign up with Google or email. You should land on `/app/library` with an empty state.
3. Click **New slideshow**, name it "Test". Opens the editor.
4. Add 3 slides (try a Photo, a Portrait, and a Quote).
5. In a second browser window (or private tab), open <http://localhost:3000/screen>. A big pairing code appears.
6. Back in the dashboard, go to **Displays → Pair display**. Enter the code.
7. The `/screen` window transitions to a live slideshow. Publish the slideshow from the editor to the new display.
8. Watch slides advance every ~6.5 seconds, with the chrome fading in/out on mouse move.

If step 7 takes >2s to swap, check the browser console for Firestore errors — usually a missing security-rule update.

## Troubleshooting

- **"FIREBASE_SERVICE_ACCOUNT env var missing"** — you haven't filled `.env.local` or the server didn't restart after you did. `pnpm dev` auto-reloads.
- **"invalid token" on sign-up** — `NEXT_PUBLIC_FIREBASE_*` values are wrong or the Firebase project ID doesn't match the service account.
- **Google popup says "access blocked"** — add `localhost` to Authorized domains in Firebase Auth settings (step 5).
- **Code pairing never resolves** — the screen uses `onSnapshot` on `pairingCodes/{code}`. If Firestore rules haven't been deployed, reads might be blocked. Check the Network tab in DevTools.
