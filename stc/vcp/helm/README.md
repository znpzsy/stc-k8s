# consolportals-vcp (minimal Helm chart)

This is a **minimal** chart created from your existing Kubernetes manifests:
- a3gw (Deployment + Service)
- httpd (Deployment + Service)
- adminportal (Deployment + Service)
- the 5 ingresses routing paths to the a3gw service

## Why this chart is intentionally simple
No helpers, no fancy templates, no deep Helm patterns — just enough `values.yaml` to:
- change image tags
- change replica counts
- optionally set an ingress host

## Quick commands

```bash
# from the chart folder
helm lint .
helm template test .
helm install test . -n <your-namespace> --create-namespace
# upgrade later:
helm upgrade test . -n <your-namespace>
# uninstall:
helm uninstall test -n <your-namespace>
```

## Common edits in values.yaml
- image tags: `.a3gw.image.tag`, `.httpd.image.tag`, `.adminportal.image.tag`
- replicas: `.a3gw.replicaCount`, etc.
- ingress host (optional): `.ingress.host` (leave empty for catch-all)
