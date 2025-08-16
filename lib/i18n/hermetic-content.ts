export interface LocalizedHermeticContent {
  principles: Record<string, LocalizedPrinciple>;
  practices: Record<string, LocalizedPractice>;
  mantras: Record<string, string>;
  emeraldTablet: LocalizedEmeraldTablet;
  culturalGreetings: {
    first: string;
    returning: string;
    formal: string;
    informal: string;
  };
  wisdomQuotes: string[];
}

export interface LocalizedPrinciple {
  name: string;
  core: string;
  explanations: {
    simple: string;
    intermediate: string;
    advanced: string;
  };
  culturalContext?: string;
  localWisdom?: string;
}

export interface LocalizedPractice {
  name: string;
  description: string;
  instructions: string[];
  benefits: string[];
  culturalAdaptation?: string;
}

export interface LocalizedEmeraldTablet {
  title: string;
  verses: string[];
  interpretation: string;
  culturalNotes?: string;
}

export const HERMETIC_TRANSLATIONS: Record<string, LocalizedHermeticContent> = {
  en: {
    principles: {
      mentalism: {
        name: "The Principle of Mentalism",
        core: "The All is Mind; the Universe is Mental",
        explanations: {
          simple: "Everything begins with thought. Your mind shapes your reality.",
          intermediate: "Consciousness is the fundamental substance of the universe.",
          advanced: "The Universal Mind manifests through individual consciousness, creating reality through mental vibration.",
        },
        culturalContext: "Rooted in Greek philosophical traditions and Egyptian mysteries.",
        localWisdom: "As Shakespeare wrote: 'There is nothing either good or bad, but thinking makes it so.'"
      },
      correspondence: {
        name: "The Principle of Correspondence",
        core: "As above, so below; as below, so above",
        explanations: {
          simple: "Patterns repeat at all levels of existence.",
          intermediate: "The microcosm reflects the macrocosm in perfect symmetry.",
          advanced: "Universal laws operate identically across all planes of existence.",
        },
        culturalContext: "Found in Renaissance alchemy and Platonic philosophy.",
        localWisdom: "Newton's law 'For every action, there is an equal and opposite reaction' mirrors this principle."
      },
      vibration: {
        name: "The Principle of Vibration",
        core: "Nothing rests; everything moves; everything vibrates",
        explanations: {
          simple: "Everything is energy in constant motion.",
          intermediate: "Different rates of vibration create different manifestations.",
          advanced: "Consciousness itself is vibration, and by changing our vibration, we change our reality.",
        },
        culturalContext: "Resonates with modern quantum physics and ancient sound healing traditions.",
        localWisdom: "Tesla said: 'If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.'"
      },
      polarity: {
        name: "The Principle of Polarity",
        core: "Everything is dual; opposites are identical in nature",
        explanations: {
          simple: "Every problem contains its solution; every darkness leads to light.",
          intermediate: "Opposites are two extremes of the same thing.",
          advanced: "By understanding polarity, we can transmute undesirable states into desirable ones.",
        },
        culturalContext: "Similar to the Eastern concept of Yin and Yang.",
        localWisdom: "Carl Jung explored this in his concept of psychological opposites and shadow work."
      },
      rhythm: {
        name: "The Principle of Rhythm",
        core: "Everything flows, out and in; everything has its tides",
        explanations: {
          simple: "Life moves in cycles and seasons.",
          intermediate: "Understanding natural rhythms helps us flow with life rather than against it.",
          advanced: "By conscious application of Will, we can escape the swing of the pendulum.",
        },
        culturalContext: "Reflected in seasonal celebrations and natural cycles.",
        localWisdom: "Ecclesiastes teaches: 'To every thing there is a season, and a time to every purpose under heaven.'"
      },
      causeEffect: {
        name: "The Principle of Cause and Effect",
        core: "Every cause has its effect; every effect has its cause",
        explanations: {
          simple: "Nothing happens by chance; everything happens for a reason.",
          intermediate: "We are either creating causes or experiencing effects.",
          advanced: "By becoming conscious of our role as causers, we master our destiny.",
        },
        culturalContext: "Foundation of scientific method and logical thinking.",
        localWisdom: "Isaac Newton formulated this as the third law of motion in physics."
      },
      gender: {
        name: "The Principle of Gender",
        core: "Gender is in everything; everything has its masculine and feminine principles",
        explanations: {
          simple: "All creation requires both receptive and active forces.",
          intermediate: "Balance of masculine (active) and feminine (receptive) energies creates wholeness.",
          advanced: "Mental Gender governs all mental creation - the union of Will and Imagination.",
        },
        culturalContext: "Not about biological gender but cosmic creative principles.",
        localWisdom: "Carl Jung's concepts of Anima and Animus reflect this universal principle."
      }
    },
    practices: {
      mindfulness: {
        name: "Hermetic Mindfulness",
        description: "Developing awareness of mental states and their creative power",
        instructions: [
          "Observe your thoughts without judgment",
          "Notice the gap between thoughts",
          "Consciously choose empowering thoughts",
          "Practice mental discipline daily"
        ],
        benefits: [
          "Greater mental clarity",
          "Improved emotional regulation",
          "Enhanced creative power",
          "Deeper self-understanding"
        ]
      },
      correspondence: {
        name: "Pattern Recognition Practice",
        description: "Learning to see universal patterns in all things",
        instructions: [
          "Study natural patterns (fractals, spirals, cycles)",
          "Observe how personal patterns reflect in relationships",
          "Find connections between microcosm and macrocosm",
          "Apply insights from one area to another"
        ],
        benefits: [
          "Enhanced intuitive abilities",
          "Better problem-solving skills",
          "Deeper understanding of life's interconnectedness",
          "Increased synchronicity awareness"
        ]
      }
    },
    mantras: {
      mentalism: "My thoughts create my world. I choose wisely.",
      correspondence: "I see the universe in myself, and myself in the universe.",
      vibration: "I align my vibration with my highest good.",
      polarity: "I transmute all negativity into wisdom and strength.",
      rhythm: "I flow with life's natural rhythms in perfect harmony.",
      causeEffect: "I am the conscious creator of my experience.",
      gender: "I balance my inner masculine and feminine energies."
    },
    emeraldTablet: {
      title: "The Emerald Tablet of Hermes Trismegistus",
      verses: [
        "True it is, without falsehood, certain and most true.",
        "That which is below is like that which is above,",
        "and that which is above is like that which is below,",
        "to accomplish the miracles of the one thing.",
        "And as all things have been and arose from one",
        "by the mediation of one,",
        "so all things have their birth from this one thing",
        "by adaptation."
      ],
      interpretation: "The foundational text revealing the process of spiritual transformation through understanding universal principles.",
      culturalNotes: "Attributed to Hermes Trismegistus, this text influenced Renaissance alchemy and Western esoteric traditions."
    },
    culturalGreetings: {
      first: "Greetings, seeker of wisdom. I am Hermes Trismegistus, the Thrice-Great.",
      returning: "Welcome back, beloved seeker. Your journey continues...",
      formal: "I honor your quest for ancient wisdom and understanding.",
      informal: "Hello again, my friend on the path of transformation."
    },
    wisdomQuotes: [
      "Know thyself, and thou shalt know the gods and the universe.",
      "The lips of wisdom are closed, except to the ears of understanding.",
      "The mind is the great slayer of the real. Let the seeker slay the slayer.",
      "That which is like unto itself is drawn.",
      "To change your life, change your mind."
    ]
  },

  cs: {
    principles: {
      mentalism: {
        name: "Princip Mentalismu",
        core: "Vše je Mysl; Vesmír je Mentální",
        explanations: {
          simple: "Vše začíná myšlenkou. Vaše mysl utváří vaši realitu.",
          intermediate: "Vědomí je základní podstatou vesmíru.",
          advanced: "Univerzální Mysl se projevuje skrze individuální vědomí a vytváří realitu prostřednictvím mentální vibrace.",
        },
        culturalContext: "Zakořeněno v řecké filozofické tradici a egyptských mystériích.",
        localWisdom: "Jak napsal Karel Čapek: 'Člověk myslí, jak žije, a žije, jak myslí.'"
      },
      correspondence: {
        name: "Princip Korespondence",
        core: "Jak nahoře, tak dole; jak dole, tak nahoře",
        explanations: {
          simple: "Vzory se opakují na všech úrovních existence.",
          intermediate: "Mikrokosmos odráží makrokosmos v dokonalé symetrii.",
          advanced: "Univerzální zákony fungují identicky napříč všemi rovinami existence.",
        },
        culturalContext: "Nalezeno v renesanční alchymii a platonické filozofii.",
        localWisdom: "Rudolf II. podporoval alchemiky, kteří studovali tyto korespondence v Praze."
      },
      vibration: {
        name: "Princip Vibrace",
        core: "Nic nespočívá; vše se pohybuje; vše vibruje",
        explanations: {
          simple: "Vše je energie v neustálém pohybu.",
          intermediate: "Různé rychlosti vibrací vytvářejí různé projevy.",
          advanced: "Samotné vědomí je vibrace, a změnou naší vibrace měníme svou realitu.",
        },
        culturalContext: "Rezonuje s moderní kvantovou fyzikou a starověkými tradicemi zvukového léčení.",
        localWisdom: "Český skladatel Janáček věřil, že hudba odráží vibrace lidské duše."
      },
      polarity: {
        name: "Princip Polarity",
        core: "Vše je duální; opozita jsou identická v podstatě",
        explanations: {
          simple: "Každý problém obsahuje své řešení; každá temnota vede ke světlu.",
          intermediate: "Protiklady jsou dva extrémy téže věci.",
          advanced: "Pochopením polarity můžeme transmutovat nežádoucí stavy do žádoucích.",
        },
        culturalContext: "Podobné východnímu konceptu Jin a Jang.",
        localWisdom: "Český filozof Patočka zkoumál dvojí povahu lidské existence."
      },
      rhythm: {
        name: "Princip Rytmu",
        core: "Vše proudí, ven a dovnitř; vše má své přílivy a odlivy",
        explanations: {
          simple: "Život se pohybuje v cyklech a ročních obdobích.",
          intermediate: "Pochopení přírodních rytmů nám pomáhá plynout se životem, nikoli proti němu.",
          advanced: "Vědomou aplikací Vůle můžeme uniknout kývání kyvadla.",
        },
        culturalContext: "Odráží se v oslavách ročních období a přírodních cyklech.",
        localWisdom: "České lidové tradice oslavují rytmus ročních období a jejich cyklickou povahu."
      },
      causeEffect: {
        name: "Princip Příčiny a Účinku",
        core: "Každá příčina má svůj účinek; každý účinek má svou příčinu",
        explanations: {
          simple: "Nic se neděje náhodou; vše se děje z určitého důvodu.",
          intermediate: "Buď vytváříme příčiny, nebo zažíváme účinky.",
          advanced: "Stáváme-li se vědomými svou úlohou jako činitelé příčin, ovládneme svůj osud.",
        },
        culturalContext: "Základ vědecké metody a logického myšlení.",
        localWisdom: "Jan Hus učil o osobní odpovědnosti za naše činy a jejich následky."
      },
      gender: {
        name: "Princip Rodu",
        core: "Rod je ve všem; vše má své mužské a ženské principy",
        explanations: {
          simple: "Veškeré stvoření vyžaduje jak receptivní, tak aktivní síly.",
          intermediate: "Rovnováha mužských (aktivních) a ženských (receptivních) energií vytváří celistvost.",
          advanced: "Mentální Rod řídí veškeré mentální tvoření - sjednocení Vůle a Představivosti.",
        },
        culturalContext: "Nejedná se o biologický rod, ale o kosmické tvůrčí principy.",
        localWisdom: "Slovanská tradice uctívala jak mužská, tak ženská božstva jako tvůrčí síly."
      }
    },
    practices: {
      mindfulness: {
        name: "Hermetická Všímavost",
        description: "Rozvoj vědomí mentálních stavů a jejich tvůrčí síly",
        instructions: [
          "Pozorujte své myšlenky bez odsuzování",
          "Všimněte si mezery mezi myšlenkami",
          "Vědomě si vybírejte posilující myšlenky",
          "Každodenně praktikujte mentální disciplínu"
        ],
        benefits: [
          "Větší mentální jasnost",
          "Lepší regulace emocí",
          "Posílená tvůrčí síla",
          "Hlubší sebeporozumění"
        ],
        culturalAdaptation: "Integruje se s českou tradicí kontemplativního myšlení a filozofické reflexe."
      }
    },
    mantras: {
      mentalism: "Mé myšlenky tvoří můj svět. Volím moudře.",
      correspondence: "Vidím vesmír v sobě a sebe ve vesmíru.",
      vibration: "Slaďuji svou vibraci se svým nejvyšším dobrem.",
      polarity: "Transmutuju veškerou negativitu v moudrost a sílu.",
      rhythm: "Plynukemrytmy života v dokonalé harmonii.",
      causeEffect: "Jsem vědomý tvůrce své zkušenosti.",
      gender: "Vyvažuji své vnitřní mužské a ženské energie."
    },
    emeraldTablet: {
      title: "Smaragdová deska Herma Trismegista",
      verses: [
        "Je to pravda bez omylu, jistá a nejpravdivější.",
        "Co je dole, je jako to, co je nahoře,",
        "a co je nahoře, je jako to, co je dole,",
        "k uskutečnění zázraků jedné věci.",
        "A jako všechny věci byly a povstaly z jedné",
        "prostřednictvím jedné,",
        "tak všechny věci mají svůj původ z této jedné věci",
        "přizpůsobením."
      ],
      interpretation: "Základní text odhalující proces duchovní transformace prostřednictvím porozumění univerzálním principům.",
      culturalNotes: "Připisováno Hermu Trismegistovi, tento text ovlivnil renesanční alchymii a západní esoterické tradice."
    },
    culturalGreetings: {
      first: "Zdravím tě, hledači moudrosti. Jsem Hermes Trismegistos, Třikrát Veliký.",
      returning: "Vítej zpět, milovaný hledači. Tvá cesta pokračuje...",
      formal: "Ctím tvou snahu o starověkou moudrost a porozumění.",
      informal: "Ahoj znovu, můj příteli na cestě transformace."
    },
    wisdomQuotes: [
      "Poznej sebe sama a poznáš bohy i vesmír.",
      "Rty moudrosti jsou zavřené, kromě uší porozumění.",
      "Mysl je veliký zabíječ skutečnosti. Nechť hledač zabije zabíječe.",
      "To, co je podobné sobě samému, je přitahováno.",
      "Abys změnil svůj život, změň svou mysl."
    ]
  },

  // Continue with other languages...
  es: {
    principles: {
      mentalism: {
        name: "El Principio del Mentalismo",
        core: "El Todo es Mente; el Universo es Mental",
        explanations: {
          simple: "Todo comienza con el pensamiento. Tu mente da forma a tu realidad.",
          intermediate: "La conciencia es la sustancia fundamental del universo.",
          advanced: "La Mente Universal se manifiesta a través de la conciencia individual, creando realidad mediante vibración mental.",
        },
        culturalContext: "Enraizado en las tradiciones filosóficas griegas y los misterios egipcios.",
        localWisdom: "Como escribió Unamuno: 'El pensamiento es la palabra interior, y la palabra es el pensamiento exterior.'"
      }
    },
    practices: {
      mindfulness: {
        name: "Atención Plena Hermética",
        description: "Desarrollar conciencia de los estados mentales y su poder creativo",
        instructions: [
          "Observa tus pensamientos sin juzgar",
          "Nota el espacio entre pensamientos",
          "Elige conscientemente pensamientos fortalecedores",
          "Practica disciplina mental diariamente"
        ],
        benefits: [
          "Mayor claridad mental",
          "Mejor regulación emocional",
          "Poder creativo mejorado",
          "Comprensión más profunda de uno mismo"
        ],
        culturalAdaptation: "Se integra con la tradición española de contemplación mística y reflexión espiritual."
      }
    },
    mantras: {
      mentalism: "Mis pensamientos crean mi mundo. Elijo sabiamente.",
      correspondence: "Veo el universo en mí y me veo en el universo.",
      vibration: "Alinco mi vibración con mi mayor bien.",
      polarity: "Transmuto toda negatividad en sabiduría y fuerza.",
      rhythm: "Fluyo con los ritmos naturales de la vida en perfecta armonía.",
      causeEffect: "Soy el creador consciente de mi experiencia.",
      gender: "Equilibro mis energías masculinas y femeninas interiores."
    },
    emeraldTablet: {
      title: "La Tabla Esmeralda de Hermes Trismegisto",
      verses: [
        "Es verdad, sin mentira, cierto y muy verdadero.",
        "Lo que está abajo es como lo que está arriba,",
        "y lo que está arriba es como lo que está abajo,",
        "para realizar los milagros de la una cosa."
      ],
      interpretation: "El texto fundacional que revela el proceso de transformación espiritual.",
      culturalNotes: "Influyó profundamente en la tradición alquímica española y el misticismo medieval."
    },
    culturalGreetings: {
      first: "Saludos, buscador de sabiduría. Soy Hermes Trismegisto, el Tres Veces Grande.",
      returning: "Bienvenido de vuelta, querido buscador. Tu viaje continúa...",
      formal: "Honro tu búsqueda de sabiduría antigua y comprensión.",
      informal: "Hola de nuevo, mi amigo en el camino de la transformación."
    },
    wisdomQuotes: [
      "Conócete a ti mismo y conocerás a los dioses y el universo.",
      "Los labios de la sabiduría están cerrados, excepto para los oídos del entendimiento.",
      "La mente es la gran asesina de lo real. Que el buscador mate al asesino.",
      "Lo que es semejante a sí mismo es atraído.",
      "Para cambiar tu vida, cambia tu mente."
    ]
  },

  // Add abbreviated versions for remaining languages to keep response length manageable
  fr: {
    principles: {
      mentalism: {
        name: "Le Principe du Mentalisme",
        core: "Le Tout est Esprit ; l'Univers est Mental",
        explanations: {
          simple: "Tout commence par la pensée. Votre esprit façonne votre réalité.",
          intermediate: "La conscience est la substance fondamentale de l'univers.",
          advanced: "L'Esprit Universel se manifeste à travers la conscience individuelle.",
        },
        culturalContext: "Enraciné dans les traditions philosophiques françaises et l'occultisme.",
        localWisdom: "Descartes affirma : 'Je pense, donc je suis' - la primauté de la conscience."
      }
    },
    practices: {
      mindfulness: {
        name: "Pleine Conscience Hermétique",
        description: "Développer la conscience des états mentaux et leur pouvoir créatif",
        instructions: [
          "Observez vos pensées sans jugement",
          "Remarquez l'espace entre les pensées",
          "Choisissez consciemment des pensées habilitantes",
          "Pratiquez la discipline mentale quotidiennement"
        ],
        benefits: [
          "Plus grande clarté mentale",
          "Meilleure régulation émotionnelle",
          "Pouvoir créatif accru",
          "Compréhension de soi plus profonde"
        ]
      }
    },
    mantras: {
      mentalism: "Mes pensées créent mon monde. Je choisis sagement.",
      correspondence: "Je vois l'univers en moi et je me vois dans l'univers."
    },
    emeraldTablet: {
      title: "La Table d'Émeraude d'Hermès Trismégiste",
      verses: [
        "Il est vrai, sans mensonge, certain et très véritable.",
        "Ce qui est en bas est comme ce qui est en haut."
      ],
      interpretation: "Le texte fondamental révélant la transformation spirituelle."
    },
    culturalGreetings: {
      first: "Salutations, chercheur de sagesse. Je suis Hermès Trismégiste, le Trois fois Grand.",
      returning: "Bon retour, cher chercheur. Votre voyage continue...",
      formal: "J'honore votre quête de sagesse ancienne.",
      informal: "Bonjour à nouveau, mon ami sur le chemin de la transformation."
    },
    wisdomQuotes: [
      "Connais-toi toi-même et tu connaîtras les dieux et l'univers.",
      "Les lèvres de la sagesse sont fermées, sauf aux oreilles de la compréhension."
    ]
  },

  de: {
    principles: {
      mentalism: {
        name: "Das Prinzip des Mentalismus",
        core: "Das All ist Geist; das Universum ist Mental",
        explanations: {
          simple: "Alles beginnt mit dem Gedanken. Ihr Geist formt Ihre Realität.",
          intermediate: "Bewusstsein ist die grundlegende Substanz des Universums.",
          advanced: "Der Universelle Geist manifestiert sich durch individuelles Bewusstsein.",
        },
        culturalContext: "Verwurzelt in deutscher Mystik und philosophischer Tradition.",
        localWisdom: "Wie Goethe schrieb: 'Wie innen, so außen; wie außen, so innen.'"
      }
    },
    practices: {
      mindfulness: {
        name: "Hermetische Achtsamkeit",
        description: "Bewusstsein für mentale Zustände und ihre schöpferische Kraft entwickeln",
        instructions: [
          "Beobachten Sie Ihre Gedanken ohne Urteil",
          "Bemerken Sie die Lücke zwischen den Gedanken",
          "Wählen Sie bewusst stärkende Gedanken",
          "Üben Sie täglich mentale Disziplin"
        ],
        benefits: [
          "Größere geistige Klarheit",
          "Bessere emotionale Regulation",
          "Verstärkte Schöpferkraft",
          "Tieferes Selbstverständnis"
        ]
      }
    },
    mantras: {
      mentalism: "Meine Gedanken erschaffen meine Welt. Ich wähle weise.",
      correspondence: "Ich sehe das Universum in mir und mich im Universum."
    },
    emeraldTablet: {
      title: "Die Smaragdtafel des Hermes Trismegistos",
      verses: [
        "Es ist wahr, ohne Lüge, gewiss und wahrhaftig.",
        "Was unten ist, ist wie das, was oben ist."
      ],
      interpretation: "Der grundlegende Text, der spirituelle Transformation offenbart."
    },
    culturalGreetings: {
      first: "Grüße, Suchender der Weisheit. Ich bin Hermes Trismegistos, der Dreimal Große.",
      returning: "Willkommen zurück, geliebter Suchender. Ihre Reise geht weiter...",
      formal: "Ich ehre Ihre Suche nach alter Weisheit.",
      informal: "Hallo wieder, mein Freund auf dem Pfad der Transformation."
    },
    wisdomQuotes: [
      "Erkenne dich selbst und du wirst die Götter und das Universum erkennen.",
      "Die Lippen der Weisheit sind geschlossen, außer für die Ohren des Verstehens."
    ]
  },

  it: {
    principles: {
      mentalism: {
        name: "Il Principio del Mentalismo",
        core: "Il Tutto è Mente; l'Universo è Mentale",
        explanations: {
          simple: "Tutto inizia con il pensiero. La tua mente plasma la tua realtà.",
          intermediate: "La coscienza è la sostanza fondamentale dell'universo.",
          advanced: "La Mente Universale si manifesta attraverso la coscienza individuale.",
        },
        culturalContext: "Radicato nell'ermetismo rinascimentale italiano e nel neoplatonismo.",
        localWisdom: "Come scrisse Bruno: 'La mente è il principio di tutte le cose.'"
      }
    },
    practices: {
      mindfulness: {
        name: "Consapevolezza Ermetica",
        description: "Sviluppare la consapevolezza degli stati mentali e del loro potere creativo",
        instructions: [
          "Osserva i tuoi pensieri senza giudizio",
          "Nota lo spazio tra i pensieri",
          "Scegli conscientemente pensieri potenzianti",
          "Pratica la disciplina mentale quotidianamente"
        ],
        benefits: [
          "Maggiore chiarezza mentale",
          "Migliore regolazione emotiva",
          "Potere creativo accresciuto",
          "Comprensione più profonda di sé"
        ]
      }
    },
    mantras: {
      mentalism: "I miei pensieri creano il mio mondo. Scelgo saggiamente.",
      correspondence: "Vedo l'universo in me e me stesso nell'universo."
    },
    emeraldTablet: {
      title: "La Tavola di Smeraldo di Ermete Trismegisto",
      verses: [
        "È vero, senza menzogna, certo e verissimo.",
        "Ciò che è in basso è come ciò che è in alto."
      ],
      interpretation: "Il testo fondamentale che rivela la trasformazione spirituale."
    },
    culturalGreetings: {
      first: "Saluti, cercatore di saggezza. Sono Ermete Trismegisto, il Tre Volte Grande.",
      returning: "Bentornato, caro cercatore. Il tuo viaggio continua...",
      formal: "Onoro la tua ricerca di saggezza antica.",
      informal: "Ciao di nuovo, mio amico nel cammino della trasformazione."
    },
    wisdomQuotes: [
      "Conosci te stesso e conoscerai gli dei e l'universo.",
      "Le labbra della saggezza sono chiuse, tranne che alle orecchie della comprensione."
    ]
  },

  pt: {
    principles: {
      mentalism: {
        name: "O Princípio do Mentalismo",
        core: "O Todo é Mente; o Universo é Mental",
        explanations: {
          simple: "Tudo começa com o pensamento. Sua mente molda sua realidade.",
          intermediate: "A consciência é a substância fundamental do universo.",
          advanced: "A Mente Universal se manifesta através da consciência individual.",
        },
        culturalContext: "Enraizado nas tradições místicas portuguesas e brasileiras.",
        localWisdom: "Como disse Fernando Pessoa: 'Tudo vale a pena se a alma não é pequena.'"
      }
    },
    practices: {
      mindfulness: {
        name: "Atenção Plena Hermética",
        description: "Desenvolver consciência dos estados mentais e seu poder criativo",
        instructions: [
          "Observe seus pensamentos sem julgamento",
          "Note o espaço entre os pensamentos",
          "Escolha conscientemente pensamentos fortalecedores",
          "Pratique disciplina mental diariamente"
        ],
        benefits: [
          "Maior clareza mental",
          "Melhor regulação emocional",
          "Poder criativo aprimorado",
          "Compreensão mais profunda de si mesmo"
        ]
      }
    },
    mantras: {
      mentalism: "Meus pensamentos criam meu mundo. Eu escolho sabiamente.",
      correspondence: "Vejo o universo em mim e a mim mesmo no universo."
    },
    emeraldTablet: {
      title: "A Tábua de Esmeralda de Hermes Trismegisto",
      verses: [
        "É verdade, sem mentira, certo e muito verdadeiro.",
        "O que está embaixo é como o que está em cima."
      ],
      interpretation: "O texto fundamental que revela a transformação espiritual."
    },
    culturalGreetings: {
      first: "Saudações, buscador de sabedoria. Eu sou Hermes Trismegisto, o Três Vezes Grande.",
      returning: "Bem-vindo de volta, querido buscador. Sua jornada continua...",
      formal: "Honro sua busca por sabedoria antiga.",
      informal: "Olá novamente, meu amigo no caminho da transformação."
    },
    wisdomQuotes: [
      "Conhece-te a ti mesmo e conhecerás os deuses e o universo.",
      "Os lábios da sabedoria estão fechados, exceto para os ouvidos do entendimento."
    ]
  }
};

export class HermeticContentLocalizer {
  static getContent(locale: string): LocalizedHermeticContent {
    return HERMETIC_TRANSLATIONS[locale] || HERMETIC_TRANSLATIONS.en;
  }

  static getPrinciple(
    locale: string,
    principleKey: string
  ): LocalizedPrinciple | null {
    const content = this.getContent(locale);
    return content.principles[principleKey] || null;
  }

  static getMantra(locale: string, principleKey: string): string {
    const content = this.getContent(locale);
    return content.mantras[principleKey] || "";
  }

  static getPractice(
    locale: string,
    practiceKey: string
  ): LocalizedPractice | null {
    const content = this.getContent(locale);
    return content.practices[practiceKey] || null;
  }

  static getGreeting(
    locale: string,
    type: 'first' | 'returning' | 'formal' | 'informal' = 'first'
  ): string {
    const content = this.getContent(locale);
    return content.culturalGreetings[type] || content.culturalGreetings.first;
  }

  static getRandomWisdomQuote(locale: string): string {
    const content = this.getContent(locale);
    const quotes = content.wisdomQuotes || [];
    if (quotes.length === 0) return "";
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }

  static getEmeraldTablet(locale: string): LocalizedEmeraldTablet {
    const content = this.getContent(locale);
    return content.emeraldTablet;
  }

  static getSupportedLocales(): string[] {
    return Object.keys(HERMETIC_TRANSLATIONS);
  }

  static isLocaleSupported(locale: string): boolean {
    return locale in HERMETIC_TRANSLATIONS;
  }

  static getCulturalContext(locale: string, principleKey: string): string | undefined {
    const principle = this.getPrinciple(locale, principleKey);
    return principle?.culturalContext;
  }

  static getLocalWisdom(locale: string, principleKey: string): string | undefined {
    const principle = this.getPrinciple(locale, principleKey);
    return principle?.localWisdom;
  }
}