import Papa from 'papaparse'
import fs from 'fs-extra'
import _ from 'lodash'
import _fp from 'lodash/fp.js'
import { formatTime, formatDistance } from './formatters.js'

const getBestPace = _.flow(_fp.minBy('pace'), _fp.get('pace'))

export const createAthletesCsv = async (outputFilepath, runs) => {
  const statsByAthlete = _.map(_.groupBy(runs, 'athlete'), (runs, athlete) => {
    const min5kRuns = runs.filter(({ distance }) => distance >= 5000)
    const nonTrivialRuns = runs.filter(({ distance }) => distance >= 4000)

    return {
      athlete,
      bestPace: getBestPace(runs),
      bestPaceMin5k: getBestPace(min5kRuns),
      firstNonTrivialPace: _.get([...nonTrivialRuns].reverse()[0], 'pace'),
      bestNonTrivialPace: getBestPace(nonTrivialRuns),
      totalDistance: _.sumBy(runs, 'distance'),
    }
  })

  const athletesCsv = Papa.unparse(
    statsByAthlete.map(
      ({
        athlete,
        bestPace,
        bestPaceMin5k,
        totalDistance,
        firstNonTrivialPace,
        bestNonTrivialPace,
      }) => {
        const improvementPercent = (
          100 -
          (bestNonTrivialPace / firstNonTrivialPace) * 100
        ).toFixed(2)

        return {
          Athlete: athlete,
          'Total Distance': formatDistance(totalDistance),
          'Best Pace': formatTime(bestPace),
          '5KM Best Pace': formatTime(bestPaceMin5k),
          '4KM Pace improvement': `-${improvementPercent}% (${formatTime(
            firstNonTrivialPace
          )} -> ${formatTime(bestNonTrivialPace)})`,
        }
      }
    ),
    { delimiter: '\t' }
  )

  await fs.writeFile(outputFilepath, athletesCsv)
}

export const createRunsCsv = async (outputFilepath, runs) => {
  const runsCsv = Papa.unparse(
    runs.map(
      ({
        athlete,
        name,
        distance,
        moving_time,
        elapsed_time,
        total_elevation_gain,
        pace,
      }) => ({
        Athlete: athlete,
        Name: name,
        Distance: formatDistance(distance),
        Pace: formatTime(pace),
        'Moving Time': formatTime(moving_time),
        'Elapsed Time': formatTime(elapsed_time),
        'Elevation Gain': `${total_elevation_gain}m`,
      })
    ),
    { delimiter: '\t' }
  )
  await fs.writeFile(outputFilepath, runsCsv)
}
