# Strava Club Sheets Script

[Strava](https://www.strava.com) is an app that tracks runs.

The UI for tracking club stats does not stretch beyond two weeks max. This script calls the API to get all the data, and then generates CSV files for opening in apps like Google Sheets.

## Running the script

Install a version of NodeJS that supports ESM (v13+).

Then, create a `.env` file in the root of this project that contains an access token for Strava:

```env
STRAVA_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

An access token can be found [in the account settings](https://www.strava.com/settings/api). They expire after a few hours; just log back in and copy + paste the new key.

Then, run the script:

```bash
npm install
npm start
```
