# ConsolPortals STC VCP Deployment Guide

This guide provides step-by-step instructions for deploying ConsolPortals using Helm.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment-Specific Deployments](#environment-specific-deployments)
4. [Configuration](#configuration)
5. [Upgrading](#upgrading)
6. [Troubleshooting](#troubleshooting)
7. [Rollback](#rollback)
8. [Cleanup](#cleanup)

## Prerequisites

Before deploying, ensure you have:

1. **Kubernetes Cluster**: v1.19 or higher
2. **Helm**: v3.0 or higher
3. **kubectl**: Configured to access your cluster
4. **Nginx Ingress Controller**: Installed in your cluster

### Verify Prerequisites

```bash
# Check Kubernetes connection
kubectl cluster-info

# Check Helm version
helm version

# Check Nginx Ingress Controller
kubectl get pods -n ingress-nginx
```

## Quick Start

### Using the Install Script (Recommended)

The easiest way to deploy is using the provided install script:

```bash
# Development deployment
./install.sh -e development

# Production deployment
./install.sh -e production -n stc-vcp-services-prod

# Dry run to preview changes
./install.sh --dry-run -e production
```

### Manual Installation

If you prefer manual installation:

```bash
# 1. Create namespace
kubectl create namespace stc-vcp-services

# 2. Install with default values
helm install consolportals . -n stc-vcp-services

# 3. Install with development values
helm install consolportals . -n stc-vcp-services -f values-development.yaml

# 4. Install with production values
helm install consolportals . -n stc-vcp-services -f values-production.yaml
```

## Environment-Specific Deployments

### Development Environment

For local development and testing:

```bash
# Using install script
./install.sh -e development

# Manual installation
helm install consolportals . \
  -n stc-vcp-services-dev \
  -f values-development.yaml
```

**Development Features:**
- Single replica for each component
- Minimal resource requests
- Localhost ingress enabled
- `IfNotPresent` image pull policy
- No security constraints

**Access:**
```bash
# Application will be available at:
http://localhost
```

### Production Environment

For production deployments:

```bash
# Using install script
./install.sh -e production -n stc-vcp-services-prod

# Manual installation
helm install consolportals . \
  -n stc-vcp-services-prod \
  -f values-production.yaml
```

**Production Features:**
- 3 replicas for high availability
- Increased resource limits
- Pod anti-affinity for better distribution
- Security contexts enabled
- Always pull latest images
- SSL/TLS termination
- Production domain configuration

**Important Production Checklist:**
- [ ] Update image tags to specific versions
- [ ] Configure production domain in values
- [ ] Set up TLS certificates
- [ ] Configure resource limits based on load testing
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategies
- [ ] Review security contexts

### Staging Environment

Create a custom values file for staging:

```yaml
# values-staging.yaml
global:
  imageTag: "1.0.0-rc1"

httpd:
  replicaCount: 2
  resources:
    limits:
      memory: "768Mi"
      cpu: "750m"

ingress:
  httpd:
    hosts:
      - host: console.staging.example.com
        paths:
          - path: /
            pathType: Prefix
```

Deploy staging:
```bash
helm install consolportals . \
  -n stc-vcp-services-staging \
  -f values-staging.yaml
```

## Configuration

### Common Configuration Scenarios

#### 1. Change Image Version

```bash
# Upgrade to version 1.0.0.3
helm upgrade consolportals . \
  -n stc-vcp-services \
  --set global.imageTag=1.0.0.3
```

#### 2. Scale Replicas

```bash
# Scale HTTPD to 5 replicas
helm upgrade consolportals . \
  -n stc-vcp-services \
  --set httpd.replicaCount=5
```

#### 3. Disable a Component

```bash
# Disable Partner Portal
helm upgrade consolportals . \
  -n stc-vcp-services \
  --set partnerportal.enabled=false
```

#### 4. Adjust Resource Limits

```bash
helm upgrade consolportals . \
  -n stc-vcp-services \
  --set httpd.resources.limits.memory=2Gi \
  --set httpd.resources.limits.cpu=2000m
```

#### 5. Configure Custom Domain

Create a custom values file:

```yaml
# custom-domain.yaml
ingress:
  httpd:
    hosts:
      - host: myapp.example.com
        paths:
          - path: /
            pathType: Prefix
    local:
      enabled: false
```

Deploy:
```bash
helm upgrade consolportals . \
  -n stc-vcp-services \
  -f custom-domain.yaml
```

## Upgrading

### Using Install Script

```bash
# Upgrade with new configuration
./install.sh -u -e production
```

### Manual Upgrade

```bash
# Basic upgrade
helm upgrade consolportals . -n stc-vcp-services

# Upgrade with new values
helm upgrade consolportals . \
  -n stc-vcp-services \
  -f values-production.yaml

# Upgrade with specific version
helm upgrade consolportals . \
  -n stc-vcp-services \
  --set global.imageTag=1.0.0.4
```

### Rolling Update Strategy

The deployments use the default rolling update strategy. Monitor the upgrade:

```bash
# Watch pods during upgrade
kubectl get pods -n stc-vcp-services -w

# Check rollout status
kubectl rollout status deployment/consolportals-sa-stc-vcp-httpd-deployment -n stc-vcp-services
kubectl rollout status deployment/consolportals-sa-stc-vcp-a3gw-deployment -n stc-vcp-services
```

## Troubleshooting

### Check Deployment Status

```bash
# Check Helm release status
helm status consolportals -n stc-vcp-services

# List all pods
kubectl get pods -n stc-vcp-services

# Check pod details
kubectl describe pod <pod-name> -n stc-vcp-services

# View pod logs
kubectl logs <pod-name> -n stc-vcp-services

# Follow logs
kubectl logs -f <pod-name> -n stc-vcp-services
```

### Common Issues

#### Pods Not Starting

**Check events:**
```bash
kubectl get events -n stc-vcp-services --sort-by='.lastTimestamp'
```

**Check pod status:**
```bash
kubectl describe pod <pod-name> -n stc-vcp-services
```

**Common causes:**
- Image pull errors (check registry credentials)
- Insufficient resources (check node resources)
- Configuration errors (check mounted configs)

#### Image Pull Errors

```bash
# Verify image exists
docker pull nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.1

# Check imagePullSecrets if using private registry
kubectl get secrets -n stc-vcp-services
```

#### Ingress Not Working

```bash
# Check ingress status
kubectl get ingress -n stc-vcp-services

# Describe ingress
kubectl describe ingress consolportals-sa-stc-vcp-httpd-ingress -n stc-vcp-services

# Check nginx ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

#### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n stc-vcp-services

# Test service connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -n stc-vcp-services -- wget -O- http://consolportals-sa-stc-vcp-httpd-service
```

### Debug Mode

Run a debug pod to test connectivity:

```bash
# Start debug pod
kubectl run -it --rm debug \
  --image=nicolaka/netshoot \
  --restart=Never \
  -n stc-vcp-services \
  -- /bin/bash

# From inside debug pod, test services:
curl http://consolportals-sa-stc-vcp-httpd-service
curl http://consolportals-sa-stc-vcp-a3gw-service:8444
```

## Rollback

### View Release History

```bash
helm history consolportals -n stc-vcp-services
```

### Rollback to Previous Version

```bash
# Rollback to previous version
helm rollback consolportals -n stc-vcp-services

# Rollback to specific revision
helm rollback consolportals 2 -n stc-vcp-services
```

### Verify Rollback

```bash
# Check pods after rollback
kubectl get pods -n stc-vcp-services

# Verify running version
kubectl get pods -n stc-vcp-services -o jsonpath='{.items[0].spec.containers[0].image}'
```

## Cleanup

### Uninstall Using Script

```bash
./install.sh --uninstall
```

### Manual Uninstall

```bash
# Uninstall the chart
helm uninstall consolportals -n stc-vcp-services

# Optional: Delete namespace
kubectl delete namespace stc-vcp-services
```

### Verify Cleanup

```bash
# Verify no resources remain
kubectl get all -n stc-vcp-services

# Check for persistent volumes (if any)
kubectl get pv
```

## Monitoring and Maintenance

### Regular Health Checks

```bash
# Check pod health
kubectl get pods -n stc-vcp-services

# Check resource usage
kubectl top pods -n stc-vcp-services
kubectl top nodes

# Check for pod restarts
kubectl get pods -n stc-vcp-services -o custom-columns=NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount
```

### Backup and Restore

**Backup Helm values:**
```bash
helm get values consolportals -n stc-vcp-services > backup-values.yaml
```

**Restore from backup:**
```bash
helm upgrade consolportals . -n stc-vcp-services -f backup-values.yaml
```

## Best Practices

1. **Use Version Control**: Store your values files in git
2. **Tag Images**: Always use specific image tags in production
3. **Test Changes**: Use `--dry-run` to preview changes
4. **Monitor Deployments**: Watch pod status during upgrades
5. **Keep Backups**: Backup values and configurations
6. **Document Changes**: Maintain a changelog of modifications
7. **Use Namespaces**: Separate environments by namespace
8. **Set Resource Limits**: Always define resource requests and limits
9. **Review Security**: Regular security audits of configurations
10. **Plan Rollbacks**: Test rollback procedures before needed

## Support

For additional help:

- Check the [README.md](README.md) for detailed configuration options
- Review pod logs for application errors
- Check Kubernetes events for cluster issues
- Consult the values files for available configuration options

## Appendix: Useful Commands

```bash
# Get all resources in namespace
kubectl get all -n stc-vcp-services

# Get detailed resource information
kubectl get all -n stc-vcp-services -o wide

# Export current deployment as YAML
kubectl get deployment consolportals-sa-stc-vcp-httpd-deployment -n stc-vcp-services -o yaml

# Get Helm release values
helm get values consolportals -n stc-vcp-services

# Get complete Helm manifest
helm get manifest consolportals -n stc-vcp-services

# Test Helm chart without installing
helm install consolportals . --dry-run --debug -n stc-vcp-services
```
