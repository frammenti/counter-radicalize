import fs from 'node:fs'
import loadData from './data-loader.ts'
import processSegments from './pipeline.ts'

process.stdout.write(`\nAligning transcript with disfluencies...\n`)

const { segments, windows, alignment } = loadData()
const result = processSegments(segments, windows, alignment)

fs.writeFileSync('./src/stores/segments.json', JSON.stringify(result, null, 2))