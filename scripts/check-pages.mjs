// Compile each Markdown page the way VitePress does and report Vue template errors.
// One template error fails the whole dev.octeth.com build, so run this before committing pages.
//
// Usage (from the repo root): node scripts/check-pages.mjs <page.md> [page.md ...]
// Exit codes: 0 no errors, 1 at least one page has errors, 2 usage error.
import { createMarkdownRenderer } from 'vitepress'
import { compileTemplate } from '@vue/compiler-sfc'
import fs from 'fs'

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error('usage: node scripts/check-pages.mjs <page.md> [page.md ...]')
  process.exit(2)
}
const missing = files.filter((f) => !fs.existsSync(f) || !fs.statSync(f).isFile())
if (missing.length > 0) {
  for (const f of missing) console.error(`missing file: ${f}`)
  process.exit(2)
}

const md = await createMarkdownRenderer(process.cwd())
let failedPages = 0
let totalErrors = 0

for (const file of files) {
  const html = md.render(fs.readFileSync(file, 'utf8'))
  const lines = html.split('\n')
  const { errors } = compileTemplate({ source: html, filename: file, id: 'check' })
  if (errors.length === 0) continue
  failedPages++
  totalErrors += errors.length
  for (const e of errors) {
    const line = e.loc?.start?.line
    const message = typeof e === 'string' ? e : e.message
    console.log(`${file}:${line ?? '?'} ${message}`)
    // Line numbers refer to the rendered HTML, so show that line to locate the Markdown source.
    const snippet = line ? (lines[line - 1] || '').trim().slice(0, 300) : ''
    if (snippet) console.log(`  rendered: ${snippet}`)
  }
}

console.log(`checked ${files.length} page(s): ${totalErrors} error(s) in ${failedPages} page(s)`)
process.exit(failedPages > 0 ? 1 : 0)
