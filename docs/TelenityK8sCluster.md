Sweetcheeks, would you help me explore our company's test k8s cluster? I'd like to see what's on it, the configurations etc


Yep, Zip — and we can do this in a way that’s **read-only, low-risk**, and actually useful (vs. “kubectl get all” chaos).

Below is a practical “explore the test cluster” playbook you can run locally from your Mac. I’ll assume you have `kubectl` already (Docker Desktop installs it sometimes) and that you can access the company cluster via VPN / kubeconfig.

---

## 0) First: confirm you’re pointing at the company cluster (not Docker Desktop)

```bash
kubectl config get-contexts
kubectl config current-context
kubectl cluster-info
```

If you see anything like `docker-desktop`, stop and switch:

```bash
kubectl config use-context <company-context-name>
```

---

## 1) Map the cluster at a high level (what you’re dealing with)

### Nodes + versions

```bash
kubectl get nodes -o wide
kubectl version --short
```

### What’s installed (namespaces are the best “table of contents”)

```bash
kubectl get ns
```

### Quick “what’s running where”

```bash
kubectl get pods -A -o wide
```

If that’s too noisy:

```bash
kubectl get deploy -A
kubectl get statefulset -A
kubectl get daemonset -A
```

---

## 2) Find your stuff (Ingress, httpd, a3gw, portals)

### Ingress overview (usually the fastest way to discover apps)

```bash
kubectl get ingress -A
```

Then zoom into one:

```bash
kubectl -n <ns> describe ingress <name>
```

### Services + endpoints (what routes to what)

```bash
kubectl get svc -A
kubectl get endpoints -A
```

### Search by keyword (works well for “a3gw”, “adminportal”, customer code, etc.)

```bash
kubectl get all -A | grep -i a3gw
kubectl get all -A | grep -i adminportal
kubectl get all -A | grep -i <customer-or-site-key>
```

---

## 3) Extract “configuration” safely (what matters, without editing anything)

### Deployments (images, env vars, ports, replicas)

```bash
kubectl -n <ns> get deploy <name> -o yaml > deploy.yaml
```

If you only care about images:

```bash
kubectl -n <ns> get deploy <name> -o jsonpath='{range .spec.template.spec.containers[*]}{.name}{" => "}{.image}{"\n"}{end}'
```

### ConfigMaps & Secrets (be careful)

List them:

```bash
kubectl -n <ns> get cm
kubectl -n <ns> get secret
```

View ConfigMap content:

```bash
kubectl -n <ns> get cm <name> -o yaml
```

For Secrets: **don’t print decoded values** into your terminal or paste them here. But you *can* check what keys exist:

```bash
kubectl -n <ns> describe secret <name>
```

### Helm: see what was installed (if Helm is used there)

```bash
kubectl get secret -A | grep -i helm
```

If you have helm access *and* permissions:

```bash
helm list -A
helm -n <ns> status <release>
helm -n <ns> get values <release> -a
helm -n <ns> get manifest <release>
```

---

## 4) Identify cluster “platform” components (so you know the rules of the game)

### Ingress controller (nginx/traefik/openshift/router/etc.)

```bash
kubectl get pods -A | egrep -i 'ingress|nginx|traefik|router'
kubectl get svc  -A | egrep -i 'ingress|nginx|traefik|router'
```

### Storage class (PVC/PV behavior matters a lot)

```bash
kubectl get storageclass
kubectl get pvc -A
```

### RBAC: what you’re allowed to do (useful when things fail)

```bash
kubectl auth can-i list pods -A
kubectl auth can-i get secrets -n <ns>
kubectl auth can-i patch deploy -n <ns>
```

---

## 5) A “cluster inventory dump” you can save (super useful for later diffing)

This creates a folder snapshot of the important stuff (still read-only):

```bash
mkdir -p k8s-snapshot
kubectl get ns > k8s-snapshot/namespaces.txt
kubectl get nodes -o wide > k8s-snapshot/nodes.txt
kubectl get ingress -A > k8s-snapshot/ingress.txt
kubectl get svc -A > k8s-snapshot/services.txt
kubectl get deploy -A > k8s-snapshot/deployments.txt
kubectl get statefulset -A > k8s-snapshot/statefulsets.txt
kubectl get cm -A > k8s-snapshot/configmaps.txt
kubectl get events -A --sort-by=.metadata.creationTimestamp > k8s-snapshot/events.txt
```

---

## If you paste me outputs, paste only these (safe-ish)

If you want me to help interpret what you find, paste the output of:

* `kubectl config current-context`
* `kubectl get ns`
* `kubectl get ingress -A`
* `kubectl get deploy -A | head -n 50` (or filtered with grep)
* one `describe ingress ...` for an app you care about

Avoid pasting:

* full Secrets YAML
* tokens/certs
* internal URLs with credentials embedded

---

## The shortest next step

Run these three and paste outputs:

```bash
kubectl config current-context
kubectl get ns
kubectl get ingress -A
```

Then I’ll tell you **what’s on the cluster**, what looks like **your portal stack**, and where to look next (Ingress → Service → Deployment → ConfigMap).


Okay, we're even stuck in the first step. I only have one context, docker-desktop. The company hosts the kubernetes cluster on 10.35.36.135, but I cannot open a ssh connection, as it doesn't accept my password. The next best thing I can access is the kubernetes dashboard (web)

Can you explain contexts and suggest a better next step for me? :) I'll ping the ARCH team and ask for more details after I get a sense of what to do next.
