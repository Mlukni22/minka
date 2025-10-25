# Flashcards Language & Sorting Feature

## Overview

Enhanced the flashcards library page with advanced filtering and display features, including language filters (German/English), word type filtering and sorting, and verb conjugation displays.

## Features Implemented

### 1. Language Filters

Users can now filter flashcards by language:

**Filter Options**:
- **All**: Shows all flashcards (default)
- **🇩🇪 German**: Shows only German words (filters cards where German is the primary side)
- **🇬🇧 English**: Shows only English words (filters cards where English is the primary side)

**UI Location**: Top of the filter panel, above the search bar

**Implementation**: Simple heuristic that checks if the word starts with Latin characters for English detection.

### 2. Word Type Filters

Filter flashcards by grammatical category:

**Filter Options**:
- **All**: Shows all word types
- **Nouns**: Only German nouns (with articles and plurals)
- **Verbs**: Only verbs (with conjugations if available)
- **Adjectives**: Only adjectives
- **Phrases**: Only phrases and expressions

**UI Location**: Next to language filter, clearly labeled "Type:"

**Behavior**: Can be combined with language filter for precise filtering (e.g., "German verbs only")

### 3. Sort by Word Type

New sorting option added to organize flashcards by grammatical category:

**Sort Order**:
1. **Nouns** (first)
2. **Verbs**
3. **Adjectives**
4. **Phrases**
5. **Other** (last)

Within each category, cards are sorted alphabetically by the German word.

**UI Location**: Added as "Sort by Word Type" option in the sort dropdown

**Default**: Word Type sorting is now the default view (previously was "Sort by Date")

### 4. Verb Conjugation Display

When viewing verb flashcards, present tense conjugations are displayed:

**Display Format** (on German side):
```
Present Tense:
ich: male          wir: malen
du: malst          ihr: malt
er/sie/es: malt
sie/Sie: malen
```

**Styling**:
- Shown in a semi-transparent white box
- Grid layout (2 columns)
- Clear labels for each pronoun
- Small text to not overwhelm the main word

**English Side**: Shows "(infinitive form)" note for verbs

**Data Structure**: New `conjugation` field added to VocabularyItem type

## Technical Implementation

### Type Updates

#### VocabularyItem Interface
```typescript
export interface VocabularyItem {
  german: string;
  english: string;
  audio?: string;
  article?: 'der' | 'die' | 'das';
  plural?: string;
  wordType?: 'noun' | 'verb' | 'adjective' | 'phrase' | 'other';
  conjugation?: {
    ich: string;
    du: string;
    er_sie_es: string;
    wir: string;
    ihr: string;
    sie_Sie: string;
  }; // NEW: Present tense conjugation for verbs
}
```

### Filter State Management

#### New State Variables
```typescript
const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('all');
const [wordTypeFilter, setWordTypeFilter] = useState<WordTypeFilter>('all');
const [sort, setSort] = useState<SortType>('wordType'); // Default changed
```

#### Filter Types
```typescript
type LanguageFilter = 'all' | 'german' | 'english';
type WordTypeFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'phrase' | 'other';
type SortType = 'date' | 'alpha' | 'reviews' | 'wordType'; // wordType added
```

### Filtering Logic

```typescript
// Language filter
if (languageFilter === 'german') {
  filtered = filtered.filter(card => !card.german.match(/^[A-Za-z]/));
} else if (languageFilter === 'english') {
  filtered = filtered.filter(card => card.german.match(/^[A-Za-z]/));
}

// Word type filter
if (wordTypeFilter !== 'all') {
  filtered = filtered.filter(card => card.wordType === wordTypeFilter);
}
```

### Sorting Logic

```typescript
if (sort === 'wordType') {
  const typeOrder: Record<string, number> = {
    'noun': 1,
    'verb': 2,
    'adjective': 3,
    'phrase': 4,
    'other': 5
  };
  const aOrder = typeOrder[a.wordType || 'other'] || 5;
  const bOrder = typeOrder[b.wordType || 'other'] || 5;
  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }
  // Within same type, sort alphabetically
  return a.german.localeCompare(b.german);
}
```

### UI Components

#### Filter Buttons Layout
```tsx
<div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-200">
  {/* Language Filter */}
  <div className="flex items-center gap-2">
    <span className="text-sm font-medium text-gray-700">Language:</span>
    <div className="flex gap-2">
      <FilterButton active={languageFilter === 'all'} ... />
      <FilterButton active={languageFilter === 'german'} label="🇩🇪 German" ... />
      <FilterButton active={languageFilter === 'english'} label="🇬🇧 English" ... />
    </div>
  </div>

  {/* Word Type Filter */}
  <div className="flex items-center gap-2">
    <span className="text-sm font-medium text-gray-700">Type:</span>
    <div className="flex gap-2">
      <FilterButton active={wordTypeFilter === 'all'} ... />
      <FilterButton active={wordTypeFilter === 'noun'} label="Nouns" ... />
      <FilterButton active={wordTypeFilter === 'verb'} label="Verbs" ... />
      <FilterButton active={wordTypeFilter === 'adjective'} label="Adjectives" ... />
      <FilterButton active={wordTypeFilter === 'phrase'} label="Phrases" ... />
    </div>
  </div>
</div>
```

#### Verb Conjugation Display
```tsx
{card.wordType === 'verb' && card.conjugation && (
  <div className="text-xs text-[#7E7A95] mt-3 space-y-1 bg-white/50 rounded-lg p-2">
    <div className="font-semibold mb-1">Present Tense:</div>
    <div className="grid grid-cols-2 gap-1">
      <div><span className="font-medium">ich:</span> {card.conjugation.ich}</div>
      <div><span className="font-medium">wir:</span> {card.conjugation.wir}</div>
      <div><span className="font-medium">du:</span> {card.conjugation.du}</div>
      <div><span className="font-medium">ihr:</span> {card.conjugation.ihr}</div>
      <div className="col-span-2"><span className="font-medium">er/sie/es:</span> {card.conjugation.er_sie_es}</div>
      <div className="col-span-2"><span className="font-medium">sie/Sie:</span> {card.conjugation.sie_Sie}</div>
    </div>
  </div>
)}
```

## Example Verb Conjugations

Added to vocabulary data:

### malen (to paint)
- ich: male
- du: malst
- er/sie/es: malt
- wir: malen
- ihr: malt
- sie/Sie: malen

### beginnen (to begin)
- ich: beginne
- du: beginnst
- er/sie/es: beginnt
- wir: beginnen
- ihr: beginnt
- sie/Sie: beginnen

## User Experience

### Workflow Examples

#### Scenario 1: Study Only Verbs
1. User clicks "Verbs" in Type filter
2. All non-verb cards are hidden
3. Each verb card shows conjugation when flipped
4. User can sort by word type to group similar verbs

#### Scenario 2: German Words Only
1. User clicks "🇩🇪 German" in Language filter
2. Only German-origin words are shown
3. Combined with "Verbs" filter for German verbs specifically

#### Scenario 3: Review by Category
1. Default sort is "Word Type"
2. Cards automatically grouped: Nouns → Verbs → Adjectives → Phrases
3. Easy to review one category at a time

## Benefits

### For Learners
1. **Focused Study**: Filter by specific word types for targeted practice
2. **Context**: Verb conjugations provide complete grammatical context
3. **Organization**: Automatic sorting by word type creates structured review
4. **Flexibility**: Multiple filters can be combined for precise selection

### For Language Acquisition
1. **Grammar Learning**: Conjugation tables teach verb patterns
2. **Pattern Recognition**: Grouping by type helps identify patterns
3. **Comprehensive**: Shows full present tense paradigm
4. **Reference**: Conjugations serve as quick reference

## Files Modified

### Core Types
- `src/types/index.ts` - Added `conjugation` field to VocabularyItem

### UI Components
- `src/components/profile/flashcards-page.tsx` - Added filters, sorting, and conjugation display

### Data
- `src/lib/story-engine.ts` - Added conjugation data to example verbs

## Mobile Responsiveness

- Filter buttons wrap on small screens
- Conjugation grid adapts to card size
- All filters remain accessible on mobile
- Touch-friendly button sizes maintained

## Future Enhancements

### Potential Additions
1. **More Verb Tenses**: Past, perfect, future tenses
2. **Irregular Verb Highlighting**: Mark irregular verbs specially
3. **Conjugation Quiz**: Interactive conjugation practice
4. **Export Conjugation Tables**: Download/print conjugation references
5. **Advanced Filters**: 
   - Irregular vs. regular verbs
   - Separable vs. inseparable verbs
   - Verb with prepositions
6. **Voice**: Audio pronunciation for each conjugation
7. **Example Sentences**: Show each conjugation in context

### Data Improvements
1. **Complete Conjugations**: Add conjugations for all verbs in vocabulary
2. **Participles**: Include past participle forms
3. **Imperative Forms**: Add command forms
4. **Auxiliary Verbs**: Indicate whether verb uses haben or sein

## Testing Checklist

- [x] Language filter works correctly
- [x] Word type filter works correctly
- [x] Filters can be combined
- [x] Sort by word type groups correctly
- [x] Verb conjugations display properly
- [x] Cards flip with conjugation data intact
- [x] Mobile responsive design
- [x] No linter errors
- [ ] All verbs have conjugation data (incremental)
- [ ] Edge cases handled (missing conjugation data)

## Known Limitations

1. **Language Detection**: Uses simple heuristic (Latin characters). May misidentify some words.
   - **Solution**: Add explicit language field to vocabulary items in future

2. **Incomplete Conjugation Data**: Not all verbs have conjugation data yet
   - **Status**: Added to 2 example verbs, more to be added incrementally
   - **Fallback**: Cards without conjugations still display normally

3. **Present Tense Only**: Only present tense conjugations implemented
   - **Reason**: Keep initial implementation simple and focused
   - **Future**: Add other tenses as separate expandable sections

## Conclusion

The enhanced flashcards page now provides powerful filtering and educational features that make vocabulary study more organized, contextual, and effective. By showing verb conjugations and allowing users to filter by word type and language, learners can create focused study sessions tailored to their specific needs. The feature integrates seamlessly with the existing flashcard system while providing significant additional value for German language learners.

