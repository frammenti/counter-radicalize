import fs from 'node:fs'
import loadData from './data-loader.ts'
import align from './align.ts'
import discretize from './fluency.ts'
import weightedMean from './stats.ts'

process.stdout.write(`\nAligning transcript with disfluencies...\n`)

const { segments, windows, alignment } = loadData()
const aligned = align(segments, windows, alignment)
const fluency = discretize(windows)
const stats = weightedMean(segments, windows)

fs.writeFileSync('./src/stores/segments.json', JSON.stringify(aligned, null, 2))
fs.writeFileSync('./src/stores/fluency.json', JSON.stringify(fluency, null, 2))
fs.writeFileSync('./src/stores/stats.json', JSON.stringify(stats, null, 2))