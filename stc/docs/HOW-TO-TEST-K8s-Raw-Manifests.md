# How to Test: Kubernetes Raw Manifests

This guide covers running and testing the VCP stack using **raw Kubernetes manifests** (no Helm). Two deployment scripts are available: **deploy-k8s.sh** (includes httpd) and **deploy-no-httpd.sh** (a3gw + portals only). Both build images locally and apply manifests to namespace `stc-vcp-services`.

---

## Prerequisites

- **kubectl** installed and configured for a cluster (Docker Desktop Kubernetes, minikube, kind, or corporate cluster).
- **Docker** (for building images).
- **NGINX Ingress Controller** installed if you want to use Ingress (not port-forward only). For minikube: `minikube addons enable ingress`.
- Cluster has enough resources for 2 replicas of httpd, a3gw, and each portal (or reduce replicas in the YAMLs for local testing).

---

## 1. Deploy with httpd: deploy-k8s.sh

This option runs the full stack: **Ingress → httpd → a3gw + portals**.

### 1.1 Run the deployment script

From the **repository root** or from `stc/vcp`:

```bash
cd stc/vcp
chmod +x deploy-k8s.sh
./deploy-k8s.sh
```

The script will:

1. Remove any existing deployment in `stc-vcp-services`.
2. Build Docker images locally (httpd, a3gw, adminportal, ccportal, partnerportal).
3. Create namespace `stc-vcp-services` (if missing).
4. Apply ConfigMap and Secret for a3gw.
5. Apply deployments and services for httpd, a3gw, and the three portals.
6. Apply PodDisruptionBudgets.
7. Prompt you to choose access method (see below).

### 1.2 Choose how to access the stack

When prompted, you’ll see something like:

- **1 – Port forwarding** (no Ingress): script sets up port-forwards; you use fixed local ports.
- **2 – Ingress + httpd**: applies `consolportals-sa-stc-vcp-httpd-ingress.yaml` (and optionally the localhost Ingress). Traffic: Ingress → httpd → a3gw/portals.
- **3 – Ingress only**: applies `consolportals_sa_stc_ingress.yaml`. Traffic: Ingress → a3gw directly (no httpd).

For **Ingress**, ensure the NGINX Ingress Controller is running and (for local) that you use the host your Ingress expects (see below).

### 1.3 Wait for pods to be ready

```bash
kubectl get pods -n stc-vcp-services -w
```

Wait until all pods show `Running` and `1/1` or `2/2` (Ready). If you chose Ingress, also check:

```bash
kubectl get ingress -n stc-vcp-services
```

### 1.4 Test when using Ingress + httpd (option 2)

The httpd Ingress file defines:

- A rule with **no host** (catch-all): use the Ingress controller’s external IP or host (e.g. `minikube ip` or `localhost` if the controller is bound to localhost).
- A rule with **host: localhost**: use `http://localhost` (and ensure your Ingress controller is reachable on localhost).

**Docker Desktop Example**

```bash
# Check ingress controller exposure
kubectl -n ingress-nginx get svc ingress-nginx-controller

# If EXTERNAL-IP is set (often localhost):
# http://localhost/adminportal

# If EXTERNAL-IP is pending, port-forward:
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8088:80
# http://localhost:8088/adminportal

```

**Docker Desktop Kubernetes:** Ingress is often exposed on localhost; try:

- http://localhost/adminportal  
- http://localhost/ccportal  
- http://localhost/partnerportal  

**Test with curl:**

```bash
curl -sI http://localhost/adminportal
# Expect HTTP/1.1 200 (or 302 then 200)
curl -s http://localhost/site.json | head -20
```

### 1.5 Test when using Ingress only / direct to a3gw (option 3)

The direct Ingress (`consolportals_sa_stc_ingress.yaml`) uses hosts **consolportals-dev.internal.telenity.com** and **localhost**. Use the same Ingress controller access as above, with one of those hosts.

**If using localhost:**

```bash
curl -sI -H "Host: localhost" http://localhost/adminportal
curl -s -H "Host: localhost" http://localhost/site.json | head -20
```

**If using a custom host:** Add a line to `/etc/hosts` (or Windows equivalent) pointing the host to your Ingress IP (e.g. minikube IP), then open:

- http://consolportals-dev.internal.telenity.com/adminportal  
- http://consolportals-dev.internal.telenity.com/ccportal  
- http://consolportals-dev.internal.telenity.com/partnerportal  

### 1.6 Test when using port-forward only (option 1)

If you chose port-forward, the script will have started forwards. Typical mapping:

- httpd: 9080 → 80, 9443 → 443  
- a3gw: 9444 → 8444, 9445 → 8445  
- adminportal: 8080 → 8080, ccportal: 8081 → 8081, partnerportal: 8082 → 8082  

Then test:

- **Via httpd (main flow):**  
  - http://localhost:9080/adminportal  
  - http://localhost:9080/ccportal  
  - http://localhost:9080/partnerportal  
  - http://localhost:9080/site.json  

- **Direct to a3gw:**  
  - http://localhost:9444/adminportal  
  - http://localhost:9444/site.json  

---

## 2. Deploy without httpd: deploy-no-httpd.sh

This option runs **a3gw + portals only**; Ingress routes directly to a3gw (no httpd container).

### 2.1 Run the deployment script

```bash
cd stc/vcp
chmod +x deploy-no-httpd.sh
./deploy-no-httpd.sh
```

The script builds and deploys a3gw and the three portals (no httpd), then offers:

- **1 – Port forwarding**
- **3 – Ingress only** (direct to a3gw)

(Option 2 “Ingress + httpd” is not applicable and is typically hidden or disabled.)

### 2.2 Wait for pods

```bash
kubectl get pods -n stc-vcp-services
```

All a3gw and portal pods should be `Running` and ready.

### 2.3 Test access

Same as “Ingress only” and “port-forward” in section 1: use either Ingress (localhost or custom host) or the port-forwards the script sets up. Portal URLs are the same; only the path to a3gw differs (no httpd in the middle).

---

## 3. Manual apply (without scripts)

If you prefer to apply manifests yourself and use pre-built images (e.g. from a registry):

### 3.1 Create namespace and apply base resources

```bash
kubectl create namespace stc-vcp-services --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_a3gw.configmap.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_a3gw.secret.yaml -n stc-vcp-services
```

### 3.2 Apply deployments and services

**With httpd:**

```bash
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_httpd.deployment.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_httpd.service.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_a3gw.deployment.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_a3gw.service.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_adminportal.deployment.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_adminportal.service.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_ccportal.deployment.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_ccportal.service.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_partnerportal.deployment.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_partnerportal.service.yaml -n stc-vcp-services
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_vcp_pdbs.yaml -n stc-vcp-services
```

**Ingress (choose one):**

```bash
# Ingress → httpd → a3gw + portals
kubectl apply -f stc/vcp/k8s/consolportals-sa-stc-vcp-httpd-ingress.yaml -n stc-vcp-services

# OR Ingress → a3gw only (no httpd)
kubectl apply -f stc/vcp/k8s/consolportals_sa_stc_ingress.yaml -n stc-vcp-services
```

Image names in the YAMLs point to `nexus.telenity.com/...`; for local testing you may need to build and load images into your cluster (e.g. `minikube image load ...` or set `imagePullPolicy: Never` and use locally built tags).

---

## 4. Verification Checklist

| Check | Command / URL |
|-------|----------------|
| Namespace exists | `kubectl get ns stc-vcp-services` |
| All pods Running | `kubectl get pods -n stc-vcp-services` |
| Ingress has address | `kubectl get ingress -n stc-vcp-services` |
| Admin portal loads | Browser: `http://<ingress-or-forward>/adminportal` |
| CC portal loads | `http://<ingress-or-forward>/ccportal` |
| Partner portal loads | `http://<ingress-or-forward>/partnerportal` |
| site.json returns JSON | `curl -s http://<ingress-or-forward>/site.json` |

---

## 5. Troubleshooting

**Pods in ImagePullBackOff**

- Manifests use images from `nexus.telenity.com`. For local-only testing, the deploy scripts build and (for minikube/kind) load images; ensure you ran the script from `stc/vcp` and that Docker is running.
- If using your own registry, update image names in the deployment YAMLs and add `imagePullSecrets` if the registry is private.

**Ingress has no ADDRESS**

- Minikube: run `minikube addons enable ingress` and wait for the Ingress controller pod. Then use `minikube ip` or `minikube tunnel`.
- Kind: install an Ingress controller (e.g. NGINX) and expose it per your Kind setup.
- Docker Desktop: Ingress is often bound to localhost; check the controller’s service.

**502 / 503 when opening portals**

- Ensure a3gw and (if used) httpd pods are Ready. Check `kubectl describe pod -n stc-vcp-services` and logs: `kubectl logs -n stc-vcp-services -l component=vcp-a3gw -c vcp-a3gw`.
- If using Ingress with a specific host, use that host in the browser or in `curl -H "Host: ..."`.

**Port-forward stopped working**

- Port-forwards are process-bound; if you closed the terminal, they stop. Re-run the deploy script and choose port-forward again, or run `kubectl port-forward` manually.

---

## 6. Cleanup

Remove everything in the namespace:

```bash
kubectl delete namespace stc-vcp-services
```

Or delete resources but keep the namespace:

```bash
kubectl delete -f stc/vcp/k8s/ -n stc-vcp-services
# Then delete ingress if applied separately
kubectl delete -f stc/vcp/k8s/consolportals_sa_stc_ingress.yaml -n stc-vcp-services
kubectl delete -f stc/vcp/k8s/consolportals-sa-stc-vcp-httpd-ingress.yaml -n stc-vcp-services
```
