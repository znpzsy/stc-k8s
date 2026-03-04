# Containerized Sandbox Environment for Portal, `httpd`, and A3GW Proxy Stack

This repository contains a Docker and K8s-based sandbox for local development and testing of the portal infrastructure. It simulates the behavior of a multi-portal frontend environment (`adminportal`, `ccportal`, `partnerportal`) alongside the internal reverse proxy (`a3gw`) and static file serving (`httpd`), as used in production.
You can quickly set up the sandbox environment using Docker Compose (Makefile) or Kubernetes. The following sections provide instructions for both methods.

## Quick Start

### I want to run it locally as fast as possible
→ **Go to [Path 1: Docker Compose](stc/docs/README-Docker.md)**

### I want to test Kubernetes deployment locally
→ **Go to [Path 2: Local Kubernetes](stc/docs/README-K8S.md)**

### I want to deploy to our corporate cluster
→ **Go to [Path 3: Corporate Kubernetes Cluster](stc/docs/README-K8S_Corporate.md)**

### I want a full picture of the project (architecture, Docker, K8s, Helm)
→ **Go to [Project Overview](stc/docs/PROJECT-OVERVIEW.md)**

### I want step-by-step testing instructions for a specific run method
→ **See [How to test (Docker Compose)](stc/docs/HOW-TO-TEST-Docker-Compose.md), [K8s raw manifests](stc/docs/HOW-TO-TEST-K8s-Raw-Manifests.md), [Helm with httpd](stc/docs/HOW-TO-TEST-Helm-With-Httpd.md), or [Helm no-httpd](stc/docs/HOW-TO-TEST-Helm-No-Httpd.md)**

---


## Standard Deployment Workflow

#### User (Browser):

- Visits `https://serveripordomain/adminportal`
- Gets the AngularJS 1.x SPA, served by `httpd` & `a3gw`


#### Apache Web Server (`httpd`):

- Serves static assets (HTML, JS, CSS, etc.)
- Acts as the first layer of reverse proxy
    - Routes `/adminportal`, `/ccportal`, `/cmpf-auth-rest`, `/vcp/services`, etc.
    - Uses ProxyPass + ProxyPassReverse rules. (see `proxy.conf`)
    - Handles web-layer security concerns, including:
        - Enforcing Content Security Policy
        - Setting security-related headers (e.g., `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
        - Adding custom HTTP response headers as required by compliance


#### AngularJS SPA:

- Runs in the browser
- Fetches configuration from `/conf/server.json` and `/site.json`
- Makes API requests such as:
    ```
    /vcp/services/some-backend/api
    /cmpf-auth-rest/refresh-token
    /img/captcha.png
    ```

#### A3GW (Node.js Proxy Server):

A3GW is intentionally kept as a lightweight proxy server and does **not** enforce CSP or HTTP headers. These are managed upstream by `httpd`.

- Receives requests forwarded by `httpd`
- Routes API calls to the appropriate backend microservice over port 8444:
    - Based on URL patterns or routing config
    - Example: `/vcp/services/xyz/*` → backend service `xyz` (This layer is typically protected by authentication mechanisms.)

Backend services provide actual business logic and run behind `a3gw`. (Never exposed directly.)

#### Example Traffic Flow
**For a config read:**
<sub>see `/a3gw/src/conf/server_config.json` & `/a3gw/ecosystem.config.js` (`PM2`).</sub>
```
User (AngularJS) → httpd (/site.json or /conf/server.json) → a3gw as configured (static file read)
```

**Backend API Request:**
```
User (AngularJS) → httpd (/vcp/services/api) → a3gw:8444 → proper backend service
```

**Authentication Request:**
```
User (AngularJS) → httpd (/cmpf-auth-rest) → a3gw:8445 → CMPF backend
```

---

## Overview

The sandbox mimics the production traffic flow using containerized components:

- Portal deployments (AngularJS 1.x SPAs)
- Reverse proxy routing (formerly handled by Apache `httpd`)
- Backend service dispatching via `a3gw`
- Static configuration delivery (`/conf`, `site.json`)
- Path-based routing through Kubernetes Ingress

## Architecture

- **Portals** are Single Page Applications built with AngularJS 1.x. These applications are served as static files and act purely as remote interfaces. They do not contain hardcoded backend URLs; all service calls are routed through a common path prefix: `/vcp/services` (or `/dsp/services`, `/enkudo/services`, depending on the backend products).

- **Apache (`httpd`)** is responsible for:
    - Serving static portal assets
    - Routing frontend-originated service requests using `ProxyPass` and `ProxyPassReverse` rules
    - Delivering static config files (e.g., `/conf/server.json`, `/site.json`) required by the frontend
    - Enforcing frontend-related security policies and headers

- **A3GW** is a Node.js-based proxy that:
    - Receives service requests (e.g., `/vcp/services/...`)
    - Dispatches them to the appropriate backend microservice (port 8444, authn protected)
    - Handles token refresh (`/cmpf-auth-rest/refresh-token`) and captcha delivery (`/img/captcha.png`) on a separate internal port (8445)
    - Requests for static files like `/conf/server.json` (private) and `/site.json` (public) also go through `a3gw`.

- **Kubernetes Ingress**
    - [consolportals_sa_stc_ingress.yaml](stc/vcp/k8s/consolportals_sa_stc_ingress.yaml) replaces `httpd` as the public-facing router. All routes handled by A3GW + httpd are now defined in Ingress resources, using NGINX as the controller and path-based routing to forward requests to the appropriate services.
    - [consolportals-sa-stc-vcp-httpd-ingress.yaml](stc/vcp/k8s/consolportals-sa-stc-vcp-httpd-ingress.yaml) replaces `httpd` Ingress routes everything to httpd, which then handles the ProxyPass logic.
    -

## Main Paths & Responsibilities

[consolportals_sa_stc_ingress.yaml](stc/vcp/k8s/consolportals_sa_stc_ingress.yaml)

| Path                        | Handled By                 | Description                           |
|-----------------------------|----------------------------|---------------------------------------|
| `/adminportal`              | Ingress → a3gw → portal    | Static AngularJS SPA                  |
| `/vcp/services/*`           | Ingress → a3gw → Backend   | Main API proxy routing                |
| `/cmpf-auth-rest/*`         | Ingress → a3gw (port 8445) | Auth-related APIs                     |
| `/conf/*` & `/site.json`    | Ingress → a3gw             | Static JSON config for portal runtime |
| `/img/captcha.png`          | Ingress → a3gw (port 8445) | CAPTCHA delivery                      |


[consolportals-sa-stc-vcp-httpd-ingress.yaml](stc/vcp/k8s/consolportals-sa-stc-vcp-httpd-ingress.yaml)
Access with default http ports (80, 443).

| Path                        | Handled By                           | Description                           |
|-----------------------------|--------------------------------------|---------------------------------------|
| `/adminportal`              | Ingress → httpd → a3gw → portal      | Static AngularJS SPA                  |
| `/vcp/services/*`           | Ingress → httpd → a3gw pod → Backend | Main API proxy routing                |
| `/cmpf-auth-rest/*`         | Ingress → httpd → a3gw (port 8445)   | Auth-related APIs                     |
| `/conf/*` & `/site.json`    | Ingress → httpd → a3gw               | Static JSON config for portal runtime |
| `/img/captcha.png`          | Ingress → httpd → a3gw (port 8445)   | CAPTCHA delivery                      |

> 🔒 **Note**: All web-layer security policies (e.g., CSP, X-Frame-Options) are enforced upstream by the `httpd` layer or Ingress controller in Kubernetes. The `a3gw` proxy assumes trust within the internal network and does not enforce frontend security policies directly.


---

## Repository Structure

```text

* 
└── stc/
     └── docs/
     └── vcp/
          ├── deploy-k8s.sh                   # Bash script to deploy to Kubernetes (local cluster, single node)
          ├── docker-compose.dev.yaml         # Docker Compose file for local development (hot-reloading, etc.)
          ├── docker-compose.prod.yaml        # Docker Compose file for production (deployment)
          ├── a3gw/
          │   ├── src/                        # a3gw source code
          │   ├── vcp/
          │   │   ├── conf.dev/               # a3g configuration files (server_config.json, service_proxies_config.json, ... etc.)
          │   │   ├── conf.prod/              
          │   │   ├── conf.k8s/              
          │   │   ├── static.dev/             # static files (server_json, site.json)
          │   │   ├── static.prod/            
          │   │   └── ecosystem.config.js     # pm2 script
          │   ├── Dockerfile.vcp.dev          # Dockerfile for local development
          │   └── Dockerfile.vcp.prod         # Dockerfile for production
          │   
          ├── k8s/
          │   ├── consolportals_sa_stc_ingress.yaml                    # Ingress YAMLs for sandbox routing
          │   ├── consolportals_sa_stc_vcp_{{nd}}.deployment.yaml      # K8s manifests for deployments
          │   ├── consolportals_sa_stc_vcp_{{nd}}.pod.yaml             # K8s manifests for pods
          │   └── consolportals_sa_stc_vcp_{{nd}}.service.yaml         # K8s manifests for services
          │   
          ├── httpd/
          │       ├── vcp/
          │       │   ├── conf/                    # httpd.conf 
          │       │   ├── conf.d.dev/              # proxy.conf & MDN best practices - web-layer security headers config (defaults)
          │       │   ├── conf.d.prod/             
          │       │   ├── openssl.dev/             # self-signed certificates
          │       │   └── openssl.prod/            
          │       ├── Dockerfile.vcp.dev           # Dockerfiles
          │       ├── Dockerfile.vcp.dev           
          │       └── Dockerfile.vcp.k8            # Dockerfile for kubernetes deployment (TBD)
          │   
          ├── vcp-adminportal/
          ├── vcp-ccportal/
          └── vcp-partnerportal/
```


Other:
- [README-Dockerization.md](README-Dockerization.md)
- [README-Ingress.md](README-Ingress.md)
- [README-Make.md](README-Make.md)

---

---
*Last updated: June 2025*
