# Album Tracker

A React web app to search albums (iTunes Search API), play 30-second previews, keep a personal listening log (status, rating, notes), play full albums through Deezer's embedded player, and get LLM-powered recommendations (Google Gemini) based on your saved albums and ratings.

**GitHub repository:** https://github.com/romelynbernabe/album-tracker

**Live link:** _Add your Vercel URL after deployment._

## Features
- Search albums and artists, view tracks, play 30-second previews
- Play previews of three popular Taylor Swift songs on the Recommendations page
- Mini player that keeps playing while you browse
- Collection with status, 1-5 star rating, notes, filter and sort (saved in your browser)
- Optional full-album playback via Deezer
- LLM-powered recommendations based on the user's saved albums and ratings

## Screenshots
Add screenshots of the search results, album detail, and recommendations pages before submission.

## Tech stack
React, Vite, Context API, iTunes API, Deezer, Gemini, Vercel

## Run locally
```bash
git clone https://github.com/romelynbernabe/album-tracker.git
cd album-tracker
npm install
# create .env.local with: GEMINI_API_KEY=your-key
npm run dev
```

In PowerShell, if `npm` is blocked because script execution is disabled, use `npm.cmd install` and `npm.cmd run dev`.

## Limitations
- Previews are 30 seconds (iTunes limit)
- Collection is saved only in your browser
- Deezer needs a login (and a plan) for full tracks

## Privacy
The recommendations feature sends your saved albums' titles, artists, ratings, and statuses to Google's Gemini API. Your notes are not sent.

## Disclaimer
Learning project, not affiliated with Apple, Spotify, Deezer, or Google. Music data, artwork, and audio belong to their owners.

## Submission checklist
- [x] Add the GitHub repository URL.
- [ ] Deploy to Vercel, configure `GEMINI_API_KEY`, and add the live URL above.
- [ ] Add screenshots for search results, album detail, and recommendations.
- [ ] Confirm no API key is included in the repository.

## Reflection
1. The audio element is stored in a ref because it is a persistent browser object, and changing it does not need to trigger a React render. React state separately tracks the information the UI displays, such as the current track and playback progress.
2. Keeping API calls in `services/` separates network details from the UI, avoids duplicating requests, and makes those calls easier to maintain.
3. React code is sent to the browser, so a key placed there is visible to users and could be misused. The serverless function reads the key from an environment variable and keeps it out of the browser bundle.
4. This feature prompts a pretrained LLM with the saved albums; it does not train a model. Prompting can find broad music-taste patterns without a training dataset, but suggestions can be inaccurate or invented and depend on the external API.
5. The install attempt was blocked because PowerShell would not run `npm.ps1` under the system execution policy. Running `npm.cmd install` used the Windows command shim instead, without changing the execution policy.
