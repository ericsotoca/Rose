/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '../types';

export const EMDR_MODULES: Module[] = [
  {
    id: 1,
    title: 'Module 1 : Fondations Neurobiologiques',
    subtitle: 'Modèle TAI (Traitement Adaptatif de l’Information)',
    phases: 'Introduction & Cadre Théorique',
    summary: 'Comprendre les mécanismes cérébraux de la mémoire traumatique et comment le modèle TAI sous-tend la thérapie EMDR.',
    slides: [
      {
        title: 'Le Modèle TAI de Francine Shapiro',
        content: [
          'Le modèle du Traitement Adaptatif de l’Information (TAI) postule que l’être humain dispose d’un système inné de guérison psychologique comparable au système immunitaire.',
          'En cas de traumatisme intense, ce système est submergé. Les souvenirs sont alors stockés de façon dysfonctionnelle (non intégrée), conservant intactes les émotions, sensations physiques et cognitions de l’instant initial.',
          'L’EMDR ne détruit pas le souvenir mais réactive le système TAI pour permettre sa métabolisation adaptative.'
        ],
        visualType: 'neuro'
      },
      {
        title: 'Amygdale, Hippocampe et Cortex Préfrontal',
        content: [
          'Amygdale (Le système d’alarme) : Reste hyperactive, maintenant le patient en état constant de menace.',
          'Hippocampe (Le classificateur) : Est inhibé par le stress extrême, empêchant l’inscription temporelle du trauma ("C’est du passé").',
          'Cortex Préfrontal (L’analyste) : Perd ses connexions de régulation, rendant l’abréaction incontrôlable sans intervention.'
        ],
        visualType: 'neuro'
      }
    ],
    verbatim: [
      {
        therapist: '« Quand un événement difficile survient, notre cerveau le traite naturellement pour l’archiver. Mais si le choc est trop fort, le système d’archivage bloque. Le souvenir reste "brûlant" et actif. L’EMDR va nous aider à débloquer ce système pour que votre cerveau range enfin ce souvenir dans le passé. »',
        patient: '« Ah je comprends mieux ! C’est pour ça que j’ai l’impression que l’accident s’est produit ce matin alors que ça fait dix ans... »'
      }
    ],
    pitfalls: [
      'Sur-intellectualiser l’explication : Le patient a besoin d’être rassuré, pas d’un cours académique de médecine.',
      'Promettre une amnésie : L’EMDR élimine la charge émotionnelle, pas le souvenir en lui-même.'
    ],
    quiz: [
      {
        id: 'm1_q1',
        question: 'Selon le modèle TAI, qu’est-ce qui caractérise un souvenir traumatique stocké de façon dysfonctionnelle ?',
        options: [
          'Il est complètement effacé de la conscience consciente.',
          'Il est stocké dans un format isolé, conservant les perceptions sensorielles et émotions d’origine.',
          'Il est automatiquement réorganisé par l’hippocampe de manière adaptative.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Le modèle TAI explique que les traumatismes bloquent le traitement de l’information. Les souvenirs restent figés sous leur forme brute d’origine, avec les mêmes émotions et sensations physiques.'
      }
    ]
  },
  {
    id: 2,
    title: 'Module 2 : Phase 1 - Anamnèse',
    subtitle: 'Cible primaire et technique du Float-back',
    phases: 'Phase 1 : Histoire du Patient',
    summary: 'Identifier les cibles de traitement actuelles et remonter à l’événement fondateur (souvenir source) grâce au Float-back.',
    slides: [
      {
        title: 'Élaborer le Plan de Ciblage TAI',
        content: [
          'Identifier les déclencheurs actuels du problème présenté par le patient.',
          'Remonter aux souvenirs passés sources (les "fondations" du réseau de mémoire dysfonctionnel).',
          'Considérer les scénarios futurs (comment le patient souhaite se comporter face au déclencheur à l’avenir).'
        ],
        visualType: 'timeline'
      },
      {
        title: 'La Technique du Float-back (Pont Affectif)',
        content: [
          'Partir de la sensation physique ou de l’émotion actuelle ressentie en séance.',
          'Demander au patient de se concentrer sur cette sensation et de laisser son esprit flotter en arrière dans le temps.',
          'Trouver le plus ancien souvenir associé à cette même signature somato-émotionnelle.'
        ],
        visualType: 'timeline'
      }
    ],
    verbatim: [
      {
        therapist: '« Concentrez-vous sur ce nœud dans l’estomac et cette pensée "Je suis en danger". Laissez votre esprit flotter en arrière dans le temps... Quelle est la première image qui vous vient à l’esprit, même si elle semble insignifiante ? »',
        patient: '« Oh... J’ai 6 ans, mon père crie très fort dans la cuisine et je suis caché sous la table. »'
      }
    ],
    pitfalls: [
      'Traiter immédiatement le premier souvenir venu sans planifier le réseau global.',
      'Négliger les ressources positives du patient durant l’anamnèse.'
    ],
    quiz: [
      {
        id: 'm2_q1',
        question: 'Quel est l’objectif premier de la technique du Float-back ?',
        options: [
          'Relaxer le patient en l’amenant à penser à des souvenirs d’enfance heureux.',
          'Retrouver le souvenir source d’origine en se servant des sensations physiques et émotions actuelles comme pont.',
          'Forcer le patient à revivre l’abréaction la plus violente possible.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Le Float-back est un pont affectif et somatique permettant de remonter le fil des réseaux de mémoire dysfonctionnels jusqu’au souvenir d’origine responsable du symptôme actuel.'
      }
    ]
  },
  {
    id: 3,
    title: 'Module 3 : Phase 2 - Stabilisation',
    subtitle: 'Lieu Sûr, Contenant et Butterfly Hug',
    phases: 'Phase 2 : Préparation & Stabilisation',
    summary: 'Installer des ressources internes de régulation émotionnelle pour sécuriser le patient avant toute exposition.',
    slides: [
      {
        title: 'Installation du Lieu Sûr (Safe Place)',
        content: [
          'Le Lieu Sûr est une image mentale choisie par le patient où il se sent en sécurité et détendu.',
          'On l’associe à des stimulations bilatérales alternées très lentes (6 à 8 passes maximum) pour ancrer les sensations positives associées.',
          'Un mot clé d’évocation (ex: "Calme", "Plage") est installé pour une réactivation autonome.'
        ],
        visualType: 'container'
      },
      {
        title: 'Technique du Contenant et du Butterfly Hug',
        content: [
          'Le Contenant Métaphorique : Un espace imaginaire (coffre, coffre-fort) hautement sécurisé pour y enfermer temporairement les pensées intrusives ou douloureuses entre les séances.',
          'Le Butterfly Hug (Étreinte du Papillon) : Méthode de SBA tactile autonome. Croiser les mains sur la poitrine et tapoter alternativement les épaules à un rythme lent pour s’apaiser.'
        ],
        visualType: 'container'
      }
    ],
    verbatim: [
      {
        therapist: '« Pensez à ce jardin calme. Ressentez l’odeur des fleurs et le soleil doux sur votre visage. Associez-y le mot "Sérénité". Maintenant, tapotez lentement vos épaules l’une après l’autre avec moi... »',
        patient: '« (Prend une respiration profonde) Je me sens apaisé. C’est comme si j’étais vraiment là-bas. »'
      }
    ],
    pitfalls: [
      'Proposer des stimulations bilatérales rapides durant l’installation des ressources (cela produit une désensibilisation non désirée et perturbe l’ancrage).',
      'Imposer un Lieu Sûr au patient au lieu de le laisser choisir.'
    ],
    quiz: [
      {
        id: 'm3_q1',
        question: 'Comment doivent être les Stimulations Bilatérales Alternées (SBA) pour installer le Lieu Sûr ?',
        options: [
          'Trés rapides et nombreuses (24 à 30 passes).',
          'Lentes, douces et courtes (6 à 8 passes maximum).',
          'Inexistantes (on n’utilise jamais de SBA en Phase 2).'
        ],
        correctAnswerIndex: 1,
        explanation: 'Pour l’installation de ressources positives, on utilise des SBA courtes et lentes (6 à 8 passes) pour renforcer la connexion neuronale agréable sans déclencher la désensibilisation.'
      }
    ]
  },
  {
    id: 4,
    title: 'Module 4 : Phase 3 - Évaluation',
    subtitle: 'Évaluation standardisée des 7 composantes',
    phases: 'Phase 3 : Évaluation',
    summary: 'Isoler scientifiquement les composantes cognitives, émotionnelles et somatiques de la cible avant la désensibilisation.',
    slides: [
      {
        title: 'Les 7 Composantes de la Cible EMDR',
        content: [
          '1. Image Source : La pire représentation visuelle du souvenir.',
          '2. Cognition Négative (CN) : La croyance dysfonctionnelle sur soi ("Je suis en danger", "Je suis nul").',
          '3. Cognition Positive (CP) : Ce que le patient aimerait croire de lui-même ("Je suis en sécurité", "J’ai de la valeur").',
          '4. Validité de la Cognition (VoC) : Score d’accord avec la CP de 1 (totalement faux) à 7 (totalement vrai).',
          '5. Émotion : Ce que le patient ressent maintenant en pensant à la cible.',
          '6. SUD (Subjective Units of Distress) : Niveau de détresse de 0 (neutre) à 10 (pire détresse imaginable).',
          '7. Somatisation : Localisation de la tension dans le corps.'
        ],
        visualType: 'metrics'
      }
    ],
    verbatim: [
      {
        therapist: '« Quand vous pensez à cet accident, quelle image représente le pire moment ? Quelles paroles négatives sur vous-même y sont associées ? »',
        patient: '« L’image des phares qui foncent sur moi. La pensée qui me vient c’est "Je vais mourir, je suis impuissant". »'
      }
    ],
    pitfalls: [
      'Confondre la CN avec une description de situation ("C’était de ma faute" est une CN, "La voiture allait vite" est un fait).',
      'Évaluer la VoC ou le SUD en fonction du passé plutôt que du ressenti immédiat en séance.'
    ],
    quiz: [
      {
        id: 'm4_q1',
        question: 'Quelle est la différence majeure entre une Cognition Négative (CN) et un fait clinique ?',
        options: [
          'La CN exprime une croyance irrationnelle et toxique sur l’identité même du patient face à l’événement.',
          'La CN est toujours logiquement correcte et basée sur les faits de l’événement.',
          'Il n’y a aucune différence, les deux termes sont interchangeables.'
        ],
        correctAnswerIndex: 0,
        explanation: 'La CN est une auto-attribution négative globalisante et irrationnelle ("Je suis impuissant", "Je suis coupable") qui montre comment le cerveau a figé le soi dans le trauma.'
      }
    ]
  },
  {
    id: 5,
    title: 'Module 5 : Phase 4 - Désensibilisation',
    subtitle: 'Traitement du looping, abréactions et tissages',
    phases: 'Phase 4 : Désensibilisation',
    summary: 'Conduire les sets de SBA rapides pour digérer l’information traumatique et débloquer les situations de résistance (looping).',
    slides: [
      {
        title: 'Déroulement de la Désensibilisation',
        content: [
          'On démarre des sets de stimulations bilatérales alternées rapides (24 à 30 passes).',
          'Entre chaque set, consigne simple : « Inspirez profondément... Qu’est-ce qui vient maintenant ? ». Sans analyser ni juger.',
          'Le thérapeute n’intervient pas, il accompagne le processus ("Laissez faire le cerveau").'
        ],
        visualType: 'interweave'
      },
      {
        title: 'Le Looping et les Tissages Cognitifs',
        content: [
          'Looping : Le patient tourne en rond dans le même matériel douloureux sans évolution adaptative pendant plusieurs sets.',
          'Tissage Cognitif : Question ciblée posée par le thérapeute pour introduire une nouvelle perspective ou information dans le système bloqué.',
          'Exemple : « Si c’était votre fille de 5 ans à votre place, diriez-vous qu’elle était coupable ? ».'
        ],
        visualType: 'interweave'
      }
    ],
    verbatim: [
      {
        therapist: '« Concentrez-vous sur cette colère et suivez la balle des yeux... (SBA rapides). Inspirez profondément. Qu’est-ce qui vient ? »',
        patient: '« Je vois la pièce d’un autre angle. Je réalise que la porte était fermée à clé, je ne pouvais vraiment pas sortir. »'
      }
    ],
    pitfalls: [
      'Trop parler : Interrompre le retraitement spontané par des commentaires ou des interprétations sauvages.',
      'Paniquer face à une abréaction (pleurs intenses) et arrêter les SBA prématurément.'
    ],
    quiz: [
      {
        id: 'm5_q1',
        question: 'Quand devez-vous utiliser un Tissage Cognitif en Phase 4 ?',
        options: [
          'Dès que le patient pleure ou exprime une vive émotion.',
          'Lorsque le retraitement stagne ou boucle de façon répétitive sans progression adaptative.',
          'Au début de chaque séance pour accélérer les choses.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Le tissage cognitif est une intervention active du clinicien réservée uniquement aux situations de blocage ("looping") afin de relancer le TAI de manière douce.'
      }
    ]
  },
  {
    id: 6,
    title: 'Module 6 : Phase 5 & 6 - Installation & Scanner Corporel',
    subtitle: 'Ancrage de la Cognition Positive et balayage somatique',
    phases: 'Phases 5 & 6 : Installation & Scanner Corporel',
    summary: 'Associer la Cognition Positive au souvenir retraité et s’assurer de l’absence totale de tensions corporelles résiduelles.',
    slides: [
      {
        title: 'Phase 5 : Installation de la Cognition Positive (CP)',
        content: [
          'Associer le souvenir d’origine à la croyance adaptative ("Je suis fort", "Je suis en sécurité aujourd’hui").',
          'On demande au patient d’évaluer la validité de cette pensée sur l’échelle de VoC (1 à 7).',
          'On utilise des sets de SBA rapides pour ancrer et faire grimper la VoC jusqu’à 7.'
        ],
        visualType: 'body'
      },
      {
        title: 'Phase 6 : Le Scanner Corporel (Body Scan)',
        content: [
          'Le patient garde à l’esprit le souvenir et la CP installée, puis ferme les yeux pour scanner mentalement son corps du sommet du crâne aux orteils.',
          'Si une tension, chaleur ou gêne somatique apparaît, on effectue des SBA pour désensibiliser cette somatisation résiduelle.',
          'La phase 6 n’est validée que lorsque le corps entier est totalement neutre ou détendu.'
        ],
        visualType: 'body'
      }
    ],
    verbatim: [
      {
        therapist: '« Pensez au souvenir et à la phrase "Je suis en sécurité maintenant". Fermez les yeux et parcourez votre corps. Y a-t-il une tension quelque part ? »',
        patient: '« J’ai encore un petit point chaud, une légère oppression au milieu de la poitrine. »'
      }
    ],
    pitfalls: [
      'Valider le Scanner Corporel alors que le patient a encore des tensions mineures (le traumatisme se cache souvent dans les somatisations fines).',
      'Installer la CP avant que le SUD ne soit descendu à 0 (ou 1 dans certains cas complexes).'
    ],
    quiz: [
      {
        id: 'm6_q1',
        question: 'Quelle condition clinique est requise avant de pouvoir passer à la Phase 5 (Installation de la CP) ?',
        options: [
          'Le niveau de détresse subjectif (SUD) doit être descendu à 0 (ou 1).',
          'La séance doit durer depuis au moins 45 minutes.',
          'Le patient doit avoir validé son Lieu Sûr à nouveau.'
        ],
        correctAnswerIndex: 0,
        explanation: 'On ne peut pas installer de cognition positive constructive si le matériel d’origine génère encore de la détresse. Le SUD doit être à 0 avant d’initier la Phase 5.'
      }
    ]
  },
  {
    id: 7,
    title: 'Module 7 : Phase 7 - Clôture',
    subtitle: 'Protocoles de clôture pour séances incomplètes ou complètes',
    phases: 'Phase 7 : Clôture',
    summary: 'Assurer le retour à l’équilibre émotionnel du patient en fin de séance, que le ciblage soit entièrement résolu ou incomplet.',
    slides: [
      {
        title: 'Séance Complète vs Séance Incomplète',
        content: [
          'Séance Complète : Le SUD est à 0, la VoC est à 7 et le Scanner Corporel est totalement neutre. On clôture en renforçant les acquis.',
          'Séance Incomplète : Le temps de consultation s’achève alors que le matériel est toujours actif (SUD > 0). Il est impératif de refermer proprement le processus pour sécuriser le patient.'
        ],
        visualType: 'closure'
      },
      {
        title: 'La Clôture d’une Séance Incomplète',
        content: [
          'Arrêter la désensibilisation 10 à 15 minutes avant l’heure de fin.',
          'Expliquer clairement au patient : « Le travail est en cours, nous l’avons juste suspendu. ».',
          'Utiliser activement la métaphore du Contenant pour stocker le matériel non résolu.',
          'Effectuer une séance d’apaisement via le Lieu Sûr ou des techniques de respiration contrôlée.'
        ],
        visualType: 'closure'
      }
    ],
    verbatim: [
      {
        therapist: '« Nous arrivons au terme de la séance d’aujourd’hui, le processus est bien engagé mais pas terminé. Nous allons ranger cette scène et ces tensions dans votre coffre-fort mental pour la semaine. Vous pourrez la rouvrir avec moi à la prochaine séance. »',
        patient: '« D’accord. Cela me rassure de savoir que je ne repars pas à la maison avec tout ça sur les bras. »'
      }
    ],
    pitfalls: [
      'Laisser partir un patient en pleine détresse (abréaction active) sans faire de protocole de stabilisation.',
      'S’excuser d’avoir entamé un travail qui n’a pas pu être fini.'
    ],
    quiz: [
      {
        id: 'm7_q1',
        question: 'Quelle action est cruciale lors de la clôture d’une séance EMDR restée incomplète ?',
        options: [
          'Prescrire des anxiolytiques immédiatement.',
          'Utiliser la métaphore du Contenant et faire une réassociation au Lieu Sûr pour stabiliser l’état émotionnel avant le départ.',
          'Demander au patient de continuer à faire des SBA rapides tout seul à la maison.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Il est fondamental de sécuriser le patient en encapsulant métaphoriquement le matériel douloureux actif pour éviter une dérégulation sévère entre les séances.'
      }
    ]
  },
  {
    id: 8,
    title: 'Module 8 : Phase 8 & Protocoles Spécifiques',
    subtitle: 'Réévaluation, protocole R-TEP et trauma complexe',
    phases: 'Phase 8 : Réévaluation & Adaptations',
    summary: 'Vérifier la consolidation du traitement lors de la séance suivante et appréhender les protocoles de traumatismes récents ou complexes.',
    slides: [
      {
        title: 'Phase 8 : La Réévaluation Clinique',
        content: [
          'Elle débute systématiquement à la séance suivante.',
          'Le thérapeute interroge le patient sur son état d’esprit, ses rêves, et les éventuelles réactivations somatiques survenues durant l’inter-séance.',
          'On ré-évalue le SUD et la VoC du souvenir traité pour s’assurer de la permanence de l’effet.'
        ],
        visualType: 'reval'
      },
      {
        title: 'Protocoles R-TEP et G-TEP (Trauma Récent)',
        content: [
          'R-TEP (Recent Traumatic Episode Protocol) : Conçu pour intervenir rapidement après un sinistre ou événement traumatique aigu, afin d’éviter la consolidation pathologique du SSPT.',
          'G-TEP (Group Traumatic Episode Protocol) : Adaptation collective du protocole récent pour traiter des communautés victimes d’un drame commun.'
        ],
        visualType: 'reval'
      }
    ],
    verbatim: [
      {
        therapist: '« Une semaine s’est écoulée depuis que nous avons travaillé sur l’accident. Quand vous repensez à cette scène aujourd’hui, quelle charge émotionnelle ressentez-vous de 0 à 10 ? »',
        patient: '« C’est extraordinaire, l’image est floue. Quand j’y pense, je ne ressens plus rien du tout, c’est à 0. »'
      }
    ],
    pitfalls: [
      'Sauter l’étape de réévaluation et attaquer directement une nouvelle cible sans valider la solidité de la précédente.',
      'Utiliser le protocole standard sur un traumatisme complexe à répétition sans préparation prolongée.'
    ],
    quiz: [
      {
        id: 'm8_q1',
        question: 'À quel moment de la thérapie débute la Phase 8 (Réévaluation) ?',
        options: [
          'Au tout début de la séance suivant immédiatement la séance de retraitement.',
          'À la toute fin du protocole global de traitement après un an.',
          'Pendant le scanner corporel.'
        ],
        correctAnswerIndex: 0,
        explanation: 'La Phase 8 est systématiquement réalisée à l’ouverture de la séance suivante pour évaluer si le retraitement a été consolidé ou si d’autres cibles associées ont émergé.'
      }
    ]
  }
];

export const GLOSSARY_ENTRIES = [
  {
    term: 'TAI (Traitement Adaptatif de l’Information)',
    definition: 'Modèle neurobiologique postulant que le cerveau possède un système inné de guérison psychologique qui métabolise les expériences vécues en apprentissages adaptatifs.',
    category: 'Neurobiologie' as const
  },
  {
    term: 'CN (Cognition Négative)',
    definition: 'Croyance négative irrationnelle et toxique sur soi-même, formulée à la première personne au présent, associée au souvenir traumatique (ex: "Je suis impuissant", "Je suis coupable").',
    category: 'Échelles' as const
  },
  {
    term: 'CP (Cognition Positive)',
    definition: 'Croyance positive constructive et réaliste que le patient aimerait pouvoir croire de lui-même en pensant au souvenir (ex: "Je suis digne d’amour", "J’ai fait de mon mieux").',
    category: 'Échelles' as const
  },
  {
    term: 'VoC (Validité de la Cognition)',
    definition: 'Échelle d’évaluation subjective de 1 (totalement faux) à 7 (totalement vrai) indiquant à quel point le patient ressent la pertinence de la Cognition Positive au moment présent.',
    category: 'Échelles' as const
  },
  {
    term: 'SUD (Subjective Units of Distress)',
    definition: 'Échelle de détresse psychologique subjective de 0 (aucune perturbation, calme) à 10 (la pire perturbation imaginable), mesurant l’angoisse instantanée face à la cible.',
    category: 'Échelles' as const
  },
  {
    term: 'Float-back (Pont Affectif)',
    definition: 'Technique d’anamnèse consistant à utiliser une sensation physique ou émotionnelle présente pour faire dériver l’esprit en arrière à la recherche du souvenir source fondateur.',
    category: 'Techniques' as const
  },
  {
    term: 'Lieu Sûr (Safe Place)',
    definition: 'Exercice de stabilisation de Phase 2 visant à créer et ancrer par SBA lentes une image mentale de détente totale utilisable par le patient en cas de débordement.',
    category: 'Techniques' as const
  },
  {
    term: 'Contenant Métaphorique',
    definition: 'Ressource imaginaire solide installée en Phase 2 pour enfermer virtuellement des émotions ou pensées perturbatrices à la fin d’une séance restée incomplète.',
    category: 'Techniques' as const
  },
  {
    term: 'Abréaction',
    definition: 'Décharge émotionnelle vive et libératrice (pleurs, cris, tremblements) survenant pendant la phase de désensibilisation, témoignant de la réactivation du retraitement.',
    category: 'Neurobiologie' as const
  },
  {
    term: 'Tissage Cognitif (Cognitive Interweave)',
    definition: 'Intervention verbale stratégique et brève du thérapeute en Phase 4 pour guider et relancer un traitement qui boucle ou stagne (looping).',
    category: 'Protocoles' as const
  },
  {
    term: 'Scanner Corporel (Body Scan)',
    definition: 'Phase 6 du protocole EMDR consistant à passer au crible le corps entier pour y repérer et désensibiliser par SBA d’éventuelles somatisations résiduelles du trauma.',
    category: 'Techniques' as const
  },
  {
    term: 'R-TEP (Recent Traumatic Episode Protocol)',
    definition: 'Protocole EMDR structuré d’intervention précoce destiné aux personnes ayant vécu un épisode traumatique récent afin de prévenir l’enkystage du SSPT.',
    category: 'Protocoles' as const
  }
];
