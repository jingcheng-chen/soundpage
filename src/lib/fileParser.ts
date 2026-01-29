import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
import ePub from 'epubjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export type SupportedFileType = 'txt' | 'md' | 'doc' | 'docx' | 'pdf' | 'epub'

const SUPPORTED_EXTENSIONS: SupportedFileType[] = ['txt', 'md', 'doc', 'docx', 'pdf', 'epub']

const MIME_TYPES: Record<string, SupportedFileType> = {
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/pdf': 'pdf',
  'application/epub+zip': 'epub',
}

export function getFileExtension(fileName: string): string | undefined {
  const parts = fileName.split('.')
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase()
  }
  return undefined
}

export function isSupportedFile(file: File): boolean {
  const ext = getFileExtension(file.name)
  if (ext && SUPPORTED_EXTENSIONS.includes(ext as SupportedFileType)) {
    return true
  }
  // Also check MIME type
  return Object.keys(MIME_TYPES).includes(file.type)
}

export function getSupportedFileType(file: File): SupportedFileType | null {
  const ext = getFileExtension(file.name)
  if (ext && SUPPORTED_EXTENSIONS.includes(ext as SupportedFileType)) {
    return ext as SupportedFileType
  }
  if (MIME_TYPES[file.type]) {
    return MIME_TYPES[file.type]
  }
  return null
}

export async function parseFile(file: File): Promise<string> {
  const fileType = getSupportedFileType(file)

  if (!fileType) {
    throw new Error(`Unsupported file type: ${file.name}`)
  }

  switch (fileType) {
    case 'txt':
    case 'md':
      return file.text()

    case 'docx':
      return parseDocx(file)

    case 'doc':
      // .doc files (old Word format) are not well supported in the browser
      // mammoth only supports .docx, so we'll try to parse it but warn the user
      try {
        return parseDocx(file)
      } catch {
        throw new Error(
          'Old .doc format is not fully supported. Please convert to .docx or .txt'
        )
      }

    case 'pdf':
      return parsePdf(file)

    case 'epub':
      return parseEpub(file)

    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })

  if (result.messages.length > 0) {
    console.warn('Mammoth parsing warnings:', result.messages)
  }

  return result.value.trim()
}

async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const textParts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    textParts.push(pageText)
  }

  return textParts.join('\n\n').trim()
}

async function parseEpub(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const book = ePub(arrayBuffer)
  await book.ready

  const spine = book.spine as { each: (callback: (item: { load: (book: unknown) => Promise<{ innerText: string }> }) => void) => void }
  const textParts: string[] = []

  await new Promise<void>((resolve) => {
    const items: Array<{ load: (book: unknown) => Promise<{ innerText: string }> }> = []
    spine.each((item) => items.push(item))

    const processItems = async () => {
      for (const item of items) {
        const contents = await item.load(book.load.bind(book))
        if (contents?.innerText) {
          textParts.push(contents.innerText.trim())
        }
      }
      resolve()
    }
    processItems()
  })

  book.destroy()
  return textParts.join('\n\n').trim()
}

export const ACCEPTED_FILE_TYPES = '.txt,.md,.doc,.docx,.pdf,.epub,text/plain,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/epub+zip'

export const SUPPORTED_FORMATS_TEXT = 'Supports .txt, .md, .doc, .docx, .pdf, .epub files'
