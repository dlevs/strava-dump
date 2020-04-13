import Papa from 'papaparse'
import fs from 'fs-extra'
import _ from 'lodash'
import { formatTime, formatDistance } from './formatters.js'

export const createAthletesCsv = async (outputFilepath, runs) => {
  const statsByAthlete = _.map(_.groupBy(runs, 'athlete'), (runs, athlete) => {
    const quickest5k = _.minBy(
      runs.filter(({ distance }) => distance >= 5000),
      'pace'
    )

    return {
      athlete,
      bestPace: _.minBy(runs, 'pace').pace,
      bestPaceMin5k: quickest5k && quickest5k.pace,
      totalDistance: _.sumBy(runs, 'distance'),
    }
  })

  const athletesCsv = Papa.unparse(
    statsByAthlete.map(
      ({ athlete, bestPace, bestPaceMin5k, totalDistance }) => ({
        Athlete: athlete,
        'Total Distance': formatDistance(totalDistance),
        'Best Pace': formatTime(bestPace),
        'Best Pace 5K': formatTime(bestPaceMin5k),
      })
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
        // Type: type,
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
