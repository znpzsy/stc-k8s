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

# Quick Reference

Here's a quick reference for inspecting your namespace:

**Quick Overview:**
```bash
# Everything at once
kubectl get all -n consolportals-test

# Or more detailed
kubectl get all,cm,secret,ingress -n consolportals-test
```

**Individual Resources:**
```bash
# Pods
kubectl get pods -n consolportals-test
kubectl get pods -n consolportals-test -o wide  # Shows node, IP

# Deployments
kubectl get deployments -n consolportals-test
kubectl get deploy -n consolportals-test  # Short form

# Services
kubectl get services -n consolportals-test
kubectl get svc -n consolportals-test  # Short form

# Ingress
kubectl get ingress -n consolportals-test
kubectl get ing -n consolportals-test  # Short form

# ConfigMaps & Secrets
kubectl get configmaps -n consolportals-test
kubectl get secrets -n consolportals-test

# ReplicaSets
kubectl get replicasets -n consolportals-test
kubectl get rs -n consolportals-test  # Short form
```

**Detailed Information:**
```bash
# Describe any resource for details
kubectl describe pod <pod-name> -n consolportals-test
kubectl describe svc <service-name> -n consolportals-test
kubectl describe ingress <ingress-name> -n consolportals-test
kubectl describe deployment <deployment-name> -n consolportals-test

# Get YAML/JSON output
kubectl get pod <pod-name> -n consolportals-test -o yaml
kubectl get svc <service-name> -n consolportals-test -o json
```

**Logs & Events:**
```bash
# Pod logs
kubectl logs <pod-name> -n consolportals-test
kubectl logs -f <pod-name> -n consolportals-test  # Follow logs
kubectl logs deployment/<deployment-name> -n consolportals-test

# Events (troubleshooting)
kubectl get events -n consolportals-test
kubectl get events -n consolportals-test --sort-by='.lastTimestamp'

# Previous container logs (if crashed)
kubectl logs <pod-name> -n consolportals-test --previous
```

**Resource Usage:**
```bash
# Pod resource usage (if metrics-server is installed)
kubectl top pods -n consolportals-test
kubectl top nodes
```

**Helm-Specific:**
```bash
# List Helm releases in namespace
helm list -n consolportals-test

# Get Helm release info
helm status consolportals-test -n consolportals-test

# Get Helm values
helm get values consolportals-test -n consolportals-test

# Get full manifest
helm get manifest consolportals-test -n consolportals-test
```

**Pro Tips:**
```bash
# Set default namespace (so you don't need -n every time)
kubectl config set-context --current --namespace=consolportals-test

# Now these work without -n flag:
kubectl get pods
kubectl get svc

# Watch resources in real-time
kubectl get pods -n consolportals-test -w
kubectl get events -n consolportals-test -w

# Filter by label
kubectl get pods -n consolportals-test -l component=vcp-httpd
kubectl get all -n consolportals-test -l component=vcp-a3gw
```

**One-Liner Health Check:**
```bash
# Quick status of everything
kubectl get pods,svc,ingress -n consolportals-test -o wide
```

Most useful day-to-day? Probably `kubectl get all -n consolportals-test` and `kubectl describe <resource>` when you need details!


----------------------

Looking back at your cluster info, `10.35.36.240` is the **ingress-nginx-controller's LoadBalancer external IP**, assigned by MetalLB:

```
NAMESPACE         NAME                         TYPE           CLUSTER-IP       EXTERNAL-IP    PORT(S)
ingress-nginx     ingress-nginx-controller     LoadBalancer   10.103.148.135   10.35.36.240   80:31314/TCP,443:30759/TCP
```

**What this means:**
- **MetalLB** (the load balancer system running in the cluster) assigned this IP
- It's the **single entry point** for all HTTP/HTTPS traffic into the cluster
- The nginx ingress controller listens on this IP
- All ingress rules (yours, keycloak, config-server, etc.) share this same IP
- The ingress controller routes traffic based on the `host` header in requests

**How it works:**
```
Browser Request
    ↓
http://consolportals.internal.telenity.com/adminportal
    ↓
DNS/hosts file resolves to → 10.35.36.240
    ↓
Hits ingress-nginx-controller (listening on 10.35.36.240:80)
    ↓
Ingress controller checks Host header: "consolportals.internal.telenity.com"
    ↓
Matches your ingress rule
    ↓
Routes to your httpd service
```

That's why setting the `host:` field in your ingress was important - it tells the ingress controller "only route traffic to my service if the Host header matches my hostname." Without it, you'd catch traffic meant for other services!

It's basically a shared gateway for the entire cluster.
