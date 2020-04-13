import fs from 'fs-extra'
import { fromDir } from './lib/pathUtils.js'
import { getRunningData } from './lib/api.js'
import { createRunsCsv, createAthletesCsv } from './lib/csvCreators.js'

const fromCurrentDir = (...paths) => fromDir(import.meta.url, ...paths)

const main = async () => {
  const runs = await getRunningData()
  await fs.mkdirp(fromCurrentDir('./dist'))
  await Promise.all([
    createRunsCsv(fromCurrentDir('./dist/athletes.csv'), runs),
    createAthletesCsv(fromCurrentDir('./dist/runs.csv'), runs),
  ])
}

main()
