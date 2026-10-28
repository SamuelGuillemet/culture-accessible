# Culture accessible

Socle minimal du site : Astro génère un site statique, prêt à être déployé sur Netlify.

## Développement local

Prérequis : Node.js 24 et pnpm 12.

```sh
pnpm install
pnpm dev
```

Vérifier le build de production :

```sh
pnpm build
pnpm preview
```

Netlify utilise `pnpm build`, publie `dist/` et sélectionne Node.js 24 via `netlify.toml`.

## Périmètre actuel

La page d’accueil est un point de départ, pas encore le site final. Decap CMS et son authentification ne sont pas configurés : le backend devra être choisi et testé avant d’ouvrir l’administration aux bénévoles. Aucun secret ne doit être ajouté au code client ou à `public/`.
