# Future Chronicles — Speaker Archive (website)

A complete, ready-to-deploy Next.js site. It builds and runs with **no database
and no environment variables**, so it will go live on Vercel first try.

Verified before hand-off: `npm install` → `npm run build` → `npm start` all pass,
`npm audit` reports 0 vulnerabilities, and every page returns 200.

---

## Put it online (about 10 minutes)

### Step 1 — Make a GitHub account and a repo
1. Go to **github.com** and sign up (free) if you don't have an account.
2. Click the **+** in the top-right → **New repository**.
3. Name it `future-chronicles`. Leave everything else alone. Click
   **Create repository**.

### Step 2 — Put these files in the repo
Easiest way, no command line:
1. On your new empty repo page, click **uploading an existing file**.
2. Unzip the folder I sent you.
3. Drag **everything inside** the folder into the browser window
   (the `app` folder, the `content` folder, `package.json`, and the rest).
   - **Do not** upload `node_modules` or `.next` if you see them — they're
     rebuilt automatically and are far too big.
4. Click **Commit changes**.

### Step 3 — Connect it to Vercel
1. Go to **vercel.com** and click **Sign Up** → **Continue with GitHub**.
2. Click **Add New…** → **Project**.
3. Find `future-chronicles` in the list and click **Import**.
4. Change nothing. Click **Deploy**.
5. Wait about a minute. You'll get a link like
   `future-chronicles.vercel.app` — **that's your live site.**

### Step 4 — (Optional) Use your own web address
In Vercel: your project → **Settings** → **Domains** → add something like
`speakers.futurechronicles.org`. Vercel tells you the exact DNS record to add
wherever `futurechronicles.org` is registered.

---

## Changing the content later

All the words and people live in **one file**: `content/site.json`.

**The easy way — edit in the admin, then export:**
1. Open the Future Chronicles artifact and go to **Admin**.
2. Make your changes (add speakers, portraits, biographies, themes).
3. Press **Save & publish** (keeps the artifact up to date).
4. Press **Export for website** — this downloads `site.json`.
5. In GitHub, open `content/site.json` → click the **pencil** icon → delete
   everything → paste in the new file → **Commit changes**.
6. Vercel rebuilds automatically. Your live site updates in about a minute.

**The direct way:** edit `content/site.json` in GitHub yourself and commit. Same
result.

### Adding a portrait
Add it in the artifact admin (it embeds the image directly in the content file),
then export. Or put a picture in the `public/` folder and set that speaker's
`"portrait"` to `"/their-photo.jpg"`.

---

## What's here, and what isn't

**Included and working:** the public archive — home page with hero, speaker
grid, individual speaker pages, programme themes, footer. Fully static, fast,
and free to host.

**Deliberately not included:** the `/submit` form, the `/review` queue and the
`/admin` editor.

This is the important bit to understand. Your handover describes those pages
storing data in **Cloudflare D1** (database) and **Cloudflare R2** (file
storage). Those are Cloudflare products — **they do not exist on Vercel**. A
form on Vercel has nowhere to save anything unless you add a database, because
Vercel's file system is temporary and wiped between visits.

So rather than ship you a form that silently loses every submission, the split
is:

- **Vercel** hosts the public, published archive.
- **The artifact** is where you write and manage content, and it genuinely
  saves.
- **Export → commit** moves content from one to the other.

### If you later want submissions on the live site
You'd add a database (Vercel Postgres or Neon both have free tiers), then build
`/submit` and `/review` against it plus a password gate. That's a separate piece
of work — ask and I can do it, but it needs real credentials and testing rather
than guessed-at code.

---

## Running it on your own computer (optional)

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Technical notes

- **Next.js 16**, React 19, TypeScript. No Tailwind — plain CSS in
  `app/globals.css`, one less thing to break.
- **Fonts are self-hosted** (`app/fonts/*.woff2`, loaded via `next/font/local`),
  so the build never depends on Google Fonts being reachable.
- Michroma + Noto Sans and the cream/ink/rust/teal palette are taken from the
  real futurechronicles.org stylesheet.
- Speaker pages are pre-rendered as static HTML via `generateStaticParams`.
