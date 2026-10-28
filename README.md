# Culture accessible

Site statique Astro publié sur [GitHub Pages](https://samuelguillemet.github.io/culture-accessible/).

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

GitHub Actions construit le site avec Node.js 24 et le publie sur GitHub Pages à chaque push sur `main` ([workflow](.github/workflows/deploy.yml)).

Avant le premier push, sélectionne **Settings → Pages → Build and deployment → GitHub Actions** dans le dépôt et désactive l’auto-déploiement Netlify pour éviter de consommer un déploiement sur les deux plateformes. Le dernier site publié sur Netlify reste disponible comme solution de repli.

Le workflow définit `VITE_BASE_URL` à partir du nom du dépôt, ce qui adapte le site aux URL GitHub Pages de type projet. En local, le préfixe vaut `/`. Un script dans `public/admin/index.html` ajoute le préfixe du site au `src` des images `/images/uploads/...`, dans le panneau d’édition Decap comme dans son iframe d’aperçu. La configuration `public/admin/config.yml` et les chemins d’images enregistrés restent inchangés.

## Styles avec Tailwind CSS

Le projet utilise Tailwind CSS 4 avec l’intégration Vite d’Astro. Ajoute les classes utilitaires directement aux éléments `.astro` ; les styles globaux de base (typographie et accessibilité clavier) sont dans `src/styles/global.css`.

## Decap CMS avec Turbo

Le CMS est servi à `/culture-accessible/admin/` sur le site publié. Avant d’utiliser le bouton de connexion :

1. Connecte l’application GitHub de Decap Turbo à `SamuelGuillemet/culture-accessible`.
2. Dans les URL d’administration du site Turbo, autorise `https://samuelguillemet.github.io/culture-accessible/admin/`. Ajoute `http://localhost:4321/culture-accessible/admin/` pour le développement local.
3. Vérifie que le site Turbo utilise la branche `main` et le chemin de configuration `public/admin/config.yml`.
4. Invite les éditeurs dans Turbo et attribue-leur l’accès au site.

Les éditeurs se connectent avec leur compte Decap Turbo, pas leur compte GitHub. Turbo nécessite une place par éditeur ; l’offre gratuite commence avec une place. Les comptes éditeurs partagés compliquent l’attribution des modifications.

Les articles et épisodes créés dans le CMS sont enregistrés dans `src/content/` et publiés sur le site au prochain déploiement GitHub Pages. Les entrées marquées comme brouillons restent absentes du site public.

## Widget d’accessibilité (essai)

Le site charge `accessibility-widgets` 2.0.14, traduit en français par défaut pour les nouveaux visiteurs. La commande vocale est désactivée car elle utilise des API navigateur et peut demander l’accès au microphone. Le widget est une aide de test, pas une preuve de conformité WCAG. Sa licence est GPL-3.0 : vérifie sa compatibilité avant une mise en production définitive.

## Périmètre actuel

Le CMS utilise la version Decap 3.17.3, épinglée dans `public/admin/index.html`. Aucun secret ne doit être ajouté au code client ou à `public/`.
