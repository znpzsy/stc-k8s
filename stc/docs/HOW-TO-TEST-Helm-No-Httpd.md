# How to Test: Helm Chart (No httpd)

This guide walks you through running and testing the VCP stack using the **Helm chart that does not include httpd**. Traffic flow: **Ingress (or port-forward) → a3gw directly**; optional **memcached** is included. There is no Apache httpd container.

---

## Prerequisites

- **kubectl** configured for a Kubernetes cluster (Docker Desktop, minikube, kind, or corporate).
- **Helm 3** installed.
- **Docker** (if you need to build and push/load images).
- For **Ingress** access: NGINX Ingress Controller installed (e.g. `minikube addons enable ingress`).

---

## 1. Prepare the cluster and namespace

```bash
kubectl create namespace stc-vcp-services --dry-run=client -o yaml | kubectl apply -f -
```

For local testing with images built on your machine, use **values-local.yaml** (tags without `-amd64`) and ensure the cluster can pull or load those images.

---

## 2. Install the chart

All commands below assume you are in **stc/vcp** (parent of the `helm-no-httpd` directory).

### 2.1 Default / local (ClusterIP + Ingress)

Ingress is enabled; default host in **values.yaml** is `consolportals.internal.telenity.com`. For local testing, override with **values-local.yaml** so `ingress.host` is `localhost`.

```bash
cd stc/vcp
helm upgrade --install consolportals ./helm-no-httpd \
  -f helm-no-httpd/values.yaml \
  -f helm-no-httpd/values-local.yaml \
  -n stc-vcp-services
```

### 2.2 Dev overrides

```bash
helm upgrade --install consolportals ./helm-no-httpd \
  -f helm-no-httpd/values.yaml \
  -f helm-no-httpd/values-dev.yaml \
  -n stc-vcp-services
```

### 2.3 Production-like

Use default values (and optional custom file) with your namespace and registry:

```bash
helm upgrade --install consolportals ./helm-no-httpd \
  -f helm-no-httpd/values.yaml \
  -n stc-vcp-services
```

---

## 3. Wait for pods to be ready

```bash
kubectl get pods -n stc-vcp-services -w
```

Wait until all pods are `Running` and ready. This chart deploys:

- a3gw (and optional log tail sidecar)
- adminportal, ccportal, partnerportal
- memcached (if `memcached.enabled` is true in values)

No httpd pods.

```bash
kubectl get svc,ingress -n stc-vcp-services
```

---

## 4. How to access and test

The chart creates **multiple Ingress resources** (auth-refresh, auth, captcha, services, main). They all route to the a3gw service; the host you use must match `ingress.host` (or `ingress.extraHosts`).

### 4.1 If Ingress is enabled and you use localhost (values-local.yaml)

Ensure the Ingress controller is reachable on localhost (e.g. Docker Desktop or `minikube tunnel`).

| What            | URL |
|-----------------|-----|
| Admin Portal    | http://localhost/adminportal |
| CC Portal       | http://localhost/ccportal |
| Partner Portal  | http://localhost/partnerportal |
| site.json       | http://localhost/site.json |
| Auth refresh    | http://localhost/cmpf-auth-rest/refresh-token (POST) |
| VCP services    | http://localhost/vcp/services/... |

**Minikube:** If Ingress is not on localhost, use `minikube ip` and add a hosts entry, or run `minikube tunnel` and use `http://localhost/...`.

### 4.2 If Ingress uses a custom host (e.g. consolportals.internal.telenity.com)

Add the host to `/etc/hosts` (or Windows equivalent) pointing to your Ingress controller’s IP (e.g. minikube IP), then open:

- http://consolportals.internal.telenity.com/adminportal  
- http://consolportals.internal.telenity.com/ccportal  
- http://consolportals.internal.telenity.com/partnerportal  
- http://consolportals.internal.telenity.com/site.json  

### 4.3 If Ingress is disabled (ingress.enabled: false)

Use port-forward to the a3gw service:

```bash
kubectl port-forward svc/consolportals-sa-stc-vcp-a3gw-service 8444:8444 8445:8445 -n stc-vcp-services
```

Then:

- http://localhost:8444/adminportal  
- http://localhost:8444/ccportal  
- http://localhost:8444/partnerportal  
- http://localhost:8444/site.json  

---

## 5. Verification checklist

| Check | How |
|-------|-----|
| Release exists | `helm list -n stc-vcp-services` |
| All pods Running (no httpd) | `kubectl get pods -n stc-vcp-services` |
| a3gw service present | `kubectl get svc consolportals-sa-stc-vcp-a3gw-service -n stc-vcp-services` |
| Multiple Ingress resources | `kubectl get ingress -n stc-vcp-services` (auth-refresh, auth, captcha, services, main) |
| Admin portal loads | Open `/adminportal` (see URLs above) |
| CC portal loads | Open `/ccportal` |
| Partner portal loads | Open `/partnerportal` |
| site.json returns JSON | `curl -s http://<base>/site.json` |

**Quick curl tests (replace BASE with your base URL or localhost:8444 if using port-forward):**

```bash
curl -sI http://localhost/adminportal
# Expect 200 or 302
curl -s http://localhost/site.json | head -20
```

---

## 6. Optional: Memcached

If **memcached.enabled** is true in values, a memcached deployment and service are created. The chart does not configure a3gw or portals to use it by default; that would require extra config or env. For testing the chart, you can ignore memcached or disable it:

```yaml
# In a values override
memcached:
  enabled: false
```

---

## 7. Making configuration changes and applying them

Configuration is driven by **values** and **chart files** under `helm-no-httpd/files/a3gw/`. Change values or files, then run **helm upgrade** so ConfigMaps/Secrets and deployments are updated.

### What you can change

| What | Where | How to override |
|------|--------|------------------|
| **a3gw conf** (server_config, logger, auth, etc.) | Chart `files/a3gw/conf/*.json` | Replace those files in the chart; then upgrade. |
| **a3gw secrets** (JWT, service_proxies) | Chart `files/a3gw/conf/jwt_config.json`, `service_proxies_config.json` | Replace the files or use chart values if supported. |
| **a3gw static JSON** (site.json, server.json) | Chart `files/a3gw/static/public/site.json`, `files/a3gw/static/private/server.json` | Replace those files, or set in values: `a3gw.static.public.siteJson` and `a3gw.static.private.serverJson` (multiline YAML strings). |
| **Image tags, replicas, resources** | `values.yaml` or `-f my-values.yaml` | Set `a3gw.image.tag`, `a3gw.replicaCount`, `a3gw.resources`, etc. |
| **Ingress** (host, TLS, annotations) | Same | Set `ingress.host`, `ingress.tls`, `ingress.annotations`. |
| **Memcached** | Same | Set `memcached.enabled`, image, resources. |

### Applying changes

1. **Edit values or chart files** (e.g. `helm-no-httpd/values.yaml`, `helm-no-httpd/values-local.yaml`, or a custom values file; or edit `helm-no-httpd/files/a3gw/conf/*.json` and `helm-no-httpd/files/a3gw/static/...`).
2. Run **helm upgrade**:
   ```bash
   cd stc/vcp
   helm upgrade consolportals ./helm-no-httpd \
     -f helm-no-httpd/values.yaml \
     -f helm-no-httpd/values-local.yaml \
     -n stc-vcp-services
   ```
   Add `-f my-values.yaml` if you use a custom values file.
3. **Pods**: ConfigMap/Secret changes update the pod template (checksum annotations), so the a3gw deployment rolls and pods get the new config. Watch:
   ```bash
   kubectl rollout status deployment/consolportals-sa-stc-vcp-a3gw-deployment -n stc-vcp-services
   ```
4. **Values-only changes** (image tag, replicas, ingress, static JSON from values): the same `helm upgrade` applies them; no need to edit files in the chart.

Re-run the verification checklist to confirm (portals and `curl .../site.json`).

---

## 8. Upgrade / reinstall

Change values and upgrade:

```bash
cd stc/vcp
helm upgrade consolportals ./helm-no-httpd \
  -f helm-no-httpd/values.yaml \
  -f helm-no-httpd/values-local.yaml \
  -n stc-vcp-services
```

---

## 9. Troubleshooting

**Pods in ImagePullBackOff**

- Default values use `nexus.telenity.com/...` and tag `1.0.0.2-amd64`. For local Mac (ARM), use **values-local.yaml** (tag `1.0.0.2`) and ensure images are available to the cluster (build and load, or push to a registry and set imagePullSecrets if private).

**Ingress has no ADDRESS**

- Install the NGINX Ingress Controller and wait for it to be ready. Minikube: `minikube addons enable ingress`. Then use `minikube ip` or `minikube tunnel` so the configured host (e.g. localhost) works.

**502 / 503 on portal URLs**

- Confirm a3gw pods are Ready: `kubectl get pods -n stc-vcp-services -l component=vcp-a3gw`. Check logs: `kubectl logs -n stc-vcp-services -l component=vcp-a3gw -c vcp-a3gw`. Ensure Ingress host matches what you use in the browser (or use `curl -H "Host: ..."`).

**Session / sticky routing**

- The chart sets ingress annotations for cookie-based affinity (e.g. `vcp-sticky`). If you see inconsistent behaviour, ensure cookies are allowed and the same host is used.

---

## 10. Cleanup

```bash
helm uninstall consolportals -n stc-vcp-services
# Optional: remove namespace
kubectl delete namespace stc-vcp-services
```

---

## 11. Difference from “Helm with httpd”

| Aspect | Helm (with httpd) | Helm (no httpd) |
|--------|--------------------|------------------|
| httpd container | Yes | No |
| Ingress backend | httpd service (80) | a3gw service (8444/8445) |
| Ingress resources | Single Ingress | Multiple Ingress (auth, services, main, etc.) |
| Memcached | No | Optional (enabled in default values) |
| Use case | Full stack with Apache | Lighter stack, Ingress does path routing |

For full path routing and TLS at the edge without httpd, use this chart and configure `ingress.tls` in values as needed.
