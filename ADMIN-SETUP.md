# Turning on the admin page (about 10 minutes)

Your site is live, but `/admin` needs three secrets before it will let anyone in.
Until you add them it shows "Admin isn't switched on yet" — it never fails
silently or lets anyone through.

**How it works:** you edit on the live site → it saves your changes back into
your GitHub repo → Vercel notices and rebuilds → the site updates. No database.

---

## Step 1 — Make a GitHub key (so the site can save your edits)

1. Go to **github.com** → click your picture (top right) → **Settings**
2. Scroll to the very bottom → **Developer settings**
3. **Personal access tokens** → **Fine-grained tokens** → **Generate new token**
4. Fill in:
   - **Token name:** `future-chronicles-admin`
   - **Expiration:** 1 year
   - **Repository access:** *Only select repositories* → pick
     **futurechroniclesspeakerhub**
   - **Permissions** → **Repository permissions** → find **Contents** →
     set it to **Read and write**
     *(This is the only permission it needs.)*
5. Click **Generate token**
6. **Copy the token now** — it starts with `github_pat_...` and GitHub will
   never show it again. Paste it somewhere safe for a minute.

## Step 2 — Add three settings in Vercel

1. Go to **vercel.com** → your **futurechroniclesspeakerhub** project
2. **Settings** → **Environment Variables**
3. Add these three, one at a time (click **Save** after each):

   | Name | Value |
   |---|---|
   | `ADMIN_PASSWORD` | any password you invent — this is what you'll type to log in |
   | `GITHUB_TOKEN` | the `github_pat_...` token you just copied |
   | `GITHUB_REPO` | `interactivefilm25/futurechroniclesspeakerhub` |

   Leave the environment tick-boxes as they are (all three ticked is fine).

## Step 3 — Redeploy so it picks them up

Environment variables only apply to **new** builds.

1. In Vercel, go to the **Deployments** tab
2. Click the **⋯** menu on the newest deployment → **Redeploy** → **Redeploy**
3. Wait about a minute

## Step 4 — Use it

1. Go to **your-site.vercel.app/admin**
2. Type the password you chose in Step 2
3. Edit anything — speakers, biographies, portraits, themes, the home page text
4. Press **Save & publish**
5. Wait about a minute and refresh the live site. Your changes are there.

---

## Things worth knowing

- **`/admin` is not linked from the site.** Nobody finds it by browsing —
  you have to type the address. It's also set to `noindex` so Google won't
  list it.
- **Saving is a real commit.** Every save shows up in your GitHub repo's
  history, so you can always see what changed and undo it there.
- **Portraits** are uploaded to `public/portraits/` in the repo and resized to
  800px automatically. Only upload photos you have permission to publish.
- **If two people edit at once**, the second person gets a "someone else
  changed this" warning rather than silently overwriting the first.
- **Changing your password later:** update `ADMIN_PASSWORD` in Vercel and
  redeploy. Everyone gets signed out.
- **If you lose the GitHub token**, just make a new one and update
  `GITHUB_TOKEN` in Vercel.

## If something goes wrong

The admin shows you the real error rather than hiding it:

- *"Admin isn't switched on yet"* → a variable is missing, or you didn't
  redeploy after adding them (Step 3).
- *"Bad credentials"* → the `GITHUB_TOKEN` is wrong, expired, or was copied
  incompletely.
- *"Not Found" when saving* → `GITHUB_REPO` is wrong. It must be exactly
  `owner/repository`, e.g. `interactivefilm25/futurechroniclesspeakerhub`.
- *"Resource not accessible"* → the token is missing the **Contents:
  Read and write** permission from Step 1.
