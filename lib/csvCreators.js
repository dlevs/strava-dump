import Papa from 'papaparse'
import fs from 'fs-extra'
import _ from 'lodash'
import _fp from 'lodash/fp.js'
import { formatTime, formatDistance, formatPace, getPositiveSign } from './formatters.js'

const getBestPace = _.flow(_fp.minBy('pace'), _fp.get('pace'))

const groupRunsByAthlete = (runs) => _.map(
  _.groupBy(runs, 'athlete'),
  (runs, athlete) => ({ runs, athlete })
)

export const createAthletesCsv = async (outputFilepath, runs) => {
  const statsByAthlete = groupRunsByAthlete(runs).map(({ runs, athlete }) => ({
    runs,
    athlete,
    firstPace: _.get(runs[runs.length - 1], 'pace'),
    bestPace: getBestPace(runs),
    totalMovingTime: _.sumBy(runs, 'moving_time'),
    totalDistance: _.sumBy(runs, 'distance'),
    averageElevationGain: Math.round(_.sumBy(runs, 'total_elevation_gain') / runs.length),
    maxElevationGain: _.get(_.maxBy(runs, 'total_elevation_gain'), 'total_elevation_gain')
  }))

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
        runs,
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
          'Number of runs': runs.length,
        }
      }
    ),
    { delimiter: '\t' }
  )

  await fs.writeFile(outputFilepath, athletesCsv)
}

export const createRunsCsv = async (outputFilepath, runs) => {
  const runsCsv = Papa.unparse(
    runs.map((run) => ({
      Athlete: run.athlete,
      Name: run.name,
      Distance: formatDistance(run.distance),
      Pace: formatPace(run.pace),
      'Moving Time': formatTime(run.moving_time),
      'Elevation Gain': `${run.total_elevation_gain}m`
    })),
    { delimiter: '\t' }
  )
  await fs.writeFile(outputFilepath, runsCsv)
}

export const createHalfKmIncreaseCsv = async (outputFilepath, allRuns) => {
  const firstAllowedRunIndex = allRuns.findIndex(run => _.isEqual(run, {
    resource_state: 2,
    athlete: 'Clara R.',
    name: 'Course du midi (1)',
    distance: 5001.1,
    moving_time: 1642,
    elapsed_time: 1665,
    total_elevation_gain: 0,
    type: 'Run',
    workout_type: 0,
    pace: 328.32776789106396
  }))
  if (firstAllowedRunIndex === -1) {
    throw new Error('Failed to find the first allowed run in the half km increase challenge.')
  }
  const runs = allRuns.slice(0, firstAllowedRunIndex + 1)
  const calculatedRuns = groupRunsByAthlete(runs).map(({ runs, athlete }) => {
    const runProgression = runs
      .reduceRight((progression, run) => {
        const lastAllowedRun = _.findLast(progression, ({ allowed }) => allowed) || {
          allowed: true,
          distance: 0,
          cumulativeDistance: 0,
          distanceIncrease: 0
        }
        const distanceIncrease = run.distance - lastAllowedRun.distance
        const allowed = distanceIncrease >= 500
        const competitionDistanceIncrease = allowed ? run.distance : 0

        return progression.concat({
          ...run,
          allowed,
          cumulativeDistance: lastAllowedRun.cumulativeDistance + competitionDistanceIncrease,
          competitionDistanceIncrease,
          distanceIncrease
        })
      }, [])
      .reverse()

    return {
      athlete,
      runs: runProgression,
      distance: _.sumBy(
        runProgression.filter(({ allowed }) => allowed),
        'distance'
      )
    }
  })
  const runsCsv = Papa.unparse(
    _.orderBy(calculatedRuns, ['distance'], ['desc']).flatMap(
      ({
        athlete,
        distance,
        runs
      }) => {
        return runs.map((run, i) => {
          const firstRowMeta = i === 0
            ? {
              Athlete: `${athlete} (${formatDistance(run.cumulativeDistance)})`
            }
            : {}

            return {
              ...firstRowMeta,
              'Run name': run.name,
              'Run Distance': formatDistance(run.distance),
              'Distance increase vs last legit run': [
                run.allowed ? '✅ ' : '❌ ',
                getPositiveSign(run.distanceIncrease),
                formatDistance(run.distanceIncrease),
              ].join(''),
              'Challenge running total': formatDistance(run.cumulativeDistance)
            }
        })
      }
    ),
    { delimiter: '\t' }
  )
  await fs.writeFile(outputFilepath, runsCsv)
}
