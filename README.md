# BRADAR CLIENT — launch website

A responsive, static launch site for BRADAR CLIENT. It uses plain HTML, CSS, and vanilla JavaScript and is designed for GitHub Pages. There is no build step, backend, paid service, or runtime dependency.

## Files

- `index.html` — page structure, navigation, features, compatibility panel, release section, and metadata.
- `style.css` — visual system, responsive layouts, effects, and reduced-motion support.
- `script.js` — central site configuration, timezone-aware countdowns, compatibility badges, mobile navigation, scroll reveals, and optional ambient particles.
- `assets/` — locally hosted SVG icon and social preview assets.

The repository did not contain an existing logo or other assets at implementation time. The site therefore uses a typography-led BRADAR wordmark and custom, local SVG assets rather than pretending a supplied logo existed. The interface in the hero is explicitly labeled as a design concept, not a product screenshot.

## Publish with GitHub Pages

1. Push or upload the repository contents to your GitHub repository's default branch (currently `main`). Keep `index.html`, `style.css`, `script.js`, and the `assets/` folder at the repository root.
2. Open the repository on GitHub and go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and the `/(root)` folder, then save. Wait for GitHub Pages to finish its deployment. GitHub will display the actual published URL in the Pages settings; this repository has not been declared published by this code change.
5. Open the published URL and verify that the CSS, JavaScript, and both SVG assets load.

All resource paths are relative, so this setup also works under a GitHub Pages repository subpath.

## Configure the community invite

Open `script.js` and edit the configuration at the top:

```js
const SITE_CONFIG = {
  discordInviteUrl: "https://discord.gg/YOUR_REAL_INVITE",
  // ...
};
```

Replace the example above with the actual invite link. Do not leave a sample or placeholder invite in production. If the value is empty, Discord actions are intentionally disabled instead of linking visitors to a fake invite.

## Configure the official release/download URL

Set `releaseUrl` in `SITE_CONFIG` to the real release page or download URL when one exists. The release buttons remain disabled while the URL is empty. No release URL is assumed by this website.

```js
releaseUrl: "https://example.com/your-real-release-page"
```

Use the final HTTPS URL in production. The countdown reaching zero changes the release area into its “BRADAR CLIENT IS HERE” state; it does not invent or auto-publish a download.

## Update the countdown date

Edit `releaseDate` in `script.js`. The date fields use a 1–12 month value and a named IANA timezone.

```js
releaseDate: {
  year: 2026,
  month: 10,
  day: 24,
  hour: 0,
  minute: 0,
  second: 0,
  timeZone: "Europe/Riga"
}
```

The displayed countdowns share one computed timestamp and one aligned timer. The script determines the UTC instant by using `Intl.DateTimeFormat` with `Europe/Riga`, which accounts for the correct offset and daylight-saving rules on the target date. Do not replace it with a hard-coded UTC offset.

## Update Minecraft compatibility targets

Edit the arrays under `SITE_CONFIG.versions` in `script.js`. The page generates the version badges and target counts from these arrays. They are labeled as **planned targets**, not confirmed working versions, until testing verifies them.

```js
versions: {
  "1.21": ["1.21.1", "1.21.2", "1.21.3"],
  "26": ["26.1", "26.2"]
}
```

The snippet is only an example of the structure; keep the full target list you intend to announce.

## Update the GitHub link

Change `githubUrl` in `SITE_CONFIG`. The footer GitHub link uses that setting.

## Motion, accessibility, and performance notes

- The navigation includes a keyboard-operable mobile menu and Escape-to-close behavior.
- Section reveals use `IntersectionObserver`; a fallback shows the content when that API is unavailable.
- The countdowns share one aligned timer and never display negative values.
- Particle animation is lightweight and is not initialized when `prefers-reduced-motion: reduce` is enabled.
- There are no JavaScript or CSS package dependencies. The site has no external runtime dependencies; system font stacks provide the typography.
