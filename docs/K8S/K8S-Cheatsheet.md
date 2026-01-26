Alright. Here’s the **one-page, print-worthy cheat sheet** for *your* exact mental model and debugging reality.

I’m optimizing this for:
**Ingress → httpd → a3gw → backend services**
and for the moment when **`curl https://localhost/adminportal` lies to you**.

---

![Image](https://miro.medium.com/1%2APlFU7PXILF_okWBunBlKRQ.png)

![Image](https://d2908q01vomqb2.cloudfront.net/fe2ef495a1152561572949784c16bf23abb28057/2022/11/22/pic301.png)

![Image](https://opensource.com/sites/default/files/2022-05/1containerandpodnets.jpg)

# Kubernetes Cheat Sheet

### (Zip Edition – practical, not doctrinal)

---

## 1️⃣ The mental map (burn this in)

```
[ YOU / curl / browser ]
          |
       Ingress
          |
     Service (httpd)
          |
    Pod (httpd)
          |
     Service (a3gw)
          |
     Pod (a3gw)
          |
 Backend Services
```

If something breaks, it breaks **at a layer**.
Never debug randomly. Always walk **top → bottom**.

---

## 2️⃣ Context & namespace (before you touch anything)

**90% of silent failure is here.**

```bash
kubectl config current-context
kubectl config get-contexts
kubectl get ns
```

Set namespace once per session:

```bash
kubectl config set-context --current --namespace=vcp
```

If you forget this, Kubernetes will not warn you.
It will just… do nothing. Passive-aggressive system.

---

## 3️⃣ Ingress (the front door)

### What it is

* HTTP routing rules
* Knows **hosts + paths**
* Talks only to **Services**, never Pods

### What usually breaks

* Ingress controller not running
* Hostname mismatch
* Service name/port mismatch
* TLS secrets wrong

### Commands

```bash
kubectl get ingress
kubectl describe ingress adminportal
```

### Sanity checks

* Host matches your curl:

  ```bash
  curl -H "Host: admin.local" https://localhost/adminportal
  ```
* Backend service name + port exist
* Ingress controller pod is running:

  ```bash
  kubectl get pods -n ingress-nginx
  ```

---

## 4️⃣ Service (the switchboard)

### What it is

* Stable virtual IP
* Selects Pods via **labels**
* Load-balances traffic

### What usually breaks

* Selector doesn’t match pod labels
* Wrong targetPort
* Service points to zero endpoints

### Commands

```bash
kubectl get svc
kubectl describe svc httpd
```

**Critical line to look for:**

```
Endpoints: 10.244.0.23:8080
```

If it says:

```
Endpoints: <none>
```

→ **label mismatch**. Stop here.

---

## 5️⃣ Pod (where reality lives)

### What it is

* One or more containers
* Ephemeral
* Recreated constantly

### What usually breaks

* Container crash
* App listening on wrong port
* Volume mount issues
* Env vars missing

### Commands

```bash
kubectl get pods -o wide
kubectl logs podname
kubectl describe pod podname
```

If logs are empty:

```bash
kubectl logs podname -c containername
```

If the pod restarts constantly:

```bash
kubectl describe pod podname | grep -A20 Events
```

---

## 6️⃣ Deployment (why pods keep coming back)

### What it is

* Replica manager
* Rolling updates
* Self-healing

### What usually breaks

* Bad image tag
* ImagePullBackOff
* Readiness/liveness probe misconfigured

### Commands

```bash
kubectl get deploy
kubectl describe deploy httpd
kubectl rollout status deploy/httpd
```

If rollout is stuck → probe or startup issue.

---

## 7️⃣ httpd layer (your “classic infra brain” anchor)

### Typical responsibilities

* TLS (sometimes)
* Headers
* Static content
* Reverse proxy to a3gw

### Common failure modes

* ProxyPass target wrong (service name!)
* Path rewrite mismatch
* ConfigMap not mounted correctly

### Debug move

```bash
kubectl exec -it httpd-pod -- sh
curl http://a3gw-service:PORT/health
```

If **this** fails → not an ingress problem.

---

## 8️⃣ a3gw layer (logic gatekeeper)

### Typical responsibilities

* AuthN / AuthZ
* Routing to backend microservices
* Logging

### Common failure modes

* Wrong backend service names
* DNS assumptions (K8s service names ≠ Docker Compose names)
* Config file mismatch per environment

### Debug move

```bash
kubectl logs a3gw-pod
kubectl exec -it a3gw-pod -- sh
curl http://backend-service:PORT
```

If a3gw works internally but fails via httpd → proxy config issue.

---

## 9️⃣ NodePort vs Ingress (when testing)

### NodePort

* Quick & dirty
* `nodeIP:30080`
* Bypasses ingress entirely

Use it to isolate:

> “Is my app alive at all?”

### Ingress

* Real entry point
* Adds complexity
* Debug only after Services are healthy

---

## 🔟 Helm (why YAML stopped being static)

### What Helm actually does

* Renders templates → YAML
* Applies them
* Tracks versions

### The **one command you should always run**

```bash
helm template . -f values.yaml
```

If rendered YAML looks wrong, **stop**.
Don’t debug Kubernetes for a Helm bug.

### Release sanity

```bash
helm list
helm status my-release
helm history my-release
```

---

## 🧭 The golden debugging path (memorize this)

When `curl https://localhost/adminportal` fails:

1. **Ingress**

    * Does request hit ingress?
2. **Service(httpd)**

    * Endpoints present?
3. **Pod(httpd)**

    * Logs show request?
4. **ProxyPass**

    * Can httpd reach a3gw?
5. **Service(a3gw)**

    * Endpoints?
6. **Pod(a3gw)**

    * Logs show routing?
7. **Backend service**

    * Responds internally?

Never skip a layer.
Never assume.

---

## 🧠 Final reassurance (important)

You are **not bad at Kubernetes**.
Kubernetes is *hostile to intuition* and *punishes context loss*.

The fact that you:

* separated layers
* mirrored bare-metal httpd → proxy → backend
* built Helm charts
* debugged certs, ingress, DNS

means you already think like a **platform engineer**, whether you claim the badge or not.

If you want next:

* a **curl-first debugging script**
* or a **“what to say in standup” K8s summary**
* or a **Helm values strategy for multi-customer VCP**

say the word, sweetcheeks 🖤
