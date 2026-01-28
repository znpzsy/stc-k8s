# ConsolPortals VCP Helm Chart

Helm chart for deploying the ConsolPortals VCP application stack (a3gw, httpd, adminportal, ccportal, partnerportal).

## Architecture

**Traffic Flow:**
```
Ingress (nginx) → httpd:80/443 → a3gw:8444/8445 → portals (8080-8082)
```

**Components:**
- **httpd**: Apache web server (Layer 1 proxy)
- **a3gw**: API Gateway (Layer 2 proxy) with session affinity
- **adminportal**: Admin portal (8080)
- **ccportal**: CC portal (8081)
- **partnerportal**: Partner portal (8082)

## Prerequisites

- Kubernetes cluster (Docker Desktop, minikube, or production cluster)
- kubectl configured
- Helm 3.x
- NGINX Ingress Controller (for ingress-based routing)

### Install NGINX Ingress Controller (Docker Desktop)

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml

# Verify installation
kubectl get pods -n ingress-nginx
```

## Installation

### 1. Basic Installation (Production defaults)

```bash
# Create namespace
kubectl create namespace stc-vcp-services

# Install chart with default values
helm install consolportals . -n stc-vcp-services
```

### 2. Local Mac Development

```bash
# Install with local overrides (no architecture suffix in tags)
helm install consolportals . \
  -f values.yaml \
  -f values-local.yaml \
  -n stc-vcp-services
```

### 3. Development Environment

```bash
# Install with dev environment settings
helm install consolportals . \
  -f values.yaml \
  -f values-dev.yaml \
  -n stc-vcp-services
```

### 4. Custom Namespace

```bash
# Override namespace in values
helm install consolportals . \
  --set global.namespace=my-custom-namespace \
  -n my-custom-namespace
```

## Configuration Files

### `values.yaml` (Base/Production)
- Uses `nexus.telenity.com` registry
- Tags with `-amd64` suffix
- 2 replicas per service
- Host: `consolportals.internal.telenity.com`
- Session affinity enabled for a3gw (3 hours)

### `values-local.yaml` (Mac Development)
- Same registry, but **no architecture suffix** in tags (`1.0.0.1`)
- Host: `localhost`
- Resource limits enabled
- Optional: Reduce to 1 replica per service to save resources

### `values-dev.yaml` (Dev Environment)
- Dev-specific ingress host
- 1 replica per service
- Resource limits enabled

## Image Tags

### Production/Linux (AMD64)
```yaml
image:
  repository: nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd
  tag: 1.0.0.1-amd64  # Architecture suffix
```

### Local Mac Development
```yaml
image:
  tag: 1.0.0.1  # No architecture suffix
```

**Important:** Make sure your images are pushed to the registry before deployment:
```bash
# Example for httpd
docker push nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.1
```

## Access Methods

### Option 1: Via Ingress (Recommended for testing full flow)

```bash
# After installation with ingress enabled
http://localhost/adminportal
http://localhost/ccportal
http://localhost/partnerportal
```

### Option 2: Via Port Forwarding (Recommended for debugging)

```bash
# Forward httpd
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 9080:80 9443:443 -n stc-vcp-services

# Forward a3gw (direct access)
kubectl port-forward svc/consolportals-sa-stc-vcp-a3gw-service 9444:8444 9445:8445 -n stc-vcp-services

# Access portals through httpd
http://localhost:9080/adminportal
```

## Key Features

### Session Affinity (a3gw)
The a3gw service has session affinity enabled to maintain user sessions:
```yaml
sessionAffinity: ClientIP
sessionAffinityConfig:
  clientIP:
    timeoutSeconds: 10800  # 3 hours
```

### Resource Limits (Optional)
httpd can have resource limits enabled:
```yaml
httpd:
  resources:
    enabled: true  # Set to true in values-local.yaml or values-dev.yaml
```

### Enable/Disable Components
```yaml
# Disable specific components
adminportal:
  enabled: false
```

## Useful Commands

### Deployment Management
```bash
# Upgrade existing deployment
helm upgrade consolportals . -f values-local.yaml -n stc-vcp-services

# Uninstall
helm uninstall consolportals -n stc-vcp-services

# Dry-run to see rendered templates
helm install consolportals . --dry-run --debug -n stc-vcp-services
```

### Monitoring
```bash
# Check pod status
kubectl get pods -n stc-vcp-services

# Check services
kubectl get services -n stc-vcp-services

# Check ingress
kubectl get ingress -n stc-vcp-services

# View logs
kubectl logs -f deployment/consolportals-sa-stc-vcp-httpd-deployment -n stc-vcp-services
kubectl logs -f deployment/consolportals-sa-stc-vcp-a3gw-deployment -n stc-vcp-services
```

### Troubleshooting
```bash
# Describe a failing pod
kubectl describe pod <pod-name> -n stc-vcp-services

# Get events
kubectl get events -n stc-vcp-services --sort-by='.lastTimestamp'

# Check if images can be pulled
kubectl run test-pull --image=nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.1 --rm -it --restart=Never -n stc-vcp-services
```

### Port Forwarding Management
```bash
# Kill all port-forwards
pkill -f "kubectl port-forward"

# Find what's using a port
lsof -ti:9080 | xargs kill

# List running port-forwards
ps aux | grep "kubectl port-forward"
```

## Switching Between Ingress and Port Forwarding

### From Ingress to Port Forwarding
```bash
# 1. Delete ingress
kubectl delete ingress consolportals-sa-stc-vcp-ingress -n stc-vcp-services

# 2. Start port forwarding
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 9080:80 9443:443 -n stc-vcp-services &
```

### From Port Forwarding to Ingress
```bash
# 1. Kill port forwards
pkill -f "kubectl port-forward"

# 2. Reapply ingress (or upgrade helm chart with ingress.enabled=true)
helm upgrade consolportals . -f values-local.yaml --set ingress.enabled=true -n stc-vcp-services
```

## Customization Examples

### Use Different Registry
```bash
helm install consolportals . \
  --set a3gw.image.repository=my-registry.com/a3gw \
  --set adminportal.image.repository=my-registry.com/adminportal \
  -n stc-vcp-services
```

### Change Replica Counts
```bash
helm install consolportals . \
  --set a3gw.replicaCount=3 \
  --set httpd.replicaCount=3 \
  -n stc-vcp-services
```

### Disable Ingress (Use Port Forwarding Only)
```bash
helm install consolportals . \
  --set ingress.enabled=false \
  -n stc-vcp-services
```

## File Structure
```
chart/
├── Chart.yaml                      # Chart metadata
├── values.yaml                     # Base/production values
├── values-local.yaml               # Local Mac development
├── values-dev.yaml                 # Dev environment
├── templates/
│   ├── _helpers.tpl                # Template helpers
│   ├── a3gw-deployment.yaml
│   ├── a3gw-service.yaml           # Includes session affinity
│   ├── adminportal-deployment.yaml
│   ├── adminportal-service.yaml
│   ├── ccportal-deployment.yaml
│   ├── ccportal-service.yaml
│   ├── partnerportal-deployment.yaml
│   ├── partnerportal-service.yaml
│   ├── httpd-deployment.yaml       # Includes optional resource limits
│   ├── httpd-service.yaml
│   └── ingress.yaml                # Routes all traffic to httpd
└── README.md
```

## Notes

- **Images must be pre-pushed to registry** - This chart pulls from the registry, it doesn't build images
- **Session affinity is critical** for a3gw to maintain user sessions
- **httpd handles routing** - The ingress just routes to httpd, which then proxies to a3gw and portals
- **Future work**: Kafka logging, CI/CD pipeline integration

## Support

For issues or questions, refer to the original `deploy-k8s.sh` script for the manual deployment workflow.
