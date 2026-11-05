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

## Tests d’accessibilité

Les tests Playwright et axe-core analysent toutes les pages HTML publiées (hors interface du CMS),
aux formats bureau et 320 px. Ils vérifient les règles WCAG 2.0/2.1/2.2 des niveaux A, AA et AAA
détectables automatiquement, les bonnes pratiques et l’absence de défilement horizontal à 320 px.
Ils testent aussi au clavier le lien d’évitement vers le contenu.

Pour les exécuter localement, installe Chromium une première fois puis lance :

```sh
pnpm test:a11y:install
pnpm test:a11y
```

Pour ouvrir Playwright UI en local, lancer les tests individuellement, voir leurs résultats et les
relancer :

```sh
pnpm test:a11y:ui
```

Cette interface est destinée au développement local ; la CI continue d’utiliser `pnpm test:a11y`.

La même suite s’exécute sur chaque pull request et push sur `main`. Le rapport Playwright est
conservé comme artefact GitHub Actions. L’analyse vérifie les éléments intégrés eux-mêmes, mais pas
le contenu interne des iframes tierces.

Avant une mise en ligne, compléter manuellement ces vérifications :

- parcourir les pages et activer les lecteurs au clavier seulement ;
- vérifier les pages avec NVDA ou VoiceOver, y compris les lecteurs et annonces de statut ;
- zoomer à 200 % et 400 %, et vérifier l’absence de perte de contenu ou de défilement horizontal ;
- contrôler les sous-titres/transcriptions des médias et le formulaire Google intégré ou sa version
  externe.

Les tests automatisés ne remplacent pas une évaluation complète de conformité.

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

Les épisodes et ressources créés dans le CMS sont enregistrés dans `src/content/` et publiés sur le site au prochain déploiement GitHub Pages. Les entrées marquées comme brouillons restent absentes du site public.

## Structure du site

| Page                   | Contenu                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `/`                    | Présentation, derniers épisodes, dernières ressources                                  |
| `/podcasts/`           | Cartes cliquables vers chaque épisode                                                  |
| `/podcasts/<épisode>/` | Lecteur Spotify (audio), lecteur YouTube (vidéo), transcription, ressources liées      |
| `/ressources/`         | Questions soulevées dans les épisodes                                                  |
| `/ressources/<slug>/`  | Extrait audio démarrant à `extractStart` secondes, réponse écrite, lien vers l’épisode |
| `/contact/`            | Google Form intégré, avec lien d’ouverture dans un nouvel onglet                       |

Les liens (Instagram, plateformes d’écoute, formulaire) et le menu sont dans `src/lib/site.ts`.

## Spotify

Dans Decap, le champ **Identifiant Spotify** accepte le lien de partage complet (`https://open.spotify.com/episode/…`) ou les 22 caractères après `/episode/`. Le schéma Astro valide la valeur au build.

Le lecteur (`src/components/SpotifyPlayer.astro`) utilise l’iFrame API de Spotify. Rien n’est téléchargé depuis Spotify avant le clic sur « Charger le lecteur ». Pour une ressource, l’extrait se positionne sur `extractStart` au premier lancement de la lecture. Un lien direct `?t=<secondes>` vers Spotify reste affiché en secours.

## Police

La charte demande Glacial Indifference. Tant que ses fichiers ne sont pas ajoutés, le site utilise Lexend, une police conçue pour la lisibilité. Pour passer à Glacial Indifference, déclare un `@font-face` dans `src/styles/global.css` avec des fichiers `.woff2` placés dans `src/assets/fonts/` : le nom `"Glacial Indifference"` est déjà en tête de la pile `--font-sans`.

## Widget d’accessibilité (essai)

Le site charge `accessibility-widgets` 2.0.14, traduit en français par défaut pour les nouveaux visiteurs. La commande vocale est désactivée car elle utilise des API navigateur et peut demander l’accès au microphone. Le widget est une aide de test, pas une preuve de conformité WCAG. Sa licence est GPL-3.0 : vérifie sa compatibilité avant une mise en production définitive.

## Périmètre actuel

Le CMS utilise la version Decap 3.17.3, épinglée dans `public/admin/index.html`. Aucun secret ne doit être ajouté au code client ou à `public/`.
