# Project Deployment Guide

This guide covers three deployment methods for the Containerized Portal Stack: Docker Compose (dev), Docker Compose (prod), and Kubernetes (local).

## Overview

The project consists of multiple services:
- **`a3gw`**: Node.js proxy server (ports 8444, 8445)
- **`dspadminportal`**: Admin portal (port 8080)
- **`dspccportal`**: CC portal (port 8081)
- **`dsppartnerportal`**: Partner portal (port 8082)
- **`httpd`**: Apache web server (ports 9080, 9443)

## Prerequisites

- Docker Desktop installed and running
- For Kubernetes: Enable Kubernetes in Docker Desktop

---

## Method 1: Docker Compose (Development)
Hot-reloading development environment with volume mounts for live code changes.

### Quick Start
```bash
# Navigate to project directory
cd mobily/dsp

# Start all services in development mode
# docker-compose -f docker-compose.dev.yml up --build -d  ## For detached mode
docker-compose -f docker-compose.dev.yml up --build
# To stop the containers:
docker-compose -f docker-compose.dev.yml down

# To remove all stopped containers, networks, images, and volumes:
docker-compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
# To force recreation of containers (complete clean start):
docker compose -f docker-compose.dev.yml  up --build --force-recreate

# To rebuild the images without using cache:
docker-compose -f docker-compose.dev.yml build --no-cache
# To view logs:
docker-compose -f docker-compose.dev.yml logs -f
# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f a3gw
# Restart specific service
# docker-compose -f docker-compose.dev.yml restart <service_name>
docker-compose -f docker-compose.dev.yml restart dspadminportal
# To run a specific service:
# docker-compose -f docker-compose.dev.yml up --build <service_name>
docker-compose -f docker-compose.dev.yml up --build dspccportal

```

### Development Features
- **Volume Mounts**: Live code reloading for all services
- **Development Configs**: Uses `conf.dev` and `static.dev` directories
- **Gulp Watch**: Portals run with `gulp server` for automatic rebuilds

### Access Points
- Admin Portal: http://localhost:8080 → http://localhost/adminportal
- CC Portal: http://localhost:8081 → http://localhost/ccportal
- Partner Portal: http://localhost:8082 → http://localhost/partnerportal

---

## Method 2: Docker Compose Production

### Purpose
Production-like environment with optimized builds and no volume mounts.

### Quick Start
```bash
# Navigate to project directory
cd mobily/dsp

# Start all services in development mode
# docker-compose -f docker-compose.prod.yml up --build -d  ## For detached mode
docker-compose -f docker-compose.prod.yml up --build
# To stop the containers:
docker-compose -f docker-compose.prod.yml down

# To remove all stopped containers, networks, images, and volumes:
docker-compose -f docker-compose.prod.yml down --rmi all --volumes --remove-orphans
# To force recreation of containers (complete clean start):
docker compose -f docker-compose.prod.yml  up --build --force-recreate

# To rebuild the images without using cache:
docker-compose -f docker-compose.prod.yml build --no-cache
# To view logs:
docker-compose -f docker-compose.prod.yml logs -f
# View logs for specific service
docker-compose -f docker-compose.prod.yml logs -f a3gw
# Restart specific service
# docker-compose -f docker-compose.prod.yml restart <service_name>
docker-compose -f docker-compose.prod.yml restart dspadminportal
# To run a specific service:
# docker-compose -f docker-compose.prod.yml up --build <service_name>
docker-compose -f docker-compose.prod.yml up --build dspccportal
```

### Production Features
- **Production Configs**: Uses `conf.prod` and `static.prod` directories
- **Health Checks**: Built-in health monitoring for all services (TBD)
- **Platform Support**: ARM64 compatibility for Apple Silicon

### Access Points
Same as development mode (ports 8080-8082, 8444-8445, 9080, 9443)
- Admin Portal: http://localhost:8080 → http://localhost/adminportal
- CC Portal: http://localhost:8081 → http://localhost/ccportal
- Partner Portal: http://localhost:8082 → http://localhost/partnerportal


---

## Method 3: Kubernetes (Local Docker Desktop)

### Prerequisites Setup
```bash
# 1. Enable Kubernetes in Docker Desktop
# Open Docker Desktop → Settings → Kubernetes → Enable Kubernetes → Apply & Restart

# 2. Verify kubectl is working
kubectl version --client
kubectl cluster-info
kubectl get nodes

# 3. Check system pods are running
kubectl get pods -n kube-system
```

### Deployment Process
```bash
# Navigate to Kubernetes directory
cd mobily/dsp/k8s

# Make deployment script executable
chmod +x deploy-to-k8s.sh

# Run deployment (builds images and deploys to K8s)
./deploy-to-k8s.sh
```

### What the Script Does
1. **Cleanup**: Removes existing `dsp-services` namespace
2. **Build Images**: Rebuilds all Docker images with K8s-specific configs
3. **Deploy**: Creates namespace and applies all K8s manifests
4. **Verify**: Shows pod and service status
5. **Port Forward**: Automatically starts port forwarding for A3GW

### Manual Steps (Alternative)
```bash
# Build images manually
docker build -t mersin.telenity.com/com/telenity/consportals-sa-mobily-dsp-a3gw:1.0.0.1 -f ./a3gw/Dockerfile.dsp.k8slocal ./a3gw
docker build -t mersin.telenity.com/com/telenity/consportals-sa-mobily-dsp-adminportal:1.0.0.1 -f ./dsp-adminportal/Dockerfile.prod ./dsp-adminportal
docker build -t mersin.telenity.com/com/telenity/consportals-sa-mobily-dsp-ccportal:1.0.0.1 -f ./dsp-ccportal/Dockerfile.prod ./dsp-ccportal
docker build -t mersin.telenity.com/com/telenity/consportals-sa-mobily-dsp-partnerportal:1.0.0.1 -f ./dsp-partnerportal/Dockerfile.prod ./dsp-partnerportal

# Create namespace
kubectl create namespace dsp-services

# Deploy services
kubectl apply -f consportals_sa_mobily_dsp_a3gw.deployment.yaml -n dsp-services
kubectl apply -f consportals_sa_mobily_dsp_a3gw.service.yaml -n dsp-services
kubectl apply -f consportals_sa_mobily_dsp_adminportal.deployment.yaml -n dsp-services
kubectl apply -f consportals_sa_mobily_dsp_adminportal.service.yaml -n dsp-services

```

### Access Services
```bash
# Port forward A3GW (done automatically by script)
kubectl port-forward svc/consportals-sa-mobily-dsp-a3gw-service 8444:8444 8445:8445 -n dsp-services

# Port forward other services (in separate terminals, if needed)
kubectl port-forward svc/consportals-sa-mobily-dsp-adminportal-service 8080:8080 -n dsp-services
kubectl port-forward svc/consportals-sa-mobily-dsp-ccportal-service 8081:8081 -n dsp-services
kubectl port-forward svc/consportals-sa-mobily-dsp-partnerportal-service 8082:8082 -n dsp-services
```

### Kubernetes Troubleshooting
```bash
# View pod status
kubectl get pods -n dsp-services

# View service status
kubectl get services -n dsp-services

# View pod logs
kubectl logs -f deployment/consportals-sa-mobily-dsp-a3gw-deployment -n dsp-services

# Describe pod for detailed info
kubectl describe pod <pod-name> -n dsp-services

# View events in namespace
kubectl get events -n dsp-services

# Access pod shell for debugging
kubectl exec -it <pod-name> -n dsp-services -- sh
```

## Cleanup & Troubleshooting

### Stop All Services
```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.dev.yml down

# Stop any running containers
docker stop $(docker ps -q) 2>/dev/null || echo "No containers to stop"

# Kubernetes
kubectl delete namespace dsp-services

# Kill port-forward processes
pkill -f "kubectl port-forward" 2>/dev/null || echo "No port-forward processes found"
```

### Why Kubernetes Pods Keep Restarting

If you delete containers through Docker Desktop, they'll automatically restart. (Kubernetes maintains the state defined in your YAML manifests.)
> **Proper Deletion**: Use `kubectl delete` commands instead of Docker commands

```bash
# Correct way to stop a specific service
kubectl delete deployment consportals-sa-mobily-dsp-a3gw-deployment -n dsp-services

# Correct way to stop everything
kubectl delete namespace dsp-services
```

## Restart Options

After cleanup, choose your preferred method:

### Option 1: Docker Compose Development
```bash
docker-compose -f docker-compose.dev.yml up --build -d
```

### Option 2: Docker Compose Production
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### Option 3: Kubernetes
```bash
cd mobily/dsp
./deploy-to-k8s.sh
```

## Configuration Differences

| Method       | Config Directory           | Use Case         | Features                         |
|--------------|----------------------------|------------------|----------------------------------|
| Dev Compose  | `conf.dev`, `static.dev`   | Development      | Hot reload, volume mounts        |
| Prod Compose | `conf.prod`, `static.prod` | Testing/Staging  | Production builds, health checks |
| Kubernetes   | `conf.k8s`, `static.prod`  | Production/Cloud | Scalability, self-healing        |

## Common Issues

### Port Conflicts
If ports are in use, stop conflicting services or change ports in compose files.

### Build Failures
```bash
# Clear Docker cache and rebuild
docker system prune -f
docker-compose -f <compose-file> build --no-cache
```

### Kubernetes Context Issues
```bash
# Ensure using docker-desktop context
kubectl config use-context docker-desktop
kubectl config current-context
```
