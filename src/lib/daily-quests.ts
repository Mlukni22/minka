/**
 * Daily Quest System
 */

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
  icon: string;
}

export type QuestType =
  | 'complete_chapters'
  | 'review_flashcards'
  | 'complete_exercises'
  | 'study_minutes'
  | 'add_words'
  | 'perfect_exercises';

interface DailyQuestData {
  quests: DailyQuest[];
  lastReset: string; // ISO date string
  completedToday: number;
}

export class DailyQuestSystem {
  private static readonly STORAGE_KEY = 'minka-daily-quests';

  // Quest templates
  private static QUEST_TEMPLATES: Omit<DailyQuest, 'id' | 'current' | 'completed'>[] = [
    {
      title: 'Chapter Explorer',
      description: 'Complete 1 chapter',
      type: 'complete_chapters',
      target: 1,
      xpReward: 30,
      icon: '📖',
    },
    {
      title: 'Flashcard Master',
      description: 'Review 10 flashcards',
      type: 'review_flashcards',
      target: 10,
      xpReward: 25,
      icon: '🎴',
    },
    {
      title: 'Exercise Champion',
      description: 'Complete 5 exercises',
      type: 'complete_exercises',
      target: 5,
      xpReward: 20,
      icon: '✏️',
    },
    {
      title: 'Dedicated Student',
      description: 'Study for 15 minutes',
      type: 'study_minutes',
      target: 15,
      xpReward: 35,
      icon: '⏱️',
    },
    {
      title: 'Vocabulary Collector',
      description: 'Add 5 words to flashcards',
      type: 'add_words',
      target: 5,
      xpReward: 15,
      icon: '📚',
    },
    {
      title: 'Perfect Practice',
      description: 'Get 3 exercises perfect',
      type: 'perfect_exercises',
      target: 3,
      xpReward: 40,
      icon: '⭐',
    },
  ];

  // Check if quests need reset (new day)
  private static needsReset(lastReset: string): boolean {
    const last = new Date(lastReset);
    const now = new Date();
    
    // Reset at midnight
    return (
      last.getDate() !== now.getDate() ||
      last.getMonth() !== now.getMonth() ||
      last.getFullYear() !== now.getFullYear()
    );
  }

  // Generate random daily quests
  private static generateDailyQuests(): DailyQuest[] {
    // Pick 3 random quests
    const shuffled = [...this.QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    return selected.map((template, index) => ({
      ...template,
      id: `quest-${index}`,
      current: 0,
      completed: false,
    }));
  }

  // Get current daily quests
  static getDailyQuests(): DailyQuest[] {
    if (typeof window === 'undefined') return [];

    const saved = localStorage.getItem(this.STORAGE_KEY);
    
    if (!saved) {
      // First time - generate quests
      const data: DailyQuestData = {
        quests: this.generateDailyQuests(),
        lastReset: new Date().toISOString(),
        completedToday: 0,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return data.quests;
    }

    try {
      const data: DailyQuestData = JSON.parse(saved);
      
      // Check if needs reset
      if (this.needsReset(data.lastReset)) {
        const newData: DailyQuestData = {
          quests: this.generateDailyQuests(),
          lastReset: new Date().toISOString(),
          completedToday: 0,
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newData));
        return newData.quests;
      }

      return data.quests;
    } catch {
      return [];
    }
  }

  // Update quest progress
  static updateQuest(type: QuestType, amount: number = 1): { questCompleted: boolean; quest?: DailyQuest } {
    if (typeof window === 'undefined') return { questCompleted: false };

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return { questCompleted: false };

    try {
      const data: DailyQuestData = JSON.parse(saved);

      // Find quest of this type
      const quest = data.quests.find(q => q.type === type && !q.completed);
      if (!quest) return { questCompleted: false };

      // Update progress
      quest.current = Math.min(quest.current + amount, quest.target);

      // Check if completed
      if (quest.current >= quest.target && !quest.completed) {
        quest.completed = true;
        data.completedToday += 1;
        
        // Save
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        
        return { questCompleted: true, quest };
      }

      // Save progress
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      
      return { questCompleted: false };
    } catch {
      return { questCompleted: false };
    }
  }

  // Get completion stats
  static getStats(): { completedToday: number; totalQuests: number } {
    const quests = this.getDailyQuests();
    const completedToday = quests.filter(q => q.completed).length;
    return { completedToday, totalQuests: quests.length };
  }

  // Check if all quests completed
  static allQuestsCompleted(): boolean {
    const quests = this.getDailyQuests();
    return quests.length > 0 && quests.every(q => q.completed);
  }

  // Get time until reset
  static getTimeUntilReset(): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
}

