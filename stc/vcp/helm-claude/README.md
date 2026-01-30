# ConsolPortals STC VCP Helm Chart

A Helm chart for deploying the ConsolPortals STC VCP (Virtual Customer Portal) application on Kubernetes.

## Overview

This Helm chart deploys a complete ConsolPortals VCP environment including:

- **HTTPD**: Apache HTTP Server for serving static content and reverse proxy
- **A3GW**: API Gateway for routing and authentication
- **Admin Portal**: Administrative interface (port 8080)
- **CC Portal**: Customer Care portal (port 8081)
- **Partner Portal**: Partner management interface (port 8082)

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Nginx Ingress Controller (if using ingress)

## Installation

### Basic Installation

```bash
# Create namespace
kubectl create namespace stc-vcp-services

# Install the chart
helm install consolportals ./consolportals-sa-stc-vcp -n stc-vcp-services
```

### Installation with Custom Values

```bash
helm install consolportals ./consolportals-sa-stc-vcp \
  -n stc-vcp-services \
  --set httpd.replicaCount=3 \
  --set global.imageTag=1.0.0.2
```

### Installation from Custom Values File

```bash
helm install consolportals ./consolportals-sa-stc-vcp \
  -n stc-vcp-services \
  -f custom-values.yaml
```

## Upgrading

```bash
# Upgrade with new values
helm upgrade consolportals ./consolportals-sa-stc-vcp \
  -n stc-vcp-services \
  --set global.imageTag=1.0.0.3

# Upgrade with values file
helm upgrade consolportals ./consolportals-sa-stc-vcp \
  -n stc-vcp-services \
  -f custom-values.yaml
```

## Uninstallation

```bash
helm uninstall consolportals -n stc-vcp-services
```

## Configuration

The following table lists the main configurable parameters of the chart and their default values.

### Global Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.registry` | Docker registry | `nexus.telenity.com/com/telenity` |
| `global.imageTag` | Default image tag for all services | `1.0.0.1` |
| `global.imagePullPolicy` | Image pull policy | `IfNotPresent` |
| `namespace` | Kubernetes namespace | `stc-vcp-services` |

### HTTPD Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `httpd.enabled` | Enable HTTPD deployment | `true` |
| `httpd.replicaCount` | Number of HTTPD replicas | `2` |
| `httpd.service.type` | Service type | `ClusterIP` |
| `httpd.service.ports.http` | HTTP port | `80` |
| `httpd.service.ports.https` | HTTPS port | `443` |
| `httpd.resources.limits.memory` | Memory limit | `512Mi` |
| `httpd.resources.limits.cpu` | CPU limit | `500m` |

### A3GW Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `a3gw.enabled` | Enable A3GW deployment | `true` |
| `a3gw.replicaCount` | Number of A3GW replicas | `2` |
| `a3gw.service.sessionAffinity` | Session affinity type | `ClientIP` |
| `a3gw.service.sessionAffinityTimeout` | Session timeout in seconds | `10800` |
| `a3gw.service.ports.portals` | Portals port | `8444` |
| `a3gw.service.ports.auth` | Auth port | `8445` |

### Portal Parameters

Each portal (adminportal, ccportal, partnerportal) has similar configuration options:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `{portal}.enabled` | Enable portal deployment | `true` |
| `{portal}.replicaCount` | Number of replicas | `2` |
| `{portal}.service.port` | Service port | `8080/8081/8082` |

### Ingress Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `nginx` |
| `ingress.httpd.enabled` | Enable HTTPD ingress | `true` |
| `ingress.httpd.local.enabled` | Enable local development ingress | `true` |
| `ingress.httpd.local.host` | Local host | `localhost` |
| `ingress.services.enabled` | Enable services ingress | `true` |

## Usage Examples

### Local Development

For local development with localhost access:

```bash
helm install consolportals ./consolportals-sa-stc-vcp \
  -n stc-vcp-services \
  --set ingress.httpd.local.enabled=true
```

Then access via: http://localhost

### Production Deployment

For production with custom domain:

```yaml
# production-values.yaml
ingress:
  httpd:
    hosts:
      - host: console.example.com
        paths:
          - path: /
            pathType: Prefix
    local:
      enabled: false

httpd:
  replicaCount: 3
  resources:
    limits:
      memory: "1Gi"
      cpu: "1000m"
    requests:
      memory: "512Mi"
      cpu: "500m"

a3gw:
  replicaCount: 3
```

```bash
helm install consolportals ./consolportals-sa-stc-vcp \
  -n stc-vcp-services \
  -f production-values.yaml
```

### Disabling Components

To disable specific components:

```bash
helm install consolportals ./consolportals-sa-stc-vcp \
  -n stc-vcp-services \
  --set partnerportal.enabled=false
```

## Monitoring and Debugging

### View Deployed Resources

```bash
# List all pods
kubectl get pods -n stc-vcp-services

# List all services
kubectl get services -n stc-vcp-services

# List all ingresses
kubectl get ingress -n stc-vcp-services
```

### View Logs

```bash
# HTTPD logs
kubectl logs -f deployment/consolportals-sa-stc-vcp-httpd-deployment -n stc-vcp-services

# A3GW logs
kubectl logs -f deployment/consolportals-sa-stc-vcp-a3gw-deployment -n stc-vcp-services

# Admin Portal logs
kubectl logs -f deployment/consolportals-sa-stc-vcp-adminportal-deployment -n stc-vcp-services
```

### Port Forwarding for Testing

```bash
# Forward HTTPD
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 9080:80 9443:443 -n stc-vcp-services

# Forward A3GW
kubectl port-forward svc/consolportals-sa-stc-vcp-a3gw-service 8444:8444 8445:8445 -n stc-vcp-services

# Forward Admin Portal
kubectl port-forward svc/consolportals-sa-stc-vcp-adminportal-service 8080:8080 -n stc-vcp-services
```

### Describe Resources

```bash
# Describe a pod
kubectl describe pod <pod-name> -n stc-vcp-services

# Describe a service
kubectl describe service consolportals-sa-stc-vcp-httpd-service -n stc-vcp-services
```

## Chart Structure

```
consolportals-sa-stc-vcp/
├── Chart.yaml                    # Chart metadata
├── values.yaml                   # Default configuration values
├── templates/
│   ├── _helpers.tpl             # Template helper functions
│   ├── serviceaccount.yaml      # Service account
│   ├── httpd-deployment.yaml    # HTTPD deployment
│   ├── httpd-service.yaml       # HTTPD service
│   ├── httpd-ingress.yaml       # HTTPD ingress
│   ├── a3gw-deployment.yaml     # A3GW deployment
│   ├── a3gw-service.yaml        # A3GW service
│   ├── portals-deployment.yaml  # Portal deployments
│   ├── portals-service.yaml     # Portal services
│   └── services-ingress.yaml    # Services ingress routing
└── README.md                     # This file
```

## Troubleshooting

### Pods not starting

Check pod status and events:
```bash
kubectl get pods -n stc-vcp-services
kubectl describe pod <pod-name> -n stc-vcp-services
```

### Image pull errors

Verify image repository and credentials:
```bash
kubectl get events -n stc-vcp-services --sort-by='.lastTimestamp'
```

### Ingress not working

Verify ingress configuration:
```bash
kubectl get ingress -n stc-vcp-services
kubectl describe ingress consolportals-sa-stc-vcp-httpd-ingress -n stc-vcp-services
```

## Support

For issues and questions:
- Check the logs using `kubectl logs`
- Review the Kubernetes events using `kubectl get events`
- Consult the values.yaml for configuration options

## License

Copyright © 2024 Telenity
