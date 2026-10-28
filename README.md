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

## Styles avec Tailwind CSS

Le projet utilise Tailwind CSS 4 avec l’intégration Vite d’Astro. Ajoute les classes utilitaires directement aux éléments `.astro` ; les styles globaux de base (typographie et accessibilité clavier) sont dans `src/styles/global.css`.

## Decap CMS avec Turbo

Le CMS est servi à `/admin/`. Avant d’utiliser le bouton de connexion :

1. Crée une organisation Decap Turbo et connecte l’application GitHub à `SamuelGuillemet/culture-accessible`.
2. Crée un site Turbo avec la branche `main`, le chemin de configuration `public/admin/config.yml` et l’URL d’administration `https://extraordinary-quokka-a7ebff.netlify.app/admin/`. Ajoute aussi `http://localhost:4321/admin/` pour le développement local.
3. Copie l’identifiant UUID du site Turbo dans `turbo_site_id` dans `public/admin/config.yml`, puis pousse le changement.
4. Invite les éditeurs dans Turbo et attribue-leur l’accès au site.

Les éditeurs se connectent avec leur compte Decap Turbo, pas leur compte GitHub. Turbo nécessite une place par éditeur ; l’offre gratuite commence avec une place. Les comptes éditeurs partagés compliquent l’attribution des modifications.

Les articles et épisodes créés dans le CMS sont enregistrés dans `src/content/` et publiés sur le site au prochain déploiement Netlify. Les entrées marquées comme brouillons restent absentes du site public.

## Widget d’accessibilité (essai)

Le site charge `accessibility-widgets` 2.0.14, traduit en français par défaut pour les nouveaux visiteurs. La commande vocale est désactivée car elle utilise des API navigateur et peut demander l’accès au microphone. Le widget est une aide de test, pas une preuve de conformité WCAG. Sa licence est GPL-3.0 : vérifie sa compatibilité avant une mise en production définitive.

## Périmètre actuel

Le CMS utilise la version Decap 3.17.3, épinglée dans `public/admin/index.html`. Aucun secret ne doit être ajouté au code client ou à `public/`.
