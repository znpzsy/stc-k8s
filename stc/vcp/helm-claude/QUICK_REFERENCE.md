# ConsolPortals Helm Chart - Quick Reference

## Essential Commands

### Installation
```bash
# Development
./install.sh -e development

# Production
./install.sh -e production -n stc-vcp-services-prod

# Custom values
helm install consolportals . -n stc-vcp-services -f my-values.yaml
```

### Upgrade
```bash
# Upgrade with script
./install.sh -u -e production

# Manual upgrade
helm upgrade consolportals . -n stc-vcp-services -f values-production.yaml
```

### Uninstall
```bash
./install.sh --uninstall
# or
helm uninstall consolportals -n stc-vcp-services
```

## Monitoring

### Status
```bash
# Helm status
helm status consolportals -n stc-vcp-services

# Pods
kubectl get pods -n stc-vcp-services

# Services
kubectl get svc -n stc-vcp-services

# Ingress
kubectl get ingress -n stc-vcp-services
```

### Logs
```bash
# HTTPD logs
kubectl logs -f deployment/consolportals-sa-stc-vcp-httpd-deployment -n stc-vcp-services

# A3GW logs
kubectl logs -f deployment/consolportals-sa-stc-vcp-a3gw-deployment -n stc-vcp-services

# All pods
kubectl logs -f -l app.kubernetes.io/instance=consolportals -n stc-vcp-services --all-containers=true
```

## Troubleshooting

### Quick Diagnostics
```bash
# Events
kubectl get events -n stc-vcp-services --sort-by='.lastTimestamp'

# Pod details
kubectl describe pod <pod-name> -n stc-vcp-services

# Resource usage
kubectl top pods -n stc-vcp-services
```

### Common Fixes
```bash
# Restart deployment
kubectl rollout restart deployment/consolportals-sa-stc-vcp-httpd-deployment -n stc-vcp-services

# Delete problematic pod (will auto-recreate)
kubectl delete pod <pod-name> -n stc-vcp-services

# Scale replicas
kubectl scale deployment/consolportals-sa-stc-vcp-httpd-deployment --replicas=3 -n stc-vcp-services
```

## Port Forwarding

```bash
# HTTPD
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 9080:80 9443:443 -n stc-vcp-services

# A3GW
kubectl port-forward svc/consolportals-sa-stc-vcp-a3gw-service 8444:8444 8445:8445 -n stc-vcp-services

# Admin Portal
kubectl port-forward svc/consolportals-sa-stc-vcp-adminportal-service 8080:8080 -n stc-vcp-services
```

## Configuration Changes

### Update Image Version
```bash
helm upgrade consolportals . -n stc-vcp-services --set global.imageTag=1.0.0.3
```

### Scale Services
```bash
helm upgrade consolportals . -n stc-vcp-services \
  --set httpd.replicaCount=5 \
  --set a3gw.replicaCount=3
```

### Disable Component
```bash
helm upgrade consolportals . -n stc-vcp-services --set partnerportal.enabled=false
```

## Rollback

```bash
# View history
helm history consolportals -n stc-vcp-services

# Rollback to previous
helm rollback consolportals -n stc-vcp-services

# Rollback to specific revision
helm rollback consolportals 2 -n stc-vcp-services
```

## Testing

```bash
# Dry run
helm install consolportals . --dry-run --debug -n stc-vcp-services

# Template rendering
helm template consolportals . -f values-production.yaml

# Validate
helm lint .
```

## Backup & Restore

```bash
# Backup values
helm get values consolportals -n stc-vcp-services > backup-values.yaml

# Backup full manifest
helm get manifest consolportals -n stc-vcp-services > backup-manifest.yaml

# Restore
helm upgrade consolportals . -n stc-vcp-services -f backup-values.yaml
```

## Common Values Overrides

```yaml
# Image version
global:
  imageTag: "1.0.0.3"

# Resources
httpd:
  resources:
    limits:
      memory: "1Gi"
      cpu: "1000m"

# Replicas
httpd:
  replicaCount: 5

# Domain
ingress:
  httpd:
    hosts:
      - host: myapp.example.com
        paths:
          - path: /
            pathType: Prefix
```

## File Structure

```
consolportals-sa-stc-vcp/
├── Chart.yaml                      # Chart metadata
├── values.yaml                     # Default values
├── values-development.yaml         # Dev environment
├── values-production.yaml          # Prod environment
├── templates/                      # K8s manifests
├── install.sh                      # Installation script
├── README.md                       # Detailed docs
└── DEPLOYMENT_GUIDE.md            # Deployment guide
```

## Access URLs

| Environment | URL |
|------------|-----|
| Development | http://localhost |
| Production | http://console.production.example.com |

## Support

- Documentation: See [README.md](README.md) and [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Logs: `kubectl logs -f <pod-name> -n stc-vcp-services`
- Events: `kubectl get events -n stc-vcp-services`
