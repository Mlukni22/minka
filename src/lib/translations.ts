/**
 * Simple German-English translation dictionary
 * This provides basic translations for common German words
 * For production, you might want to use a translation API
 */

const translations: Record<string, string> = {
  // Common words
  'hallo': 'hello',
  'guten': 'good',
  'tag': 'day',
  'morgen': 'morning',
  'abend': 'evening',
  'nacht': 'night',
  'danke': 'thank you',
  'bitte': 'please',
  'ja': 'yes',
  'nein': 'no',
  'gut': 'good',
  'schlecht': 'bad',
  'wie': 'how',
  'was': 'what',
  'wer': 'who',
  'wo': 'where',
  'wann': 'when',
  'warum': 'why',
  'ich': 'i',
  'du': 'you',
  'er': 'he',
  'sie': 'she/they/you (formal)',
  'es': 'it',
  'wir': 'we',
  'ihr': 'you (plural)',
  'sein': 'to be',
  'haben': 'to have',
  'werden': 'to become',
  'können': 'can',
  'müssen': 'must',
  'sollen': 'should',
  'wollen': 'want',
  'mögen': 'like',
  'gehen': 'to go',
  'kommen': 'to come',
  'sehen': 'to see',
  'hören': 'to hear',
  'sagen': 'to say',
  'machen': 'to make/do',
  'geben': 'to give',
  'nehmen': 'to take',
  'wissen': 'to know',
  'denken': 'to think',
  'finden': 'to find',
  'bleiben': 'to stay',
  'liegen': 'to lie',
  'stehen': 'to stand',
  'sitzen': 'to sit',
  'laufen': 'to run/walk',
  'fahren': 'to drive',
  'fliegen': 'to fly',
  'schwimmen': 'to swim',
  'essen': 'to eat',
  'trinken': 'to drink',
  'schlafen': 'to sleep',
  'arbeiten': 'to work',
  'lernen': 'to learn',
  'spielen': 'to play',
  'lesen': 'to read',
  'schreiben': 'to write',
  'sprechen': 'to speak',
  'verstehen': 'to understand',
  'neu': 'new',
  'alt': 'old',
  'groß': 'big/large',
  'klein': 'small',
  'schön': 'beautiful',
  'wichtig': 'important',
  'leicht': 'easy/light',
  'schwer': 'heavy/difficult',
  'schnell': 'fast',
  'langsam': 'slow',
  'heute': 'today',
  'gestern': 'yesterday',
  'morgen_tomorrow': 'tomorrow',
  'jetzt': 'now',
  'hier': 'here',
  'dort': 'there',
  'viel': 'much/many',
  'wenig': 'little/few',
  'mehr': 'more',
  'weniger': 'less',
  'alle': 'all',
  'jeder': 'every',
  'manche': 'some',
  'kein': 'no/none',
  'nicht': 'not',
  'auch': 'also',
  'noch': 'still/yet',
  'schon': 'already',
  'noch nicht': 'not yet',
  'immer': 'always',
  'nie': 'never',
  'oft': 'often',
  'manchmal': 'sometimes',
  'selten': 'rarely',
  'heißt': 'is called',
  'bin': 'am',
  'bist': 'are',
  'ist': 'is',
  'sind': 'are',
  'war': 'was',
  'waren': 'were',
  'wird': 'will/becomes',
  'wird_sein': 'will be',
  'hat': 'has',
  'hatte': 'had',
  'wird_haben': 'will have',
  'kann': 'can',
  'muss': 'must',
  'soll': 'should',
  'will': 'want',
  'mag': 'like',
  'möchte': 'would like',
  'möchten': 'would like',
  'darf': 'may',
  'sollte': 'should',
  'sollten': 'should',
  'könnte': 'could',
  'könnten': 'could',
  'würde': 'would',
  'würden': 'would',
  'hätte': 'would have',
  'hätten': 'would have',
  'wäre': 'would be',
  'wären': 'would be',
  'würde_sein': 'would be',
  'würden_sein': 'would be',
  'wird_werden': 'will become',
  'wird_können': 'will be able to',
  'wird_müssen': 'will have to',
  'wird_sollen': 'will should',
  'wird_wollen': 'will want',
  'wird_mögen': 'will like',
  'wird_dürfen': 'will may',
  // Common story words
  'dorf': 'village',
  'haus': 'house',
  'freund': 'friend',
  'freundin': 'friend (female)',
  'katze': 'cat',
  'hund': 'dog',
  'mädchen': 'girl',
  'junge': 'boy',
  'frau': 'woman',
  'mann': 'man',
  'kind': 'child',
  'familie': 'family',
  'mutter': 'mother',
  'vater': 'father',
  'bruder': 'brother',
  'schwester': 'sister',
  'name': 'name',
  'buch': 'book',
  'stift': 'pen',
  'tisch': 'table',
  'stuhl': 'chair',
  'fenster': 'window',
  'tür': 'door',
  'wasser': 'water',
  'brot': 'bread',
  'milch': 'milk',
  'apfel': 'apple',
  'rot': 'red',
  'blau': 'blue',
  'grün': 'green',
  'gelb': 'yellow',
  'weiß': 'white',
  'schwarz': 'black',
  'eins': 'one',
  'zwei': 'two',
  'drei': 'three',
  'vier': 'four',
  'fünf': 'five',
  'sechs': 'six',
  'sieben': 'seven',
  'acht': 'eight',
  'neun': 'nine',
  'zehn': 'ten',
  'minka': 'minka (name)',
  'lisa': 'lisa (name)',
  'emma': 'emma (name)',
  'pinko': 'pinko (name)',
  'boby': 'boby (name)',
  // Story-specific words
  'im': 'in the',
  'eine': 'a/an (feminine)',
  'ein': 'a/an (masculine/neuter)',
  'der': 'the (masculine)',
  'die': 'the (feminine/plural)',
  'das': 'the (neuter)',
  'maus': 'mouse',
  'park': 'park',
  'malen': 'to paint',
  'baum': 'tree',
  'tee': 'tea',
  'unter': 'under',
  'freunde': 'friends',
  'sonne': 'sun',
  'lächeln': 'to smile',
  'himmel': 'sky',
  'wohnen': 'to live',
  'band': 'ribbon',
  'ruhig': 'calm',
  'kleine': 'small (feminine)',
  'kleiner': 'small (masculine)',
  'kleines': 'small (neuter)',
  'große': 'big (feminine)',
  'großer': 'big (masculine)',
  'großes': 'big (neuter)',
  'habe': 'have (I)',
  'hast': 'have (you)',
  'gehe': 'go (I)',
  'gehst': 'go (you)',
  'geht': 'goes',
  'komme': 'come (I)',
  'kommst': 'come (you)',
  'kommt': 'comes',
  'sehe': 'see (I)',
  'siehst': 'see (you)',
  'sieht': 'sees',
  'sage': 'say (I)',
  'sagst': 'say (you)',
  'sagt': 'says',
  'mache': 'make/do (I)',
  'machst': 'make/do (you)',
  'macht': 'makes/does',
  // More common words
  'und': 'and',
  'oder': 'or',
  'aber': 'but',
  'dann': 'then',
  'später': 'later',
  'früher': 'earlier',
  'woche': 'week',
  'monat': 'month',
  'jahr': 'year',
  'stunde': 'hour',
  'minute': 'minute',
  'sekunde': 'second',
  'mittag': 'noon',
  'montag': 'monday',
  'dienstag': 'tuesday',
  'mittwoch': 'wednesday',
  'donnerstag': 'thursday',
  'freitag': 'friday',
  'samstag': 'saturday',
  'sonntag': 'sunday',
  'januar': 'january',
  'februar': 'february',
  'märz': 'march',
  'april': 'april',
  'mai': 'may',
  'juni': 'june',
  'juli': 'july',
  'august': 'august',
  'september': 'september',
  'oktober': 'october',
  'november': 'november',
  'dezember': 'december',
  // Body parts
  'kopf': 'head',
  'auge': 'eye',
  'augen': 'eyes',
  'nase': 'nose',
  'mund': 'mouth',
  'ohr': 'ear',
  'ohren': 'ears',
  'hand': 'hand',
  'hände': 'hands',
  'fuß': 'foot',
  'füße': 'feet',
  'bein': 'leg',
  'beine': 'legs',
  'arm': 'arm',
  'arme': 'arms',
  // Food
  'kuchen': 'cake',
  'kekse': 'cookies',
  'schokolade': 'chocolate',
  'kaffee': 'coffee',
  'saft': 'juice',
  'obst': 'fruit',
  'gemüse': 'vegetables',
  'fleisch': 'meat',
  'fisch': 'fish',
  'ei': 'egg',
  'eier': 'eggs',
  'käse': 'cheese',
  'butter': 'butter',
  // Animals
  'tier': 'animal',
  'tiere': 'animals',
  'vogel': 'bird',
  'vögel': 'birds',
  'pferd': 'horse',
  'pferde': 'horses',
  'kuh': 'cow',
  'kühe': 'cows',
  'schwein': 'pig',
  'schweine': 'pigs',
  'hase': 'rabbit',
  'hasen': 'rabbits',
  // Nature
  'blume': 'flower',
  'blumen': 'flowers',
  'gras': 'grass',
  'stein': 'stone',
  'steine': 'stones',
  'feuer': 'fire',
  'luft': 'air',
  'erde': 'earth',
  'wolke': 'cloud',
  'wolken': 'clouds',
  'regen': 'rain',
  'schnee': 'snow',
  'wind': 'wind',
  'mond': 'moon',
  'stern': 'star',
  'sterne': 'stars',
  // Actions
  'springen': 'to jump',
  'tanzen': 'to dance',
  'singen': 'to sing',
  'schauen': 'to look/watch',
  'gucken': 'to look/watch',
  'suchen': 'to search',
  'bekommen': 'to get/receive',
  'öffnen': 'to open',
  'schließen': 'to close',
  'helfen': 'to help',
  'brauchen': 'to need',
  'lieben': 'to love',
  'hassen': 'to hate',
  'dürfen': 'to may',
  // Adjectives
  'lang': 'long',
  'kurz': 'short',
  'hoch': 'high',
  'niedrig': 'low',
  'breit': 'wide',
  'schmal': 'narrow',
  'dick': 'thick',
  'dünn': 'thin',
  'warm': 'warm',
  'kalt': 'cold',
  'heiß': 'hot',
  'kühl': 'cool',
  'hell': 'bright',
  'dunkel': 'dark',
  'laut': 'loud',
  'leise': 'quiet',
  'sauber': 'clean',
  'schmutzig': 'dirty',
  'voll': 'full',
  'leer': 'empty',
  'richtig': 'correct',
  'falsch': 'wrong/false',
  'wahr': 'true',
  'froh': 'happy',
  'traurig': 'sad',
  'müde': 'tired',
  'wach': 'awake',
  'krank': 'sick',
  'gesund': 'healthy',
  'hungrig': 'hungry',
  'durstig': 'thirsty',
  // Places
  'platz': 'square',
  'straße': 'street',
  'weg': 'path',
  'garten': 'garden',
  'schule': 'school',
  'kirche': 'church',
  'geschäft': 'shop',
  'restaurant': 'restaurant',
  'kino': 'cinema',
  'theater': 'theater',
  'museum': 'museum',
  'bibliothek': 'library',
  'krankenhaus': 'hospital',
  'apotheke': 'pharmacy',
  'bank': 'bank',
  'post': 'post office',
  'bahnhof': 'train station',
  'flughafen': 'airport',
  'hotel': 'hotel',
  // Objects
  'auto': 'car',
  'fahrrad': 'bicycle',
  'zug': 'train',
  'bus': 'bus',
  'flugzeug': 'airplane',
  'schiff': 'ship',
  'uhr': 'clock/watch',
  'telefon': 'phone',
  'computer': 'computer',
  'fernseher': 'television',
  'radio': 'radio',
  'kamera': 'camera',
  'tasche': 'bag',
  'koffer': 'suitcase',
  'geld': 'money',
  'schlüssel': 'key',
  'brille': 'glasses',
  'ring': 'ring',
  'kette': 'necklace',
  // Clothing
  'kleidung': 'clothing',
  'hemd': 'shirt',
  'hose': 'pants',
  'rock': 'skirt',
  'kleid': 'dress',
  'jacke': 'jacket',
  'mantel': 'coat',
  'schuhe': 'shoes',
  'stiefel': 'boots',
  'hut': 'hat',
  'mütze': 'cap',
  'handschuhe': 'gloves',
  'schal': 'scarf',
};

/**
 * Get translation for a German word
 * @param word - German word or phrase
 * @returns English translation or null if not found
 */
export function getTranslation(word: string): string | null {
  const normalized = word.toLowerCase().trim();
  
  // Check exact match
  if (translations[normalized]) {
    return translations[normalized];
  }
  
  // Check without punctuation
  const withoutPunctuation = normalized.replace(/[.,!?;:]/g, '');
  if (translations[withoutPunctuation]) {
    return translations[withoutPunctuation];
  }
  
  // Check with spaces replaced by underscores
  const withUnderscores = normalized.replace(/\s+/g, '_');
  if (translations[withUnderscores]) {
    return translations[withUnderscores];
  }
  
  // Try removing common German endings to find base form
  const endings = ['en', 'er', 'es', 'e', 'n', 's', 't', 'st', 'te', 'ten', 'test', 'tet'];
  for (const ending of endings) {
    if (normalized.endsWith(ending) && normalized.length > ending.length) {
      const baseForm = normalized.slice(0, -ending.length);
      if (translations[baseForm]) {
        return translations[baseForm];
      }
    }
  }
  
  // Check common phrases (partial match)
  const phrasePatterns: Array<[RegExp, string]> = [
    [/wie\s+hei[ßs]t\s+du/i, 'what is your name'],
    [/ich\s+hei[ßs]e/i, 'my name is'],
    [/ich\s+bin/i, 'i am'],
    [/guten\s+tag/i, 'good day'],
    [/guten\s+morgen/i, 'good morning'],
    [/guten\s+abend/i, 'good evening'],
    [/gute\s+nacht/i, 'good night'],
    [/wie\s+geht\s+es\s+dir/i, 'how are you'],
    [/wie\s+geht\s+es\s+ihnen/i, 'how are you (formal)'],
    [/es\s+geht\s+mir\s+gut/i, 'i am fine'],
    [/auf\s+wiedersehen/i, 'goodbye'],
    [/bis\s+später/i, 'see you later'],
    [/bis\s+gleich/i, 'see you soon'],
    [/bis\s+morgen/i, 'see you tomorrow'],
    [/bitte\s+schön/i, 'you are welcome'],
    [/guten\s+appetit/i, 'enjoy your meal'],
    [/viel\s+glück/i, 'good luck'],
    [/alles\s+gute/i, 'all the best'],
  ];
  
  for (const [pattern, translation] of phrasePatterns) {
    if (pattern.test(normalized)) {
      return translation;
    }
  }
  
  return null;
}

/**
 * Get translation with fallback
 * @param word - German word or phrase
 * @param fallback - Fallback translation if not found
 * @returns English translation
 */
export function getTranslationWithFallback(word: string, fallback?: string): string {
  const translation = getTranslation(word);
  if (translation) {
    return translation;
  }
  
  // If no translation found and no fallback, return a generic message
  return fallback || `Translation for "${word}" not available`;
}

/**
 * Get translation with Dictionary API fallback (async)
 * First tries local dictionary, then falls back to Dictionary API
 * @param word - Word to translate
 * @param fallback - Fallback translation if not found
 * @returns English translation
 */
export async function getTranslationWithAPIFallback(
  word: string,
  fallback?: string
): Promise<string> {
  // First try local dictionary (fast, offline)
  const localTranslation = getTranslation(word);
  if (localTranslation) {
    return localTranslation;
  }

  // If word looks like English (starts with English letter pattern), try Dictionary API
  // This is useful for English words that might appear in German text
  const isLikelyEnglish = /^[a-zA-Z]+$/.test(word.trim());
  if (isLikelyEnglish) {
    try {
      const { getDictionaryTranslation } = await import('./dictionary-api');
      const apiTranslation = await getDictionaryTranslation(word);
      if (apiTranslation) {
        // Extract a short definition (first sentence or first 100 chars)
        const shortDef = apiTranslation.split('.')[0].trim();
        return shortDef.length > 100 ? shortDef.substring(0, 100) + '...' : shortDef;
      }
    } catch (error) {
      console.error('Error fetching from Dictionary API:', error);
      // Fall through to fallback
    }
  }

  // Return fallback if nothing found
  return fallback || `Translation for "${word}" not available`;
}
