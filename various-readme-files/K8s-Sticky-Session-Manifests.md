Normally:


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
│  • Routes to portals and backend APIs                       │
│  • Session management ? (stateless nodejs proxy server)     │
│    Since A3GW is stateless by nature, httpd should fwd      │
│    incoming requests to the same pod in K8S/helm setups     │
│    otherwise audit logging won't make sense,                │
│    and captcha might not work                               │
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
