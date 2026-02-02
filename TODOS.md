# The never ending todo list

- Cleanup doc files and make it make sense
- A3GW service-proxies.json **ConfigMap** not ready, currently static file packed into the docker container
- Ingress -> httpd --> a3gw --> portals OR Ingress --> a3gw --> portals ?????
- Produce semi-production-ready manifests & charts
  - Add Health probes (Liveness & Readiness)
  - Add Resource requests & limits
  - Add Dependency Mgmt properly? 



After (Improved Manifests)
- Full health monitoring with auto-restart
- Resource isolation and guarantees
- Automatic dependency resolution
- Production environment configuration
- High availability guarantees (PDBs)
- Zero-downtime deployments
- Graceful shutdown handling
- One-command deployment (Kustomize)
- Consistent labeling for monitoring
- Session affinity for user experience

---
*Last updated: January 2026*
