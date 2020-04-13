# Strava Club Sheets Script

[Strava](https://www.strava.com/dashboard) is an app that tracks runs.

The UI for tracking club stats does not stretch beyond two weeks max. This script calls the API to get all the data, and then generates CSV files for opening in apps like Google Sheets.

## Running the script

Install a version of NodeJS that supports ESM (v13+).

Then, create a `.env` file in the root of this project that defines an API key for Strava:

```env
STRAVA_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then, run the script:

```bash
npm install
npm start
```
