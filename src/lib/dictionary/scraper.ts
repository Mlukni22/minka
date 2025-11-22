import * as cheerio from 'cheerio';
import { DictionaryResult, VerbForms } from '@/types/dictionary';

/**
 * Scrape verbformen.com for word translation and verb forms
 */
export async function scrapeVerbformen(word: string): Promise<DictionaryResult> {
  const normalizedWord = word.trim().toLowerCase();
  const url = `https://www.verbformen.com/${normalizedWord}.htm`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          word: normalizedWord,
          translation: 'Not found',
          isVerb: false,
          error: 'Word not found on verbformen.com',
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract translation
    let translation = '';
    
    // Try to find translation in various possible locations
    // Look for "Übersetzung" section or first paragraph with translation
    const translationSection = $('p:contains("Übersetzung")').first();
    if (translationSection.length) {
      translation = translationSection.text().replace(/Übersetzung:?\s*/i, '').trim();
    } else {
      // Try to find in main content area
      const mainContent = $('main, .content, article').first();
      if (mainContent.length) {
        const firstP = mainContent.find('p').first();
        if (firstP.length) {
          translation = firstP.text().trim();
        }
      }
    }
    
    // If still no translation, try meta description or title
    if (!translation) {
      const metaDesc = $('meta[name="description"]').attr('content');
      if (metaDesc) {
        translation = metaDesc.split('–')[1]?.trim() || metaDesc.split('-')[1]?.trim() || '';
      }
    }
    
    // Check if it's a verb by looking for conjugation tables
    const hasConjugationTable = $('table[id*="konjugation"], table[id*="conjugation"], .konjugation, .conjugation').length > 0;
    const isVerb = hasConjugationTable;
    
    // Extract verb forms if it's a verb
    let verbForms: VerbForms | undefined;
    if (isVerb) {
      verbForms = extractVerbForms($);
    }
    
    // Extract example sentences
    const examples: string[] = [];
    $('ul.examples li, .examples li, .beispiel li').each((_, el) => {
      const example = $(el).text().trim();
      if (example && example.length > 0) {
        examples.push(example);
      }
    });
    
    // If no examples found in specific sections, try to find any list items
    if (examples.length === 0) {
      $('ul li').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 10 && text.length < 200 && text.includes(' ')) {
          examples.push(text);
        }
      });
      // Limit to first 5 examples
      examples.splice(5);
    }
    
    return {
      word: normalizedWord,
      translation: translation || 'Translation not available',
      isVerb,
      verbForms,
      examples: examples.length > 0 ? examples : undefined,
    };
  } catch (error) {
    console.error('Error scraping verbformen.com:', error);
    return {
      word: normalizedWord,
      translation: 'Error fetching translation',
      isVerb: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract verb forms from conjugation table
 */
function extractVerbForms($: cheerio.CheerioAPI): VerbForms | undefined {
  try {
    // Find conjugation table
    const table = $('table[id*="konjugation"], table[id*="conjugation"], .konjugation table, .conjugation table').first();
    
    if (table.length === 0) {
      return undefined;
    }
    
    const verbForms: VerbForms = {
      infinitive: '',
      present: [],
      past: [],
      perfect: [],
    };
    
    // Extract infinitive (usually in header or first row)
    const header = table.find('thead th, tr:first-child th, tr:first-child td').first();
    if (header.length) {
      verbForms.infinitive = header.text().trim();
    }
    
    // Extract present tense forms
    table.find('tr').each((_, row) => {
      const cells = $(row).find('td, th');
      const rowText = $(row).text().toLowerCase();
      
      // Look for present tense indicators
      if (rowText.includes('präsens') || rowText.includes('present')) {
        cells.each((i, cell) => {
          if (i > 0) { // Skip first column (usually label)
            const form = $(cell).text().trim();
            if (form && !form.includes('Präsens') && !form.includes('Present')) {
              verbForms.present.push(form);
            }
          }
        });
      }
      
      // Look for past tense (Präteritum/Imperfekt)
      if (rowText.includes('präteritum') || rowText.includes('imperfekt') || rowText.includes('past')) {
        cells.each((i, cell) => {
          if (i > 0) {
            const form = $(cell).text().trim();
            if (form && !form.includes('Präteritum') && !form.includes('Past')) {
              verbForms.past.push(form);
            }
          }
        });
      }
      
      // Look for perfect tense (Perfekt)
      if (rowText.includes('perfekt') || rowText.includes('perfect')) {
        cells.each((i, cell) => {
          if (i > 0) {
            const form = $(cell).text().trim();
            if (form && !form.includes('Perfekt') && !form.includes('Perfect')) {
              verbForms.perfect.push(form);
            }
          }
        });
      }
    });
    
    // If we didn't find forms in structured way, try to extract from any table cells
    if (verbForms.present.length === 0) {
      table.find('td').each((_, cell) => {
        const text = $(cell).text().trim();
        if (text && text.length > 0 && text.length < 30 && !text.includes(' ')) {
          verbForms.present.push(text);
        }
      });
      // Limit to 6 forms (ich, du, er/sie/es, wir, ihr, sie/Sie)
      verbForms.present = verbForms.present.slice(0, 6);
    }
    
    return verbForms.infinitive || verbForms.present.length > 0 ? verbForms : undefined;
  } catch (error) {
    console.error('Error extracting verb forms:', error);
    return undefined;
  }
}

