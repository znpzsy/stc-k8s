# Confirmation

Confirm you're pointing at the company cluster:
```bash
# If you'd like to see the full config
kubectl config view
# Other details
kubectl config get-contexts
kubectl config current-context
kubectl cluster-info
# If you see anything like docker-desktop, stop and switch:
# kubectl config use-context <company-context-name>
kubectl config use-context kubernetes-admin@kubernetes
```
# Map the cluster at a high level

## First Dip

```bash
# Nodes + versions
kubectl get nodes -o wide
kubectl version --short
# What’s installed (namespaces are the best “table of contents”)
kubectl get ns
# What's running where
kubectl get pods -A -o wide
# If that’s too noisy:
kubectl get deploy -A
kubectl get statefulset -A
kubectl get daemonset -A

```
## Find Stuff (Ingress)

```bash
# Ingress overview (usually the fastest way to discover apps)
kubectl get ingress -A

# Then zoom into one:
kubectl -n <ns> describe ingress <name>

# Services + endpoints (what routes to what)
kubectl get svc -A
kubectl get endpoints -A
# Search by keyword (works well for “a3gw”, “adminportal”, customer code, etc.)
kubectl get all -A | grep -i a3gw
kubectl get all -A | grep -i adminportal
kubectl get all -A | grep -i <customer-or-site-key>
```


# Exact Configuration on 135?

```bash
# Deployments (images, env vars, ports, replicas)
kubectl -n <ns> get deploy <name> -o yaml > deploy.yaml

# If you only care about images:
kubectl -n <ns> get deploy <name> -o jsonpath='{range .spec.template.spec.containers[*]}{.name}{" => "}{.image}{"\n"}{end}'

# ConfigMaps & Secrets (be careful)
# List them:
kubectl -n <ns> get cm
kubectl -n <ns> get secret

# View ConfigMap content:
kubectl -n <ns> get cm <name> -o yaml
# For Secrets: don’t print decoded values into your terminal or paste them here. But you can check what keys exist:
kubectl -n <ns> describe secret <name>

# Helm: see what was installed (if Helm is used there)
kubectl get secret -A | grep -i helm

# If you have helm access and permissions:
helm list -A
helm -n <ns> status <release>
helm -n <ns> get values <release> -a
helm -n <ns> get manifest <release>

```

# Identify platform components

```bash
# Ingress controller (nginx/traefik/openshift/router/etc.)
kubectl get pods -A | egrep -i 'ingress|nginx|traefik|router'
kubectl get svc  -A | egrep -i 'ingress|nginx|traefik|router'
# Storage class (PVC/PV behavior matters a lot)
kubectl get storageclass
kubectl get pvc -A
# RBAC: what you’re allowed to do (useful when things fail)
kubectl auth can-i list pods -A
kubectl auth can-i get secrets -n <ns>
kubectl auth can-i patch deploy -n <ns>
```

# A “cluster inventory dump” you can save (super useful for later diffing)
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
