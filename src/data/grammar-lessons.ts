export interface GrammarLesson {
  id: string;
  episodeId: string;
  title: string;
  rules: {
    title: string;
    explanation: string;
    examples: {
      german: string;
      english: string;
    }[];
    table?: {
      headers: string[];
      rows: string[][];
    };
  }[];
  exercises: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
}

export const grammarLessons: GrammarLesson[] = [
  {
    id: 'grammar-episode-0',
    episodeId: 'episode-0-hallo',
    title: 'Grammar: sein & heißen',
    rules: [
      {
        title: '1. Personal Pronouns',
        explanation: 'In German, personal pronouns are used to refer to people. Here are the basic pronouns you need to know:',
        examples: [
          { german: 'ich', english: 'I' },
          { german: 'du', english: 'you (informal)' },
          { german: 'er', english: 'he' },
          { german: 'sie', english: 'she' },
          { german: 'wir', english: 'we' },
          { german: 'sie', english: 'they' }
        ],
        table: {
          headers: ['Deutsch', 'English', 'Example'],
          rows: [
            ['ich', 'I', 'Ich bin Minka.'],
            ['du', 'you', 'Du bist Lisa.'],
            ['er/sie', 'he/she', 'Sie ist Emma.'],
            ['wir', 'we', 'Wir sind Freunde.'],
            ['sie', 'they', 'Sie sind glücklich.']
          ]
        }
      },
      {
        title: '2. The Verb "sein" (to be)',
        explanation: 'The verb "sein" is one of the most important verbs in German. It means "to be" and is used to describe who or what someone is.\n\n💡 Important: The verb always comes SECOND in German sentences!',
        examples: [
          { german: 'Ich bin Minka.', english: 'I am Minka.' },
          { german: 'Du bist Lisa.', english: 'You are Lisa.' },
          { german: 'Sie ist Emma.', english: 'She is Emma.' },
          { german: 'Wir sind Freunde.', english: 'We are friends.' }
        ],
        table: {
          headers: ['Pronoun', 'Verb Form', 'Example'],
          rows: [
            ['ich', 'bin', 'Ich bin Minka.'],
            ['du', 'bist', 'Du bist Lisa.'],
            ['er/sie/es', 'ist', 'Sie ist Emma.'],
            ['wir', 'sind', 'Wir sind Freunde.'],
            ['ihr', 'seid', 'Ihr seid im Dorf.'],
            ['sie/Sie', 'sind', 'Sie sind glücklich.']
          ]
        }
      },
      {
        title: '3. The Verb "heißen" (to be called)',
        explanation: 'The verb "heißen" is used to tell someone your name. It literally means "to be called".\n\n💡 Tip: "Wie heißt du?" sounds like "vee heist doo?" - gentle and friendly!',
        examples: [
          { german: 'Ich heiße Minka.', english: 'My name is Minka.' },
          { german: 'Wie heißt du?', english: 'What is your name?' },
          { german: 'Er heißt Pinko.', english: 'His name is Pinko.' },
          { german: 'Sie heißt Emma.', english: 'Her name is Emma.' }
        ],
        table: {
          headers: ['Pronoun', 'Verb Form', 'Example'],
          rows: [
            ['ich', 'heiße', 'Ich heiße Minka.'],
            ['du', 'heißt', 'Du heißt Lisa.'],
            ['er/sie/es', 'heißt', 'Sie heißt Emma.'],
            ['wir', 'heißen', 'Wir heißen Freunde.'],
            ['ihr', 'heißt', 'Ihr heißt die Katzen.'],
            ['sie/Sie', 'heißen', 'Sie heißen Pinko und Boby.']
          ]
        }
      },
      {
        title: '4. Difference: sein vs. heißen',
        explanation: 'Both "sein" and "heißen" can be used for introductions, but they have slightly different meanings:\n\n• Use "sein" to say WHO you are\n• Use "heißen" to say what your NAME is\n\n💡 Both are correct in introductions! You can say either:\n"Hallo! Ich bin Minka." OR "Hallo! Ich heiße Minka."',
        examples: [
          { german: 'Ich bin Minka.', english: 'I am Minka. (who I am)' },
          { german: 'Ich heiße Minka.', english: 'My name is Minka. (what I\'m called)' },
          { german: 'Du bist Lisa.', english: 'You are Lisa.' },
          { german: 'Du heißt Lisa.', english: 'Your name is Lisa.' }
        ]
      }
    ],
    exercises: [
      {
        question: 'Complete: Ich ___ Minka.',
        options: ['bin', 'bist', 'ist', 'sind'],
        correct: 0,
        explanation: 'With "ich" (I), we use "bin". So: "Ich bin Minka" = "I am Minka".'
      },
      {
        question: 'Complete: Du ___ Lisa.',
        options: ['bin', 'bist', 'ist', 'sind'],
        correct: 1,
        explanation: 'With "du" (you), we use "bist". So: "Du bist Lisa" = "You are Lisa".'
      },
      {
        question: 'Complete: Ich ___ Emma.',
        options: ['heiße', 'heißt', 'heißen', 'bin'],
        correct: 0,
        explanation: 'With "ich" (I), we use "heiße". So: "Ich heiße Emma" = "My name is Emma".'
      },
      {
        question: 'Complete: Wie ___ du?',
        options: ['bin', 'bist', 'heißt', 'heiße'],
        correct: 2,
        explanation: 'To ask someone\'s name, we say "Wie heißt du?" = "What is your name?"'
      },
      {
        question: 'Which is correct for "We are friends"?',
        options: ['Wir bin Freunde', 'Wir bist Freunde', 'Wir ist Freunde', 'Wir sind Freunde'],
        correct: 3,
        explanation: 'With "wir" (we), we use "sind". So: "Wir sind Freunde" = "We are friends".'
      },
      {
        question: 'Complete: Sie ___ Pinko. (She is called Pinko)',
        options: ['heiße', 'heißt', 'heißen', 'bin'],
        correct: 1,
        explanation: 'With "sie" (she), we use "heißt". So: "Sie heißt Pinko" = "Her name is Pinko".'
      }
    ]
  }
];

export function getGrammarLessonByEpisode(episodeId: string): GrammarLesson | undefined {
  return grammarLessons.find(lesson => lesson.episodeId === episodeId);
}

