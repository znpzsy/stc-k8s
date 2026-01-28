# Migration Guide: Raw K8s Manifests → Helm Chart

## Summary of Changes

### What's Been Fixed

1. **Registry Updated**: `mersin.telenity.com` → `nexus.telenity.com`
2. **Session Affinity Added**: a3gw service now includes 3-hour session affinity (critical for stateful sessions)
3. **Ingress Simplified**: Properly routes all traffic through httpd (matches your Phase 2 approach)
4. **Resource Limits**: Optional resource limits for httpd (can be enabled in values)
5. **Syntax Errors Fixed**: ccportal and partnerportal deployment indentation corrected
6. **Multi-Environment Support**: values-local.yaml for Mac, values-dev.yaml for dev

### What Stayed the Same

- All service names, ports, and selectors unchanged
- Deployment replica counts (2 by default)
- Image pull policy (IfNotPresent)
- Original resource names preserved (no Helm release prefixes)
- httpd-based routing architecture maintained

## Key Differences: Old vs New

### Image Tags

**Old manifests:**
```yaml
image: mersin.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.1
```

**New Helm (Production):**
```yaml
repository: nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd
tag: 1.0.0.1-amd64
```

**New Helm (Mac Local):**
```yaml
tag: 1.0.0.1  # No architecture suffix
```

### Session Affinity (CRITICAL)

**Old manifests (consolportals_sa_stc_vcp_a3gw.service.yaml):**
```yaml
sessionAffinity: ClientIP
sessionAffinityConfig:
  clientIP:
    timeoutSeconds: 10800
```

**New Helm:** Now included! Controlled by values:
```yaml
a3gw:
  sessionAffinity:
    enabled: true
    timeout: 10800
```

### Ingress Evolution

**Phase 1 (consolportals_sa_stc_ingress.yaml):**
- 5 separate Ingress resources
- Direct routing to a3gw with path rewrites
- Complex nginx annotations

**Phase 2 (consolportals-sa-stc-vcp-httpd-ingress.yaml):**
- Single ingress: everything → httpd:80
- httpd handles all proxy logic
- Simple nginx annotations

**New Helm Chart:**
- Follows Phase 2 approach
- Annotations configurable in values.yaml
- Hostname configurable per environment

## Deployment Comparison

### Old Way (deploy-k8s.sh)

```bash
# 1. Build images locally
docker build -t mersin.telenity.com/.../httpd:1.0.0.1 .

# 2. Push to registry
docker push mersin.telenity.com/.../httpd:1.0.0.1

# 3. Apply manifests
kubectl apply -f consolportals_sa_stc_vcp_httpd_deployment.yaml
kubectl apply -f consolportals_sa_stc_vcp_httpd_service.yaml
# ... repeat for all services

# 4. Optionally setup port forwarding
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 9080:80
```

### New Way (Helm)

```bash
# Images still pushed manually (same as before)
docker push nexus.telenity.com/.../httpd:1.0.0.1

# Deploy everything with one command
helm install consolportals . -f values-local.yaml -n stc-vcp-services

# Upgrade is also simple
helm upgrade consolportals . -f values-local.yaml -n stc-vcp-services
```

## Environment-Specific Deployment

### Production
```bash
helm install consolportals . -f values.yaml -n stc-vcp-services
```
- Uses nexus registry
- Tags with -amd64 suffix
- 2 replicas per service
- Host: consolportals.internal.telenity.com

### Local Mac
```bash
helm install consolportals . -f values.yaml -f values-local.yaml -n stc-vcp-services
```
- Same nexus registry
- Tags WITHOUT architecture suffix
- localhost ingress
- Resource limits enabled

### Dev Environment
```bash
helm install consolportals . -f values.yaml -f values-dev.yaml -n stc-vcp-services
```
- Dev-specific hostname
- 1 replica per service
- Resource limits enabled

## What You Need to Do

### 1. Update deploy-k8s.sh (Optional)
Change registry in line 7:
```bash
# Old
REGISTRY="mersin.telenity.com/com/telenity"

# New
REGISTRY="nexus.telenity.com/com/telenity"
```

### 2. Push Images to Nexus Registry
```bash
# For production (AMD64)
docker push nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.1-amd64
docker push nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-a3gw:1.0.0.1-amd64
# ... etc

# For Mac (no suffix)
docker push nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.1
docker push nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-a3gw:1.0.0.1
# ... etc
```

### 3. Test Helm Deployment

#### Dry-run First
```bash
helm install consolportals . -f values-local.yaml -n stc-vcp-services --dry-run --debug
```

#### Actual Deployment
```bash
# Create namespace
kubectl create namespace stc-vcp-services

# Install
helm install consolportals . -f values-local.yaml -n stc-vcp-services

# Check status
kubectl get pods -n stc-vcp-services
kubectl get svc -n stc-vcp-services
kubectl get ingress -n stc-vcp-services
```

## Compatibility Matrix

| Environment | Registry | Tag Format | Values File | Replicas |
|------------|----------|------------|-------------|----------|
| Production | nexus | 1.0.0.1-amd64 | values.yaml | 2 |
| Mac Local | nexus | 1.0.0.1 | values-local.yaml | 2 (or 1) |
| Dev | nexus | 1.0.0.1-amd64 | values-dev.yaml | 1 |

## Troubleshooting

### "ImagePullBackOff" errors
- Check if images exist in nexus registry
- Verify tag format (with/without -amd64)
- Check image pull policy in values

### Session not maintained across requests
- Verify a3gw service has session affinity enabled
- Check timeout value (should be 10800 seconds = 3 hours)

### Ingress not working
- Verify NGINX ingress controller is installed
- Check ingress host matches your DNS/hosts file
- Try port-forward as alternative

### Resource limits causing OOMKilled
- Disable resource limits: `httpd.resources.enabled: false`
- Or increase limits in values file

## Future Considerations

### CI/CD Integration
When you build CI/CD pipeline:
1. Build multi-arch images or separate AMD64/ARM64 images
2. Tag with version + architecture
3. Push to nexus registry
4. Helm upgrade in pipeline
5. Consider GitOps (ArgoCD/Flux)

### Kafka Logging (A3GW)
For future Kafka integration:
1. Add Kafka configuration to values.yaml
2. Create ConfigMap for a3gw logging config
3. Mount ConfigMap in a3gw deployment
4. Add Kafka sidecar or fluentd DaemonSet

### Observability
Consider adding:
- Prometheus metrics
- Grafana dashboards
- Loki for log aggregation
- Jaeger for tracing

## Questions?

If anything is unclear about the Helm chart or migration, let me know!
