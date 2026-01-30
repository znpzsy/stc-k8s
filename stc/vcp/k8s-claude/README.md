# ConsolPortals STC VCP - Improved Kubernetes Manifests

## 🚀 Key Improvements

### 1. **Health Checks (Liveness & Readiness Probes)**
- **Liveness probes**: Detect and restart unhealthy containers
- **Readiness probes**: Control traffic routing to healthy pods only
- Prevents traffic to pods during startup or when unhealthy
- Matches healthcheck configs from docker-compose

### 2. **Resource Management**
- Added resource requests and limits to ALL deployments
- Ensures predictable scheduling and prevents resource starvation
- Protects cluster from memory leaks or runaway processes

**Resources per component:**
```
httpd:         256Mi-512Mi RAM, 250m-500m CPU
a3gw:          512Mi-1Gi RAM,  500m-1000m CPU
portals:       384Mi-768Mi RAM, 250m-750m CPU
```

### 3. **Dependency Management**
- Added `initContainers` to wait for service dependencies
- Prevents startup errors when services aren't ready
- Matches `depends_on` behavior from docker-compose:
  - a3gw waits for httpd
  - All portals wait for httpd + a3gw

### 4. **Environment Variables**
- Added `NODE_ENV=production` to all Node.js services
- Added `DOCKER_OPTS` for a3gw (registry configuration)
- Matches docker-compose environment configuration

### 5. **Consistent Labeling**
- Added hierarchical labels for better organization:
  - `app: consolportals-sa-stc-vcp` (application)
  - `component: vcp-*` (component type)
  - `version: 1.0.0.1` (version tracking)
- Enables better filtering, monitoring, and service mesh integration

### 6. **Rolling Update Strategy**
- Configured `RollingUpdate` with:
  - `maxSurge: 1` - One extra pod during updates
  - `maxUnavailable: 0` - Zero downtime deployments
- Added `preStop` lifecycle hooks for graceful shutdown

### 7. **Pod Disruption Budgets (PDBs)**
- Ensures at least 1 pod remains available during:
  - Node maintenance
  - Cluster upgrades
  - Voluntary disruptions
- Protects application availability

### 8. **Session Affinity**
- Maintained ClientIP session affinity for a3gw (3 hours)
- Added cookie-based sticky sessions at Ingress level
- Ensures consistent user experience

### 9. **Removed Redundant Resources**
- Removed standalone `pod.yaml` files
- Deployments automatically manage pods
- Reduces configuration duplication

### 10. **Kustomize Support**
- Added `kustomization.yaml` for unified deployment
- Enables environment-specific overlays
- Simplifies version management

## 📦 File Structure

```
.
├── kustomization.yaml                                      # Kustomize config
├── consolportals-sa-stc-vcp-httpd-ingress.yaml            # Ingress (unchanged)
│
├── Deployments/
│   ├── consolportals_sa_stc_vcp_httpd.deployment.yaml     # ✅ Improved
│   ├── consolportals_sa_stc_vcp_a3gw.deployment.yaml      # ✅ Improved
│   ├── consolportals_sa_stc_vcp_adminportal.deployment.yaml # ✅ Improved
│   ├── consolportals_sa_stc_vcp_ccportal.deployment.yaml  # ✅ Improved
│   └── consolportals_sa_stc_vcp_partnerportal.deployment.yaml # ✅ Improved
│
├── Services/
│   ├── consolportals_sa_stc_vcp_httpd.service.yaml        # ✅ Improved labels
│   ├── consolportals_sa_stc_vcp_a3gw.service.yaml         # ✅ Improved labels
│   └── consolportals_sa_stc_vcp_portals.services.yaml     # ✅ All portals
│
└── consolportals_sa_stc_vcp_pdbs.yaml                      # 🆕 New - High availability
```

## 🚢 Deployment

### Method 1: Using Kustomize (Recommended)

```bash
# Deploy everything
#kubectl apply -k .
## delete the resources created by that kustomize overlay from the *current* namespace (default)
# kubectl delete -k .

# View what will be deployed (dry-run)
kubectl kustomize . | kubectl apply --dry-run=client -f -

# Deploy to specific namespace
kubectl apply -k . -n your-namespace


```

### Method 2: Individual Resources

```bash
# Deploy in order
kubectl apply -f consolportals_sa_stc_vcp_httpd.deployment.yaml
kubectl apply -f consolportals_sa_stc_vcp_httpd.service.yaml

kubectl apply -f consolportals_sa_stc_vcp_a3gw.deployment.yaml
kubectl apply -f consolportals_sa_stc_vcp_a3gw.service.yaml

kubectl apply -f consolportals_sa_stc_vcp_adminportal.deployment.yaml
kubectl apply -f consolportals_sa_stc_vcp_ccportal.deployment.yaml
kubectl apply -f consolportals_sa_stc_vcp_partnerportal.deployment.yaml
kubectl apply -f consolportals_sa_stc_vcp_portals.services.yaml

kubectl apply -f consolportals_sa_stc_vcp_pdbs.yaml
kubectl apply -f consolportals-sa-stc-vcp-httpd-ingress.yaml
```

### Method 3: All-in-One (Quick)

```bash
# Deploy all resources at once
kubectl apply -f .
```

## 🔍 Monitoring & Troubleshooting

### Check Deployment Status
```bash
# View all resources
kubectl get all -l app=consolportals-sa-stc-vcp

# Check pod status
kubectl get pods -l app=consolportals-sa-stc-vcp -o wide

# Watch rollout status
kubectl rollout status deployment/consolportals-sa-stc-vcp-httpd-deployment
```

### Check Health Probes
```bash
# Describe pod to see probe results
kubectl describe pod <pod-name>

# Check events for probe failures
kubectl get events --sort-by='.lastTimestamp' | grep -i probe
```

### Debug Init Containers
```bash
# View init container logs
kubectl logs <pod-name> -c wait-for-httpd
kubectl logs <pod-name> -c wait-for-a3gw

# Check if services are accessible
kubectl exec -it <pod-name> -- nc -zv consolportals-sa-stc-vcp-httpd-service 80
```

### View Logs
```bash
# Stream logs from all pods of a component
kubectl logs -l component=vcp-httpd -f --all-containers=true

# View logs from specific container
kubectl logs <pod-name> -c vcp-httpd
```

### Check Resource Usage
```bash
# View resource consumption
kubectl top pods -l app=consolportals-sa-stc-vcp

# View PDB status
kubectl get pdb
```

## 🔄 Rolling Updates

```bash
# Update image version
kubectl set image deployment/consolportals-sa-stc-vcp-httpd-deployment \
  vcp-httpd=nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.2

# Watch rollout
kubectl rollout status deployment/consolportals-sa-stc-vcp-httpd-deployment

# Rollback if needed
kubectl rollout undo deployment/consolportals-sa-stc-vcp-httpd-deployment

# View rollout history
kubectl rollout history deployment/consolportals-sa-stc-vcp-httpd-deployment
```

## 🎯 Health Check Endpoints

Based on docker-compose healthchecks:

| Component | Endpoint | Port |
|-----------|----------|------|
| httpd | `/site.json` | 80 |
| a3gw | `/adminportal` | 8444 |
| adminportal | `/adminportal` | 8080 |
| ccportal | `/ccportal` | 8081 |
| partnerportal | `/partnerportal` | 8082 |

## 🛡️ High Availability Features

1. **Multiple Replicas**: 2 pods per service
2. **PodDisruptionBudgets**: Minimum 1 pod available during disruptions
3. **Rolling Updates**: Zero-downtime deployments
4. **Readiness Probes**: Traffic only to healthy pods
5. **Session Affinity**: Sticky sessions for consistent UX
6. **Graceful Shutdown**: 5-second preStop delay

## 📝 Environment-Specific Configurations

To create environment overlays (dev/staging/prod):

```bash
# Structure
.
├── base/
│   └── (all files here)
└── overlays/
    ├── dev/
    │   └── kustomization.yaml
    ├── staging/
    │   └── kustomization.yaml
    └── prod/
        └── kustomization.yaml
```

Example `overlays/dev/kustomization.yaml`:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base

namespace: dev

commonLabels:
  environment: dev

replicas:
  - name: consolportals-sa-stc-vcp-httpd-deployment
    count: 1
  - name: consolportals-sa-stc-vcp-a3gw-deployment
    count: 1
```

Deploy with: `kubectl apply -k overlays/dev`

## 🔧 Additional Considerations

### For OpenShift Deployments
If deploying to OpenShift, you may need to:
1. Add SecurityContextConstraints (SCCs)
2. Run containers as non-root
3. Adjust service account permissions
4. Use OpenShift Routes instead of Ingress

### For Production
Consider adding:
1. **HorizontalPodAutoscaler** (HPA) for auto-scaling
2. **NetworkPolicies** for network segmentation
3. **ServiceMonitor** for Prometheus metrics
4. **Secrets** for sensitive configuration
5. **ConfigMaps** for configuration management

### Resource Tuning
Adjust resources based on actual usage:
```bash
# Monitor resource usage over time
kubectl top pods -l app=consolportals-sa-stc-vcp --containers
```

## 📊 Comparison: Docker Compose vs Kubernetes

| Feature | Docker Compose | Kubernetes Manifests |
|---------|----------------|----------------------|
| Health Checks | ✅ healthcheck | ✅ liveness/readiness probes |
| Dependencies | ✅ depends_on | ✅ initContainers |
| Restart Policy | ✅ restart: always | ✅ Deployment controller |
| Resource Limits | ❌ Not configured | ✅ Configured |
| Networking | ✅ vcp-network | ✅ Services + Ingress |
| Port Mapping | ✅ 9080:80 | ✅ Service ClusterIP |
| Environment | ✅ environment | ✅ env |
| Scaling | ❌ Manual | ✅ Automatic (replicas) |
| Session Affinity | ❌ Not available | ✅ ClientIP + Cookies |
| High Availability | ❌ Single host | ✅ Multi-node + PDB |

## 🚨 Migration from Docker Compose

The Kubernetes deployment provides equivalent functionality to docker-compose with additional production features:

- Same health checks and timeouts
- Same dependency ordering
- Same environment variables
- Enhanced with: auto-healing, rolling updates, HA, resource management

## 📚 Next Steps

1. Test the deployment in a dev environment
2. Monitor resource usage and adjust limits
3. Set up monitoring/alerting (Prometheus/Grafana)
4. Configure backup strategies
5. Document disaster recovery procedures
6. Implement GitOps (ArgoCD/Flux) for deployment automation

## 🤝 Contributing

When updating manifests:
1. Test locally with `kubectl apply --dry-run=client`
2. Verify with `kubectl kustomize .`
3. Check for label consistency
4. Update version labels when bumping images
5. Run lint checks: `kubeval` or `kube-score`

## 📞 Support

For issues:
1. Check pod logs: `kubectl logs <pod-name>`
2. Describe resources: `kubectl describe pod <pod-name>`
3. Check events: `kubectl get events --sort-by='.lastTimestamp'`
4. Verify service endpoints: `kubectl get endpoints`
