import fs from 'node:fs'
import loadData from './data-loader.ts'
import align from './align.ts'
import discretize from './fluency.ts'
import weightedMean from './stats.ts'
import rank from './rank.ts'

process.stdout.write(`\nAligning transcript with disfluencies...\n`)

const { segments, windows, alignment } = loadData()
const outDir = './src/stores/'

const aligned = align(segments, windows, alignment)
const fluency = discretize(windows)
const stats = weightedMean(segments, windows)
const ranking = rank(aligned)

fs.writeFileSync(outDir + 'segments.json', JSON.stringify(aligned, null, 2))
fs.writeFileSync(outDir + 'fluency.json', JSON.stringify(fluency, null, 2))
fs.writeFileSync(outDir + 'stats.json', JSON.stringify(stats, null, 2))
fs.writeFileSync(outDir + 'ranking.json', JSON.stringify(ranking, null, 2))