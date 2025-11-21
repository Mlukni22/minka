export const homeContent = {
  brand: 'Minka',
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#fun-showcase' },
  ],
  headerCta: {
    label: 'Join Waitlist',
    href: '/waitlist',
  },
  hero: {
    title: 'Learning that feels alive.',
    description:
      'With Minka, every word is part of a bigger tale — one that connects language to feeling, culture, and curiosity.',
    secondary: "You don't just study, you live inside the story.",
    primaryCta: { label: 'Join the Waitlist', href: '/waitlist' },
    secondaryCta: { label: 'How it works', href: '#system' },
    banner: {
      title: 'Win 1 Year Pro Access Free',
      detail: 'Join the waitlist for a chance to unlock founding rewards.',
    },
  },
  funShowcase: {
    title: 'It has never been this fun.',
    description:
      'Stories, culture, and community collide so every session feels like time with friends — and every moment counts toward real fluency.',
    items: [
      {
        image: '/images/feature-story-circle.png',
        title: 'Story Circles — A Mystery',
        description:
          'Follow Minka and friends through animated adventures that unlock new vocabulary and expressions without drills.',
      },
      {
        image: '/images/feature-culture-lens.png',
        title: 'Culture Lenses',
        description:
          'Zoom into traditions, art, and daily rituals so you understand not just words, but the world they live in.',
      },
      {
        image: '/images/feature-dialogue-cafe.png',
        title: 'Exercises',
        description:
          'Practice speaking with responsive characters who remember your style and nudge you toward natural phrasing.',
      },
    ],
    cta: {
      label: 'Join Waitlist',
      href: '/waitlist',
    },
  },
  system: {
    title: 'The system behind your progress',
    intro: 'Each layer is designed to move you from recognition to recall, and from memorising words to thinking in stories.',
    description: 'We combine narrative immersion with spaced repetition, active recall, and compassionate feedback.',
    steps: [
      { number: 1, title: 'Vocabulary depth', description: '14,250 daily terms plus specialised topics, all grouped by frequency and story context.' },
      { number: 2, title: 'Spaced repetition scheduler', description: 'Cards return just before you forget them. You focus on practice, we handle timing.' },
      { number: 3, title: 'Interleaved practice modes', description: 'Multiple choice for quick wins, cloze and free recall for mastery, dialogue drills for fluency.' },
      { number: 4, title: 'Instant mistake feedback', description: 'Every error becomes a mini lesson, reinforced until it is automatic.' },
      { number: 5, title: 'AI dialogue companions', description: 'Nine personalities from different regions keep conversations flowing and dissect every line you send.' },
      { number: 6, title: 'Progress tracking & analytics', description: 'Heat maps and timelines show consistency so you can course-correct fast.' },
      { number: 7, title: 'Curiosity Points', description: 'Unlock culture, science, emotions, and history inside each story. Grow your Knowledge Tree.' },
      { number: 8, title: 'Always in sync', description: 'Desktop, tablet, or phone — your journey stays perfectly aligned everywhere.' },
    ],
  },
  knowledge: {
    title: 'Stories that teach more than words',
    description:
      'Each chapter layers in real-world curiosity. You collect Curiosity Points, grow a Knowledge Tree, and remember because meaning sticks.',
    chips: ['Culture', 'Science', 'Emotions', 'History'],
    bullets: [
      'Curiosity Points unlock deeper explainers and context.',
      'The Knowledge Tree visualises what you now understand beyond vocabulary.',
      'Reflection prompts connect language to real life moments.',
    ],
  },
  faq: {
    title: 'Smart questions from curious learners',
    items: [
      {
        question: 'How is Minka different from drill-based apps?',
        answer:
          'We teach through narrative immersion. Every review is anchored in story scenes, cultural notes, and reflections so you remember ideas, not just isolated phrases.',
      },
      {
        question: 'Do I have to be at an advanced level to start?',
        answer:
          'No. We map every chapter to CEFR levels, offer guided audio, and adapt practice modes so complete beginners and advanced speakers both get the right challenge.',
      },
      {
        question: 'What happens on the waitlist?',
        answer:
          "You'll receive behind-the-scenes chapters, early invites to live sessions, and first access to betas. We send one thoughtful update each week.",
      },
    ],
  },
  cta: {
    title: 'Ready to explore Minka for real?',
    description: 'Step into the village, meet the characters, and follow the stories that make language unforgettable.',
    buttonLabel: 'Join the Waitlist',
    buttonHref: '/waitlist',
  },
  footer: {
    tagline: 'Serious language learning for curious minds.',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'How it works', href: '#system' },
          { label: 'Knowledge layer', href: '#knowledge' },
          { label: 'Waitlist', href: '/waitlist' },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'Help Center', href: '#' },
          { label: 'Contact', href: 'mailto:hello@minka.app' },
          { label: 'Community', href: '#' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Terms', href: '#' },
          { label: 'Privacy', href: '#' },
          { label: 'Cookies', href: '#' },
        ],
      },
    ],
    note: '© 2025 Minka. Made with curiosity and plenty of tea in Sofia.',
  },
};

export type HomeContent = typeof homeContent;