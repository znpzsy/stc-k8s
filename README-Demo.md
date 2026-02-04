
# Sandbox Demo

## Repository Structure

```text

* 
└── stc/
     └── docs/
     └── vcp/
          ├── deploy-k8s.sh                   # Bash script to deploy to K8S (local cluster, single node), apply ingress
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
          ├── helm/
          │   ├── values.yaml                  # Helm values YAMLS for prod, dev, local & local-nodeport
          │   ├── values.dev.yaml                  
          │   ├── values.local.yaml            # Ingress - host:localhost, ClusterIP (dev)         
          │   ├── values.local-nodeport.yaml   # Httpd & A3gw as service, NodePorts configured (dev)        
          │   └── (...)                        #  Readmes & Chart templates  
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
              ├── Dockerfile.dev                   # Dockerfiles
              ├── Dockerfile.prod                  # no k8slocal, use this.
              ├── npm-shrinkwrap.json              # Ensures consistent dependency versions
              └── nginx                            
                    └── default.conf               # necessary to route to index.html
```

This repository contains a Docker and K8s-based sandbox for local development and testing of the portal infrastructure. It simulates the behavior of a multi-portal frontend environment (`adminportal`, `ccportal`, `partnerportal`) alongside the internal reverse proxy (`a3gw`) and static file serving (`httpd`), as used in production.
You can quickly set up the sandbox environment using Docker Compose (Makefile) or Kubernetes (either with deploy script or helm). The following sections provide instructions for both methods.


## Standard Workflow (Bare metal, all on the same machine)

#### User (Browser):

- Visits `https://hostname/adminportal`
- Gets the AngularJS 1.x SPA, served by `httpd` & `a3gw`


#### Apache Web Server (`httpd`):

- Serves static assets (HTML, JS, CSS, etc.) together with A3GW Application Server (port 8444, some files are auth protected)
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
see `/a3gw/src/conf/server_config.json` & `/a3gw/ecosystem.config.js` (`PM2`).
- [server_config.json](stc/vcp/a3gw/vcp/conf.k8s/server_config.json)
- [service_proxies_config.json](stc/vcp/a3gw/vcp/conf.k8s/service_proxies_config.json)

```
User (AngularJS) → httpd (/site.json or /conf/server.json) → a3gw as configured (static file read)
```

**Backend API Request:**
Hits A3GW auth protected server on port 8444
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

## Main Paths & Responsibilities

[consolportals-sa-stc-vcp-httpd-ingress.yaml](stc/vcp/k8s/consolportals-sa-stc-vcp-httpd-ingress.yaml)
Access with default http ports (80, 443).

| Path                        | Handled By                           | Description                           |
|-----------------------------|--------------------------------------|---------------------------------------|
| `/adminportal`              | Ingress → httpd → a3gw → portal      | Static AngularJS SPA                  |
| `/vcp/services/*`           | Ingress → httpd → a3gw pod → Backend | Main API proxy routing                |
| `/cmpf-auth-rest/*`         | Ingress → httpd → a3gw (port 8445)   | Auth-related APIs                     |
| `/conf/*` & `/site.json`    | Ingress → httpd → a3gw               | Static JSON config for portal runtime |
| `/img/captcha.png`          | Ingress → httpd → a3gw (port 8445)   | CAPTCHA delivery                      |


---


# Issues




---
*Last updated: January 2026*
