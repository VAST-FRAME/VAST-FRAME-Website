# VASTFRAME Website

Static site for VASTFRAME.com — hosted on GitHub Pages.

## File Structure

```
vastframe/
├── index.html          ← Home
├── games.html          ← Games
├── jobs.html           ← Jobs
├── contact.html        ← Contact
├── css/
│   └── style.css       ← All styles
└── assets/
    ├── bg.jpg          ← Hero background image (you provide)
    └── logo.png        ← Logo image (optional, you provide)
```

## Assets to Add

1. **`assets/bg.jpg`** — Hero background image on the home page.
   Recommended: 1920×1080 or larger, dark/atmospheric.

2. **`assets/logo.png`** — Optional. If you have a logo image,
   uncomment the `<img>` tag in each nav and remove the text "Vastframe".

## Updating Content

- **Emails on Contact page**: Edit `contact.html`, swap `hello@vastframe.com` etc.
- **Game description**: Edit `games.html`
- **Job openings**: In `jobs.html`, uncomment the `.job-row` blocks and fill in titles.
- **Studio description**: Edit the `<p class="section-body">` paragraphs in `index.html`

## Deploying to GitHub Pages

1. Create a new repo on GitHub (e.g. `vastframe-website`)
2. Push this entire folder to the repo
3. Go to repo Settings → Pages
4. Set source to "Deploy from a branch" → `main` → `/ (root)`
5. GitHub will give you a `username.github.io/vastframe-website` URL

## Connecting Your GoDaddy Domain

1. In your GitHub repo → Settings → Pages → Custom domain
   → Enter `vastframe.com` and save
2. In GoDaddy DNS settings, add these records:
   ```
   Type: A     Name: @    Value: 185.199.108.153
   Type: A     Name: @    Value: 185.199.109.153
   Type: A     Name: @    Value: 185.199.110.153
   Type: A     Name: @    Value: 185.199.111.153
   Type: CNAME Name: www  Value: yourgithubusername.github.io
   ```
3. Wait 10–30 mins for DNS to propagate
4. Check "Enforce HTTPS" in GitHub Pages settings (free SSL!)

That's it. Total cost: $20/yr for the domain.
