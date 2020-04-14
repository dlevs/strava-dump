import Papa from 'papaparse'
import fs from 'fs-extra'
import _ from 'lodash'
import _fp from 'lodash/fp.js'
import { formatTime, formatDistance, formatPace } from './formatters.js'

const getBestPace = _.flow(_fp.minBy('pace'), _fp.get('pace'))

export const createAthletesCsv = async (outputFilepath, runs) => {
  const statsByAthlete = _.map(_.groupBy(runs, 'athlete'), (runs, athlete) => {
    return {
      athlete,
      firstPace: _.get(runs[runs.length - 1], 'pace'),
      bestPace: getBestPace(runs),
      totalMovingTime: _.sumBy(runs, 'moving_time'),
      totalDistance: _.sumBy(runs, 'distance'),
      averageElevationGain: Math.round(_.sumBy(runs, 'total_elevation_gain') / runs.length),
      maxElevationGain: _.get(_.maxBy(runs, 'total_elevation_gain'), 'total_elevation_gain')
    }
  })

  const athletesCsv = Papa.unparse(
    statsByAthlete.map(
      ({
        athlete,
        bestPace,
        firstPace,
        totalDistance,
        totalMovingTime,
        averageElevationGain,
        maxElevationGain,
      }) => {
        const improvementPercent = (100 - (bestPace / firstPace) * 100).toFixed(
          2
        )

        return {
          Athlete: athlete,
          'Total Distance': formatDistance(totalDistance),
          'Total Moving Time': formatTime(totalMovingTime),
          'Average pace': formatPace(totalMovingTime / (totalDistance / 1000)),
          'Best Pace': formatPace(bestPace),
          'Average Elevation Gain': `${averageElevationGain}m`,
          'Max Elevation Gain': `${maxElevationGain}m`,
          'Pace improvement': `-${improvementPercent}% (${formatPace(
            firstPace
          )} -> ${formatPace(bestPace)})`,
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
        total_elevation_gain,
        pace,
      }) => ({
        Athlete: athlete,
        Name: name,
        Distance: formatDistance(distance),
        Pace: formatPace(pace),
        'Moving Time': formatTime(moving_time),
        'Elevation Gain': `${total_elevation_gain}m`,
      })
    ),
    { delimiter: '\t' }
  )
  await fs.writeFile(outputFilepath, runsCsv)
}
