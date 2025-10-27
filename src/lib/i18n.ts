/**
 * Internationalization (i18n) system for Minka
 * Supports English and Bulgarian
 */

export type Language = 'en' | 'bg';

export interface Translations {
  // Navigation
  nav: {
    features: string;
    stories: string;
    roadmap: string;
    about: string;
    signIn: string;
    signOut: string;
  };
  
  // Home page
  home: {
    tagline: string;
    subtitle: string;
    continueChapter: string;
    startChapter: string;
    replayChapter: string;
    nextChapter: string;
  };
  
  // Profile menu
  profile: {
    myProgress: string;
    levelQuests: string;
    achievements: string;
    myFlashcards: string;
    settings: string;
  };
  
  // Streak widget
  streak: {
    dayStreak: string;
    days: string;
    day: string;
    keepLearning: string;
    todaysGoals: string;
    dailyQuests: string;
    streakStats: string;
    currentStreak: string;
    bestStreak: string;
    resetsIn: string;
    allGoalsCompleted: string;
    amazingWork: string;
    startStreakToday: string;
    completeQuest: string;
    greatStart: string;
    moreDaysToWeek: string;
    youreOnFire: string;
    daysToMonth: string;
    incredibleDedication: string;
    learningChampion: string;
  };
  
  // Daily quests
  quests: {
    dailyQuests: string;
    completeQuests: string;
    questComplete: string;
    completedToday: string;
    chapterExplorer: string;
    chapterExplorerDesc: string;
    flashcardMaster: string;
    flashcardMasterDesc: string;
    exerciseChampion: string;
    exerciseChampionDesc: string;
    dedicatedStudent: string;
    dedicatedStudentDesc: string;
    vocabularyCollector: string;
    vocabularyCollectorDesc: string;
    perfectPractice: string;
    perfectPracticeDesc: string;
  };
  
  // Level system
  level: {
    level: string;
    totalXP: string;
    levelUp: string;
    xpUntilNext: string;
    beginner: string;
    eagerLearner: string;
    dedicatedStudent: string;
    intermediateSpeaker: string;
    advancedStudent: string;
    fluentLearner: string;
    expertSpeaker: string;
    germanMaster: string;
  };
  
  // Progress page
  progress: {
    myProgress: string;
    trackYourJourney: string;
    overallProgress: string;
    chaptersCompleted: string;
    currentStreak: string;
    totalXP: string;
    wordsLearned: string;
    wordsRead: string;
    episodes: string;
    studyTime: string;
    episodeProgress: string;
    completed: string;
    completedOn: string;
  };
  
  // Flashcards
  flashcards: {
    myFlashcards: string;
    vocabularyCollection: string;
    practiceNow: string;
    totalCards: string;
    reviewed: string;
    newCards: string;
    totalReviews: string;
    libraryView: string;
    gridView: string;
    language: string;
    all: string;
    german: string;
    english: string;
    type: string;
    nouns: string;
    verbs: string;
    adjectives: string;
    phrases: string;
    search: string;
    recent: string;
    new: string;
    sortByDate: string;
    sortAlpha: string;
    sortByReviews: string;
    sortByWordType: string;
    noCardsFound: string;
    noFlashcardsYet: string;
    adjustFilters: string;
    completeLessons: string;
    showing: string;
    of: string;
    cards: string;
    reviews: string;
    added: string;
    plural: string;
    presentTense: string;
    infinitiveForm: string;
  };
  
  // Flashcard study session
  flashcardStudy: {
    studySession: string;
    progress: string;
    card: string;
    of: string;
    due: string;
    new: string;
    learned: string;
    total: string;
    whatsTheMeaning: string;
    translateToGerman: string;
    typeEnglishMeaning: string;
    typeGermanWord: string;
    check: string;
    again: string;
    hard: string;
    good: string;
    easy: string;
    oneHour: string;
    oneDay: string;
    twoToFourDays: string;
    oneWeek: string;
    pressEnterAgain: string;
    perfect: string;
    keepPracticing: string;
    example: string;
    plural: string;
    presentTense: string;
    infinitiveForm: string;
  };
  
  // Story reader
  story: {
    scene: string;
    previous: string;
    next: string;
    continueToGrammar: string;
    completeChapter: string;
    backToHome: string;
    correct: string;
    notQuiteRight: string;
    greatJob: string;
    nextScene: string;
    nextExercise: string;
    exercises: string;
    completeStory: string;
    nextChapter: string;
    wordAddedToFlashcards: string;
    exerciseCorrect: string;
    exerciseAttempt: string;
    failedToSavePosition: string;
    failedToSaveChapterCompletion: string;
    fantasticWork: string;
    youreDoingGreat: string;
    excellentProgress: string;
    keepUpAmazingWork: string;
    youreAStar: string;
    wonderfulJob: string;
  };
  
  // Home page features
  features: {
    storyFirstLessons: string;
    storyFirstLessonsDesc: string;
    smartWordbook: string;
    smartWordbookDesc: string;
    listenSpeak: string;
    listenSpeakDesc: string;
    tinyDailyGoals: string;
    tinyDailyGoalsDesc: string;
  };
  
  // Digital reader
  digitalReader: {
    title: string;
    congratulations: string;
    completedExercise: string;
  };
  
  // Error messages
  errors: {
    episodeLocked: string;
    loadingUserData: string;
    syncingProgress: string;
    syncingVocabulary: string;
  };
  
  // Success messages
  success: {
    chapterCompleted: string;
    flashcardReviewed: string;
    flashcardAttempt: string;
  };
  
  // Error boundaries
  errorBoundary: {
    oopsSomethingWentWrong: string;
    unexpectedError: string;
    progressSaved: string;
    tryAgain: string;
    reloadPage: string;
    errorDetails: string;
    development: string;
    storyLoadingError: string;
    storyLoadingMessage: string;
    flashcardError: string;
    flashcardMessage: string;
    progressError: string;
    progressMessage: string;
    authError: string;
    authMessage: string;
    generalError: string;
    generalMessage: string;
  };
  
  // Common
  common: {
    back: string;
    continue: string;
    start: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    loading: string;
    error: string;
    success: string;
  };
}

const en: Translations = {
  nav: {
    features: 'Features',
    stories: 'Stories',
    roadmap: 'Roadmap',
    about: 'About',
    signIn: 'Sign In',
    signOut: 'Sign Out',
  },
  home: {
    tagline: "Learn German by following Minka's adventures.",
    subtitle: "Step into Minka's cozy world and learn naturally through short, heart‑warming stories and spaced repetition.",
    continueChapter: 'Continue Chapter',
    startChapter: 'Start Chapter',
    replayChapter: 'Replay Chapter',
    nextChapter: 'Next Chapter',
  },
  profile: {
    myProgress: 'My Progress',
    levelQuests: 'Level & Quests',
    achievements: 'Achievements',
    myFlashcards: 'My Flashcards',
    settings: 'Settings',
  },
  streak: {
    dayStreak: '-Day Streak!',
    days: 'days',
    day: 'day',
    keepLearning: 'Keep learning every day',
    todaysGoals: "Today's Goals",
    dailyQuests: 'Daily Quests',
    streakStats: 'Streak Stats',
    currentStreak: 'Current Streak',
    bestStreak: 'Best Streak',
    resetsIn: 'Resets in',
    allGoalsCompleted: 'All goals completed!',
    amazingWork: 'Amazing work today!',
    startStreakToday: 'Start your streak today!',
    completeQuest: 'Complete a quest to begin.',
    greatStart: 'Great start! Keep it up!',
    moreDaysToWeek: 'more days to reach 1 week.',
    youreOnFire: "You're on fire! 🔥",
    daysToMonth: 'days to reach 1 month.',
    incredibleDedication: 'Incredible dedication! 🏆',
    learningChampion: "You're a learning champion!",
  },
  quests: {
    dailyQuests: 'Daily Quests',
    completeQuests: 'Complete quests to earn bonus XP',
    questComplete: 'Quest Complete!',
    completedToday: 'Completed Today',
    chapterExplorer: 'Chapter Explorer',
    chapterExplorerDesc: 'Complete 1 chapter',
    flashcardMaster: 'Flashcard Master',
    flashcardMasterDesc: 'Review 10 flashcards',
    exerciseChampion: 'Exercise Champion',
    exerciseChampionDesc: 'Complete 5 exercises',
    dedicatedStudent: 'Dedicated Student',
    dedicatedStudentDesc: 'Study for 15 minutes',
    vocabularyCollector: 'Vocabulary Collector',
    vocabularyCollectorDesc: 'Add 5 words to flashcards',
    perfectPractice: 'Perfect Practice',
    perfectPracticeDesc: 'Get 3 exercises perfect',
  },
  level: {
    level: 'Level',
    totalXP: 'Total XP',
    levelUp: 'Level Up!',
    xpUntilNext: 'XP until next level',
    beginner: 'Beginner',
    eagerLearner: 'Eager Learner',
    dedicatedStudent: 'Dedicated Student',
    intermediateSpeaker: 'Intermediate Speaker',
    advancedStudent: 'Advanced Student',
    fluentLearner: 'Fluent Learner',
    expertSpeaker: 'Expert Speaker',
    germanMaster: 'German Master',
  },
  progress: {
    myProgress: 'My Progress',
    trackYourJourney: 'Track your German learning journey',
    overallProgress: 'Overall Progress',
    chaptersCompleted: 'chapters completed',
    currentStreak: 'Current Streak',
    totalXP: 'Total XP',
    wordsLearned: 'Words Learned',
    wordsRead: 'Words Read',
    episodes: 'Episodes',
    studyTime: 'Study Time',
    episodeProgress: 'Episode Progress',
    completed: 'Completed',
    completedOn: 'Completed on',
  },
  flashcards: {
    myFlashcards: 'My Flashcards',
    vocabularyCollection: 'Your personal vocabulary collection',
    practiceNow: 'Practice Now',
    totalCards: 'Total Cards',
    reviewed: 'Reviewed',
    newCards: 'New Cards',
    totalReviews: 'Total Reviews',
    libraryView: 'Library View',
    gridView: 'Grid View',
    language: 'Language',
    all: 'All',
    german: 'German',
    english: 'English',
    type: 'Type',
    nouns: 'Nouns',
    verbs: 'Verbs',
    adjectives: 'Adjectives',
    phrases: 'Phrases',
    search: 'Search flashcards...',
    recent: 'Recent',
    new: 'New',
    sortByDate: 'Sort by Date',
    sortAlpha: 'Sort Alphabetically',
    sortByReviews: 'Sort by Reviews',
    sortByWordType: 'Sort by Word Type',
    noCardsFound: 'No cards found',
    noFlashcardsYet: 'No flashcards yet',
    adjustFilters: 'Try adjusting your search or filters',
    completeLessons: 'Complete lessons to add vocabulary to your flashcards',
    showing: 'Showing',
    of: 'of',
    cards: 'cards',
    reviews: 'reviews',
    added: 'Added',
    plural: 'Plural',
    presentTense: 'Present Tense',
    infinitiveForm: 'infinitive form',
  },
  flashcardStudy: {
    studySession: 'Flashcard Study Session',
    progress: 'Progress',
    card: 'Card',
    of: 'of',
    due: 'Due',
    new: 'New',
    learned: 'Learned',
    total: 'Total',
    whatsTheMeaning: "What's the meaning of:",
    translateToGerman: 'Translate to German:',
    typeEnglishMeaning: 'Type the English meaning…',
    typeGermanWord: 'Type the German word…',
    check: 'Check',
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
    oneHour: '1 hour',
    oneDay: '~1 day',
    twoToFourDays: '~2-4 days',
    oneWeek: '~1 week',
    pressEnterAgain: 'Press Enter again for Good',
    perfect: '✨ Perfect! You got it right!',
    keepPracticing: '💪 Keep practicing — you\'re making progress!',
    example: 'Example:',
    plural: 'Plural:',
    presentTense: 'Present Tense:',
    infinitiveForm: 'infinitive form',
  },
  story: {
    scene: 'Scene',
    previous: 'Previous',
    next: 'Next',
    continueToGrammar: 'Continue to Grammar',
    completeChapter: 'Complete Chapter',
    backToHome: 'Back to Home',
    correct: 'Correct!',
    notQuiteRight: 'Not quite right',
    greatJob: 'Great job! You got it right.',
    nextScene: 'Next Scene',
    nextExercise: 'Next Exercise',
    exercises: 'Exercises',
    completeStory: 'Complete Story',
    nextChapter: 'Next Chapter',
    wordAddedToFlashcards: 'Word added to flashcards',
    exerciseCorrect: 'Exercise correct!',
    exerciseAttempt: 'Exercise attempt',
    failedToSavePosition: 'Failed to save position:',
    failedToSaveChapterCompletion: 'Failed to save chapter completion:',
    fantasticWork: 'Fantastic work! 🌟',
    youreDoingGreat: 'You\'re doing great! 💪',
    excellentProgress: 'Excellent progress! ✨',
    keepUpAmazingWork: 'Keep up the amazing work! 🎉',
    youreAStar: 'You\'re a star! ⭐',
    wonderfulJob: 'Wonderful job! 🎊',
  },
  features: {
    storyFirstLessons: 'Story-first lessons',
    storyFirstLessonsDesc: 'Learn in context with cozy episodes that feel like reading a short book.',
    smartWordbook: 'Smart wordbook',
    smartWordbookDesc: 'Spaced repetition flashcards created automatically from each episode.',
    listenSpeak: 'Listen & speak',
    listenSpeakDesc: 'Native audio + gentle speaking prompts, beginner-safe.',
    tinyDailyGoals: 'Tiny daily goals',
    tinyDailyGoalsDesc: '5–10 minute sessions you can actually finish.',
  },
  digitalReader: {
    title: 'Digital Reader',
    congratulations: 'Congratulations!',
    completedExercise: 'You completed the digital reader exercise.',
  },
  errors: {
    episodeLocked: 'This episode is locked. Complete previous episodes to unlock it!',
    loadingUserData: 'Error loading user data:',
    syncingProgress: 'Error syncing progress to Firestore:',
    syncingVocabulary: 'Error syncing vocabulary to Firestore:',
  },
  success: {
    chapterCompleted: 'Chapter completed!',
    flashcardReviewed: 'Flashcard reviewed',
    flashcardAttempt: 'Flashcard attempt',
  },
  errorBoundary: {
    oopsSomethingWentWrong: 'Oops! Something went wrong',
    unexpectedError: 'We encountered an unexpected error. Don\'t worry, your progress is saved.',
    progressSaved: 'Don\'t worry, your progress is saved.',
    tryAgain: 'Try Again',
    reloadPage: 'Reload Page',
    errorDetails: 'Error Details (Development)',
    development: 'Development',
    storyLoadingError: 'Story Loading Error',
    storyLoadingMessage: 'We had trouble loading the story content. Your progress is safe.',
    flashcardError: 'Flashcard Error',
    flashcardMessage: 'There was an issue with the flashcard system. Your cards are saved.',
    progressError: 'Progress Error',
    progressMessage: 'We encountered an issue loading your progress data.',
    authError: 'Authentication Error',
    authMessage: 'There was a problem with the login system. Please try again.',
    generalError: 'Something went wrong',
    generalMessage: 'We encountered an unexpected error.',
  },
  common: {
    back: 'Back',
    continue: 'Continue',
    start: 'Start',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
  },
};

const bg: Translations = {
  nav: {
    features: 'Функции',
    stories: 'Истории',
    roadmap: 'Пътна карта',
    about: 'Относно',
    signIn: 'Вход',
    signOut: 'Изход',
  },
  home: {
    tagline: 'Научете немски, следвайки приключенията на Минка.',
    subtitle: 'Влезте в уютния свят на Минка и се учете естествено чрез кратки, трогателни истории и интервално повторение.',
    continueChapter: 'Продължи глава',
    startChapter: 'Започни глава',
    replayChapter: 'Повтори глава',
    nextChapter: 'Следваща глава',
  },
  profile: {
    myProgress: 'Моят напредък',
    levelQuests: 'Ниво и мисии',
    achievements: 'Постижения',
    myFlashcards: 'Моите флашкарти',
    settings: 'Настройки',
  },
  streak: {
    dayStreak: '-дневна поредица!',
    days: 'дни',
    day: 'ден',
    keepLearning: 'Продължавайте да се учите всеки ден',
    todaysGoals: 'Днешни цели',
    dailyQuests: 'Дневни мисии',
    streakStats: 'Статистика на поредицата',
    currentStreak: 'Текуща поредица',
    bestStreak: 'Най-добра поредица',
    resetsIn: 'Нулира се след',
    allGoalsCompleted: 'Всички цели завършени!',
    amazingWork: 'Страхотна работа днес!',
    startStreakToday: 'Започнете поредицата си днес!',
    completeQuest: 'Завършете мисия, за да започнете.',
    greatStart: 'Страхотно начало! Продължавайте така!',
    moreDaysToWeek: 'още дни до 1 седмица.',
    youreOnFire: 'Вие сте в огън! 🔥',
    daysToMonth: 'дни до 1 месец.',
    incredibleDedication: 'Невероятна отдаденост! 🏆',
    learningChampion: 'Вие сте шампион в ученето!',
  },
  quests: {
    dailyQuests: 'Дневни мисии',
    completeQuests: 'Завършете мисии, за да спечелите бонус опит',
    questComplete: 'Мисия завършена!',
    completedToday: 'Завършени днес',
    chapterExplorer: 'Изследовател на глави',
    chapterExplorerDesc: 'Завършете 1 глава',
    flashcardMaster: 'Майстор на флашкарти',
    flashcardMasterDesc: 'Прегледайте 10 флашкарти',
    exerciseChampion: 'Шампион по упражнения',
    exerciseChampionDesc: 'Завършете 5 упражнения',
    dedicatedStudent: 'Отдаден студент',
    dedicatedStudentDesc: 'Учете 15 минути',
    vocabularyCollector: 'Колекционер на думи',
    vocabularyCollectorDesc: 'Добавете 5 думи към флашкартите',
    perfectPractice: 'Перфектна практика',
    perfectPracticeDesc: 'Направете 3 упражнения перфектно',
  },
  level: {
    level: 'Ниво',
    totalXP: 'Общ опит',
    levelUp: 'Ново ниво!',
    xpUntilNext: 'опит до следващо ниво',
    beginner: 'Начинаещ',
    eagerLearner: 'Желаещ да учи',
    dedicatedStudent: 'Отдаден студент',
    intermediateSpeaker: 'Средно ниво',
    advancedStudent: 'Напреднал студент',
    fluentLearner: 'Свободно говорещ',
    expertSpeaker: 'Експертен говорител',
    germanMaster: 'Майстор на немски',
  },
  progress: {
    myProgress: 'Моят напредък',
    trackYourJourney: 'Проследете пътуването си в изучаването на немски',
    overallProgress: 'Общ напредък',
    chaptersCompleted: 'завършени глави',
    currentStreak: 'Текуща поредица',
    totalXP: 'Общ опит',
    wordsLearned: 'Научени думи',
    wordsRead: 'Прочетени думи',
    episodes: 'Епизоди',
    studyTime: 'Време за учене',
    episodeProgress: 'Напредък по епизоди',
    completed: 'Завършен',
    completedOn: 'Завършен на',
  },
  flashcards: {
    myFlashcards: 'Моите флашкарти',
    vocabularyCollection: 'Вашата лична колекция от думи',
    practiceNow: 'Практикувай сега',
    totalCards: 'Общо карти',
    reviewed: 'Прегледани',
    newCards: 'Нови карти',
    totalReviews: 'Общо прегледи',
    libraryView: 'Изглед библиотека',
    gridView: 'Изглед мрежа',
    language: 'Език',
    all: 'Всички',
    german: 'Немски',
    english: 'Английски',
    type: 'Тип',
    nouns: 'Съществителни',
    verbs: 'Глаголи',
    adjectives: 'Прилагателни',
    phrases: 'Фрази',
    search: 'Търси флашкарти...',
    recent: 'Скорошни',
    new: 'Нови',
    sortByDate: 'Сортирай по дата',
    sortAlpha: 'Сортирай азбучно',
    sortByReviews: 'Сортирай по прегледи',
    sortByWordType: 'Сортирай по тип дума',
    noCardsFound: 'Няма намерени карти',
    noFlashcardsYet: 'Все още няма флашкарти',
    adjustFilters: 'Опитайте да промените търсенето или филтрите',
    completeLessons: 'Завършете уроци, за да добавите думи към флашкартите',
    showing: 'Показване',
    of: 'от',
    cards: 'карти',
    reviews: 'прегледи',
    added: 'Добавено',
    plural: 'Множествено число',
    presentTense: 'Сегашно време',
    infinitiveForm: 'инфинитивна форма',
  },
  flashcardStudy: {
    studySession: 'Сесия за изучаване на флашкарти',
    progress: 'Напредък',
    card: 'Карта',
    of: 'от',
    due: 'За днес',
    new: 'Нови',
    learned: 'Научени',
    total: 'Общо',
    whatsTheMeaning: 'Какво означава:',
    translateToGerman: 'Преведи на немски:',
    typeEnglishMeaning: 'Въведи английското значение…',
    typeGermanWord: 'Въведи немската дума…',
    check: 'Провери',
    again: 'Отново',
    hard: 'Трудно',
    good: 'Добре',
    easy: 'Лесно',
    oneHour: '1 час',
    oneDay: '~1 ден',
    twoToFourDays: '~2-4 дни',
    oneWeek: '~1 седмица',
    pressEnterAgain: 'Натиснете Enter отново за Добре',
    perfect: '✨ Перфектно! Успяхте!',
    keepPracticing: '💪 Продължавайте да практикувате — правите напредък!',
    example: 'Пример:',
    plural: 'Множествено число:',
    presentTense: 'Сегашно време:',
    infinitiveForm: 'инфинитивна форма',
  },
  story: {
    scene: 'Сцена',
    previous: 'Предишна',
    next: 'Следваща',
    continueToGrammar: 'Продължи към граматика',
    completeChapter: 'Завърши глава',
    backToHome: 'Назад към начало',
    correct: 'Правилно!',
    notQuiteRight: 'Не съвсем правилно',
    greatJob: 'Страхотна работа! Успяхте!',
    nextScene: 'Следваща сцена',
    nextExercise: 'Следващо упражнение',
    exercises: 'Упражнения',
    completeStory: 'Завърши историята',
    nextChapter: 'Следваща глава',
    wordAddedToFlashcards: 'Дума добавена към флашкартите',
    exerciseCorrect: 'Упражнението е правилно!',
    exerciseAttempt: 'Опит с упражнение',
    failedToSavePosition: 'Неуспешно запазване на позицията:',
    failedToSaveChapterCompletion: 'Неуспешно запазване на завършването на главата:',
    fantasticWork: 'Фантастична работа! 🌟',
    youreDoingGreat: 'Правите страхотно! 💪',
    excellentProgress: 'Отличен напредък! ✨',
    keepUpAmazingWork: 'Продължавайте страхотната работа! 🎉',
    youreAStar: 'Вие сте звезда! ⭐',
    wonderfulJob: 'Чудесна работа! 🎊',
  },
  features: {
    storyFirstLessons: 'Уроци базирани на истории',
    storyFirstLessonsDesc: 'Учете се в контекст с уютни епизоди, които се чувстват като четене на кратка книга.',
    smartWordbook: 'Умна книга с думи',
    smartWordbookDesc: 'Флашкарти с интервално повторение, създадени автоматично от всеки епизод.',
    listenSpeak: 'Слушай и говори',
    listenSpeakDesc: 'Нативен аудио + нежни подкани за говорене, безопасни за начинаещи.',
    tinyDailyGoals: 'Малки дневни цели',
    tinyDailyGoalsDesc: '5-10 минутни сесии, които наистина можете да завършите.',
  },
  digitalReader: {
    title: 'Цифров четец',
    congratulations: 'Поздравления!',
    completedExercise: 'Завършихте упражнението в цифровия четец.',
  },
  errors: {
    episodeLocked: 'Този епизод е заключен. Завършете предишните епизоди, за да го отключите!',
    loadingUserData: 'Грешка при зареждане на потребителските данни:',
    syncingProgress: 'Грешка при синхронизиране на напредъка с Firestore:',
    syncingVocabulary: 'Грешка при синхронизиране на речника с Firestore:',
  },
  success: {
    chapterCompleted: 'Глава завършена!',
    flashcardReviewed: 'Флашкарта прегледана',
    flashcardAttempt: 'Опит с флашкарта',
  },
  errorBoundary: {
    oopsSomethingWentWrong: 'Опа! Нещо се обърка',
    unexpectedError: 'Срещнахме неочаквана грешка. Не се притеснявайте, напредъкът ви е запазен.',
    progressSaved: 'Не се притеснявайте, напредъкът ви е запазен.',
    tryAgain: 'Опитайте отново',
    reloadPage: 'Презаредете страницата',
    errorDetails: 'Детайли за грешката (Разработка)',
    development: 'Разработка',
    storyLoadingError: 'Грешка при зареждане на историята',
    storyLoadingMessage: 'Имахме проблеми с зареждането на съдържанието на историята. Напредъкът ви е безопасен.',
    flashcardError: 'Грешка с флашкартите',
    flashcardMessage: 'Имаше проблем с системата за флашкарти. Вашите карти са запазени.',
    progressError: 'Грешка с напредъка',
    progressMessage: 'Срещнахме проблем при зареждането на данните за напредъка.',
    authError: 'Грешка с удостоверяването',
    authMessage: 'Имаше проблем с системата за вход. Моля, опитайте отново.',
    generalError: 'Нещо се обърка',
    generalMessage: 'Срещнахме неочаквана грешка.',
  },
  common: {
    back: 'Назад',
    continue: 'Продължи',
    start: 'Започни',
    cancel: 'Отказ',
    save: 'Запази',
    delete: 'Изтрий',
    edit: 'Редактирай',
    close: 'Затвори',
    loading: 'Зареждане',
    error: 'Грешка',
    success: 'Успех',
  },
};

const translations: Record<Language, Translations> = {
  en,
  bg,
};

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}

export function getLanguageName(language: Language): string {
  return language === 'en' ? 'English' : 'Български';
}

export function getLanguageFlag(language: Language): string {
  return language === 'en' ? '🇬🇧' : '🇧🇬';
}

