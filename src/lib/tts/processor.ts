import type { Language, TextProcessorConfig } from './types'
import { AVAILABLE_LANGS } from './types'

/**
 * Validates if a language code is supported
 */
export function isValidLang(lang: string): lang is Language {
  return AVAILABLE_LANGS.includes(lang as Language)
}

/**
 * UnicodeProcessor - Handles text preprocessing and encoding
 * Ported from Supertonic helper.js
 */
export class UnicodeProcessor {
  private indexer: number[]

  constructor(indexer: TextProcessorConfig) {
    this.indexer = indexer
  }

  /**
   * Process text lists into model inputs
   * Returns arrays matching the reference implementation format
   */
  call(textList: string[], langList: Language[]): {
    textIds: number[][]
    textMask: number[][][]
  } {
    const processedTexts = textList.map((text, i) =>
      this.preprocessText(text, langList[i])
    )

    const textIdsLengths = processedTexts.map((text) => text.length)
    const maxLen = Math.max(...textIdsLengths)

    const textIds = processedTexts.map((text) => {
      const row = new Array(maxLen).fill(0)
      for (let j = 0; j < text.length; j++) {
        const codePoint = text.codePointAt(j)
        if (codePoint !== undefined) {
          row[j] =
            codePoint < this.indexer.length ? this.indexer[codePoint] : -1
        }
      }
      return row
    })

    const textMask = this.getTextMask(textIdsLengths)
    return { textIds, textMask }
  }

  /**
   * Preprocess text with comprehensive normalization
   * Matches reference implementation exactly
   */
  private preprocessText(text: string, lang: Language): string {
    // Unicode normalization (NFKD)
    let processed = text.normalize('NFKD')

    // Remove emojis (wide Unicode range)
    const emojiPattern =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]+/gu
    processed = processed.replace(emojiPattern, '')

    // Replace various dashes and symbols
    const replacements: Record<string, string> = {
      '–': '-',
      '‑': '-',
      '—': '-',
      _: ' ',
      '\u201C': '"', // left double quote "
      '\u201D': '"', // right double quote "
      '\u2018': "'", // left single quote '
      '\u2019': "'", // right single quote '
      '´': "'",
      '`': "'",
      '[': ' ',
      ']': ' ',
      '|': ' ',
      '/': ' ',
      '#': ' ',
      '→': ' ',
      '←': ' ',
    }
    for (const [k, v] of Object.entries(replacements)) {
      processed = processed.replaceAll(k, v)
    }

    // Remove special symbols
    processed = processed.replace(/[♥☆♡©\\]/g, '')

    // Replace known expressions
    const exprReplacements: Record<string, string> = {
      '@': ' at ',
      'e.g.,': 'for example, ',
      'i.e.,': 'that is, ',
    }
    for (const [k, v] of Object.entries(exprReplacements)) {
      processed = processed.replaceAll(k, v)
    }

    // Fix spacing around punctuation
    processed = processed.replace(/ ,/g, ',')
    processed = processed.replace(/ \./g, '.')
    processed = processed.replace(/ !/g, '!')
    processed = processed.replace(/ \?/g, '?')
    processed = processed.replace(/ ;/g, ';')
    processed = processed.replace(/ :/g, ':')
    processed = processed.replace(/ '/g, "'")

    // Remove duplicate quotes
    while (processed.includes('""')) {
      processed = processed.replace('""', '"')
    }
    while (processed.includes("''")) {
      processed = processed.replace("''", "'")
    }
    while (processed.includes('``')) {
      processed = processed.replace('``', '`')
    }

    // Remove extra spaces
    processed = processed.replace(/\s+/g, ' ').trim()

    // If text doesn't end with punctuation, add a period
    if (!/[.!?;:,'"')\]}…。」』】〉》›»]$/.test(processed)) {
      processed += '.'
    }

    // Validate language
    if (!isValidLang(lang)) {
      throw new Error(
        `Invalid language: ${lang}. Available: ${AVAILABLE_LANGS.join(', ')}`
      )
    }

    // Wrap text with language tags (XML-style like reference)
    processed = `<${lang}>${processed}</${lang}>`

    return processed
  }

  /**
   * Create text mask from lengths
   */
  private getTextMask(textIdsLengths: number[]): number[][][] {
    const maxLen = Math.max(...textIdsLengths)
    return this.lengthToMask(textIdsLengths, maxLen)
  }

  /**
   * Create length-based mask with shape [bsz, 1, maxLen]
   */
  lengthToMask(lengths: number[], maxLen?: number): number[][][] {
    const actualMaxLen = maxLen || Math.max(...lengths)
    return lengths.map((len) => {
      const row = new Array(actualMaxLen).fill(0.0)
      for (let j = 0; j < Math.min(len, actualMaxLen); j++) {
        row[j] = 1.0
      }
      return [row] // 3D: [1, actualMaxLen]
    })
  }
}

/**
 * Chunk text into manageable segments
 * Matches reference implementation
 */
export function chunkText(text: string, maxLen: number = 300): string[] {
  if (typeof text !== 'string') {
    throw new Error(`chunkText expects a string, got ${typeof text}`)
  }

  // Split by paragraph (two or more newlines)
  const paragraphs = text
    .trim()
    .split(/\n\s*\n+/)
    .filter((p) => p.trim())

  const chunks: string[] = []

  for (let paragraph of paragraphs) {
    paragraph = paragraph.trim()
    if (!paragraph) continue

    // Split by sentence boundaries
    const sentences = paragraph.split(
      /(?<!Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Sr\.|Jr\.|Ph\.D\.|etc\.|e\.g\.|i\.e\.|vs\.|Inc\.|Ltd\.|Co\.|Corp\.|St\.|Ave\.|Blvd\.)(?<!\b[A-Z]\.)(?<=[.!?])\s+/
    )

    let currentChunk = ''

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length + 1 <= maxLen) {
        currentChunk += (currentChunk ? ' ' : '') + sentence
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
        }
        currentChunk = sentence
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }
  }

  return chunks
}
