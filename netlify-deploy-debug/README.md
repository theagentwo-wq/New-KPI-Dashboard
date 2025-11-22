Netlify deploy debug bundle

Contents:
- site-info.txt: basic site/account info
- commands.txt: exact commands I ran
- debug-excerpt.txt: CLI debug output excerpt showing the 500 error

Summary
-------
Reproduced consistent failures when uploading functions to Netlify: the API returns HTTP 500 with JSON {"code":500,"message":"Failed to create function"} during function upload. The failure occurs even when uploading a single tiny function (`debug-status.js`). Local `netlify dev` works fine; function artifacts are built as CommonJS in `functions-dist/`.

Site / Account
---------------
- Site name: kpidashbd
- Project URL: https://kpidashbd.netlify.app
- Project Id (siteId): 96034138-b959-429b-9369-34fdbc8a46be
- Netlify CLI user: theagentwo@gmail.com
- Local path: C:\Users\theag\Documents\New-KPI-Dashboard
- Date of capture: 2025-11-22

Reproduction steps
------------------
1. Build functions: `npm run build:functions` (esbuild bundles into `functions-dist/` as CommonJS)
2. Build client: `npm run build:client` (vite build)
3. Deploy without rebuild to ensure files uploaded match the current `functions-dist`:

   npx netlify deploy --prod --dir=dist --skip-functions-cache --no-build --debug

Observed behavior
-----------------
- Deploy fails during function upload with a JSONHTTPError 500. Example message:
  {
    "code": 500,
    "message": "Failed to create function"
  }
- This occurs when uploading `maps-proxy` in regular cases and also when uploading only `debug-status.js`.
- Local `netlify dev` and function invocation works; issue only occurs during production deploy function upload.

Files included
--------------
- `debug-excerpt.txt`: the CLI debug excerpt showing the error and stack trace.

Suggested support questions
---------------------------
- Why is the functions upload API returning 500 when creating a function for this site?
- Is there a per-account or per-site restriction (size, content, permissions) causing an internal server error when creating functions?
- Please inspect server-side logs (deploy ID / attempt) for the create-function calls originating from the CLI at the timestamps shown in `debug-excerpt.txt` and share the root cause.

Please let me know if you need any additional files (full debug log, function artifact archive, or the full `functions-dist` folder) and I can provide them.
