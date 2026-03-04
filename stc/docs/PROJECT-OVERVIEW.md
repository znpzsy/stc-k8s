# STC-K8s Project Overview

This document describes what this project is, how it is structured, and how Docker, Kubernetes, and Helm fit together. Use it as the single reference for understanding the codebase and deployment options.

---

## 1. What This Project Is

**stc-k8s** is a **containerized sandbox** for the **VCP (Console Portals) stack**: AngularJS 1.x portals, Apache httpd, and the A3GW Node.js proxy. It is used for:

- **Local development** (Docker Compose, hot reload)
- **Local Kubernetes testing** (minikube, kind, or single-node cluster)
- **Deployment to a corporate Kubernetes cluster** (Helm or raw manifests)

The stack mirrors production behaviour: browsers hit a single entrypoint (httpd or Ingress), which routes to portals and to A3GW; A3GW forwards API and auth traffic to backend services that are not part of this repo.

---

## 2. Architecture

### 2.1 Components

| Component | Role | Tech |
|-----------|------|------|
| **Admin Portal** | AngularJS 1.x SPA | Nginx serving static files (port 8080) |
| **CC Portal** | AngularJS 1.x SPA | Nginx (port 8081) |
| **Partner Portal** | AngularJS 1.x SPA | Nginx (port 8082) |
| **httpd** | Static assets, reverse proxy, security headers, TLS | Apache httpd (80, 443) |
| **A3GW** | API/auth proxy, config delivery | Node.js + PM2 (8444 services, 8445 auth) |

Portals do not call backends directly; they use paths like `/vcp/services/*` and `/cmpf-auth-rest/*`. Those are routed by httpd (or Ingress) to A3GW, which forwards to the real backends.

### 2.2 Traffic Flow

**With httpd (traditional):**

```
Browser → Ingress (or direct) → httpd → { a3gw (APIs/auth/config) | portal static }
                                    → a3gw → backend services
```

**Without httpd (Ingress-only):**

```
Browser → Ingress → a3gw → { portal static (via a3gw) | backend services }
```

Security (CSP, headers) is applied at httpd or at the Ingress controller when httpd is skipped.

### 2.3 Path Routing (summary)

| Path | Handler | Notes |
|------|---------|--------|
| `/adminportal`, `/ccportal`, `/partnerportal` | Portal static (httpd or a3gw) | AngularJS SPAs |
| `/vcp/services/*` | A3GW → backends | Main API proxy (port 8444) |
| `/cmpf-auth-rest/*` | A3GW auth (port 8445) | Token refresh, etc. |
| `/conf/*`, `/site.json` | A3GW | Runtime config for portals |
| `/img/captcha.png` | A3GW (8445) | Captcha image |

---

## 3. Repository Layout

```
stc/
  docs/
    README-Docker.md      # Docker Compose quick start
    README-K8S.md         # Local K8s
    PROJECT-OVERVIEW.md   # This file
  vcp/
    # --- Docker ---
    docker-compose.dev.yml
    docker-compose.prod.yml
    deploy-k8s.sh          # Deploy with httpd (build + apply)
    deploy-no-httpd.sh    # Deploy without httpd

    a3gw/                 # Node.js proxy
      Dockerfile.vcp.dev | .vcp.prod | .vcp.k8slocal
      .dockerignore
    httpd/                # Apache
      Dockerfile.vcp.dev | .vcp.prod | .vcp.k8slocal
      .dockerignore
    vcp-adminportal/      # AngularJS SPA
      Dockerfile.dev | .prod
      .dockerignore
    vcp-ccportal/
    vcp-partnerportal/

    # --- Raw Kubernetes manifests (namespace: stc-vcp-services) ---
    k8s/
      consolportals_sa_stc_ingress.yaml           # Ingress → a3gw (no httpd)
      consolportals-sa-stc-vcp-httpd-ingress.yaml  # Ingress → httpd
      consolportals_sa_stc_vcp_*.deployment.yaml
      consolportals_sa_stc_vcp_*.service.yaml
      consolportals_sa_stc_vcp_pdbs.yaml
      consolportals_sa_stc_vcp_a3gw.configmap.yaml
      consolportals_sa_stc_vcp_a3gw.secret.yaml
    k8s-nohttpd/          # No-httpd variant, TLS notes, migration guide

    # --- Helm charts ---
    helm/                  # With httpd: Ingress → httpd → a3gw + portals
      Chart.yaml
      values.yaml
      values-dev.yaml
      values-local.yaml
      templates/
    helm-no-httpd/        # Without httpd: Ingress → a3gw (+ memcached option)
      values.yaml
      values-dev.yaml
      values-local.yaml
      templates/
```

---

## 4. Docker

### 4.1 Dockerfiles

- **a3gw**: `Dockerfile.vcp.k8slocal` (K8s/local, uses `conf.k8s`), `Dockerfile.vcp.prod` (uses `conf.prod`). Both use `npm ci` when lockfile exists, expose 8444/8445, and include a HEALTHCHECK on `http://127.0.0.1:8444/site.json`.
- **httpd**: `Dockerfile.vcp.dev`, `Dockerfile.vcp.prod`, `Dockerfile.vcp.k8slocal`. All EXPOSE 80 and 443; prod/k8slocal include a HEALTHCHECK on port 80. TLS certs are copied from `vcp/openssl.*`; for production clusters, consider mounting certs via Kubernetes Secrets instead of baking them in.
- **Portals** (admin, cc, partner): `Dockerfile.dev` (development), `Dockerfile.prod` (multi-stage: Node 10 + Bower/Gulp build → Nginx). Each exposes the correct port (8080, 8081, 8082) and has a HEALTHCHECK on the portal path. Node 10 is EOL; kept for legacy AngularJS/Bower compatibility until the stack is migrated.

### 4.2 .dockerignore

Present under `a3gw/`, `httpd/`, and each portal directory to keep build context small (e.g. exclude `node_modules`, `.git`, `*.md`).

### 4.3 Compose

- **docker-compose.dev.yml**: development (hot reload, dev configs).
- **docker-compose.prod.yml**: production-like images and healthchecks; use for local E2E or demos.

Apply from `stc/vcp/` with:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 5. Kubernetes Manifests (Raw YAML)

- All resources use **namespace: `stc-vcp-services`** (ingress, deployments, services, PDBs, configmap, secret).
- **Deployments** include:
  - `securityContext.allowPrivilegeEscalation: false` on containers
  - Resource requests/limits, liveness/readiness probes, anti-affinity
- **PodDisruptionBudgets** use `minAvailable: 1`; the ccportal PDB name is `consolportals-sa-stc-vcp-ccportal-pdb` (typo “ccortal” was fixed).
- **Two ingress styles**:
  - `consolportals_sa_stc_ingress.yaml`: path-based routing directly to a3gw (no httpd).
  - `consolportals-sa-stc-vcp-httpd-ingress.yaml`: single entrypoint to httpd, which does ProxyPass to a3gw and portals.

Create the namespace and apply from `stc/vcp/k8s/`:

```bash
kubectl create namespace stc-vcp-services
kubectl apply -f k8s/ -n stc-vcp-services
```

For private registry (e.g. Nexus), ensure the namespace has an `imagePullSecret` or add `imagePullSecrets` to each deployment.

---

## 6. Helm Charts

### 6.1 Chart “helm” (with httpd)

- **Purpose**: Ingress → httpd → a3gw and portals.
- **Values**: `values.yaml` (default), `values-dev.yaml`, `values-local.yaml`.
- **Ingress**: Single Ingress with path `/` to the httpd service. Optional **TLS**: set `ingress.tls` in values (e.g. `[{"hosts": ["consolportals.internal.telenity.com"], "secretName": "vcp-tls"}]`).
- **Global**: `global.namespace` overrides release namespace; `global.imagePullSecrets` can be set for private registry.

### 6.2 Chart “helm-no-httpd”

- **Purpose**: Ingress → a3gw only (and optional memcached). No httpd container.
- **Values**: Same pattern; **ingress annotations** are read from `ingress.annotations` (this was fixed; templates previously expected `commonAnnotations`).
- **Ingress**: Multiple Ingress resources (auth-refresh, auth, captcha, services, main). Optional **TLS**: set `ingress.tls` in values; each Ingress gets the same TLS block when present.
- **Memcached**: Optional deployment + service when `memcached.enabled` is true; no PDB by default.

Install examples:

```bash
# With httpd
helm upgrade --install vcp ./helm -n stc-vcp-services -f helm/values-dev.yaml

# Without httpd
helm upgrade --install vcp ./helm-no-httpd -n stc-vcp-services -f helm-no-httpd/values-dev.yaml
```

---

## 7. Deployment Paths (Quick Reference)

| Goal | Where to look |
|------|----------------|
| Run locally with Docker only | [stc/docs/README-Docker.md](README-Docker.md) |
| Run on local Kubernetes | [stc/docs/README-K8S.md](README-K8S.md) |
| Deploy to corporate cluster | [stc/docs/README-K8S_Corporate.md](README-K8S_Corporate.md) (if present) or use Helm from `stc/vcp/helm` / `stc/vcp/helm-no-httpd` |
| Scripted deploy (with httpd) | `stc/vcp/deploy-k8s.sh` |
| Scripted deploy (no httpd) | `stc/vcp/deploy-no-httpd.sh` |

### 7.1 How to test (detailed guides)

Each run method has a dedicated **how to test** document with step-by-step instructions, verification checklists, and troubleshooting:

| Method | Document |
|--------|----------|
| Docker Compose (dev & prod) | [HOW-TO-TEST-Docker-Compose.md](HOW-TO-TEST-Docker-Compose.md) |
| Kubernetes raw manifests (deploy-k8s.sh / deploy-no-httpd.sh) | [HOW-TO-TEST-K8s-Raw-Manifests.md](HOW-TO-TEST-K8s-Raw-Manifests.md) |
| Helm chart with httpd | [HOW-TO-TEST-Helm-With-Httpd.md](HOW-TO-TEST-Helm-With-Httpd.md) |
| Helm chart without httpd | [HOW-TO-TEST-Helm-No-Httpd.md](HOW-TO-TEST-Helm-No-Httpd.md) |

---

## 8. Production Checklist

When moving from sandbox to production, consider:

- **Namespace**: Use a dedicated namespace (e.g. `stc-vcp-services`) and ensure RBAC and network policies as required.
- **Secrets**: Replace Helm `stringData` / baked-in secrets with a secret manager (e.g. External Secrets, Sealed Secrets, or Vault). Do not commit real JWT or proxy secrets.
- **TLS**: Configure `ingress.tls` in Helm values and create the TLS Secret (or use a controller that provisions certs).
- **Image pull**: Set `global.imagePullSecrets` (Helm) or add `imagePullSecrets` to deployments if using a private registry.
- **httpd certs**: Prefer mounting TLS certs for httpd from Kubernetes Secrets rather than baking them into the image.
- **Resource limits**: Adjust `resources.requests`/`limits` in Helm values or raw manifests to match cluster sizing and SLOs.
- **Scaling**: Add HorizontalPodAutoscaler (HPA) if needed; not included in the current manifests.
- **Logging**: a3gw can use a log sidecar and emptyDir; for production, ship logs to your central logging pipeline.

---

*Last updated: February 2025*
