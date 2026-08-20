# Harmonie : Union Complice & Cursus EMDR Clinique

Une plateforme bivalente et moderne combinant un espace confidentiel d'apprentissage linguistique intime pour couples franco-thaïlandais et un portail pédagogique complet d'apprentissage et de pratique clinique de la psychothérapie EMDR (Modèle TAI).

Développée en **React (TypeScript)**, propulsée par **Tailwind CSS** et empaquetée avec **Vite**, cette application fonctionne de manière autonome (Offline-First) sans base de données externe grâce à une persistance locale sécurisée dans le `localStorage` du navigateur.

---

## 🌟 FONCTIONNALITÉS PRINCIPALES

### 1. Clé d'Entrée Privée (Password Gate)
* Sécurisation totale de l'entrée de l'application avec le mot de passe secret **`LOVE`** (insensible à la casse).
* Garantie de confidentialité absolue de vos données d'apprentissage linguistique et de vos dossiers cliniques.

### 2. L'Espace Complice (Français • Anglais • Thaïlandais) 🔞
* **Phrasebook coquin et sensuel** : Une collection de phrases traduites en 3 langues classées par catégories (*Romance*, *Désir*, *Intime/Coquin*, *Après / Pillow Talk*).
* **Prononciation phonétique bilingue** : Écriture phonétique du thaï pour les francophones, et aide phonétique du français pour les thaïlandophones.
* **Synthèse Vocale Native (TTS)** : Écoutez la prononciation exacte du français et du thaï d'un clic grâce à la Web Speech API du navigateur.
* **Mode Flashcards Interactif** : Un jeu de cartes intuitif pour deviner et mémoriser les expressions ensemble.
* **Créateur d'Expressions Personnalisées** : Enregistrez vos propres mots doux et codes coquins secrets persistant localement.

### 3. Le Cursus Théorique et Clinique EMDR (8 Modules)
* **Les 8 Phases EMDR en Diaporama** : Parcourez les étapes clés de la méthode de Francine Shapiro (Anamnèse, Stabilisation, Évaluation, Désensibilisation, Scanner Corporel, Clôture et Réévaluation).
* **Schémas Cliniques Interactifs** :
  * *Module 1* : Cartographie interactive des réponses du cerveau au trauma (Amygdale, Hippocampe, Cortex préfrontal).
  * *Module 2* : Frise temporelle interactive du Float-back.
  * *Module 3* : Matrice des outils de stabilisation (Lieu Sûr & Contenant).
  * *Module 4* : Visualisation des échelles standardisées de VoC et de SUD.
  * *Module 5* : Matrice interactive de Tissage Cognitif (Responsabilité, Sécurité, Contrôle).
  * *Module 6* : Silhouette de Scanner Corporel cliquable pour traiter les somatisations.
  * *Module 7* : logigramme d'arbre décisionnel de Clôture (Séance Complète ou Incomplète).
  * *Module 8* : Guide clinique d'évaluation à distance.
* **Verbatims Guidés** : Scripts types des dialogues Thérapeute-Patient pour chaque phase.
* **Cas Pratiques & Justifications Cliniques** : Un quiz interactif par module avec explications détaillées immédiates.

### 4. Simulateur Interactif de Stimulations Bilatérales Alternées (SBA)
* **Oscillation Sinusoïdale Fluide** : Balle colorée se déplaçant à un rythme réglable (de 0,4 Hz à 2,0 Hz).
* **Générateur Binaural Synchrone** : Son stéréo (gauche/droite) calculé en temps réel par la **Web Audio API** sans fichiers externes, calé exactement sur les impacts de la balle.
* **Support Haptique Smartphone** : Déclenche de courtes vibrations synchronisées (**Vibration API**) sur les smartphones compatibles Android pour simuler le tapotement tactile alternatif.
* **Mode Plein Écran (Fullscreen)** : Idéal pour présenter le simulateur au patient sur tablette, ordinateur ou écran déporté.

### 5. Fiche Clinique de Ciblage (Phase 3)
* Formulaire complet et interactif pour définir la situation cible, les cognitions (CN, CP), évaluer les échelles (VoC, SUD) et localiser la somatisation.
* **Exportation Automatique** : Téléchargement instantané au format `.txt` ou impression formatée / Sauvegarde PDF propre pour votre archivage de cabinet.

### 6. Attestation Académique Officielle
* Suivi dynamique calculant l'acquisition des 8 modules par le biais des quizz réussis.
* Une fois les 8 modules complétés, déblocage d'un formulaire pour imprimer votre certificat d'aptitude académique EMDR.

---

## 📱 ERGONOMIE SMARTPHONE ET SUPPORT HAPTIQUE

L'application a été conçue selon un paradigme **Mobile-First** rigoureux :
* **Mobile Bottom Nav** : Sur les résolutions mobiles (< 1024px), le menu latéral se rétracte au profit d'une barre de navigation fixe tout en bas de l'écran, optimisée pour le pouce.
* **Hauteur tactile (44px+)** : Toutes les zones cliquables respectent la taille minimale recommandée pour éviter les faux clics.
* **Vibration Haptique** : 
  * Activez l'interrupteur haptique dans le simulateur SBA.
  * Lorsque la balle percute le bord gauche, le téléphone vibre brièvement à gauche, et inversement à droite.
  * *Note de compatibilité* : Les vibrations haptiques nécessitent le support de la `Vibration API` (nativement active sur la majorité des navigateurs Android comme Chrome ou Firefox. Safari sur iOS restreint actuellement les vibrations système).

---

## 🚀 DÉPLOIEMENT AUTOMATIQUE SUR GITHUB PAGES

L'application est entièrement configurée pour un déploiement automatisé gratuit par **GitHub Actions**.

### Instructions Étape par Étape pour Activer GitHub Pages :

1. **Créer un dépôt GitHub** : Créez un nouveau dépôt public sur votre compte GitHub (ex : `mon-app-harmonie`).
2. **Pousser le code** : Initialisez votre dépôt local et poussez le code sur la branche principale nommée `main`.
3. **Autoriser GitHub Actions** :
   * Sur GitHub, rendez-vous dans l'onglet **Settings** (Paramètres) de votre dépôt.
   * Allez dans **Actions** -> **General** dans le menu de gauche.
   * Faites défiler jusqu'à **Workflow permissions** et assurez-vous de sélectionner **Read and write permissions** (Nécessaire pour que le script de build puisse pousser les fichiers compilés sur la branche `gh-pages`), puis cliquez sur **Save**.
4. **Déclencher le déploiement** :
   * Le fichier `.github/workflows/deploy.yml` détectera automatiquement tout push sur la branche `main`.
   * Le pipeline va compiler le projet avec Vite et publier les fichiers statiques du dossier `dist/` sur une branche isolée nommée `gh-pages`.
5. **Activer Pages** :
   * Allez dans l'onglet **Settings** de votre dépôt GitHub.
   * Cliquez sur **Pages** dans le menu latéral gauche.
   * Sous **Build and deployment**, vérifiez que la Source est configurée sur **Deploy from a branch**.
   * Sélectionnez la branche **`gh-pages`** et le dossier **`/ (root)`**, puis cliquez sur **Save**.
6. **Félicitations !** Votre application sera disponible en ligne à l'adresse fournie par GitHub (généralement `https://<votre-pseudo>.github.io/<nom-du-depot>/`).

---

## 🛠️ ARCHITECTURE DU CODE

* `/src/types.ts` : Déclaration centralisée et robuste des typages TypeScript.
* `/src/data/modules.ts` : Banque de données des modules de formation, du glossaire clinique TAI et des cas pratiques.
* `/src/data/phrases.ts` : Base de données linguistique de traduction multilingue Français-Anglais-Thaï.
* `/src/components/SbaSimulator.tsx` : Moteur de simulation bilatérale alternée haptique et audio binaural.
* `/src/components/CiblageForm.tsx` : Formulaire de Phase 3 et outils de traitement clinique.
* `/src/components/Glossary.tsx` : Dictionnaire dynamique filtrable.
* `/src/components/Certificate.tsx` : Évaluateur académique et générateur d’attestations.
* `/src/components/LoversSpace.tsx` : Espace d'apprentissage linguistique intime bilingue.
* `/src/App.tsx` : Système d'authentification par mot de passe `LOVE` et routeur de l'application.
