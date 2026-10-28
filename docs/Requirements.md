# Culture accessible — Architecture technique

## Astro + Decap CMS + Netlify

**Guide de mise en place — site associatif accessible et éditable sans développeur**

> **Objectif :** un site statique rapide, un domaine personnalisé, des publications autonomes par les bénévoles et une démarche de tests visant WCAG 2.2 niveau AA.

## 1. Résumé exécutif

Le site est généré par Astro en HTML statique. Les contenus sont stockés dans le dépôt GitHub. Decap CMS fournit une interface web d’édition sous `/admin`. Netlify construit et publie le site après les changements validés dans Git.

**Point d’attention majeur :** Netlify Git Gateway est officiellement déprécié et les nouvelles configurations ne sont pas recommandées. Ne construis pas la production sur l’ancien couple Netlify Identity + Git Gateway sans décision explicite et validation de sa pérennité. Pour le pilote, évalue un backend Decap actuel (par exemple Decap Turbo pour GitHub) ou une authentification GitHub/OAuth maintenue. L’hébergement Netlify et l’authentification du CMS sont deux briques distinctes.

## 2. Architecture cible

| Brique                       | Rôle                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Bénévoles                    | Accèdent à `https://votre-domaine.fr/admin/` et rédigent les articles et épisodes.                                                              |
| Decap CMS                    | Interface de saisie, gestion des médias, brouillons et publication selon le workflow retenu.                                                    |
| Backend/authentification CMS | Authentifie les contributeurs et autorise les modifications au dépôt. À valider séparément ; ne pas exposer de token GitHub dans le navigateur. |
| GitHub                       | Dépôt privé conseillé pour le code et les contenus légers ; historique et contrôle des changements.                                             |
| Netlify                      | Build Astro et publication du dossier `dist/` à chaque push sur la branche de production.                                                       |
| Visiteurs                    | Reçoivent des pages statiques via CDN HTTPS ; aucun serveur applicatif n’est requis pour les pages publiques.                                   |

## 3. Stack retenue

- **Astro :** génération statique, composants et layouts accessibles, pages et collections de contenu.
- **TypeScript :** facultatif ; ne l’ajouter que si cela apporte une vraie valeur.
- **Decap CMS :** interface d’administration et édition de fichiers contenus dans Git.
- **GitHub :** versionnement et stockage du code, du contenu et des médias légers.
- **Netlify Free :** hébergement, CDN, HTTPS et déploiements Git, dans les limites de quotas et des conditions du plan.
- **Domaine :** acheté séparément ; DNS configuré selon les instructions Netlify.
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
├── netlify.toml
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

Choisis un projet minimal et conserve un build statique. N’ajoute pas de SSR ni d’adaptateur Netlify tant qu’aucune fonctionnalité serveur ne le nécessite.

## 7. Configuration Netlify

1. Crée le dépôt GitHub et pousse le projet.
2. Dans Netlify, crée un site en important le dépôt existant.
3. Configure la commande de build : `pnpm build`.
4. Configure le dossier publié : `dist`.
5. Vérifie que le déploiement de production suit uniquement la branche `main`.
6. Ajoute le domaine personnalisé dans Netlify et applique les enregistrements DNS affichés par Netlify.
7. Attends que HTTPS soit actif avant de tester l’administration CMS.

Exemple de `netlify.toml` :

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

Vérifie la version Node recommandée par la version d’Astro choisie et la configuration Netlify courante.

## 8. Installation de Decap CMS

Crée `public/admin/index.html` :

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Administration — Culture accessible</title>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </body>
</html>
```

Le CDN ci-dessus est une amorce. Pour la production, choisis une version précise, teste-la et documente sa mise à jour. Vérifie les recommandations Decap actuelles.

## 9. Authentification : décision obligatoire

Ne considère pas le CMS comme prêt tant que l’authentification n’a pas été testée avec un compte bénévole n’ayant pas accès en écriture au dépôt GitHub.

- Évite le backend GitHub direct si les bénévoles ne doivent pas avoir de droits d’écriture au dépôt : les utilisateurs de ce backend ont besoin d’un accès push.
- Git Gateway permettait historiquement d’éviter un accès Git direct, mais Netlify le marque comme déprécié et déconseille les nouvelles configurations.
- Évalue un backend maintenu et adapté au nombre de contributeurs, par exemple Decap Turbo (`turbo-github`), si ses tarifs, limites et conditions conviennent.
- Vérifie les invitations, la révocation des accès, les brouillons, les conflits d’édition et le comportement après changement de domaine.
- Ne place jamais de secret OAuth, token GitHub ou clé privée dans `public/admin/config.yml`, le code client ou le dépôt.

## 10. Exemple de configuration Decap — à adapter

L’exemple illustre les collections. Le backend est volontairement laissé comme point de décision : ne publie pas une configuration de production avant d’avoir validé la méthode d’authentification dans la documentation Decap actuelle.

```yaml
# public/admin/config.yml
# Remplacer le bloc backend par la configuration validée.
# backend:
#   name: turbo-github
#   repo: ORGANISATION/REPO
#   branch: main

site_url: https://VOTRE-DOMAINE.fr
media_folder: public/images/uploads
public_folder: /images/uploads

publish_mode: editorial_workflow

collections:
  - name: articles
    label: Articles
    folder: src/content/articles
    create: true
    slug: "{{slug}}"
    fields:
      - { label: Titre, name: title, widget: string }
      - { label: Résumé, name: description, widget: text }
      - { label: Date de publication, name: pubDate, widget: datetime }
      - { label: Image, name: image, widget: image, required: false }
      - {
          label: Texte alternatif de l’image,
          name: imageAlt,
          widget: string,
          required: false,
        }
      - { label: Corps, name: body, widget: markdown }

  - name: episodes
    label: Podcasts
    folder: src/content/episodes
    create: true
    slug: "{{slug}}"
    fields:
      - { label: Titre, name: title, widget: string }
      - { label: Description, name: description, widget: text }
      - { label: Date de publication, name: pubDate, widget: datetime }
      - { label: URL YouTube, name: youtubeUrl, widget: string }
      - {
          label: Transcription,
          name: transcript,
          widget: markdown,
          required: false,
        }
```

**À vérifier avant production :**

- La compatibilité des widgets et chemins avec la version Decap utilisée.
- La correspondance exacte entre les noms de champs et les frontmatter attendus par Astro.
- Le fonctionnement de `editorial_workflow` avec le backend retenu : branches, demandes de fusion et publication doivent être testées de bout en bout.

## 11. Modélisation des contenus Astro

Définis des schémas Astro pour valider les champs des articles et épisodes au build. Une donnée manquante doit provoquer une erreur explicite en préproduction plutôt qu’un rendu cassé en production.

Exemple conceptuel à adapter à la version Astro installée :

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
- Configure le DNS à partir des valeurs affichées dans Netlify.
- Vérifie HTTPS avant de communiquer l’URL et avant de tester l’authentification CMS.
- Active la MFA sur GitHub, Netlify et le fournisseur d’identité CMS quand disponible.
- Donne le minimum de droits nécessaire ; retire rapidement les accès des personnes qui quittent l’équipe.
- Ne committe pas de secrets, tokens ou fichiers `.env`. Utilise les variables d’environnement Netlify uniquement pour les secrets côté serveur si des fonctions en ont besoin.
- Mets à jour les dépendances régulièrement et teste le build avant déploiement.

## 16. Budget et limites du gratuit

Budget cible : domaine payé annuellement ; hébergement et CMS potentiellement gratuits sous réserve des quotas, conditions d’utilisation et choix d’authentification. Les plans gratuits évoluent : vérifie les tarifs officiels au moment de la mise en production.

- **Netlify Free :** la page tarifaire indique un plan à 0 $ avec un plafond mensuel de crédits ; surveille l’usage et les conditions d’éligibilité.
- **GitHub :** dépôt et collaboration selon les limites du compte et les réglages choisis.
- **Decap CMS :** open source ; l’authentification hébergée ou un fournisseur tiers peut avoir ses propres limites ou coûts.
- **Domaine :** coût annuel et renouvellement à budgéter ; HTTPS est généralement fourni par l’hébergeur.
- Aucun serveur ou base de données séparés ne sont nécessaires pour le périmètre statique initial.

Liens utiles : [Tarifs Netlify](https://www.netlify.com/pricing/).

## 17. Plan de réalisation recommandé

1. Crée le dépôt et le squelette Astro ; vérifie `pnpm build`.
2. Déploie une page minimale sur Netlify et valide le domaine/HTTPS.
3. Construis les composants accessibles : en-tête, navigation, pied de page, cartes d’article et lecteur vidéo.
4. Définis les schémas de contenu Astro pour les articles et épisodes.
5. Ajoute `/admin/` et la configuration Decap.
6. Choisis et configure le backend d’authentification ; teste avec un vrai compte bénévole sans accès Git direct.
7. Teste la création, modification, brouillon, publication et suppression d’un article et d’un épisode.
8. Exécute la recette WCAG 2.2 AA et corrige les problèmes bloquants.
9. Forme deux bénévoles et fais-leur réaliser une publication complète sans assistance développeur.
10. Documente la mise à jour, la révocation des accès et la restauration d’une version antérieure.

## 18. Critères d’acceptation avant mise en ligne

- [ ] Le site se construit sans erreur à partir d’un clone propre du dépôt.
- [ ] Un push sur la branche de production déclenche le déploiement Netlify.
- [ ] Un bénévole peut se connecter au CMS et publier sans accès en écriture au dépôt, si c’est l’exigence retenue.
- [ ] Les articles et épisodes ajoutés au CMS apparaissent sur le site après publication.
- [ ] Les images et URL YouTube restent valides après déploiement.
- [ ] Les pages principales passent les tests automatiques et la recette clavier/lecteur d’écran définie.
- [ ] Le domaine sert le site en HTTPS et l’URL `/admin/` fonctionne.
- [ ] Les bénévoles disposent d’un guide de publication et savent signaler un problème.

## 19. Documentation officielle

- [Astro — déploiement Netlify](https://docs.astro.build/en/guides/deploy/netlify/)
- [Netlify — Astro](https://docs.netlify.com/build/frameworks/framework-setup-guides/astro/)
- [Decap CMS — documentation](https://decapcms.org/docs/)
- [Decap CMS — Git Gateway](https://decapcms.org/docs/git-gateway-backend/)
- [Decap CMS — backend GitHub](https://decapcms.org/docs/github-backend/)
- [Netlify — accès sécurisé et Git Gateway](https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/)
- [Netlify — tarifs](https://www.netlify.com/pricing/)
- [W3C — WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **Décision technique à ne pas reporter :** valide le backend d’authentification Decap. Le reste de l’architecture peut être construit indépendamment, mais l’administration ne doit pas être considérée prête tant que l’accès bénévole n’a pas été testé de bout en bout.
