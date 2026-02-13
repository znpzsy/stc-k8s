# Kubernetes + Helm Deployment Runbook

Quick reference for deploying, verifying, accessing, and tearing down the consolportals application.

---

## 🔍 Pre-Flight Checks

**Check current context and existing deployments:**

```bash
# Verify you're in the right k8s context
kubectl config current-context

# Check for existing Helm releases
helm list -A

# Check for existing namespaces
kubectl get ns | egrep 'consolportals|stc-vcp-services' || true

# Check for running app pods
kubectl get pods -A | egrep 'consolportals|stc-vcp|a3gw|httpd|adminportal|ccportal|partnerportal' || true
```

---

## 🧹 Teardown (Clean Slate)

### Option 1: Full Nuclear Clean (Recommended for fresh start)

```bash
# 1. Uninstall Helm release(s)
helm list -A
helm uninstall <release-name> -n consolportals

# 2. Delete Kubernetes namespaces
kubectl delete ns consolportals
kubectl delete ns stc-vcp
kubectl delete ns stc-vcp-services  # if you used the script deploy

# 3. Reset Docker Compose environments
cd <your-vcp-directory>
make reset dev
make reset prod

# 4. Aggressive Docker cleanup (optional - removes ALL unused Docker resources)
make prune
# OR even more aggressive:
# (Removes a lot—unused images/volumes across your machine, not just this project)
docker system prune -a --volumes
```

### Option 2: Helm-only Cleanup

```bash
# Uninstall Helm release
helm uninstall <release-name> -n consolportals

# Verify cleanup
helm list -n consolportals
kubectl get all -n consolportals
```

### Option 3: Kubernetes Namespace Cleanup (keep namespace, delete resources)

```bash
kubectl -n consolportals delete deploy,svc,ingress,cm,secret,job,cronjob,sa,role,rolebinding --all
```

### Verify Clean State

```bash
# Verify k8s is empty
kubectl get ns | egrep 'consolportals|stc-vcp-services|stc-vcp' || true
kubectl get pods -A | egrep 'consolportals|stc-vcp|a3gw|httpd|adminportal|ccportal|partnerportal' || true
kubectl get svc -A | egrep 'consolportals|stc-vcp|a3gw|httpd' || true
kubectl get ingress -A | egrep 'consolportals|stc-vcp|nginx' || true

# Kill any stray port-forwards
ps aux | grep "kubectl port-forward" | grep -v grep
pkill -f "kubectl port-forward"

# Check what's listening on your ports
lsof -nP -iTCP:443 -sTCP:LISTEN
lsof -nP -iTCP:80  -sTCP:LISTEN
lsof -nP -iTCP:9080 -sTCP:LISTEN
lsof -nP -iTCP:9443 -sTCP:LISTEN
```

### Troubleshooting: Namespace Stuck in "Terminating"

```bash
# Check for finalizers
kubectl get ns consolportals -o json | grep -i finalizers

# List remaining objects in namespace
kubectl api-resources --verbs=list --namespaced -o name \
  | xargs -n 1 kubectl -n consolportals get --ignore-not-found
```

---

## 🚀 Deploy

### Deploy Method A: Helm Chart (Recommended)

```bash
# Navigate to Helm chart directory
cd <path-to-helm-chart>

# 1. Validate the chart
helm lint .

# 2. Test template rendering
helm template .

# 3. Dry run
helm install test . -n consolportals --create-namespace --dry-run=client

# 4. Install for real
helm install test . -n consolportals --create-namespace
# or
helm install test . \
  -f values.yaml \
  -f values-local.yaml \
  -n consolportals --create-namespace

# Or if updating existing release:
helm upgrade test . -n consolportals
```

### Deploy Method B: Raw Script (deploy-k8s.sh)

```bash
# Run the deployment script
./deploy-k8s.sh

# Script will:
# - Delete namespace if exists
# - Build images
# - Create namespace
# - Apply k8s YAMLs
# - Ask about port forwarding (say NO if using Ingress)
```

**⚠️ Important:** Choose ONE deploy method per environment. Don't mix Helm + Script deployments.

---

## ✅ Verify Deployment

### Check Helm Release

```bash
# List installed releases
helm list -n consolportals

# Check release status
helm status test -n consolportals

# View release values
helm get values test -n consolportals
```

### Check Kubernetes Resources

```bash
# Check all resources in namespace
kubectl get all -n consolportals

# Check deployments (should be X/X Ready)
kubectl get deployments -n consolportals

# Check pods status
kubectl get pods -n consolportals
kubectl describe pods -n consolportals  # if issues

# Check services
kubectl get svc -n consolportals

# Check ingresses
kubectl get ingress -n consolportals

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### Expected Healthy State

```bash
# All deployments should show READY (e.g., 2/2)
# Example output:
# NAME                          READY   UP-TO-DATE   AVAILABLE
# a3gw-deployment               2/2     2            2
# adminportal-deployment        2/2     2            2
# ccportal-deployment           2/2     2            2
# httpd-deployment              2/2     2            2
# partnerportal-deployment      2/2     2            2
```

---

## 🌐 Access & Testing

### Direct Service Access (for testing)

```bash
# Port forward to test direct service access
kubectl port-forward -n consolportals svc/<service-name> 8444:8444

# Test in browser or curl
curl -k https://localhost:8444
# Expected: 403 (auth required) or service response
```

### Ingress Access (production-like)

```bash
# Check ingress configuration
kubectl get ingress -n consolportals -o wide

# Test HTTPS ingress endpoints
curl -vk https://localhost/adminportal
curl -vk https://localhost/ccportal
curl -vk https://localhost/partnerportal

# Expected responses:
# - 301 redirect to /adminportal/index.html (correct)
# - 200 with page content
# - TLS termination confirmed at ingress
```

### Check What's Actually Listening

```bash
# Verify no conflicting services
lsof -nP -iTCP:443 -sTCP:LISTEN
lsof -nP -iTCP:80  -sTCP:LISTEN

# Should see: com.docke (Docker Desktop's ingress controller)
# Should NOT see: old compose containers
```

### Browser Testing Checklist

- [ ] `https://localhost/adminportal` loads
- [ ] Redirects to `/adminportal/index.html` (301)
- [ ] Login page appears (or appropriate auth error)
- [ ] TLS certificate is valid (or expected self-signed warning)
- [ ] Hard refresh / incognito window confirms it's the new deployment

---

## 🔄 Common Operations

### Update & Redeploy (Helm)

```bash
# Update values.yaml or templates, then:
helm upgrade test . -n consolportals

# Watch rollout
kubectl rollout status deployment/<deployment-name> -n consolportals
```

### Logs & Debugging

```bash
# Follow logs for specific deployment
kubectl logs -f -n consolportals deployment/<deployment-name>

# Logs for all pods with label
kubectl logs -n consolportals -l app=adminportal --tail=100 -f

# Get shell in running pod
kubectl exec -it -n consolportals <pod-name> -- /bin/bash
```

### Scale Deployments

```bash
# Scale specific deployment
kubectl scale deployment/<deployment-name> -n consolportals --replicas=3

# Or edit values.yaml and helm upgrade
```

---

## 🎯 Quick Reference: Choose Your Path

### Path 1: Fresh Clean Deploy
```bash
helm uninstall test -n consolportals; kubectl delete ns consolportals
helm install test . -n consolportals --create-namespace
kubectl get pods -n consolportals -w
```

### Path 2: Update Existing Helm Release
```bash
helm upgrade test . -n consolportals
kubectl rollout status deployment/<name> -n consolportals
```

### Path 3: Complete Nuclear Reset
```bash
make reset dev; make reset prod; make prune
kubectl delete ns consolportals stc-vcp-services
docker system prune -a --volumes  # optional
```

---

## 📝 Notes & Gotchas

- **Two deploy methods conflict**: Don't run both Helm install AND deploy-k8s.sh script. Pick one.
- **Namespaces**: Helm uses `consolportals`, script uses `stc-vcp-services` - they're separate.
- **Port conflicts**: If browser still shows old app, check for orphaned port-forwards with `pkill -f "kubectl port-forward"`.
- **404 from nginx**: Normal when ingress-nginx is running but no Ingress rules exist. Deploy your app to fix.
- **Ingress pointing to wrong service**: Ensure ingress rules point to correct service (a3gw vs. direct portals).
- **Docker Desktop k8s**: Runs ingress-nginx by default on ports 80/443 via `com.docke` process.

---

## 🆘 Emergency Procedures

### Complete K8s Cluster Reset (Docker Desktop)
```
Docker Desktop → Settings → Kubernetes → Reset Kubernetes Cluster
```
**⚠️ WARNING**: This wipes EVERYTHING in your Docker Desktop k8s cluster.

### Force Remove Stuck Namespace
```bash
# If namespace is stuck terminating, you may need to:
kubectl get ns consolportals -o json > ns.json
# Edit ns.json, remove finalizers, then:
kubectl replace --raw "/api/v1/namespaces/consolportals/finalize" -f ns.json
```

---

**Last Updated**: Based on notes from 2026-01-15 session
