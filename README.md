# Crow-Flix website

Official static information and download website for the
[CrowFlix Windows desktop application](https://github.com/CrowLoki/Crow-Flix).

The desktop application, this website, and Orion Public Research are separate
projects:

- `CrowLoki/Crow-Flix` contains the Tauri desktop source and release assets.
- `CrowLoki/Crow-Flix-Site` contains this static website only.
- `CrowLoki/orion-public-research` remains the Orion research website.

## Local verification

```console
npm ci
npm run check
```

The checker verifies required files, internal links, release metadata, security
headers, Cloudflare limits, and common credential or workstation-path leaks.

## Cloudflare Pages

This repository is connected directly to Cloudflare Pages through its GitHub
integration. The production site is
[crow-flix.pages.dev](https://crow-flix.pages.dev/).

- Cloudflare project: `crow-flix`
- Production branch: `main`
- Framework preset: None
- Root directory: `/`
- Build command: `npm run check`
- Build output directory: `public`

Only the allowlisted `public` directory is deployed. Repository documentation,
checks, workflows, and licensing material do not become website routes.

## Release updates

When CrowFlix publishes a new desktop release, update the version, installer
URL, installer size, checksum, release tag, and source tag in
`public/index.html`, then run `npm run check` before publishing.

## Licensing

Website code and documentation are licensed under `AGPL-3.0-only`. Crow brand
assets use the separate `LicenseRef-Crow-Brand` terms. See
[`LICENSING.md`](LICENSING.md).
