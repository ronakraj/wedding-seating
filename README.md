# Wedding Seating Lookup

A simple static web app to look up wedding seating by name. Host for free on GitHub Pages and share the link via a QR code.

## How it works
- The page loads `seating.json`, which contains your guest list and table/seat assignments.
- Guests type their name, and the app shows their table and seat (if provided).
- Name matching is case-insensitive and diacritic-insensitive. Optional `aliases` help with common variations.

## Edit the seating plan
1. Open `seating.json`.
2. Replace the sample entries with your real guest list. Fields:
   - `name` (required): Full display name, e.g., `"Alex Johnson"`.
   - `aliases` (optional): Array of alternate spellings, e.g., `["Alex J.", "Alexander Johnson"]`.
   - `table` (required): The table label or number, e.g., `"Table 5"`.
   - `seat` (optional): Seat number if you assign specific seats, e.g., `8`.
   - `note` (optional): Any extra detail (dietary, side, etc.).

Tip: Keep names consistent with invitations. Add aliases for common variations or punctuation differences.

## Host for free with GitHub Pages
1. Push these files to the `main` branch.
2. Enable GitHub Pages:
   - Repo → Settings → Pages.
   - “Build and deployment”: Select “Deploy from a branch”.
   - Branch: `main`, Folder: `/ (root)`. Save.
3. Your site will publish at a URL like `https://<your-username>.github.io/wedding-seating/`.

Notes:
- If you don’t see Pages settings for private repos on your account plan, either:
  - Make a separate public repo (e.g., `wedding-seating-site`) with these same files just for hosting, or
  - Use a free static host (Cloudflare Pages, Netlify, Vercel) and drag-drop or connect your repo.

## Share via QR code
Once you have your site URL:
- In Chrome/Edge: open your site → click the address bar Share icon → “Create QR code” → download.
- Or use any online QR generator. Paste your site URL and export the PNG/SVG.

## Local testing
Some browsers block `fetch` of local files when opened directly. Use a local server:
- Python: `python3 -m http.server 8080` then visit http://localhost:8080
- Node: `npx serve` then visit the shown URL.
