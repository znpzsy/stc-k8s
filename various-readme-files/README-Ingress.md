
# Ingress on Docker Desktop Kubernetes (macOS)

This repo intentionally captures how the sandbox evolved:

1) **Docker Compose first** : (dev/prod configs per component: portals + httpd + a3gw)
2) **Raw Kubernetes manifests + deploy script** : (kubectl apply + optional port-forward)
3) **Helm chart** (standardized, reproducible deployments)

The goal is:
- keep **each stage runnable**
- make the **current canonical architecture unambiguous**
- still document legacy/alternate ways (for debugging / learning / migration)

---

## Canonical Architecture (current, recommended)

**Ingress → HTTPD → A3GW → Portals**

HTTPD is not optional:
- DevOps might want **HTTPD logs** (and often headers, proxy behavior, cert handling)
- HTTPD centralizes ProxyPass rules and mirrors the production “edge proxy” concept
- It keeps the Ingress layer simple and stable

**Rule of thumb:**  
If you are using Kubernetes + Ingress, Ingress should route to **HTTPD only**.

---

## Install ingress-nginx on Docker Desktop (recommended)

Docker Desktop Kubernetes does not ship with an ingress controller preinstalled.
Install ingress-nginx via Helm (this is what we validated works cleanly):

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  -n ingress-nginx --create-namespace
```



Check it:

```bash
kubectl get pods -n ingress-nginx
kubectl get svc  -n ingress-nginx
kubectl get validatingwebhookconfigurations | grep -i nginx || true
kubectl get ingressclass
```

Uninstall:

```bash
helm uninstall ingress-nginx -n ingress-nginx
kubectl delete namespace ingress-nginx
```

> Note: if you delete only the namespace but some cluster-scoped resources remain
> (IngressClass, ClusterRole, ClusterRoleBinding), Helm may refuse reinstall.
> In that case, delete the leftover cluster-scoped resources explicitly.

---


## Access Modes (K8s)

### Mode A — Ingress (canonical)

* You access via: `http(s)://localhost/<path>`
* Ingress routes everything to **HTTPD**
* HTTPD ProxyPass routes to A3GW

Examples:

* `/adminportal`
* `/ccportal`
* `/partnerportal`
* `/vcp/services/...`
* `/cmpf-auth-rest/...`
* `/cmpf-rest/...`
* `/conf`, `/site.json`, captcha path, etc.

### Mode B — Port-forward (debug / fallback)

This is useful when:

* Ingress is broken / being reinstalled
* You want to isolate HTTPD or A3GW behavior quickly
* You want a minimal “is it alive?” sanity check

HTTPD port-forward example:

```bash
kubectl port-forward -n <ns> svc/<httpd-service> 9080:80 9443:443 &
# portals reachable at:
# http://localhost:9080/adminportal
```

Stop all port-forwards:

```bash
pkill -f "kubectl port-forward"
```

---

## IMPORTANT: Path correctness (/vcp/services vs /vcp-services)

The portals call backend service paths like:

* `/vcp/services/<servicepath>`

That is **not** the same as `/vcp-services`.

If you bypass HTTPD and try to encode backend routing in Ingress, this mismatch will break things.
Canonical approach avoids this entirely: Ingress sends everything to HTTPD, and HTTPD handles the precise ProxyPass rules.

---

## Where the Ingress YAML lives

* Helm: `helm/templates/ingress.yaml` (canonical)
* Raw k8s manifests: `k8s/...` (legacy stage)

If you change the “edge routing” architecture, update **this doc first**.


# Other Notes (To Be Deleted)
## About the Ingress Fix: Helm `templates/ingress.yaml` (single ingress → HTTPD)

The older Helm ingress template is creating **multiple ingress objects** and sending traffic to **A3GW** on `8444`. That’s what broke `/vcp/services/...`.

Replaced it with this **single-ingress** version (`stc/vcp/helm/templates/ingress.yaml`):

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: consolportals-sa-stc-vcp-httpd-ingress
  namespace: {{ include "consolportals.namespace" . }}
  {{- with .Values.ingress.annotations }}
  annotations:
{{ toYaml . | indent 4 }}
  {{- end }}
spec:
  ingressClassName: {{ .Values.ingress.className }}
  rules:
    - {{- if .Values.ingress.host }}
      host: {{ .Values.ingress.host | quote }}
      {{- end }}
      http:
        paths:
          - pathType: Prefix
            path: "/"
            backend:
              service:
                name: {{ .Values.service.httpd.name }}
                port:
                  number: {{ .Values.ingress.httpdServicePort }}
{{- end }}
````

### Updated `values.yaml` accordingly

Change `ingress:` section to:

```yaml
ingress:
  enabled: true
  className: nginx
  host: ""
  httpdServicePort: 80
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
```

…and delete the now-unused fields from values:

* `a3gwServicePort`
* `rules.mainPaths`
* `refreshTokenPaths`, `cmpfRestPaths`, `captchaPaths`, `vcpServicesPaths`

Because HTTPD is handling those routes, and it already knows the correct `/vcp/services` path.

---

## Helm-first clean start

 “Helm can’t adopt resources created by kubectl apply”, ---> the clean approach is:

```bash
kubectl delete ns stc-vcp --ignore-not-found=true
# wait a few seconds until namespace is fully gone

helm upgrade --install test . -n stc-vcp --create-namespace
kubectl get ingress -n stc-vcp
kubectl get pods -n stc-vcp
```

(If you had applied manifests with kubectl before, always nuke the namespace before Helm installs. Otherwise Helm sees existing resources without Helm labels/annotations and refuses.)

---

## TODO

Now that Ingress is fixed and canonical:

1. Verify ingress points to **httpd-service**
2. Verify HTTPD `ProxyPass` has the right routes (`/vcp/services` etc.)
3. Document the **three runnable stages** (compose → kubectl script → helm) as separate sections, with “why/when” for each.
