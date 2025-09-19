import dotenv from 'dotenv'
import fs from 'node:fs'
import fg from 'fast-glob'

process.stdout.write(`Fetching link previews...\n`)

dotenv.config({ path: '.env.local', quiet: true })
const API_KEY = process.env.LINK_PREVIEW_API_KEY
if (!API_KEY) throw new Error('Missing LINK_PREVIEW_API_KEY')

const files = await fg('src/**/*.vue')

// Extract urls from <LinkPreview href='...'>
const pattern = /<LinkPreview[^>]*href=['"]([^'"]+)['"]/g
const urls = new Set<string>()

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8')
  let match
  while ((match = pattern.exec(content)) !== null) {
    urls.add(match[1])
  }
}

process.stdout.write(`Found URLs:\n  \x1b[36m${[...urls].join('\x1b[0m,\x1b[36m\n  ')}\x1b[0m\n`)

// Fetch previews
const results: { [key: string]: {} } = {}
const skipped = new Array<string>()
for (const url of urls) {
  const res = await fetch('https://api.linkpreview.net', {
    method: 'POST',
    headers: {
      'X-Linkpreview-Api-Key': API_KEY,
    },
    mode: 'cors',
    body: JSON.stringify({q: url})
  })
  if (!res.ok) {
    skipped.push(`\x1b[33m${url}\x1b[0m: \x1b[31merror ${res.status} (${res.statusText})\x1b[0m`)
    continue
  }
  let data = await res.json()
  if (data.url.length == 0) continue
  const domain = new URL(data.url).hostname
  data.url = domain
  results[url] = data
}

process.stdout.write(`Skipped:\n  ${[...skipped].join(',\n  ')}\n`)

fs.writeFileSync('src/stores/previews.json', JSON.stringify(results, null, 2))