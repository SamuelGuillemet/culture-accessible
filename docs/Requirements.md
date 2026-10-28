# Culture accessible — Architecture technique

## Astro + Decap CMS + GitHub Pages

**Guide de mise en place — site associatif accessible et éditable sans développeur**

> **Objectif :** un site statique rapide, un domaine personnalisé, des publications autonomes par les bénévoles et une démarche de tests visant WCAG 2.2 niveau AA.

## 1. Résumé exécutif

Le site est généré par Astro en HTML statique. Les contenus sont stockés dans le dépôt GitHub. Decap CMS fournit une interface web d’édition sous `/admin`. GitHub Actions construit et publie le site sur GitHub Pages après les changements validés dans Git.

**Point d’attention majeur :** Decap Turbo et l’hébergement du site sont deux briques distinctes. Turbo authentifie les éditeurs et écrit le contenu dans GitHub ; GitHub Actions reconstruit ensuite le site statique et GitHub Pages le sert.

## 2. Architecture cible

| Brique                       | Rôle                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Bénévoles                    | Accèdent à `https://votre-domaine.fr/admin/` avec un compte Decap Turbo et rédigent les articles et épisodes.                      |
| Decap CMS                    | Interface de saisie, gestion des médias, brouillons et publication sur GitHub via Turbo.                                           |
| Backend/authentification CMS | Decap Turbo authentifie les contributeurs et relaie les modifications au dépôt ; les éditeurs n’ont pas besoin d’un compte GitHub. |
| GitHub                       | Dépôt public recommandé avec GitHub Pages sur GitHub Free ; historique et contrôle des changements.                                |
| GitHub Pages                 | Sert le dossier généré par Astro ; GitHub Actions construit et publie les changements de la branche `main`.                         |
| Visiteurs                    | Reçoivent des pages statiques via CDN HTTPS ; aucun serveur applicatif n’est requis pour les pages publiques.                      |

## 3. Stack retenue

- **Astro :** génération statique, composants et layouts accessibles, pages et collections de contenu.
- **TypeScript :** facultatif ; ne l’ajouter que si cela apporte une vraie valeur.
- **Decap CMS :** interface d’administration et édition de fichiers contenus dans Git.
- **GitHub :** versionnement et stockage du code, du contenu et des médias légers.
- **GitHub Pages :** hébergement statique et HTTPS ; déploiement automatisé avec GitHub Actions.
- **Domaine :** acheté séparément ; un domaine personnalisé est facultatif.
- **YouTube :** hébergement des podcasts ; le site stocke les URL, métadonnées et transcriptions.

## 4. Périmètre fonctionnel

| Type        | Champs suggérés                                                                           | URL / rendu                               |
| ----------- | ----------------------------------------------------------------------------------------- | ----------------------------------------- |
| Article     | `title`, `description`, `pubDate`, `author`, `image`, `imageAlt`, `body`, `draft`         | `/articles/slug/` et `/articles/`         |
| Épisode     | `title`, `description`, `pubDate`, `youtubeUrl`, `transcript` ou `transcriptUrl`, `draft` | `/podcasts/slug/` et `/podcasts/`         |
| Pages fixes | Contenu éditorial contrôlé dans Astro ou collection de pages                              | `/`, `/a-propos/`, `/contact/`            |
| Contact     | Adresse e-mail de l’association                                                           | Lien `mailto:`, pas de formulaire/backend |

## 5. Organisation du dépôt

```text
culture-accessible/
├── public/
│   └── admin/
│       ├── index.html
│       └── config.yml
├── public/images/uploads/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── a-propos.astro
│   │   ├── contact.astro
│   │   ├── articles/
│   │   └── podcasts/
│   └── content/
│       ├── articles/
│       └── episodes/
├── astro.config.mjs
├── package.json
├── .github/workflows/deploy.yml
└── README.md
```

La structure exacte dépend de la version d’Astro et du choix entre Content Collections et fichiers Markdown/MDX. Aligne les chemins de collections Decap et ceux lus par Astro. Cette structure est indicative, pas un scaffold garanti prêt à compiler.

## 6. Démarrage local Astro

Prérequis : Node.js LTS compatible avec la version d’Astro installée, Git et un compte GitHub.

```bash
pnpm create astro@latest culture-accessible
cd culture-accessible
pnpm install
pnpm dev
pnpm build
pnpm preview
```

Choisis un projet minimal et conserve un build statique. N’ajoute pas de SSR ni d’adaptateur serveur tant qu’aucune fonctionnalité serveur ne le nécessite.

## 7. Déploiement GitHub Pages

1. Le dépôt doit être public si son compte utilise GitHub Free ; vérifie les règles actuelles si sa visibilité change.
2. Dans les paramètres du dépôt, sélectionne **Settings → Pages → Build and deployment → GitHub Actions**.
3. Le workflow `.github/workflows/deploy.yml` construit Astro avec Node.js 24 et pnpm, puis publie `dist/` sur chaque push à `main`.
4. Pour ce dépôt projet, l’URL est `https://samuelguillemet.github.io/culture-accessible/` ; `astro.config.mjs` configure `site` et `base`.
5. Si tu as déjà configuré Netlify, désactive son auto-déploiement avant le push de migration pour ne pas déclencher deux builds ; le dernier site publié reste une solution de repli.
6. Un domaine personnalisé peut être ajouté plus tard dans les paramètres Pages, avec DNS configuré selon les valeurs affichées par GitHub.
7. Vérifie le premier workflow et HTTPS avant de communiquer l’URL ou de tester l’administration.

## 8. Installation de Decap CMS

Le projet sert Decap depuis `public/admin/index.html` et épingle la version 3.17.3 du script CDN. La version installée inclut le backend `turbo-github` :

```html
<script src="https://cdn.jsdelivr.net/npm/decap-cms@3.17.3/dist/decap-cms.js"></script>
```

La configuration se trouve dans `public/admin/config.yml`. Le `turbo_site_id` doit être remplacé par l’UUID du site créé dans le tableau de bord Decap Turbo.

## 9. Authentification Decap Turbo

Avant de tester `/admin/`, l’organisation Turbo doit connecter l’application GitHub au dépôt et créer un site avec la branche `main`, le chemin `public/admin/config.yml` et l’URL d’administration GitHub Pages. L’UUID de ce site est renseigné dans `turbo_site_id`.

- Les éditeurs se connectent avec un compte Decap Turbo (adresse e-mail et mot de passe) ; ils n’ont pas besoin d’un compte GitHub.
- Invite chaque éditeur avec son adresse personnelle et attribue l’accès au site. Le plan gratuit commence avec une place ; vérifie les tarifs et limites avant d’ajouter des éditeurs.
- Autorise `https://samuelguillemet.github.io/culture-accessible/admin/` dans les URL d’administration Turbo. Ajoute `http://localhost:4321/culture-accessible/admin/` pour le développement local. Turbo vérifie l’origine.
- Vérifie les invitations, la révocation des accès, le comportement des brouillons et la publication sur `main`.
- Ne place jamais de secret OAuth, token GitHub ou clé privée dans `public/admin/config.yml`, le code client ou le dépôt. Turbo gère l’accès GitHub côté serveur.

## 10. Configuration Decap

La configuration actuelle se trouve dans `public/admin/config.yml`. Elle utilise le backend `turbo-github` et les collections `articles` et `episodes`. Les entrées sont enregistrées dans `src/content/` ; le champ `draft` permet de préparer une entrée sans la rendre publique.

N’active pas `editorial_workflow` sans avoir d’abord validé sa compatibilité avec le backend Turbo et décidé comment les changements seront approuvés.

## 11. Modélisation des contenus Astro

Définis des schémas Astro pour valider les champs des articles et épisodes au build. Une donnée manquante doit provoquer une erreur explicite en préproduction plutôt qu’un rendu cassé en production.

Le projet définit ces schémas dans `src/content.config.ts` avec les APIs de collections de la version d’Astro installée.

```ts
import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

const episodes = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    youtubeUrl: z.string().url(),
    transcript: z.string().optional(),
  }),
});

export const collections = { articles, episodes };
```

Ce code est un point de départ : les APIs de collections ont évolué entre versions d’Astro. Suis la documentation de la version installée.

## 12. Accessibilité : exigences et recette

- **Référentiel cible :** WCAG 2.2 niveau AA ; documente les critères applicables et les résultats. Un outil automatique ne prouve pas la conformité.
- **HTML sémantique :** H1 principal clair, hiérarchie des titres, landmarks, liens descriptifs, boutons natifs et ordre DOM cohérent.
- **Clavier :** navigation complète, focus visible, aucun piège clavier, menus et lecteurs utilisables sans souris.
- **Visuel :** contrastes AA, zoom/reflow, texte ajustable, absence d’information transmise uniquement par la couleur.
- **Médias :** vérifie les sous-titres YouTube ; fournis une transcription ou une alternative textuelle pertinente pour chaque épisode lorsque possible.
- **Images :** texte alternatif utile pour les images informatives ; `alt=""` pour les images décoratives.
- **Administration :** teste `/admin/` avec clavier et lecteur d’écran, pas seulement le site public.
- **Tests :** axe ou Lighthouse, puis tests manuels avec NVDA + Firefox et si possible VoiceOver ; teste l’accueil, un article, un podcast, À propos et Contact.
- **Recette éditoriale :** contrôle les titres, liens, listes, tableaux, sous-titres et textes alternatifs avant publication.

Références : [WCAG 2.2 — W3C](https://www.w3.org/TR/WCAG22/) et [documentation WAI](https://www.w3.org/WAI/standards-guidelines/wcag/).

## 13. YouTube et confidentialité

- Ne lance pas automatiquement les vidéos ni leur audio.
- Envisage une vignette avec bouton de lecture et chargement du lecteur à la demande pour limiter les requêtes tierces avant interaction.
- Affiche le titre, la description, la date et le lien vers YouTube.
- Contrôle les sous-titres de chaque vidéo ; les sous-titres automatiques peuvent être inexacts.
- Documente l’intégration YouTube et les éventuels traceurs selon la politique de confidentialité de l’association.

## 14. Contact et pages fixes

- **Contact :** lien explicite « Écrire à l’association » pointant vers `mailto:ADRESSE@EXEMPLE.FR`. Cela ouvre l’application de messagerie de l’utilisateur ; ce n’est pas un formulaire web.
- **À propos :** mission, publics concernés, équipe et partenaires si pertinent.
- **Accueil :** proposition de valeur, derniers articles, derniers épisodes, contact et navigation claire.
- Prévois les pages légales nécessaires selon la situation de l’association et les usages du site.

## 15. Domaine, HTTPS et sécurité

- Achète le domaine au nom de l’association, avec une adresse de récupération institutionnelle et l’authentification multifacteur activée.
- Configure le DNS à partir des valeurs affichées dans les paramètres GitHub Pages si un domaine personnalisé est utilisé.
- Vérifie HTTPS avant de communiquer l’URL et avant de tester l’authentification CMS.
- Active la MFA sur GitHub et le fournisseur d’identité CMS quand disponible.
- Donne le minimum de droits nécessaire ; retire rapidement les accès des personnes qui quittent l’équipe.
- Ne committe pas de secrets, tokens ou fichiers `.env`.
- Mets à jour les dépendances régulièrement et teste le build avant déploiement.

## 16. Budget et limites du gratuit

Budget cible : domaine payé annuellement ; hébergement et CMS potentiellement gratuits sous réserve des quotas, conditions d’utilisation et choix d’authentification. Les plans gratuits évoluent : vérifie les tarifs officiels au moment de la mise en production.

- **GitHub Pages :** pour ce projet statique public, GitHub Actions publie le site ; les limites et règles d’usage GitHub Pages restent applicables.
- **GitHub :** dépôt et collaboration selon les limites du compte et les réglages choisis.
- **Decap Turbo :** vérifie les limites de sites et de places de l’offre choisie ; l’offre gratuite commence avec un site et une place.
- **Domaine :** coût annuel et renouvellement à budgéter ; HTTPS est généralement fourni par l’hébergeur.
- Aucun serveur ou base de données séparés ne sont nécessaires pour le périmètre statique initial.

## 17. Plan de réalisation recommandé

1. Crée le dépôt et le squelette Astro ; vérifie `pnpm build`.
2. Déploie une page minimale sur GitHub Pages et valide le domaine/HTTPS.
3. Construis les composants accessibles : en-tête, navigation, pied de page, cartes d’article et lecteur vidéo.
4. Définis les schémas de contenu Astro pour les articles et épisodes.
5. Ajoute `/admin/` et la configuration Decap.
6. Connecte le dépôt à Decap Turbo, renseigne l’UUID du site et invite un éditeur de test.
7. Teste la création, modification, brouillon, publication et suppression d’un article et d’un épisode.
8. Exécute la recette WCAG 2.2 AA et corrige les problèmes bloquants.
9. Forme deux bénévoles et fais-leur réaliser une publication complète sans assistance développeur.
10. Documente la mise à jour, la révocation des accès et la restauration d’une version antérieure.

## 18. Critères d’acceptation avant mise en ligne

- [ ] Le site se construit sans erreur à partir d’un clone propre du dépôt.
- [ ] Un push sur `main` déclenche le workflow GitHub Actions et le déploiement GitHub Pages.
- [ ] Un éditeur peut se connecter à Decap Turbo et publier sans compte GitHub.
- [ ] Les articles et épisodes ajoutés au CMS apparaissent sur le site après publication.
- [ ] Les images et URL YouTube restent valides après déploiement.
- [ ] Les pages principales passent les tests automatiques et la recette clavier/lecteur d’écran définie.
- [ ] Le domaine sert le site en HTTPS et l’URL `/admin/` fonctionne.
- [ ] Les bénévoles disposent d’un guide de publication et savent signaler un problème.

## 19. Documentation officielle

- [Astro — déploiement GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages — limites](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Decap CMS — documentation](https://decapcms.org/docs/)
- [Decap Turbo — démarrage](https://decapcms.org/docs/turbo-getting-started/)
- [Decap Turbo — connexion d’un site](https://decapcms.org/docs/turbo-connecting-a-site/)
- [Decap Turbo — membres et rôles](https://decapcms.org/docs/turbo-roles-and-members/)
- [Decap CMS — Git Gateway](https://decapcms.org/docs/git-gateway-backend/)
- [Decap CMS — backend GitHub](https://decapcms.org/docs/github-backend/)
- [W3C — WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **À valider avant la mise en ligne :** active GitHub Pages avec la source GitHub Actions, puis teste une publication de bout en bout depuis Turbo.
