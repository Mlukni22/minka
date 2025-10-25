import { Story, StoryChapter, VocabularyItem } from '@/types';

export class StoryEngine {
  private stories: Story[] = [];

  constructor() {
    this.initializeStories();
  }

  private initializeStories() {
    this.stories = [
      {
        id: 'episode-0-hallo',
        title: 'Chapter 1 – Hallo!',
        description: 'The first German words in Minka\'s world - greetings and introductions',
        difficulty: 'A1',
        estimatedTime: 5,
        chapters: [
          {
            id: 'meet-lisa',
            title: 'Chapter 1.1 – Meeting Lisa',
            content: `🌅 Im Dorf
Minka: Hallo!
Lisa: Hallo!
Minka: Wie heißt du?
Lisa: Ich heiße Lisa.
Minka: Hallo, Lisa! Ich bin Minka.
Lisa: Hallo, Minka!
(They smile. The word "Hallo" glows softly.)`,
            vocabulary: [
              { german: 'Hallo', english: 'Hello', audio: '/audio/hallo.mp3', wordType: 'other' },
              { german: 'Wie heißt du?', english: 'What is your name?', audio: '/audio/wie-heisst-du.mp3', wordType: 'phrase' },
              { german: 'Ich heiße', english: 'My name is', audio: '/audio/ich-heisse.mp3', wordType: 'phrase' },
              { german: 'Ich bin', english: 'I am', audio: '/audio/ich-bin.mp3', wordType: 'phrase' }
            ],
            exercises: [
              {
                type: 'multiple-choice',
                question: 'What does "Hallo" mean?',
                options: ['Goodbye', 'Hello', 'Thank you'],
                correct: 1
              },
              {
                type: 'fill-blank',
                question: 'Complete: "___ heißt du?"',
                options: ['Wie', 'Was', 'Wer'],
                correct: 0
              }
            ]
          },
          {
            id: 'meet-emma',
            title: 'Chapter 1.2 – Meeting Emma',
            content: `🐭 Eine kleine Maus
Minka: Hallo!
Maus: Hallo!
Minka: Wie heißt du?
Maus: Ich heiße Emma.
Minka: Hallo, Emma! Ich bin Minka.
Emma: Hallo, Minka!
(Emma waves shyly. A soft sound of bells plays.)`,
            vocabulary: [
              { german: 'Hallo', english: 'Hello', audio: '/audio/hallo.mp3', wordType: 'other' },
              { german: 'Wie heißt du?', english: 'What is your name?', audio: '/audio/wie-heisst-du.mp3', wordType: 'phrase' },
              { german: 'Ich heiße', english: 'My name is', audio: '/audio/ich-heisse.mp3', wordType: 'phrase' },
              { german: 'Maus', english: 'mouse', audio: '/audio/maus.mp3', article: 'die', plural: 'Mäuse', wordType: 'noun' }
            ],
            exercises: [
              {
                type: 'multiple-choice',
                question: 'What does "Ich heiße Emma" mean?',
                options: ['I am Emma', 'My name is Emma', 'I like Emma'],
                correct: 1
              },
              {
                type: 'fill-blank',
                question: 'Complete: "Ich ___ Minka."',
                options: ['bin', 'bist', 'ist'],
                correct: 0
              }
            ]
          },
          {
            id: 'meet-pinko',
            title: 'Chapter 1.3 – Meeting Pinko',
            content: `🎨 Im Park
Im Park sitzt Pinko. 🎨
Er malt.
Minka: Hallo!
Pinko: Hallo!
Minka: Wie heißt du?
Pinko: Ich heiße Pinko.
Minka: Hallo, Pinko! Ich bin Minka.
Pinko: Hallo, Minka!
(He smiles and holds up his painting.)`,
            vocabulary: [
              { german: 'Hallo', english: 'Hello', audio: '/audio/hallo.mp3', wordType: 'other' },
              { german: 'Park', english: 'park', audio: '/audio/park.mp3', article: 'der', plural: 'Parks', wordType: 'noun' },
              { 
                german: 'malen', 
                english: 'to paint', 
                audio: '/audio/malen.mp3', 
                wordType: 'verb',
                conjugation: {
                  ich: 'male',
                  du: 'malst',
                  er_sie_es: 'malt',
                  wir: 'malen',
                  ihr: 'malt',
                  sie_Sie: 'malen'
                }
              },
              { german: 'Ich bin', english: 'I am', audio: '/audio/ich-bin.mp3', wordType: 'phrase' }
            ],
            exercises: [
              {
                type: 'multiple-choice',
                question: 'Where is Pinko?',
                options: ['In the house', 'In the park', 'In the bakery'],
                correct: 1
              },
              {
                type: 'fill-blank',
                question: 'Complete: "Ich ___ Pinko."',
                options: ['heiße', 'heißt', 'heißen'],
                correct: 0
              }
            ]
          },
          {
            id: 'meet-boby',
            title: 'Chapter 1.4 – Meeting Boby',
            content: `☕ Unter dem Baum
Unter einem Baum sitzt Boby mit einer Tasse Tee. ☕
Minka: Hallo!
Boby: Hallo!
Minka: Wie heißt du?
Boby: Ich heiße Boby.
Minka: Hallo, Boby! Ich bin Minka.
Boby: Hallo, Minka!
(The scene ends with a warm smile.)`,
            vocabulary: [
              { german: 'Baum', english: 'tree', audio: '/audio/baum.mp3', article: 'der', plural: 'Bäume', wordType: 'noun' },
              { german: 'Tee', english: 'tea', audio: '/audio/tee.mp3', article: 'der', plural: 'Tees', wordType: 'noun' },
              { german: 'unter', english: 'under', audio: '/audio/unter.mp3', wordType: 'other' },
              { german: 'sitzen', english: 'to sit', audio: '/audio/sitzen.mp3', wordType: 'verb' }
            ],
            exercises: [
              {
                type: 'multiple-choice',
                question: 'What is Boby drinking?',
                options: ['Coffee', 'Tea', 'Water'],
                correct: 1
              },
              {
                type: 'multiple-choice',
                question: 'Where is Boby sitting?',
                options: ['Under a tree', 'On a bench', 'In a house'],
                correct: 0
              }
            ]
          },
          {
            id: 'all-together',
            title: 'Chapter 1.5 – All Together',
            content: `🌻 Zusammen
Alle stehen im Dorf.
Sie lächeln.
Die Sonne scheint.
Minka: Hallo, Freunde!
Alle: Hallo!
(Soft music, birds chirping, and a warm closing scene.)`,
            vocabulary: [
              { german: 'Freunde', english: 'friends', audio: '/audio/freunde.mp3', article: 'die', plural: 'Freunde', wordType: 'noun' },
              { german: 'Sonne', english: 'sun', audio: '/audio/sonne.mp3', article: 'die', plural: 'Sonnen', wordType: 'noun' },
              { german: 'Dorf', english: 'village', audio: '/audio/dorf.mp3', article: 'das', plural: 'Dörfer', wordType: 'noun' },
              { german: 'lächeln', english: 'to smile', audio: '/audio/laecheln.mp3', wordType: 'verb' }
            ],
            exercises: [
              {
                type: 'multiple-choice',
                question: 'What does "Freunde" mean?',
                options: ['Family', 'Friends', 'Neighbors'],
                correct: 1
              },
              {
                type: 'fill-blank',
                question: 'Complete: "Hallo, ___!"',
                options: ['Freunde', 'Freund', 'Freundin'],
                correct: 0
              }
            ]
          }
        ],
        progress: {
          completed: false,
          currentChapter: 0,
          vocabularyLearned: 0,
          exercisesCompleted: 0
        }
      },
      {
        id: 'episode-1-willkommen',
        title: 'Chapter 2 – Willkommen in Minka\'s Dorf',
        description: 'Welcome to Minka\'s Village - greetings, "I am...", and "Who are you?"',
        difficulty: 'A1',
        estimatedTime: 8,
        chapters: [
          {
            id: 'morgen-im-dorf',
            title: 'Chapter 2.1 – Der Morgen im Dorf',
            content: `🌅 Teil 1 – Der Morgen
🐾 Dialog
Die Sonne. ☀️
Die Sonne scheint.
Der Himmel ist blau.
Ein Haus.
Ein kleines Haus mit Blumen.
Dort schläft Minka. 🐱
Sie wacht auf.
Sie streckt sich.
Sie lächelt.
Minka: Guten Morgen!
(She waves. The word "Guten Morgen" glows on screen.)
Minka: Hallo! Ich bin Minka.
Ich bin eine Katze.
Ich wohne hier.
Mein Band ist lavendel. 💜
Minka geht langsam durch das Dorf.
Vögel singen.
Häuser. Blumen. Sonne.
Alles ist ruhig.
(Soft sounds: birds, footsteps, bell from the bakery.)`,
            vocabulary: [
              { german: 'Guten Morgen', english: 'Good morning', audio: '/audio/guten-morgen.mp3', wordType: 'phrase' },
              { german: 'Sonne', english: 'sun', audio: '/audio/sonne.mp3', article: 'die', plural: 'Sonnen', wordType: 'noun' },
              { german: 'Himmel', english: 'sky', audio: '/audio/himmel.mp3', article: 'der', plural: 'Himmel', wordType: 'noun' },
              { german: 'Haus', english: 'house', audio: '/audio/haus.mp3', article: 'das', plural: 'Häuser', wordType: 'noun' },
              { german: 'Katze', english: 'cat', audio: '/audio/katze.mp3', article: 'die', plural: 'Katzen', wordType: 'noun' },
              { german: 'wohnen', english: 'to live', audio: '/audio/wohnen.mp3', wordType: 'verb' },
              { german: 'Band', english: 'ribbon', audio: '/audio/band.mp3', article: 'das', plural: 'Bänder', wordType: 'noun' },
              { german: 'ruhig', english: 'calm', audio: '/audio/ruhig.mp3', wordType: 'adjective' },
              { german: 'lächeln', english: 'to smile', audio: '/audio/laecheln.mp3', wordType: 'verb' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "___ Morgen!"',
                options: ['Guten', 'Gute', 'Gut'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "Ich wohne hier" mean?',
                options: ['I live here', 'I work here', 'I sleep here'],
                correct: 0
              },
              {
                type: 'fill-blank',
                question: 'Complete: "Die Sonne ___."',
                options: ['scheint', 'scheinen', 'scheinst'],
                correct: 0
              }
            ]
          },
          {
            id: 'baeckerei',
            title: 'Chapter 2.2 – Die Bäckerei',
            content: `🥐 Teil 2 – Die Bäckerei
🐾 Dialog
Minka riecht Brot.
Warm. Süß. Lecker.
Vor der Bäckerei steht Lisa. 🐰
Sie winkt.
Minka: Guten Morgen, Lisa!
Lisa: Guten Morgen, Minka!
Minka: Wie geht es dir?
Lisa: Gut! Und dir?
Minka: Auch gut!
Lisa: Ich bin Lisa.
Ich bin ein Hase.
Ich arbeite hier.
Ich backe Brot. 🍞
Da! Eine kleine Maus mit einer Tasche. 🐭
Minka: Hallo! Wer bist du?
Maus: Ich heiße Emma. Ich bin neu.
Lisa: Willkommen, Emma!
Emma: Danke!
(They smile. Fresh bread steam rises. The words Guten Morgen / Hallo / Danke stay visible.)`,
            vocabulary: [
              { german: 'Brot', english: 'bread', audio: '/audio/brot.mp3', article: 'das', plural: 'Brote', wordType: 'noun' },
              { german: 'Bäckerei', english: 'bakery', audio: '/audio/baeckerei.mp3', article: 'die', plural: 'Bäckereien', wordType: 'noun' },
              { german: 'Wie geht es dir?', english: 'How are you?', audio: '/audio/wie-geht-es-dir.mp3', wordType: 'phrase' },
              { german: 'gut', english: 'good', audio: '/audio/gut.mp3', wordType: 'adjective' },
              { german: 'Hase', english: 'rabbit', audio: '/audio/hase.mp3', article: 'der', plural: 'Hasen', wordType: 'noun' },
              { german: 'arbeiten', english: 'to work', audio: '/audio/arbeiten.mp3', wordType: 'verb' },
              { german: 'backen', english: 'to bake', audio: '/audio/backen.mp3', wordType: 'verb' },
              { german: 'Maus', english: 'mouse', audio: '/audio/maus.mp3', article: 'die', plural: 'Mäuse', wordType: 'noun' },
              { german: 'Willkommen', english: 'Welcome', audio: '/audio/willkommen.mp3', wordType: 'phrase' },
              { german: 'Danke', english: 'Thank you', audio: '/audio/danke.mp3', wordType: 'phrase' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Wie ___ es dir?"',
                options: ['geht', 'gehen', 'gehst'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "Ich arbeite hier" mean?',
                options: ['I live here', 'I work here', 'I sleep here'],
                correct: 1
              },
              {
                type: 'fill-blank',
                question: 'Complete: "Ich ___ Brot."',
                options: ['backe', 'backen', 'backst'],
                correct: 0
              }
            ]
          },
          {
            id: 'abend',
            title: 'Chapter 2.3 – Der Abend',
            content: `🌙 Teil 3 – Der Abend
🐾 Dialog
Am Abend sitzt Minka am Fenster. 🌙
Der Himmel ist dunkel.
Der Mond scheint.
Im Garten glitzert etwas.
Ein kleines Stück Band.
Minka: Komisch… Ich trage doch mein Band.
Der Wind flüstert leise.
Etwas beginnt.
(Scene fades to moonlight and the sound of wind.)`,
            vocabulary: [
              { german: 'Abend', english: 'evening', audio: '/audio/abend.mp3', article: 'der', plural: 'Abende', wordType: 'noun' },
              { german: 'Mond', english: 'moon', audio: '/audio/mond.mp3', article: 'der', plural: 'Monde', wordType: 'noun' },
              { german: 'dunkel', english: 'dark', audio: '/audio/dunkel.mp3', wordType: 'adjective' },
              { german: 'Garten', english: 'garden', audio: '/audio/garten.mp3', article: 'der', plural: 'Gärten', wordType: 'noun' },
              { german: 'glitzern', english: 'to sparkle', audio: '/audio/glitzern.mp3', wordType: 'verb' },
              { german: 'Wind', english: 'wind', audio: '/audio/wind.mp3', article: 'der', plural: 'Winde', wordType: 'noun' },
              { german: 'leise', english: 'quiet', audio: '/audio/leise.mp3', wordType: 'adjective' },
              { 
                german: 'beginnen', 
                english: 'to begin', 
                audio: '/audio/beginnen.mp3', 
                wordType: 'verb',
                conjugation: {
                  ich: 'beginne',
                  du: 'beginnst',
                  er_sie_es: 'beginnt',
                  wir: 'beginnen',
                  ihr: 'beginnt',
                  sie_Sie: 'beginnen'
                }
              }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Der ___ scheint."',
                options: ['Mond', 'Sonne', 'Stern'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "leise" mean?',
                options: ['loud', 'quiet', 'fast'],
                correct: 1
              }
            ]
          }
        ],
        progress: {
          completed: false,
          currentChapter: 0,
          vocabularyLearned: 0,
          exercisesCompleted: 0
        }
      },
      {
        id: 'episode-2-verlorener-schluessel',
        title: 'Chapter 3 – Der verlorene Schlüssel',
        description: 'The Lost Key - haben (to have), suchen (to search)',
        difficulty: 'A1',
        estimatedTime: 10,
        chapters: [
          {
            id: 'schluessel-weg',
            title: 'Chapter 3.1 – Wo ist der Schlüssel?',
            content: `💜 Teil 1 – Wo ist der Schlüssel?
🐾 Dialog
Szene: Morgenlicht. Minka steht in ihrem kleinen Haus.
Minka: (öffnet ihre Tasche) Oh … die Tasche ist leer.
Mein Schlüssel ist weg!
Sie sucht auf dem Tisch.
Sie sucht unter dem Stuhl.
Kein Schlüssel.
Minka: Ich habe keinen Schlüssel.
Wo ist er?
(Sie schaut aus dem Fenster. Die Sonne scheint.)`,
            vocabulary: [
              { german: 'Schlüssel', english: 'key', audio: '/audio/schluessel.mp3', article: 'der', plural: 'Schlüssel', wordType: 'noun' },
              { german: 'Tasche', english: 'bag', audio: '/audio/tasche.mp3', article: 'die', plural: 'Taschen', wordType: 'noun' },
              { german: 'leer', english: 'empty', audio: '/audio/leer.mp3', wordType: 'adjective' },
              { german: 'suchen', english: 'to search', audio: '/audio/suchen.mp3', wordType: 'verb' },
              { german: 'Tisch', english: 'table', audio: '/audio/tisch.mp3', article: 'der', plural: 'Tische', wordType: 'noun' },
              { german: 'Stuhl', english: 'chair', audio: '/audio/stuhl.mp3', article: 'der', plural: 'Stühle', wordType: 'noun' },
              { german: 'haben', english: 'to have', audio: '/audio/haben.mp3', wordType: 'verb' },
              { german: 'kein', english: 'no / none', audio: '/audio/kein.mp3', wordType: 'other' },
              { german: 'wo', english: 'where', audio: '/audio/wo.mp3', wordType: 'other' },
              { german: 'weg', english: 'gone', audio: '/audio/weg.mp3', wordType: 'other' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Ich ___ keinen Schlüssel."',
                options: ['habe', 'hast', 'hat'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "Die Tasche ist leer" mean?',
                options: ['The bag is full', 'The bag is empty', 'The bag is heavy'],
                correct: 1
              }
            ]
          },
          {
            id: 'pinko-hilft',
            title: 'Chapter 3.2 – Pinko hilft',
            content: `💙 Teil 2 – Pinko hilft
🐾 Dialog
Szene: Draußen im Garten. 🌷
Pinko: Hallo, Minka!
Minka: Hallo, Pinko. Ich habe ein Problem.
Pinko: Was ist los?
Minka: Mein Schlüssel ist weg.
Pinko: Oh nein! Ich helfe dir.
Minka: Danke, Pinko!
Sie suchen im Garten.
Unter den Blumen. Neben dem Baum.
Aber kein Schlüssel.
Minka: Hmm… nicht hier.
Pinko: Vielleicht fragen wir Lisa.`,
            vocabulary: [
              { german: 'helfen', english: 'to help', audio: '/audio/helfen.mp3', wordType: 'verb' },
              { german: 'Garten', english: 'garden', audio: '/audio/garten.mp3', article: 'der', plural: 'Gärten', wordType: 'noun' },
              { german: 'Blume', english: 'flower', audio: '/audio/blume.mp3', article: 'die', plural: 'Blumen', wordType: 'noun' },
              { german: 'Baum', english: 'tree', audio: '/audio/baum.mp3', article: 'der', plural: 'Bäume', wordType: 'noun' },
              { german: 'vielleicht', english: 'maybe', audio: '/audio/vielleicht.mp3', wordType: 'other' },
              { german: 'fragen', english: 'to ask', audio: '/audio/fragen.mp3', wordType: 'verb' },
              { german: 'Problem', english: 'problem', audio: '/audio/problem.mp3', article: 'das', plural: 'Probleme', wordType: 'noun' },
              { german: 'nicht', english: 'not', audio: '/audio/nicht.mp3', wordType: 'other' },
              { german: 'unter', english: 'under', audio: '/audio/unter.mp3', wordType: 'other' },
              { german: 'neben', english: 'next to', audio: '/audio/neben.mp3', wordType: 'other' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Ich ___ dir."',
                options: ['helfe', 'helfen', 'hilfst'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "vielleicht" mean?',
                options: ['always', 'never', 'maybe'],
                correct: 2
              }
            ]
          },
          {
            id: 'lisa-weiss-etwas',
            title: 'Chapter 3.3 – Lisa weiß etwas',
            content: `💫 Teil 3 – Lisa weiß etwas
🐾 Dialog
Szene: In der Bäckerei. 🍞
Minka: Lisa! Siehst du meinen Schlüssel?
Lisa: Hmm … vielleicht. Ich sehe etwas im Park. Etwas glänzend.
Pinko: Vielleicht ist es der Schlüssel!
Minka: Wir gehen in den Park!
Sie gehen in den Park.
Die Sonne scheint. ☀️
Im Gras liegt etwas Kleines.
Minka: Da ist es! … Nein – das ist eine Münze. 💰
Lisa: (lächelt) Kein Problem. Wir suchen morgen.
Minka: Ja. Ich habe Freunde. Das ist gut.`,
            vocabulary: [
              { german: 'sehen', english: 'to see', audio: '/audio/sehen.mp3', wordType: 'verb' },
              { german: 'glänzend', english: 'shiny', audio: '/audio/glaenzend.mp3', wordType: 'adjective' },
              { german: 'Park', english: 'park', audio: '/audio/park.mp3', article: 'der', plural: 'Parks', wordType: 'noun' },
              { german: 'Gras', english: 'grass', audio: '/audio/gras.mp3', article: 'das', plural: 'Gräser', wordType: 'noun' },
              { german: 'Münze', english: 'coin', audio: '/audio/muenze.mp3', article: 'die', plural: 'Münzen', wordType: 'noun' },
              { german: 'gehen', english: 'to go', audio: '/audio/gehen.mp3', wordType: 'verb' },
              { german: 'morgen', english: 'tomorrow', audio: '/audio/morgen.mp3', wordType: 'other' },
              { german: 'Freunde', english: 'friends', audio: '/audio/freunde.mp3', article: 'die', plural: 'Freunde', wordType: 'noun' },
              { german: 'gut', english: 'good', audio: '/audio/gut.mp3', wordType: 'adjective' },
              { german: 'kein Problem', english: 'no problem', audio: '/audio/kein-problem.mp3', wordType: 'phrase' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Ich ___ Freunde."',
                options: ['habe', 'hast', 'hat'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "Kein Problem" mean?',
                options: ['Big problem', 'No problem', 'Small problem'],
                correct: 1
              }
            ]
          }
        ],
        progress: {
          completed: false,
          currentChapter: 0,
          vocabularyLearned: 0,
          exercisesCompleted: 0
        }
      },
      {
        id: 'episode-3-brief',
        title: 'Chapter 4 – Der Brief ohne Absender',
        description: 'The Letter Without a Sender - Modal verb können (can)',
        difficulty: 'A1',
        estimatedTime: 12,
        chapters: [
          {
            id: 'brief-vor-tuer',
            title: 'Chapter 4.1 – Der Brief vor der Tür',
            content: `💜 Teil 1 – Der Brief vor der Tür
🐾 Dialog
Szene: Morgen. Die Sonne scheint. ☀️
Minka öffnet die Tür.
Minka: (überrascht) Oh! Ein Brief!
Sie nimmt den Brief in die Hand.
Er ist klein und weiß.
Kein Name. Keine Adresse. Kein Absender.
Minka: Komisch… wer hat den Brief geschrieben?
Sie öffnet ihn langsam.
Auf dem Papier steht:
"Ich habe etwas, das dir gehört."
Minka: Etwas, das mir gehört? Vielleicht mein Schlüssel!`,
            vocabulary: [
              { german: 'Brief', english: 'letter', audio: '/audio/brief.mp3', article: 'der', plural: 'Briefe', wordType: 'noun' },
              { german: 'Tür', english: 'door', audio: '/audio/tuer.mp3', article: 'die', plural: 'Türen', wordType: 'noun' },
              { german: 'kein', english: 'no / none', audio: '/audio/kein.mp3', wordType: 'other' },
              { german: 'Name', english: 'name', audio: '/audio/name.mp3', article: 'der', plural: 'Namen', wordType: 'noun' },
              { german: 'Adresse', english: 'address', audio: '/audio/adresse.mp3', article: 'die', plural: 'Adressen', wordType: 'noun' },
              { german: 'Absender', english: 'sender', audio: '/audio/absender.mp3', article: 'der', plural: 'Absender', wordType: 'noun' },
              { german: 'öffnen', english: 'to open', audio: '/audio/oeffnen.mp3', wordType: 'verb' },
              { german: 'lesen', english: 'to read', audio: '/audio/lesen.mp3', wordType: 'verb' },
              { german: 'schreiben', english: 'to write', audio: '/audio/schreiben.mp3', wordType: 'verb' },
              { german: 'gehören', english: 'to belong', audio: '/audio/gehoeren.mp3', wordType: 'verb' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Ich ___ den Brief."',
                options: ['öffne', 'öffnen', 'öffnest'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "gehören" mean?',
                options: ['to belong', 'to give', 'to take'],
                correct: 0
              }
            ]
          },
          {
            id: 'freunde-lesen-brief',
            title: 'Chapter 4.2 – Die Freunde lesen den Brief',
            content: `💙 Teil 2 – Die Freunde lesen den Brief
🐾 Dialog
Szene: In der Bäckerei. Alle sitzen am Tisch. 🍞
Lisa: Minka! Was ist das?
Minka: Ein Brief. Kein Name, kein Absender.
Pinko: Oh! Spannend!
Emma: Lies laut, Minka.
Minka: (liest) "Ich habe etwas, das dir gehört."
Boby: Hm… vielleicht der Schlüssel.
Lisa: Wir können zusammen suchen.
Pinko: Ja! Ich kann eine Karte malen.
Emma: Ich kann Notizen machen.
Boby: Ich kann Tee kochen.
Minka: Danke, Freunde! Zusammen können wir es schaffen.`,
            vocabulary: [
              { german: 'zusammen', english: 'together', audio: '/audio/zusammen.mp3', wordType: 'other' },
              { german: 'spannend', english: 'exciting', audio: '/audio/spannend.mp3', wordType: 'adjective' },
              { german: 'laut', english: 'aloud', audio: '/audio/laut.mp3', wordType: 'adjective' },
              { german: 'können', english: 'can', audio: '/audio/koennen.mp3', wordType: 'verb' },
              { german: 'machen', english: 'to make', audio: '/audio/machen.mp3', wordType: 'verb' },
              { german: 'malen', english: 'to paint', audio: '/audio/malen.mp3', wordType: 'verb' },
              { german: 'kochen', english: 'to cook', audio: '/audio/kochen.mp3', wordType: 'verb' },
              { german: 'suchen', english: 'to search', audio: '/audio/suchen.mp3', wordType: 'verb' },
              { german: 'Freund', english: 'friend', audio: '/audio/freund.mp3', article: 'der', plural: 'Freunde', wordType: 'noun' },
              { german: 'schaffen', english: 'to manage/achieve', audio: '/audio/schaffen.mp3', wordType: 'verb' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Ich ___ eine Karte malen."',
                options: ['kann', 'kannst', 'können'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "zusammen" mean?',
                options: ['alone', 'together', 'quickly'],
                correct: 1
              }
            ]
          },
          {
            id: 'der-plan',
            title: 'Chapter 4.3 – Der Plan',
            content: `💫 Teil 3 – Der Plan
🐾 Dialog
Szene: Am Nachmittag. Es regnet leicht. 🌧️
Die Freunde sitzen am Tisch. Der Brief liegt in der Mitte.
Minka: Wir können morgen suchen.
Lisa: Ja! Wenn die Sonne scheint.
Pinko: Ich male eine Karte.
Emma: Ich schreibe eine Liste.
Boby: Ich mache Tee.
Minka: Gut. Zusammen ist alles einfach.
Sie lächeln.
Der Regen wird leise.
Der Brief liegt still.
Etwas wartet.`,
            vocabulary: [
              { german: 'Regen', english: 'rain', audio: '/audio/regen.mp3', article: 'der', plural: '-', wordType: 'noun' },
              { german: 'morgen', english: 'tomorrow', audio: '/audio/morgen.mp3', wordType: 'other' },
              { german: 'wenn', english: 'when', audio: '/audio/wenn.mp3', wordType: 'other' },
              { german: 'Sonne', english: 'sun', audio: '/audio/sonne.mp3', article: 'die', plural: 'Sonnen', wordType: 'noun' },
              { german: 'schreiben', english: 'to write', audio: '/audio/schreiben.mp3', wordType: 'verb' },
              { german: 'Liste', english: 'list', audio: '/audio/liste.mp3', article: 'die', plural: 'Listen', wordType: 'noun' },
              { german: 'machen', english: 'to make', audio: '/audio/machen.mp3', wordType: 'verb' },
              { german: 'einfach', english: 'simple / easy', audio: '/audio/einfach.mp3', wordType: 'adjective' },
              { german: 'warten', english: 'to wait', audio: '/audio/warten.mp3', wordType: 'verb' },
              { german: 'leise', english: 'quiet', audio: '/audio/leise.mp3', wordType: 'adjective' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Wir ___ morgen suchen."',
                options: ['können', 'kann', 'könnt'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "einfach" mean?',
                options: ['difficult', 'simple', 'fast'],
                correct: 1
              }
            ]
          }
        ],
        progress: {
          completed: false,
          currentChapter: 0,
          vocabularyLearned: 0,
          exercisesCompleted: 0
        }
      },
      {
        id: 'episode-4-spuren',
        title: 'Chapter 5 – Spuren im Regen',
        description: 'Traces in the Rain - Perfekt tense (past tense)',
        difficulty: 'A1',
        estimatedTime: 15,
        chapters: [
          {
            id: 'spuren-garten',
            title: 'Chapter 5.1 – Spuren im Garten',
            content: `💜 Teil 1 – Spuren im Garten
🐾 Dialog
Szene: Es ist Morgen. Der Himmel ist grau, die Luft ist frisch.
Minka: (schaut hinaus) Da! Ich sehe Spuren im Regen!
Pinko: Kleine Fußabdrücke im Schlamm!
Lisa: Vielleicht von einem Tier?
Emma: Oder vom Schlüssel?
Boby: Wir haben den Brief gelesen. Jetzt haben wir eine Spur.
Minka: Dann folgen wir ihr!
Die Freunde gehen durch den Garten.
Der Boden ist nass. Alles glitzert. 🌧️`,
            vocabulary: [
              { german: 'Spur', english: 'track, trace', audio: '/audio/spur.mp3', article: 'die', plural: 'Spuren', wordType: 'noun' },
              { german: 'Regen', english: 'rain', audio: '/audio/regen.mp3', article: 'der', plural: '-', wordType: 'noun' },
              { german: 'Fußabdruck', english: 'footprint', audio: '/audio/fussabdruck.mp3', article: 'der', plural: 'Fußabdrücke', wordType: 'noun' },
              { german: 'Schlamm', english: 'mud', audio: '/audio/schlamm.mp3', article: 'der', plural: '-', wordType: 'noun' },
              { german: 'nass', english: 'wet', audio: '/audio/nass.mp3', wordType: 'adjective' },
              { german: 'folgen', english: 'to follow', audio: '/audio/folgen.mp3', wordType: 'verb' },
              { german: 'Boden', english: 'ground', audio: '/audio/boden.mp3', article: 'der', plural: 'Böden', wordType: 'noun' },
              { german: 'sehen', english: 'to see', audio: '/audio/sehen.mp3', wordType: 'verb' },
              { german: 'lesen', english: 'to read', audio: '/audio/lesen.mp3', wordType: 'verb' },
              { german: 'glitzern', english: 'to sparkle', audio: '/audio/glitzern.mp3', wordType: 'verb' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Wir haben den Brief ___."',
                options: ['gelesen', 'lesen', 'liest'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "folgen" mean?',
                options: ['to lead', 'to follow', 'to stop'],
                correct: 1
              }
            ]
          },
          {
            id: 'im-wald',
            title: 'Chapter 5.2 – Im Wald',
            content: `💙 Teil 2 – Im Wald
🐾 Dialog
Szene: Am Waldrand. Der Boden ist feucht. Die Luft riecht nach Regen. 🌲
Minka: Die Spur geht weiter.
Pinko: Ich bin noch nie hier gewesen.
Lisa: Ich habe meine Farben mitgebracht.
Emma: Ich habe Notizen geschrieben.
Boby: Wir gehen langsam. Der Weg ist rutschig.
Sie gehen zwischen den Bäumen.
Blätter fallen leise. Der Wind weht.
Die Spur führt tiefer in den Wald.`,
            vocabulary: [
              { german: 'Wald', english: 'forest', audio: '/audio/wald.mp3', article: 'der', plural: 'Wälder', wordType: 'noun' },
              { german: 'feucht', english: 'damp', audio: '/audio/feucht.mp3', wordType: 'adjective' },
              { german: 'riechen', english: 'to smell', audio: '/audio/riechen.mp3', wordType: 'verb' },
              { german: 'rutschig', english: 'slippery', audio: '/audio/rutschig.mp3', wordType: 'adjective' },
              { german: 'Blatt', english: 'leaf', audio: '/audio/blatt.mp3', article: 'das', plural: 'Blätter', wordType: 'noun' },
              { german: 'Wind', english: 'wind', audio: '/audio/wind.mp3', article: 'der', plural: 'Winde', wordType: 'noun' },
              { german: 'langsam', english: 'slowly', audio: '/audio/langsam.mp3', wordType: 'adjective' },
              { german: 'fallen', english: 'to fall', audio: '/audio/fallen.mp3', wordType: 'verb' },
              { german: 'tiefer', english: 'deeper', audio: '/audio/tiefer.mp3', wordType: 'adjective' },
              { german: 'Weg', english: 'path', audio: '/audio/weg.mp3', article: 'der', plural: 'Wege', wordType: 'noun' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Ich bin noch nie hier ___."',
                options: ['gewesen', 'sein', 'war'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "rutschig" mean?',
                options: ['smooth', 'slippery', 'hard'],
                correct: 1
              }
            ]
          },
          {
            id: 'band-im-baum',
            title: 'Chapter 5.3 – Das Band im Baum',
            content: `💫 Teil 3 – Das Band im Baum
🐾 Dialog
Szene: Im Wald, unter einem großen Baum. 🌳
Die Spur endet dort. Etwas glitzert zwischen den Ästen.
Minka: (zeigt nach oben) Schaut! Mein Lavendelband!
Lisa: Oh! Es ist wirklich deins!
Emma: Aber kein Schlüssel … noch nicht.
Boby: Der Baum hat das Band gehalten.
Pinko: Wir haben das erste Zeichen gefunden!
Minka: (lächelt) Dann suchen wir morgen weiter.
Der Wind weht leise. Das Band tanzt im Licht.`,
            vocabulary: [
              { german: 'Band', english: 'ribbon', audio: '/audio/band.mp3', article: 'das', plural: 'Bänder', wordType: 'noun' },
              { german: 'Ast', english: 'branch', audio: '/audio/ast.mp3', article: 'der', plural: 'Äste', wordType: 'noun' },
              { german: 'halten', english: 'to hold', audio: '/audio/halten.mp3', wordType: 'verb' },
              { german: 'hängen', english: 'to hang', audio: '/audio/haengen.mp3', wordType: 'verb' },
              { german: 'Zeichen', english: 'sign', audio: '/audio/zeichen.mp3', article: 'das', plural: 'Zeichen', wordType: 'noun' },
              { german: 'tanzen', english: 'to dance', audio: '/audio/tanzen.mp3', wordType: 'verb' },
              { german: 'leise', english: 'quiet', audio: '/audio/leise.mp3', wordType: 'adjective' },
              { german: 'Licht', english: 'light', audio: '/audio/licht.mp3', article: 'das', plural: 'Lichter', wordType: 'noun' },
              { german: 'oben', english: 'up / above', audio: '/audio/oben.mp3', wordType: 'other' },
              { german: 'morgen', english: 'tomorrow', audio: '/audio/morgen.mp3', wordType: 'other' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Wir haben das Band ___."',
                options: ['gefunden', 'finden', 'findet'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "Zeichen" mean?',
                options: ['letter', 'sign', 'number'],
                correct: 1
              }
            ]
          }
        ],
        progress: {
          completed: false,
          currentChapter: 0,
          vocabularyLearned: 0,
          exercisesCompleted: 0
        }
      },
      {
        id: 'episode-5-geheimnis',
        title: 'Chapter 6 – Das Geheimnis im Turm',
        description: 'The Secret in the Tower - dass-Sätze (that-clauses)',
        difficulty: 'A1',
        estimatedTime: 18,
        chapters: [
          {
            id: 'weg-zum-turm',
            title: 'Chapter 6.1 – Der Weg zum Turm',
            content: `💜 Teil 1 – Der Weg zum Turm
🐾 Dialog
Szene: Die Sonne steht tief. Die Freunde stehen am Rand des Waldes.
Minka: Die Spur führt weiter. Seht ihr das alte Gebäude dort?
Lisa: Ja, ich sehe einen Turm!
Pinko: Der Turm ist groß – und ein bisschen schief.
Emma: Ich glaube, dass dort jemand gewohnt hat.
Boby: Dann gehen wir hin.
Sie laufen über den kleinen Weg.
Der Wind ist warm. Die Vögel fliegen.
Vor ihnen steht der alte Turm.`,
            vocabulary: [
              { german: 'Turm', english: 'tower', audio: '/audio/turm.mp3', article: 'der', plural: 'Türme', wordType: 'noun' },
              { german: 'Gebäude', english: 'building', audio: '/audio/gebaeude.mp3', article: 'das', plural: 'Gebäude', wordType: 'noun' },
              { german: 'schief', english: 'crooked', audio: '/audio/schief.mp3', wordType: 'adjective' },
              { german: 'glauben', english: 'to believe', audio: '/audio/glauben.mp3', wordType: 'verb' },
              { german: 'wohnen', english: 'to live', audio: '/audio/wohnen.mp3', wordType: 'verb' },
              { german: 'führen', english: 'to lead', audio: '/audio/fuehren.mp3', wordType: 'verb' },
              { german: 'laufen', english: 'to walk', audio: '/audio/laufen.mp3', wordType: 'verb' },
              { german: 'Weg', english: 'path', audio: '/audio/weg.mp3', article: 'der', plural: 'Wege', wordType: 'noun' },
              { german: 'warm', english: 'warm', audio: '/audio/warm.mp3', wordType: 'adjective' },
              { german: 'vor', english: 'in front of', audio: '/audio/vor.mp3', wordType: 'other' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Ich glaube, ___ dort jemand gewohnt hat."',
                options: ['dass', 'das', 'dass'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "schief" mean?',
                options: ['straight', 'crooked', 'tall'],
                correct: 1
              }
            ]
          },
          {
            id: 'im-alten-turm',
            title: 'Chapter 6.2 – Im alten Turm',
            content: `💙 Teil 2 – Im alten Turm (Die Überraschung)
🐾 Dialog
Szene: Die Freunde stehen in der Tür. Der Turm riecht nach Staub und Zeit.
Minka: Es ist dunkel hier.
Lisa: Ich habe eine kleine Lampe.
Pinko: Ich sehe alte Bilder an der Wand!
Emma: Da liegt ein Buch auf dem Tisch.
Boby: Ich glaube, dass dieses Buch wichtig ist.
Minka: Öffne es, Emma.
Emma öffnet das Buch vorsichtig.
Die Seiten sind gelb und weich.
Plötzlich ruft Lisa:
Lisa: Schaut! Daneben liegt etwas Glänzendes!
Pinko: (überrascht) Ist das…?
Boby: Das ist der Schlüssel!
Minka nimmt den Schlüssel langsam in die Hand.
Er glänzt im Licht der Lampe.
Minka: (leise) Ich glaube, dass das unser Schlüssel ist.
Alle Freunde stehen still.
Dann lächeln sie.`,
            vocabulary: [
              { german: 'Staub', english: 'dust', audio: '/audio/staub.mp3', article: 'der', plural: '-', wordType: 'noun' },
              { german: 'dunkel', english: 'dark', audio: '/audio/dunkel.mp3', wordType: 'adjective' },
              { german: 'Lampe', english: 'lamp', audio: '/audio/lampe.mp3', article: 'die', plural: 'Lampen', wordType: 'noun' },
              { german: 'Buch', english: 'book', audio: '/audio/buch.mp3', article: 'das', plural: 'Bücher', wordType: 'noun' },
              { german: 'Seite', english: 'page', audio: '/audio/seite.mp3', article: 'die', plural: 'Seiten', wordType: 'noun' },
              { german: 'vorsichtig', english: 'carefully', audio: '/audio/vorsichtig.mp3', wordType: 'adjective' },
              { german: 'wichtig', english: 'important', audio: '/audio/wichtig.mp3', wordType: 'adjective' },
              { german: 'öffnen', english: 'to open', audio: '/audio/oeffnen.mp3', wordType: 'verb' },
              { german: 'Schlüssel', english: 'key', audio: '/audio/schluessel.mp3', article: 'der', plural: 'Schlüssel', wordType: 'noun' },
              { german: 'glänzen', english: 'to shine', audio: '/audio/glaenzen.mp3', wordType: 'verb' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Ich glaube, ___ das Buch wichtig ist."',
                options: ['dass', 'das', 'dass'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "vorsichtig" mean?',
                options: ['carefully', 'quickly', 'loudly'],
                correct: 0
              }
            ]
          },
          {
            id: 'herz-des-dorfes',
            title: 'Chapter 6.3 – Das Herz des Dorfes',
            content: `💫 Teil 3 – Das Herz des Dorfes
🐾 Dialog
Szene: Vor dem Turm. Die Sonne scheint wieder. Die Freunde atmen frische Luft.
Minka: Ich glaube, dass wir etwas Wichtiges gefunden haben.
Lisa: Ich glaube das auch.
Pinko: Ich habe viele Fotos gemacht.
Emma: Ich habe das Buch mitgenommen.
Boby: Ich bin froh, dass wir zusammen sind.
Minka: (lächelt) Ich weiß, dass wir bald verstehen, warum der Schlüssel wichtig ist.
Der Wind weht über das Feld.
In der Ferne glitzert etwas.`,
            vocabulary: [
              { german: 'froh', english: 'happy', audio: '/audio/froh.mp3', wordType: 'adjective' },
              { german: 'Feld', english: 'field', audio: '/audio/feld.mp3', article: 'das', plural: 'Felder', wordType: 'noun' },
              { german: 'in der Ferne', english: 'in the distance', audio: '/audio/in-der-ferne.mp3', wordType: 'phrase' },
              { german: 'wehen', english: 'to blow', audio: '/audio/wehen.mp3', wordType: 'verb' },
              { german: 'wissen', english: 'to know', audio: '/audio/wissen.mp3', wordType: 'verb' },
              { german: 'finden', english: 'to find', audio: '/audio/finden.mp3', wordType: 'verb' },
              { german: 'mitnehmen', english: 'to take with', audio: '/audio/mitnehmen.mp3', wordType: 'verb' },
              { german: 'zusammen', english: 'together', audio: '/audio/zusammen.mp3', wordType: 'other' },
              { german: 'glauben', english: 'to believe', audio: '/audio/glauben.mp3', wordType: 'verb' },
              { german: 'warum', english: 'why', audio: '/audio/warum.mp3', wordType: 'other' }
            ],
            exercises: [
              {
                type: 'fill-blank',
                question: 'Complete: "Ich weiß, ___ wir zusammen sind."',
                options: ['dass', 'das', 'dass'],
                correct: 0
              },
              {
                type: 'multiple-choice',
                question: 'What does "froh" mean?',
                options: ['sad', 'happy', 'angry'],
                correct: 1
              }
            ]
          }
        ],
        progress: {
          completed: false,
          currentChapter: 0,
          vocabularyLearned: 0,
          exercisesCompleted: 0
        }
      }
    ];
  }

  getStories(): Story[] {
    return this.stories;
  }

  getStory(id: string): Story | undefined {
    return this.stories.find(story => story.id === id);
  }

  getChapter(storyId: string, chapterId: string): StoryChapter | undefined {
    const story = this.getStory(storyId);
    return story?.chapters.find(chapter => chapter.id === chapterId);
  }

  getAllVocabulary(): VocabularyItem[] {
    const allVocabulary: VocabularyItem[] = [];
    this.stories.forEach(story => {
      story.chapters.forEach(chapter => {
        allVocabulary.push(...chapter.vocabulary);
      });
    });
    return allVocabulary;
  }

  getVocabularyForStory(storyId: string): VocabularyItem[] {
    const story = this.getStory(storyId);
    if (!story) return [];
    
    const vocabulary: VocabularyItem[] = [];
    story.chapters.forEach(chapter => {
      vocabulary.push(...chapter.vocabulary);
    });
    return vocabulary;
  }

  markChapterComplete(storyId: string, chapterId: string): void {
    const story = this.getStory(storyId);
    if (!story) return;

    const chapter = story.chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      // Mark chapter as complete
      story.progress.currentChapter = Math.max(story.progress.currentChapter, 
        story.chapters.indexOf(chapter) + 1);
      
      // Update vocabulary learned count
      story.progress.vocabularyLearned += chapter.vocabulary.length;
    }
  }

  markExerciseComplete(storyId: string, chapterId: string, exerciseIndex: number): void {
    const story = this.getStory(storyId);
    if (!story) return;

    const chapter = story.chapters.find(ch => ch.id === chapterId);
    if (chapter && chapter.exercises[exerciseIndex]) {
      story.progress.exercisesCompleted++;
    }
  }

  getProgress(): { totalStories: number; completedStories: number; totalVocabulary: number; learnedVocabulary: number } {
    const totalStories = this.stories.length;
    const completedStories = this.stories.filter(story => story.progress.completed).length;
    const totalVocabulary = this.getAllVocabulary().length;
    const learnedVocabulary = this.stories.reduce((sum, story) => sum + story.progress.vocabularyLearned, 0);

    return {
      totalStories,
      completedStories,
      totalVocabulary,
      learnedVocabulary
    };
  }
}