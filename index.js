import fs from 'fs-extra'
import { fromDir } from './lib/pathUtils.js'
import { getRunningData } from './lib/api.js'
import { createRunsCsv, createAthletesCsv, createHalfKmIncreaseCsv } from './lib/csvCreators.js'

const fromCurrentDir = (...paths) => fromDir(import.meta.url, ...paths)

const main = async () => {
  const runs = await getRunningData()
  await fs.mkdirp(fromCurrentDir('./dist'))
  await Promise.all([
    createRunsCsv(fromCurrentDir('./dist/runs.csv'), runs),
    createAthletesCsv(fromCurrentDir('./dist/athletesAll.csv'), runs),
    createAthletesCsv(fromCurrentDir('./dist/athletes4k.csv'), runs.filter(({ distance }) => distance >= 4000 )),
    createAthletesCsv(fromCurrentDir('./dist/athletes5k.csv'), runs.filter(({ distance }) => distance >= 5000 )),
    createAthletesCsv(fromCurrentDir('./dist/athletes10k.csv'), runs.filter(({ distance }) => distance >= 10000 )),
    createHalfKmIncreaseCsv(fromCurrentDir('./dist/halfKmIncrease.csv'), runs)
  ])
}

main()
