/**
 * Dictionary types for Minka
 */

export interface DictionaryResult {
  word: string;
  translation: string;
  isVerb: boolean;
  verbForms?: VerbForms;
  examples?: string[];
  cached?: boolean;
  error?: string;
}

export interface VerbForms {
  infinitive: string;
  present: string[];
  past: string[];
  perfect: string[];
  subjunctive?: string[];
}

export interface DictionaryCache {
  id: string;
  word: string;
  translation: string;
  isVerb: boolean;
  verbForms?: VerbForms;
  examples?: string[];
  lastFetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

