ClientIP affinity is unfortunately not effective here for the same reason as before — from a3gw's perspective, the client IP is never the browser's IP. It's the nginx ingress controller pod's IP. So ClientIP affinity does pin requests, but it pins them per ingress controller pod, not per actual user.

If your ingress controller has multiple pods (which it likely does), a request routed through controller pod A and another through controller pod B appear as two different client IPs to a3gw, even though they're from the same browser session. The captcha image load goes through one controller pod, the login POST goes through another, and a3gw sees them as different clients entirely.

You can verify this is exactly what's happening:

```bash
kubectl logs -l component=vcp-a3gw -n consolportals \
  --container vcp-a3gw --prefix=true | grep ipAddresses
```

You'll see the `ipAddresses` field in the log — if it's always `192.168.65.3` (the node IP) or a small set of IPs regardless of which browser is connecting, that confirms a3gw never sees real client IPs.

The only solutions that actually work in this architecture are:

1. **Memcached** — share captcha tokens across pods, so it doesn't matter which pod validates
2. **Single a3gw replica** — for local testing only
3. **`externalTrafficPolicy: Local`** on the ingress controller service — preserves real client IPs, but only works if the ingress controller is exposed via NodePort/LoadBalancer, not applicable to internal ClusterIP routing

Memcached is the right answer here. Want to wire it up?


Memcached is up fine, so the issue is a3gw itself not starting. Check its logs:

```bash
kubectl logs consolportals-sa-stc-vcp-a3gw-deployment-8f97d5577-r2b74 \
  -n consolportals -c vcp-a3gw
```

My guess is either a JSON parse error in `auth_config.json` (a trailing comma, missing bracket, something like that) or a3gw is failing to connect to memcached on startup and crashing rather than continuing without it. The logs will tell you exactly which.

Nothing to do with the service name — it's a Node.js ESM/CJS interop issue. The `rate-limit-memcached` package version installed in the image exports as an ES module default, so `require('rate-limit-memcached')` returns `{ default: [Function] }` instead of the constructor directly. When `memcachedServers` was empty this code path was never hit, so it never crashed. Now that you added a server it tries `new MemcachedStore(...)` and blows up.

You can't fix the source without rebuilding the image, but you can sidestep it. The rate limiter and the captcha/session storage are separate. Looking at the code:

```js
if (serverConfig.rateLimit.enabled && authConfig.memcachedServers.length > 0) {
    rateLimitOptions.store = new MemcachedStore(...)  // <- only hits this if enabled
}
```

So set `rateLimit.enabled: false` in `server_config.json` — the broken constructor never gets called, and memcached still gets used for captcha and session storage through the rest of the app:

```json
"rateLimit": {
  "enabled": false,
  "expiration": 900,
  "max": 1000
},
```

Then `helm upgrade` again. The captcha problem should be solved and rate limiting can be fixed properly when the image gets rebuilt with the correct import:

```js
const _MemcachedStore = require('rate-limit-memcached');
const MemcachedStore = _MemcachedStore.default || _MemcachedStore;
```
