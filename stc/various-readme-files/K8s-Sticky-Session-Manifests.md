

```text

┌─────────────────────────────────────────────────────────────┐
│  Browser (User)                                             │
│  https://hostname/adminportal                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  httpd (Apache Web Server) - Port 80/443                    │
│  • Serves static assets (HTML, JS, CSS)                     │
│  • First layer reverse proxy                                │
│  • Enforces security headers (CSP, X-Frame-Options)         │
│  • Session management (with sticky sessions)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  a3gw (API Gateway) - Port 8444/8445                        │
│  • Second layer reverse proxy                               │
│  • Stateless nodejs proxy server.                           │
│  • Serves portals and routes requests to backend APIs       │
│    Since A3GW is stateless by nature, httpd should fwd      │
│    incoming requests to the same pod in K8S/helm setups     │
│    otherwise audit logging might not make sense,            │
│    and captcha might not work (unreliable)                  │
└────────────────┬────────────────────────────────────────────┘
                 │                                           ▲
        ┌────────┴────────┬────────────┐                     │
        ▼                 ▼            ▼                     │
┌───────────────┐  ┌──────────┐  ┌───────────────┐           │
│ Admin Portal  │  │CC Portal │  │Partner Portal │           │
│   :8080       │  │  :8081   │  │    :8082      │           │
└───────────────┘  └──────────┘  └───────────────┘           │
                                                             │
                                                             │
                                                             │
                                                             │
                                                             │
                                                             │
                                                             │
                                                             ▼
                                              ┌─────────────────┐
                                              │  Backend APIs   │
                                              │  (External)     │
                                              └─────────────────┘



```

------

Yep — you’ve found two separate truths at once:

1. **Ingress is not httpd** (it’s NGINX ingress controller routing to your httpd *service*).
2. Your `kubectl exec` error is simply because you’re exec’ing **without the namespace**.

Let’s fix the immediate command issue first, then tie it back to the stickiness story.

---

## 1) Why `kubectl exec` says NotFound

Your pods are in `-n stc-vcp-services`, but your `kubectl exec` call didn’t include `-n`, so kubectl searches the default namespace and can’t find the pod.

Do:

```bash
export NS=stc-vcp-services
export POD1=consolportals-sa-stc-vcp-a3gw-deployment-6566c9455-2btr5
export POD2=consolportals-sa-stc-vcp-a3gw-deployment-6566c9455-vltq5

kubectl exec -n $NS -it $POD1 -- sh -lc "netstat -tnp | grep :8444; netstat -tnp | grep :8445"
kubectl exec -n $NS -it $POD2 -- sh -lc "netstat -tnp | grep :8444; netstat -tnp | grep :8445"
```

If `netstat` isn’t present in the image, try:

```bash
kubectl exec -n $NS -it $POD1 -- sh -lc "ss -tnp | grep ':8444\|:8445' || true"
```

---

## 2) Why auth hits POD1 but later requests hit POD2 (even with same `vcp-sticky` cookie)

Now that we know **httpd has 2 pods**:

* Ingress cookie stickiness pins the **client → httpd-pod** choice.
* Then the **httpd-pod → a3gw-service** hop chooses an a3gw endpoint.
* Your a3gw service uses `sessionAffinity: ClientIP`, but the “ClientIP” here is **the source IP of the httpd pod** (10.1.5.56 vs 10.1.5.57 in your endpoints output).

So what happens in practice is:

* If you’re stuck to httpd pod **10.1.5.56**, then *all* requests leaving that httpd pod will have source IP 10.1.5.56 → k8s will consistently pick (say) a3gw POD1.
* If you’re stuck to httpd pod **10.1.5.57**, those requests will consistently pick (say) a3gw POD2.

That should mean: *within a single browser session*, you’d usually stick to **one httpd pod**, hence also one a3gw pod (per that httpd).

So why are you seeing “auth on POD1, later on POD2” *within one session*?

### The most likely explanation

You actually have **two different upstream “sessions”** from the ingress/httpd perspective:

* One request set might be hitting one Ingress object / rule / host (or a different port / scheme redirect chain) that lands you on httpd pod A
* Another set hits a slightly different route (still sends the same cookie, but maybe different Host/path handling triggers a different location block / different upstream) and ends up on httpd pod B

The cookie can be present in both, but if the request is going through a different **Ingress server block** (host mismatch) or the cookie scope/path rules differ, NGINX might not *use* it the same way.

---

## 3) Two super-fast checks to confirm what’s splitting

### A) Which httpd pod handled each request?

Temporarily make httpd add a header with its hostname/pod name:

In Apache you can do something like:

* `Header set X-Httpd-Pod "%{HOSTNAME}e" env=HOSTNAME`
  (Exact directive depends on how your container exposes env; if HOSTNAME is present, it’s easy.)

Even easier: just log it. If you can’t easily inject headers, use access logs with `%v %p %h ...` and include server name, then correlate.

### B) Are the `/cmpf-auth-rest` and `/vcp/services` requests *actually* hitting the same host?

In Chrome DevTools → Network:

* click one `/cmpf-auth-rest/...` request and one `/vcp/services/...`
* compare:

    * **Request URL**
    * **Request Headers → Host**
    * **Scheme/port**
    * **Remote Address**

If Host differs (even subtly), your Ingress may treat them as different virtual hosts, and cookie-affinity can behave differently.

---

## 4) The “I want per-user same a3gw pod” reality check

Right now your chain is:

**Ingress (cookie sticky) → httpd (2 pods) → a3gw-service (ClientIP sticky) → a3gw (2 pods)**

This gives you: **user → httpd stickiness**, and then **httpd-pod → a3gw stickiness**.

It does *not* give you true “user → a3gw” stickiness if the user ever lands on the other httpd pod (or if different routes land on different httpd pods).

### Clean fix (when you’re ready)

Make Ingress route API paths directly to **a3gw-service** with cookie affinity on that upstream:

* `/cmpf-auth-rest` → a3gw-service:8445 (cookie affinity)
* `/vcp/services` → a3gw-service:8444 (cookie affinity)
  …and leave static asset serving / headers / SSL to httpd if you want.

That is the simplest way to make the cookie meaningfully select the a3gw pod.

---

If you run the namespace-fixed `exec` and tell me what you see for the peer IPs on 8444/8445 (or whether there are connections at all), I can tell you immediately whether:

* both ports are being reached from the same httpd pod,
* or auth is coming from httpd while services are coming from somewhere else.

```bash

curl 'http://localhost/cmpf-auth-rest/authenticate' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,ar;q=0.6' \
  -H 'Authorization: Bearer undefined' \
  -H 'Cache-Control: no-cache' \
  -H 'Channel: CC' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -b 'vcp-sticky=1769698056.722.6172.685497|e29605fb8dee4031b04a723fce990af5; connect.sid=s%3AdvJbWTNOSDlhQBLKXSztaU6ow64U2Y_e.Svp9Waifw8enyRkGZ%2FH5msPf4TOloWqa%2FW36X6hW9ok; JSESSIONID=FB49E9F667E70494281456AA2263C53A' \
  -H 'Origin: http://localhost' \
  -H 'Pragma: no-cache' \
  -H 'Referer: http://localhost/partnerportal/app.html' \
  -H 'ResourceName: VCP Partner Portal' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'ServiceLabel: CMPF Authorization' \
  -H 'TransactionId: 1769701144624' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  --data-raw '{"username":"znpzsy","password":"Test@1234","captcha":"9"}'


curl 'http://localhost/vcp/services/content-management-rest/rbt/categories/200000000000000668' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,ar;q=0.6' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOnsiY21wZlRva2VuIjp7Imhhc2giOiJmZmZmZmZmZjhiYTIyODBkIiwidG9rZW4iOiIzYWZhOTQyMyIsInVpZCI6MjU2LCJvaWQiOjR9LCJ1c2VybmFtZSI6InpucHpzeSJ9LCJyZXNvdXJjZU5hbWUiOiJWQ1AgUGFydG5lciBQb3J0YWwiLCJpZGxlIjp7ImlkbGVUaW1lb3V0IjoxNzI4MDAsImtlZXBhbGl2ZUludGVydmFsIjoxNX0sImp0aSI6ImNjZDhiZjM2LWVlOGItNGNmOC04ZjBjLTkyNmFiOTQyMGM0NiIsImlhdCI6MTc2OTcwMTE1MSwiZXhwIjoxNzY5NzA0NzUxfQ.4yNQMrwMbGtvkBx93upKeZDdo0uNPmGl3xmVV9Q8hXQ' \
  -H 'Cache-Control: no-cache' \
  -H 'Channel: CC' \
  -H 'Connection: keep-alive' \
  -b 'vcp-sticky=1769698056.722.6172.685497|e29605fb8dee4031b04a723fce990af5; connect.sid=s%3AdvJbWTNOSDlhQBLKXSztaU6ow64U2Y_e.Svp9Waifw8enyRkGZ%2FH5msPf4TOloWqa%2FW36X6hW9ok; JSESSIONID=FB49E9F667E70494281456AA2263C53A' \
  -H 'Pragma: no-cache' \
  -H 'Referer: http://localhost/partnerportal/app.html' \
  -H 'ResourceName: VCP Partner Portal' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'ServiceLabel: Content Management' \
  -H 'TransactionId: 1769701152262' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36' \
  -H 'Username: znpzsy' \
  -H 'orgId: 4' \
  -H 'sec-ch-ua: "Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'userId: 256'

#
#copied the requests as curls. 
#
#Can't I configure sessionAffinity on httpd service as well and be done with it? Wouldn't that work?
#
#But if I route the API paths directly to a3gw service, won't i lose the proxy.conf of httpd? I need these:
#
## CMPF Auth
#ProxyPass        /cmpf-auth-rest/refresh-token http://consolportals-sa-stc-vcp-a3gw-service:8445/refresh-token
#ProxyPassReverse /cmpf-auth-rest/refresh-token http://consolportals-sa-stc-vcp-a3gw-service:8445/refresh-token
#ProxyPass        /cmpf-auth-rest http://consolportals-sa-stc-vcp-a3gw-service:8445/cmpf-rest
#ProxyPassReverse /cmpf-auth-rest http://consolportals-sa-stc-vcp-a3gw-service:8445/cmpf-rest
#
## Portals
## VCP
#ProxyPass        /adminportal http://consolportals-sa-stc-vcp-a3gw-service:8444/adminportal
#ProxyPassReverse /adminportal http://consolportals-sa-stc-vcp-a3gw-service:8444/adminportal
#ProxyPass        /ccportal http://consolportals-sa-stc-vcp-a3gw-service:8444/ccportal
#ProxyPassReverse /ccportal http://consolportals-sa-stc-vcp-a3gw-service:8444/ccportal
#ProxyPass        /partnerportal http://consolportals-sa-stc-vcp-a3gw-service:8444/partnerportal
#ProxyPassReverse /partnerportal http://consolportals-sa-stc-vcp-a3gw-service:8444/partnerportal
#
## Other services
#ProxyPass        /vcp/services http://consolportals-sa-stc-vcp-a3gw-service:8444
#ProxyPassReverse /vcp/services http://consolportals-sa-stc-vcp-a3gw-service:8444
#ProxyPass        /conf http://consolportals-sa-stc-vcp-a3gw-service:8444/conf
#ProxyPassReverse /conf http://consolportals-sa-stc-vcp-a3gw-service:8444/conf
#ProxyPass        /site.json http://consolportals-sa-stc-vcp-a3gw-service:8444/site.json
#ProxyPassReverse /site.json http://consolportals-sa-stc-vcp-a3gw-service:8444/site.json
#ProxyPass        /img/captcha.png http://consolportals-sa-stc-vcp-a3gw-service:8445/captcha.png
#ProxyPassReverse /img/captcha.png http://consolportals-sa-stc-vcp-a3gw-service:8445/captcha.png

```
---
---

You’re thinking in exactly the right direction — **yes**, you *can* “solve it” by making sure a single user consistently hits the **same httpd pod**, because then `sessionAffinity: ClientIP` on the **a3gw Service** will also consistently pick the same a3gw pod (since the source IP becomes “that httpd pod’s IP”).

But there are two big caveats + one cleaner alternative.

---

## 1) “Can I set `sessionAffinity` on the httpd Service and be done?”

### If your traffic is **Client → Service** (no Ingress), then `ClientIP` affinity can work.

But you’re going **Client → Ingress-nginx → httpd Service**.

For the httpd Service, the “client” is **the ingress controller pod**, not your browser. So:

* `sessionAffinity: ClientIP` on httpd Service will stick **Ingress pod → httpd pod**, not **user → httpd pod**.
* With multiple ingress controller replicas, it can still “look random” per user.

So: **it won’t do what you want** in an ingress-based setup.

### The correct “stickiness for end users” at the edge is what you already have:

`nginx.ingress.kubernetes.io/affinity: cookie` and `vcp-sticky`. That’s the right tool for user stickiness.

---

## 2) Why you still see cross-pod behavior even with the same `vcp-sticky` cookie

Your two curl examples are both:

* `http://localhost/...` (same host)
* both send the same `vcp-sticky` cookie

So the edge stickiness is being *sent*.

But note: cookie affinity in ingress-nginx is **per-Ingress upstream**. In your current design, the upstream is **httpd-service**, not a3gw-service.

So you’ve guaranteed:
✅ same user → same httpd pod (most of the time)

But you have *not* guaranteed:
❌ same user → same a3gw pod

Because httpd then calls `consolportals-sa-stc-vcp-a3gw-service:8444/8445`, and that’s chosen by kube-proxy. Your `ClientIP` affinity there is based on **source IP = httpd pod IP**, not the browser.

So if your user ever lands on the other httpd pod (restart, readiness flip, different host rule, etc.), you’ll land on the other a3gw pod.

---

## 3) “If I route API paths directly to a3gw service, won’t I lose httpd proxy.conf?”

You won’t “lose” it — you just won’t *need* httpd to perform those specific proxy rewrites anymore, because **Ingress can do the routing**, and **a3gw already does the downstream routing using its own `proxy.conf`** (your JSON config like `contextList` etc).

That big Apache block you pasted is mainly doing **path mapping from public URLs → internal a3gw endpoints**, e.g.:

* `/cmpf-auth-rest` → `a3gw:8445/cmpf-rest`
* `/img/captcha.png` → `a3gw:8445/captcha.png`
* `/vcp/services` → `a3gw:8444/...`
* `/adminportal` → `a3gw:8444/adminportal`

Ingress can do those mappings too.

### The only things httpd uniquely gives you

* static assets (if you serve them from httpd)
* security headers
* SSL termination (though ingress can do this too)
* any Apache-only tricks (auth modules, advanced rewrite edge cases)

But **simple path routing and rewrite-prefix** is totally doable in ingress-nginx.

---

## 4) The clean solution: keep httpd for portals/static, route API to a3gw with cookie stickiness

### Goal

Make **the `vcp-sticky` cookie select the a3gw pod**, not the httpd pod.

### Approach

Use two ingresses (or one with multiple paths), same host:

* `/adminportal`, `/ccportal`, `/partnerportal` → httpd-service (as today)
* `/cmpf-auth-rest`, `/img/captcha.png`, `/vcp/services`, `/conf`, `/site.json` → **a3gw-service**
  with **cookie affinity enabled on that a3gw upstream**

Then the user will keep hitting the same a3gw pod for both 8444 and 8445.

### Sketch (nginx ingress) of the key idea

(Conceptual — your exact syntax depends on your controller version, but this shows the mapping.)

* `Ingress A (httpd)`:

  * paths: `/adminportal`, `/ccportal`, `/partnerportal`, `/` (optional) → httpd-service

* `Ingress B (a3gw)`:

  * paths:

    * `/cmpf-auth-rest` → a3gw-service port 8445 with rewrite `/cmpf-rest`
    * `/img/captcha.png` → a3gw-service port 8445 with rewrite `/captcha.png`
    * `/vcp/services` → a3gw-service port 8444 (no rewrite needed if a3gw expects it)
    * `/conf` → a3gw-service port 8444
    * `/site.json` → a3gw-service port 8444
  * annotations: `affinity: cookie`, `session-cookie-name: vcp-sticky` etc.

That replaces your Apache ProxyPass mappings for those routes, while preserving behavior.

---

## 5) What I’d do in your sandbox (minimal changes, maximum sanity)

1. **Leave portal/static routes on httpd** (so you keep security headers/static serving exactly as today).
2. **Move only the “must be same a3gw pod” routes** to direct ingress → a3gw:

  * `/cmpf-auth-rest`
  * `/img/captcha.png`
  * `/vcp/services`
  * (maybe `/refresh-token` if it matters)

This will immediately tell you if your “auth on pod1, later on pod2” is purely a routing stickiness problem (it almost certainly is).

---

## Tiny immediate question (no need to answer, but it matters)

Are you using **multiple ingress-nginx controller replicas**? If yes, cookie stickiness still works per-user, but `ClientIP` affinity on services becomes even less meaningful because the source IP can be “different ingress pod” depending on the route.

---

If you upload/paste your **current Ingress rules** (or just the `kubectl get ingress -n stc-vcp-services -o yaml` output), I’ll rewrite them into the split model above with the exact annotations + rewrite targets you need, using your real service names/ports, and you can apply it as-is.

(Uploaded)

Ingress pod stichs to httpd pod, but there's sessionAffinity on a3gw too. So I thought a3gw would stick to the httpd pod as well. Doesn't the cookie stick the user to the ingress pod? that should be enough



-----
Close — but the “sticky points” are **not transitive**, and the cookie doesn’t stick you to an *ingress pod*. It sticks you to an **upstream endpoint** chosen by the ingress controller.

Here’s the key mental model:

## 1) What the cookie actually sticks to

`vcp-sticky` (ingress-nginx cookie affinity) sticks **your browser → a specific endpoint of the Ingress *upstream***.

In your current setup, the upstream is **`httpd-service`**, so the cookie pins you to **one httpd pod**.

It does **not** pin you to:

* a particular ingress-nginx controller pod
* a3gw
* anything beyond that upstream selection

## 2) Why “cookie → ingress pod” is the wrong picture

Even if you always hit the same *ingress controller Service* externally, you are not guaranteed to hit the same ingress controller **pod** every request. That Service load-balances to ingress pods. And even if you *did* hit the same ingress pod, **the cookie isn’t about that** — cookie affinity is about the *upstream* selection the ingress pod makes.

So: **cookie ≠ “stick me to the ingress pod”**
cookie = “for this Host+path rule, pick the same upstream endpoint again.”

## 3) Why your a3gw `sessionAffinity: ClientIP` doesn’t complete the chain

You’re expecting:

**browser (cookie) → ingress → httpd (fixed) → a3gw (fixed)**

But a3gw’s affinity key is **source IP of the connection to the a3gw Service**.

That source IP is **the httpd pod IP** (or sometimes the node/NAT IP), not the browser’s. So a3gw will stick *per-httpd-pod*, not per-user.

That means:

* If you’re always on httpd pod A → you’ll tend to stick to a3gw pod X.
* If you ever end up on httpd pod B (restart, readiness flip, different Ingress rule, etc.) → you’ll tend to stick to a3gw pod Y.

And since you have 2 httpd pods, you have two “client IP identities” as far as a3gw is concerned.

## 4) “But the user has the same vcp-sticky cookie on both requests”

Right — but that cookie is only used by ingress-nginx when selecting **httpd** (because that’s the upstream configured in ingress). Once traffic is inside httpd and it calls `a3gw-service`, that cookie is just an HTTP header going past; Kubernetes Service routing does not use it.

So the cookie being the same does *not* imply the a3gw pod will be the same.

## 5) The one-liner conclusion

Your current architecture gives you:

✅ user → httpd stickiness (via ingress cookie)
✅ httpd-pod → a3gw stickiness (via Service ClientIP)
❌ user → a3gw stickiness (not guaranteed unless user is guaranteed to always hit the same httpd pod forever)

## 6) What “should be enough” would look like

If you want the cookie to be enough, the cookie must be applied at the hop that selects **a3gw**.

That means either:

* Ingress routes `/cmpf-auth-rest` and `/vcp/services` **directly to a3gw-service** with cookie affinity, **or**
* httpd itself load-balances to a3gw pods with its own sticky mechanism (cookie/hash) — Kubernetes Service won’t do cookie-based selection for you.

---

### Small practical note

In *stable* conditions you might *appear* to stick, until something causes you to land on the other httpd pod (even briefly). Then your a3gw affinity flips, and you see exactly what you described: auth on POD1, rest on POD2.

If you want, I can give you the smallest ingress-nginx config change that routes only:

* `/cmpf-auth-rest`
* `/img/captcha.png`
* `/vcp/services`
  to a3gw directly (with the same `vcp-sticky` cookie name), while leaving portals/static on httpd. That’s the minimal “surgical” fix.



----
----

CLAUDE

----
----


The 301 redirect is normal - your httpd/a3gw is redirecting `/partnerportal` to `/partnerportal/index.html`. That's fine.

**The problem is: there's NO `Set-Cookie: vcp-sticky=...` header in the response!**

Look at your YAML - the **`consolportals-sa-stc-vcp-httpd-ingress-local`** (the one with `host: localhost`) is **missing the sticky session annotations**!

When you curl `http://localhost/partnerportal`, you're hitting the `-local` ingress, which doesn't have the cookie affinity configured.

Fix it by adding the sticky annotations to the localhost ingress too:

```yaml
---

# For local development with localhost
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: consolportals-sa-stc-vcp-httpd-ingress-local
  annotations:
    # ADD THESE:
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/session-cookie-name: "vcp-sticky"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "10800"
    nginx.ingress.kubernetes.io/session-cookie-expires: "10800"
    nginx.ingress.kubernetes.io/session-cookie-path: "/"
    nginx.ingress.kubernetes.io/session-cookie-samesite: "Lax"
    
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
spec:
  ingressClassName: nginx
  rules:
    - host: localhost
      http:
        paths:
          - pathType: Prefix
            path: "/"
            backend:
              service:
                name: consolportals-sa-stc-vcp-httpd-service
                port:
                  number: 80
```

Then reapply:
```bash
kubectl apply -f consolportals-sa-stc-vcp-httpd-ingress.yaml -n stc-vcp-services
```

Now try again:
```bash
curl -i http://localhost/partnerportal
```

You should see:
```
Set-Cookie: vcp-sticky=<some-hash>; Path=/; Max-Age=10800; SameSite=Lax
```


-------


What sessionAffinity Actually Does
Here's the critical thing: sessionAffinity: ClientIP in Kubernetes uses iptables rules that hash based on (sourceIP, protocol, destPort).
So if httpd pod 10.1.5.47 connects to:

Port 8444 → hashes to a3gw pod #1
Port 8445 → might hash to a3gw pod #2 (different port = different hash)




This is by design in Kubernetes! Each Service port gets its own load balancing.


----

Short answer: **yes, you’re circling the *right* mechanism**, but the exact statement needs a small correction.

> **Kubernetes `sessionAffinity: ClientIP` is *not* based on a hash of `(sourceIP, protocol, destPort)`**
> …but **iptables *does* create per-Service, per-port affinity rules**, which *can* result in different backend pods for different destination ports **even within the same Service**.

That nuance is exactly why your **8444 vs 8445** behavior is happening.

Let’s anchor this properly with docs + how kube-proxy actually works.

---

## 1. What Kubernetes *officially* says

From the Kubernetes Service docs (emphasis mine):

> *“When `sessionAffinity` is set to `ClientIP`, kube-proxy sends traffic from a given client IP address to the same Pod **for a given Service port**.”*

Source (official docs):
[https://kubernetes.io/docs/concepts/services-networking/service/#session-affinity](https://kubernetes.io/docs/concepts/services-networking/service/#session-affinity)

That “**for a given Service port**” line is the killer detail.

So:

* Affinity is **scoped to (Service, port)**
* Not to “Service as a whole”

---

## 2. What kube-proxy actually implements (iptables mode)

In **iptables mode** (which you are using on Docker Desktop / most clusters):

* kube-proxy creates **separate iptables chains per Service *port***
* For each `(ServiceIP, port)` pair, it creates:

  * an **affinity set** keyed by **source IP**
  * a timeout (`timeoutSeconds`)
* Each port has its **own affinity table**

Conceptually (simplified):

```
Service A:
  port 8444 → affinity map { clientIP → podX }
  port 8445 → affinity map { clientIP → podY }
```

So even if:

* same Service
* same client IP (httpd pod)
* same user
* same cookie

👉 **different ports = different affinity decisions**

This is **documented behavior**, even though the exact iptables hash tuple is not spelled out as `(srcIP, proto, destPort)` in docs.

---

## 3. Why your intuition was *almost* right

Your statement:

> “iptables rules hash based on (sourceIP, protocol, destPort)”

What’s *effectively* true is:

* The affinity decision is **per Service port**
* The connection tuple includes destination port
* Therefore, **port becomes part of the selection boundary**

So while Kubernetes doesn’t describe it as a literal hash of those fields, **the outcome is indistinguishable from that model**.

In your case:

| Request           | Service      | Port | Result |
| ----------------- | ------------ | ---- | ------ |
| `/cmpf-auth-rest` | a3gw-service | 8445 | POD1   |
| `/vcp/services`   | a3gw-service | 8444 | POD2   |

✔ same source IP (httpd pod)
✔ same Service
❌ different Service port → **different affinity map**

---

## 4. This fully explains your observed behavior

You have:

```yaml
ports:
- name: auth
  port: 8445
- name: app
  port: 8444
```

And:

```yaml
sessionAffinity: ClientIP
```

So Kubernetes guarantees:

> “Same client IP → same pod **for port 8445**”
> “Same client IP → same pod **for port 8444**”

But it makes **no guarantee** that:

* the pod chosen for 8445
* and the pod chosen for 8444
  will be the same.

In fact, statistically, with 2 pods:

* first port may map to pod A
* second port may map to pod B

Exactly what you’re seeing.

---

## 5. This also explains why cookies can’t fix this

Even if:

* ingress cookie sticks you to httpd pod X
* httpd pod X is the client IP

You still get:

* affinity decision #1 for `(X → 8445)`
* affinity decision #2 for `(X → 8444)`

Cookies are **completely invisible** to kube-proxy.

---

## 6. Canonical “aha” summary (this is the key takeaway)

> **Kubernetes `ClientIP` sessionAffinity is scoped to a Service *port*, not the Service.**
> Therefore, **multi-port Services cannot guarantee same-backend stickiness across ports.**

This is not a bug. This is how it is designed.

---

## 7. What *would* guarantee same a3gw pod?

Only one of these:

1. **Single port on the Service**
   (8444 and 8445 behind one port, routed internally inside a3gw)

2. **Ingress cookie affinity directly to a3gw**
   (cookie selects pod, not Service port)

3. **Single a3gw replica**
   (brute-force correctness)

4. **Application-level stickiness**
   (a3gw stores captcha/auth state somewhere shared or encodes it into tokens)

---

## 8. Why this was a *very* good question

You didn’t just notice “it’s not sticky” — you noticed:

* same cookie
* same Service
* same client IP
* different pods
* different ports

That’s exactly the boundary where Kubernetes affinity semantics trip people up — even senior platform engineers.

Your mental model was missing **one clause**:

> *“…for a given Service port.”*

Once you add that, everything you’re seeing becomes boringly deterministic.

If you want, next we can:

* redesign the a3gw Service shape (single port vs split)
* or sketch the clean ingress split that preserves httpd where it matters and gives you true per-user a3gw stickiness
