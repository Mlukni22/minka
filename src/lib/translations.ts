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
  'kommt': 'comes',
  'komme': 'come',
  'kommst': 'come',
  'kommen': 'to come',
  'sehen': 'to see',
  'sieht': 'sees',
  'siehst': 'see',
  'hören': 'to hear',
  'hört': 'hears',
  'hörst': 'hear',
  'sagen': 'to say',
  'sagt': 'says',
  'sagst': 'say',
  'machen': 'to make/do',
  'macht': 'makes/does',
  'machst': 'make/do',
  'geben': 'to give',
  'gibt': 'gives',
  'gibst': 'give',
  'nehmen': 'to take',
  'nimmt': 'takes',
  'nimmst': 'take',
  'wissen': 'to know',
  'weiß': 'knows',
  'weißt': 'know',
  'kratzen': 'to scratch',
  'kratzt': 'scratches',
  'kratzst': 'scratch',
  'kratze': 'scratch',
  // Separable verbs
  'aussehen': 'to look/appear',
  'sieht aus': 'looks/appears',
  'siehst aus': 'look/appear',
  'siehe aus': 'look/appear',
  'ausmachen': 'to turn off/switch off',
  'macht aus': 'turns off',
  'machst aus': 'turn off',
  'mache aus': 'turn off',
  'ausgemacht': 'turned off',
  'anrufen': 'to call',
  'ruft an': 'calls',
  'rufst an': 'call',
  'rufe an': 'call',
  'angerufen': 'called',
  'aufmachen': 'to open',
  'macht auf': 'opens',
  'machst auf': 'open',
  'mache auf': 'open',
  'aufgemacht': 'opened',
  'zumachen': 'to close',
  'macht zu': 'closes',
  'machst zu': 'close',
  'mache zu': 'close',
  'zugemacht': 'closed',
  'ankommen': 'to arrive',
  'kommt an': 'arrives',
  'kommst an': 'arrive',
  'komme an': 'arrive',
  'angekommen': 'arrived',
  'abfahren': 'to depart',
  'fährt ab': 'departs',
  'fährst ab': 'depart',
  'fahre ab': 'depart',
  'abgefahren': 'departed',
  'aufstehen': 'to stand up/get up',
  'steht auf': 'stands up',
  'stehst auf': 'stand up',
  'stehe auf': 'stand up',
  'aufgestanden': 'stood up',
  'einschlafen': 'to fall asleep',
  'schläft ein': 'falls asleep',
  'schläfst ein': 'fall asleep',
  'schlafe ein': 'fall asleep',
  'eingeschlafen': 'fallen asleep',
  'aufwachen': 'to wake up',
  'wacht auf': 'wakes up',
  'wachst auf': 'wake up',
  'wache auf': 'wake up',
  'aufgewacht': 'woken up',
  'denken': 'to think',
  'finden': 'to find',
  'bleiben': 'to stay',
  'liegen': 'to lie',
  'stehen': 'to stand',
  'sitzen': 'to sit',
  'laufen': 'to run/walk',
  'fahren': 'to drive',
  'fliegen': 'to fly',
  'zeigen':'to show',
  'scheinen':'to shine',
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
  'barfuß': 'barefoot',
  'barfus': 'barefoot',
  'schnell': 'fast',
  'langsam': 'slow',
  'heute': 'today',
  'gestern': 'yesterday',
  'morgen_tomorrow': 'tomorrow',
  'jetzt': 'now',
  'hier': 'here',
  'da':'then',
  'dort': 'there',
  'draußen': 'outside',
  'drinnen': 'inside',
  'oben': 'up/above',
  'unten': 'down/below',
  'links': 'left',
  'rechts': 'right',
  'vorne': 'in front',
  'hinten': 'behind/back',
  'mitten': 'middle',
  'irgendwo': 'somewhere',
  'nirgendwo': 'nowhere',
  'überall': 'everywhere',
  'viel': 'much/many',
  'wenig': 'little/few',
  'mehr': 'more',
  'weniger': 'less',
  'alle': 'all',
  'jeder': 'every',
  'manche': 'some',
  'kein': 'no/none',
  'niemand': 'nobody/no one',
  'jemand': 'someone/somebody',
  'etwas': 'something',
  'nichts': 'nothing',
  'irgendjemand': 'anyone/anybody',
  'irgendetwas': 'anything',
  // Possessive pronouns (ihr already defined above as 'you (plural)')
  'ihre': 'her/their/your (formal)',
  'ihrem': 'her/their/your (formal)',
  'ihren': 'her/their/your (formal)',
  'ihrer': 'her/their/your (formal)',
  'ihres': 'her/their/your (formal)',
  'mein': 'my',
  'meine': 'my',
  'meinem': 'my',
  'meinen': 'my',
  'meiner': 'my',
  'meines': 'my',
  'dein': 'your',
  'deine': 'your',
  'deinem': 'your',
  'deinen': 'your',
  'deiner': 'your',
  'deines': 'your',
  // sein already defined above as 'to be'
  'seine': 'his/its',
  'seinem': 'his/its',
  'seinen': 'his/its',
  'seiner': 'his/its',
  'seines': 'his/its',
  'unser': 'our',
  'unsere': 'our',
  'unserem': 'our',
  'unseren': 'our',
  'unserer': 'our',
  'unseres': 'our',
  'euer': 'your (plural)',
  'eure': 'your (plural)',
  'eurem': 'your (plural)',
  'euren': 'your (plural)',
  'eurer': 'your (plural)',
  'eures': 'your (plural)',
  // Body parts and anatomy
  'schwanz': 'tail',
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
  'finger': 'finger/fingers',
  'zehe': 'toe',
  'zehen': 'toes',
  'rücken': 'back',
  'bauch': 'belly/stomach',
  'brust': 'chest/breast',
  'herz': 'heart',
  'herzen': 'hearts',
  'bett': 'bed',
  'betten': 'beds',
  // Adverbs and prepositions
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
  'wieder': 'again',
  'nochmal': 'again/once more',
  'noch einmal': 'once more',
  'gerade': 'just/right now',
  'sofort': 'immediately',
  'bald': 'soon',
  'später': 'later',
  'früher': 'earlier',
  'dann': 'then',
  'danach': 'afterwards',
  'vorher': 'before',
  'zuerst': 'first',
  'zuletzt': 'last',
  'endlich': 'finally',
  'schließlich': 'finally',
  'plötzlich': 'suddenly',
  'vielleicht': 'maybe/perhaps',
  'wahrscheinlich': 'probably',
  'sicher': 'certainly/sure',
  'natürlich': 'naturally/of course',
  'leider': 'unfortunately',
  'glücklicherweise': 'fortunately',
  'hoffentlich': 'hopefully',
  'besonders': 'especially/particularly',
  'spezial': 'special',
  'anf': 'at the beginning/at first',
  'an': 'at/on/to',
  'auf': 'on/at/up',
  'aus': 'out/from',
  'bei': 'at/near/with',
  'durch': 'through',
  'für': 'for',
  'gegen': 'against',
  'in': 'in',
  'mit': 'with',
  'nach': 'after/to',
  'ohne': 'without',
  'über': 'over/above/about',
  'um': 'around/at',
  'unter': 'under/below',
  'von': 'from/of',
  'vor': 'before/in front of',
  'zu': 'to/at',
  'zwischen': 'between',
  'normal': 'normal',
  'normalerweise': 'normally/usually',
  'gewöhnlich': 'usually',
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
  // 'weiß': 'white', // Removed - conflicts with "weiß" = knows (verb form)
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
  'habe': 'have',
  'hast': 'have',
  'gehe': 'go',
  'gehst': 'go',
  'geht': 'goes',
  'sehe': 'see',
  'sage': 'say',
  'mache': 'make/do',
  // More verb conjugations
  'scheint':'shines',
  'findet': 'finds',
  'findest': 'find',
  'finde': 'find',
  'steht': 'stands',
  'stehst': 'stand',
  'stehe': 'stand',
  'sitzt': 'sits',
  'sitze': 'sit',
  'läuft': 'runs/walks',
  'läufst': 'run/walk',
  'laufe': 'run/walk',
  'fährt': 'drives',
  'fährst': 'drive',
  'fahre': 'drive',
  'fliegt': 'flies',
  'fliegst': 'fly',
  'fliege': 'fly',
  'isst': 'eats',
  'esse': 'eat',
  'trinkt': 'drinks',
  'trinkst': 'drink',
  'trinke': 'drink',
  'schläft': 'sleeps',
  'schläfst': 'sleep',
  'schlafe': 'sleep',
  'arbeitet': 'works',
  'arbeitest': 'work',
  'arbeite': 'work',
  'zeigt':'shows',
  'lernt': 'learns',
  'lernst': 'learn',
  'lerne': 'learn',
  'spielt': 'plays',
  'spielst': 'play',
  'spiele': 'play',
  'liest': 'reads',
  'lese': 'read',
  'schreibt': 'writes',
  'schreibst': 'write',
  'schreibe': 'write',
  'spricht': 'speaks',
  'sprichst': 'speak',
  'spreche': 'speak',
  'versteht': 'understands',
  'verstehst': 'understand',
  'verstehe': 'understand',
  // More common words
  'und': 'and',
  'oder': 'or',
  'aber': 'but',
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
  'öffnet': 'opens',
  'öffne': 'open',
  'öffnest': 'open',
  'schließen': 'to close',
  'schließt': 'closes',
  'schließe': 'close',
  'schließest': 'close',
  'bleibt': 'stays',
  'bleibe': 'stay',
  'bleibst': 'stay',
  'schnuppern': 'to sniff',
  'schnuppert': 'sniffs',
  'schnuppere': 'sniff',
  'schnupperst': 'sniff',
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
  'küche':'kitchen',
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
  'napf':'bowl (for animals)',
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
  
  // Try removing common German verb endings to find infinitive form
  // Handle verb conjugations more intelligently
  const verbEndings = [
    // Present tense endings (try these first as they're most common)
    't',      // 3rd person singular: bleibt -> bleiben, schließt -> schließen
    'st',     // 2nd person singular: bleibst -> bleiben, schließt -> schließen
    'e',      // 1st person singular: bleibe -> bleiben, schließe -> schließen
    'en',     // infinitive/plural: bleiben, schließen
    'n',      // sometimes used: bleibn -> bleiben
    // Past tense endings
    'te',     // past tense: bliebte -> bleiben
    'ten',    // past tense plural: bliebten -> bleiben
    'test',   // past tense 2nd person: bliebtest -> bleiben
    'tet',    // past tense 2nd person plural: bliebtet -> bleiben
    // Other endings
    'er',     // comparative: größer -> groß
    'es',     // genitive: großes -> groß
    's',      // genitive/possessive: großs -> groß
  ];
  
  for (const ending of verbEndings) {
    if (normalized.endsWith(ending) && normalized.length > ending.length) {
      let baseForm = normalized.slice(0, -ending.length);
      
      // Special handling for verbs ending in 't' or 'st' - try adding 'en' to get infinitive
      if (ending === 't' || ending === 'st') {
        // Try adding 'en' to get infinitive form (e.g., bleibt -> bleiben, schließt -> schließen)
        const infinitiveForm = baseForm + 'en';
        if (translations[infinitiveForm]) {
          return translations[infinitiveForm];
        }
      }
      
      // Try the base form directly
      if (translations[baseForm]) {
        return translations[baseForm];
      }
      
      // For verbs ending in 't', also try adding 'en' to base form (fallback)
      if (ending === 't' && baseForm.length > 2) {
        const withEn = baseForm + 'en';
        if (translations[withEn]) {
          return translations[withEn];
        }
      }
    }
  }
  
  // Special handling for common verb patterns
  // If word ends with 't' and removing it gives a valid stem, try adding 'en'
  if (normalized.endsWith('t') && normalized.length > 3) {
    const stem = normalized.slice(0, -1);
    const infinitive = stem + 'en';
    if (translations[infinitive]) {
      return translations[infinitive];
    }
  }
  
  // Handle verbs with umlaut changes: bleibt -> bleiben (no change), but some verbs change
  // Try common verb stem patterns
  const commonVerbStems = [
    { pattern: /^(.+)t$/, add: 'en' },      // bleibt -> bleiben
    { pattern: /^(.+)st$/, add: 'en' },    // bleibst -> bleiben
    { pattern: /^(.+)e$/, add: 'en' },     // bleibe -> bleiben
  ];
  
  for (const { pattern, add } of commonVerbStems) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const stem = match[1];
      const infinitive = stem + add;
      if (translations[infinitive]) {
        return translations[infinitive];
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

// Ensure this file is treated as a module
export {};
