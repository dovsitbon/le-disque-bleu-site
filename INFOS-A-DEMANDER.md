# Le Disque Bleu : infos à lui demander

Tout ce qui manque pour finir le site. Entre parenthèses : le fichier où le noter.

## Indispensable

1. **La carte complète et les prix** (`data/carte.json`). La carte du site vient de ses publications et stories Instagram ;
   aucun prix n'y figure. Sont à confirmer en particulier : les plats servis toute la semaine et ceux qui ne passent
   qu'à l'ardoise, les autres salades, la formule petit-déjeuner, les bières et les vins.
2. **Le plat du jour** : qui le saisit chaque matin, et son prix (`data/plat-du-jour.json`). S'il existe une formule
   du midi (plat + dessert, plat + café), son contenu et son prix.
3. **La carte des cocktails et des desserts** : prix, et confirmation de la liste relevée sur sa carte en photo
   (5 cocktails avec alcool, 4 sans alcool). Les prix vus sur une affiche de décembre 2024 (cocktail 8,50 €,
   sans alcool 6,50 €) n'ont pas été repris.
4. **Un e-mail** pour recevoir les réservations, les commandes et les demandes de privatisation
   (`data/site.json` → email, et variables Resend sur Vercel : `RESEND_API_KEY`, `NOTIFY_EMAIL`, `RESEND_FROM`).
   Tant que ce n'est pas branché, le site enregistre la demande et demande au client de confirmer par téléphone.
5. **Le SIRET et le nom du responsable de la publication** (mentions légales, `locales/*.json` → pages.legal).

## Pour faire vivre le site

6. **Le prénom du patron, de l'équipe, et l'histoire du Disque Bleu** (d'où vient le nom ?). Un avis Google
   ancien cite Cathy, Philippe, Nico et Nadia en cuisine : à confirmer avant de nommer qui que ce soit.
7. **Les soirées à venir** (`data/evenements.json`) : dates, heure, menu. Le Beaujolais nouveau tombe le jeudi
   19 novembre 2026 : y a-t-il une soirée ?
8. **La privatisation** : capacité de la salle et de la terrasse, conditions, acompte, budget minimum.
9. **La livraison** : sa fiche Google indique « repas sur place » et « vente à emporter », mais pas la livraison.
   Livre-t-il en direct, par une plateforme, ou seulement pour les fêtes (burgers livrés pour un anniversaire) ?
   Le site ne promet rien pour l'instant (`data/site.json` → delivery).
10. **Un portable pour WhatsApp** (`data/site.json` → whatsapp). Le 01 75 40 78 27 est un fixe.
11. **Les horaires** : confirmer lundi–samedi 7 h – 21 h et dimanche 7 h 30 – 15 h (son Instagram dit « 7 j/7 de 7 h
    à 21 h »), les dates des horaires d'été jusqu'à 22 h (`data/horaires.json` → summer), les heures de service
    du déjeuner et du dîner, et les jours de fermeture annuels.
12. **Les moyens de paiement** : carte, espèces, titres-restaurant, chèques-vacances ?
13. **Le stationnement** : le site dit « sur la place et dans les rues voisines » ; y a-t-il un parking à conseiller ?
14. **De vrais avis clients à citer**, avec son accord (`data/avis.json`).
15. **Le lien « Bon cadeau »**, s'il veut en vendre (`data/site.json` → giftCardUrl ; le lien reste masqué sinon).

## Photos et logo

16. **Le fichier d'origine du logo** (le verre de vin). Il a été redessiné d'après sa photo de profil Instagram
    (`public/logo.svg`).
17. **Des photos** de la salle, du bar, de la façade de jour, de l'équipe et des soirées : il n'y en a aucune
    d'exploitable sur Instagram (images petites, visages de clients). La liste est dans `assets/A-PHOTOGRAPHIER.md`.
18. **Une grande photo de la terrasse** pour le hero : les images Instagram font au mieux 1440 px de large.

## Nom de domaine

19. Veut-il un nom de domaine (par exemple ledisquebleu-montmorency.fr) ? Le site tourne pour l'instant sur
    l'adresse Vercel ; l'affichette A5 et son QR code se régénèrent avec `npm run affichette` si l'adresse change.
