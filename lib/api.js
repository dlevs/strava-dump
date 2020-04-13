import fs from 'fs-extra'
import axios from 'axios'
import _ from 'lodash'
import { fromDir } from './pathUtils.js'

const getActivitiesBlacklist = async () => {
  const filepath = fromDir(import.meta.url, './activitiesBlacklist.json')
  const file = await fs.readFile(filepath, 'utf8')
  return JSON.parse(file)
}

export const getRunningData = async () => {
  const [activitiesBlacklist, { data: activities }] = await Promise.all([
    getActivitiesBlacklist(),
    axios('https://www.strava.com/api/v3/clubs/619113/activities', {
      headers: {
        Authorization: `Bearer ${process.env.STRAVA_API_KEY}`,
      },
    }),
  ])

  return (
    activities
      // We're only interested in runs.
      .filter((activity) => activity.type === 'Run')
      // Remove invalid runs. The blacklist is just runs before
      // the current competition started.
      .filter((run) => {
        return activitiesBlacklist.every(
          (blacklistedRun) => !_.isEqual(blacklistedRun, run)
        )
      })
      // Calculate some properties that aren't provided out-of-the-box.
      .map((run) => {
        return {
          ...run,
          athlete: `${run.athlete.firstname} ${run.athlete.lastname}`,
          pace: run.moving_time / (run.distance / 1000),
        }
      })
  )
}
