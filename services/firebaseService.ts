The Netlify deploy errored, with the following guidance provided:

**Diagnosis**
- The build stops immediately after running `node scripts/validate-env.js`, as shown at [line 63](#L63). That script exits with a non-zero code when any required environment variable is absent, so the failure is caused by missing or incorrect Netlify environment variables listed in [`scripts/validate-env.js`](https://github.com/theagentwo-wq/New-KPI-Dashboard/blob/main/scripts/validate-env.js).

**Solution**
1. Review the required keys in [`scripts/validate-env.js`](https://github.com/theagentwo-wq/New-KPI-Dashboard/blob/main/scripts/validate-env.js) and determine which ones are missing.
2. In Netlify, go to **Site settings → Environment variables**, and add the missing values (or correct incorrect ones). Use secure values—do not commit secrets to the repo.
3. Trigger a new deploy; the build will proceed once `node scripts/validate-env.js` finds all required variables.

The relevant error logs are:

Line 54: [36m[1m​[22m[39m
Line 55: [36m[1m❯ Context[22m[39m
Line 56:   production
Line 57: [96m[1m​[22m[39m
Line 58: [96m[1mBuild command from Netlify app                                [22m[39m
Line 59: [96m[1m────────────────────────────────────────────────────────────────[22m[39m
Line 60: ​
Line 61: [36m$ npm run build[39m
Line 62: > operations-kpi-dashboard@0.0.0 build
Line 63: > node scripts/validate-env.js && node scripts/create-netlify-config.js && npm run build:functions && npm run build:client
Line 64: Failed during stage 'building site': Build script returned non-zero exit code: 2