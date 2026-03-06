# How to Test: Helm Chart (With httpd)

This guide walks you through running and testing the VCP stack using the **Helm chart that includes httpd**. Traffic flow: **Ingress (or NodePort/port-forward) → httpd → a3gw + portals**.

---

## Prerequisites

- **kubectl** configured for a Kubernetes cluster (Docker Desktop, minikube, kind, or corporate).
- **Helm 3** installed.
- **Docker** (if you need to build and push/load images; otherwise use images from your registry).
- For **Ingress** access: NGINX Ingress Controller installed (e.g. `minikube addons enable ingress`).

---

## 1. Prepare the cluster and namespace

```bash
kubectl create namespace stc-vcp-services --dry-run=client -o yaml | kubectl apply -f -
```

If using pre-built images from a registry (e.g. Nexus), ensure the cluster can pull them. For **local-only** testing with images built on your machine, use the **values-local.yaml** overrides (tag without `-amd64`) and either load images into the cluster (e.g. minikube/kind) or use a local registry.

---

## 2. Install the chart

All commands below assume you are in **stc/vcp** (parent of the `helm` directory).

### 2.1 Default / dev (ClusterIP + Ingress)

Uses default values plus local overrides: Ingress enabled, host `localhost`.

```bash
cd stc/vcp
helm upgrade --install consolportals ./helm \
  -f helm/values.yaml \
  -f helm/values-local.yaml \
  -n stc-vcp-services
```

### 2.2 NodePort (no Ingress, no port-forward)

Good for quick local access without an Ingress controller or port-forwarding.

```bash
cd stc/vcp
helm upgrade --install consolportals ./helm \
  -f helm/values.yaml \
  -f helm/values-local-nodeport.yaml \
  -n stc-vcp-services
```

- httpd: **30080** (HTTP), **30443** (HTTPS).
- a3gw (direct): **30444** (portals), **30445** (auth).

### 2.3 Production-like (corporate / shared cluster)

Use default values and set namespace via `--namespace` or `global.namespace` in a custom values file. Optionally enable TLS and imagePullSecrets (see chart values).

```bash
helm upgrade --install consolportals ./helm \
  -f helm/values.yaml \
  -f helm/values-dev.yaml \
  -n stc-vcp-services
```

---

## 3. Wait for pods to be ready

```bash
kubectl get pods -n stc-vcp-services -w
```

Wait until all pods show `Running` and ready (e.g. `1/1` or `2/2`). Then:

```bash
kubectl get svc,ingress -n stc-vcp-services
```

---

## 4. How to access and test

Access depends on how you installed (Ingress, NodePort, or port-forward).

### 4.1 If you used NodePort (values-local-nodeport.yaml)

No Ingress and no port-forward needed. Use the NodePort ports (with minikube, use `minikube ip` or `minikube service` if needed).

**Direct from host (Docker Desktop / cluster with NodePort on localhost):**

| What            | URL |
|-----------------|-----|
| Admin Portal    | http://localhost:30080/adminportal |
| CC Portal       | http://localhost:30080/ccportal |
| Partner Portal  | http://localhost:30080/partnerportal |
| HTTPS           | https://localhost:30443/adminportal |
| Direct a3gw     | http://localhost:30444/adminportal, http://localhost:30444/site.json |

**Minikube:**

```bash
# Get node IP
minikube ip
# Open: http://<minikube-ip>:30080/adminportal
# Or use tunnel so localhost works
minikube tunnel
# Then: http://localhost:30080/adminportal
```

### 4.2 If you used Ingress (values-local.yaml, ingress.enabled: true)

With **values-local.yaml**, `ingress.host` is `localhost`. Ensure the Ingress controller is reachable at that host (e.g. Docker Desktop or `minikube tunnel`).

| What            | URL |
|-----------------|-----|
| Admin Portal    | http://localhost/adminportal |
| CC Portal       | http://localhost/ccportal |
| Partner Portal  | http://localhost/partnerportal |
| site.json       | http://localhost/site.json |

**Check Ingress:**

```bash
kubectl get ingress -n stc-vcp-services
```

If ADDRESS is empty (e.g. on minikube), enable ingress and wait: `minikube addons enable ingress`.

### 4.3 If you used ClusterIP only (no NodePort, Ingress disabled)

Use port-forward to the httpd service:

```bash
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 9080:80 9443:443 -n stc-vcp-services
```

Then open:

- http://localhost:9080/adminportal  
- http://localhost:9080/ccportal  
- http://localhost:9080/partnerportal  
- http://localhost:9080/site.json  

---

## 5. Verification checklist

| Check | How |
|-------|-----|
| Release exists | `helm list -n stc-vcp-services` |
| All pods Running | `kubectl get pods -n stc-vcp-services` |
| httpd service present | `kubectl get svc consolportals-sa-stc-vcp-httpd-service -n stc-vcp-services` |
| Admin portal loads | Open `/adminportal` in browser (see URLs above) |
| CC portal loads | Open `/ccportal` |
| Partner portal loads | Open `/partnerportal` |
| site.json returns JSON | `curl -s http://<base>/site.json` (base = localhost, localhost:30080, or localhost:9080) |

---

## 6. Making configuration changes and applying them

Configuration is driven by **values** and by **chart files** (e.g. under `helm/files/a3gw/`). Change values or files, then run **helm upgrade** so the cluster gets the new ConfigMaps/Secrets and, if needed, new pod specs.

### What you can change

| What | Where | How to override |
|------|--------|------------------|
| **a3gw conf** (server_config, logger, auth, operations) | Chart `files/a3gw/conf/*.json` | Replace those files in the chart, or use a custom values file that references different content (would require chart template support for inline conf). Default: edit `helm/files/a3gw/conf/*.json` and upgrade. |
| **a3gw secrets** (JWT, service_proxies) | Chart `files/a3gw/conf/jwt_config.json`, `service_proxies_config.json` (templated into Secret) | Replace the files or supply values that the chart uses for the secret (if the chart supports it). |
| **a3gw static JSON** (site.json, server.json) | Chart `files/a3gw/static/public/site.json`, `files/a3gw/static/private/server.json` | Replace those files, or set in values: `a3gw.static.public.siteJson` and `a3gw.static.private.serverJson` (multiline strings). |
| **Image tags, replicas, resources** | `values.yaml` or `-f my-values.yaml` | Set `a3gw.image.tag`, `a3gw.replicaCount`, `a3gw.resources`, etc. |
| **Ingress** (host, TLS, annotations) | `values.yaml` or `-f my-values.yaml` | Set `ingress.host`, `ingress.tls`, `ingress.annotations`. |
| **Global** (namespace, imagePullSecrets) | Same | Set `global.namespace`, `global.imagePullSecrets`. |

### Applying changes

1. **Edit values or chart files** (e.g. `helm/values.yaml`, `helm/values-local.yaml`, or a custom `my-values.yaml`; or edit `helm/files/a3gw/conf/*.json` and `helm/files/a3gw/static/...`).
2. Run **helm upgrade** so the release is updated with the new ConfigMaps, Secrets, and deployment specs:
   ```bash
   cd stc/vcp
   helm upgrade consolportals ./helm \
     -f helm/values.yaml \
     -f helm/values-local.yaml \
     -n stc-vcp-services
   ```
   Add `-f my-values.yaml` if you use a custom values file.
3. **Pods**: Changing ConfigMap/Secret content updates the pod template (checksum annotations), so Kubernetes rolls the a3gw (and other) pods and they pick up the new config. Watch the rollout:
   ```bash
   kubectl rollout status deployment/consolportals-sa-stc-vcp-a3gw-deployment -n stc-vcp-services
   ```
4. **Only values (no file edits):** If you only changed values (e.g. image tag, replicas, ingress host), the same `helm upgrade` command applies; no need to edit files in the chart.

To confirm, re-run the verification checklist (portals and `curl .../site.json`).

---

## 7. Upgrade / reinstall

Change values and upgrade:

```bash
cd stc/vcp
helm upgrade consolportals ./helm \
  -f helm/values.yaml \
  -f helm/values-local.yaml \
  -n stc-vcp-services
```

Switch to NodePort:

```bash
helm upgrade consolportals ./helm \
  -f helm/values.yaml \
  -f helm/values-local-nodeport.yaml \
  -n stc-vcp-services
```

---

## 8. Troubleshooting

**Pods in ImagePullBackOff**

- Default values use `nexus.telenity.com/...` images with tag `1.0.0.2-amd64`. For local Mac (ARM), use `values-local.yaml` (tag `1.0.0.2` without `-amd64`) and ensure images are built and loaded or available in a registry the cluster can pull from.
- For a private registry, set `global.imagePullSecrets` in values and create the secret in the namespace.

**Ingress has no ADDRESS**

- Install and wait for the NGINX Ingress Controller. Minikube: `minikube addons enable ingress`. Then use `minikube ip` or `minikube tunnel` so that the host (e.g. localhost) resolves.

**502 / 503 on portal URLs**

- Confirm httpd and a3gw pods are Ready: `kubectl get pods -n stc-vcp-services`. Check logs: `kubectl logs -n stc-vcp-services -l component=vcp-httpd -c vcp-httpd` and same for `vcp-a3gw`.

**NodePort not reachable**

- On minikube, use `minikube ip` and the NodePort (e.g. 30080). Or run `minikube tunnel` and use localhost if your setup exposes NodePort on the tunnel.

---

## 9. Cleanup

```bash
helm uninstall consolportals -n stc-vcp-services
# Optional: remove namespace
kubectl delete namespace stc-vcp-services
```

---

## 10. More options

- **README-LocalDevGuide.md** in `stc/vcp/helm/` has more detail on NodePort vs port-forward vs Ingress and switching between them.
- **values-dev.yaml** and **values-local.yaml** reduce replicas or adjust resources for local use; combine as needed with `-f`.
