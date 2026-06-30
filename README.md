# Lunch Jackpot v3

A polished GitHub Pages lunch slot-machine web app.

## Files to upload
Upload all files and folders to your GitHub repository root:

- index.html
- styles.css
- data.js
- app.js
- site.webmanifest
- images/
- sounds/

## Music
To add your own background music:

1. Rename your MP3 to `bgm.mp3`
2. Put it inside the `sounds` folder
3. Upload/commit it to GitHub

The music starts only after the first Spin or when the music button is tapped. This is required by mobile browsers.

Fallback: if you already have `bg-music.mp3` beside index.html, it can also work.

## Editing foods
Open `data.js` and edit the categories, food items, budgets, challenges, and fortunes.

## GitHub Pages
Settings > Pages > Deploy from branch > main > /root.


## Autoplay note
This version tries to start music when the page opens. Some browsers, especially mobile Safari and Chrome, block autoplay with sound until the user taps the page. If blocked, the music will start after the user taps Spin or the music button.


## Fixes in this version
- Music/reset buttons are smaller and no longer block the Lunch Jackpot title.
- Slot reel cards now show the exact same final result as the jackpot card.
- Stats and history are based on the same chosen result.
