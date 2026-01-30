# Quick Deployment Commands

## 🚀 Deploy Everything (Recommended)
```bash
kubectl apply -k .
```

## 🔍 Verify Deployment
```bash
# Check all resources
kubectl get all -l app=consolportals-sa-stc-vcp

# Watch pods come up
kubectl get pods -l app=consolportals-sa-stc-vcp -w

# Check rollout status
kubectl rollout status deployment -l app=consolportals-sa-stc-vcp
```

## 🐛 Quick Troubleshooting
```bash
# View all pod logs
kubectl logs -l app=consolportals-sa-stc-vcp --all-containers=true -f

# Check pod health
kubectl describe pods -l app=consolportals-sa-stc-vcp | grep -A 10 "Conditions\|Events"

# Test service connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- sh
# Inside the pod:
wget -O- http://consolportals-sa-stc-vcp-httpd-service/site.json
```

## 🔄 Update Deployment
```bash
# Update single component
kubectl set image deployment/consolportals-sa-stc-vcp-httpd-deployment \
  vcp-httpd=nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:NEW_VERSION

# Restart all deployments (picks up new images)
kubectl rollout restart deployment -l app=consolportals-sa-stc-vcp

# Rollback
kubectl rollout undo deployment/consolportals-sa-stc-vcp-httpd-deployment
```

## 📊 Monitor
```bash
# Resource usage
kubectl top pods -l app=consolportals-sa-stc-vcp

# PDB status
kubectl get pdb

# Service endpoints
kubectl get endpoints -l app=consolportals-sa-stc-vcp
```

## 🗑️ Cleanup
```bash
# Delete all resources
kubectl delete -k .

# Or delete by label
kubectl delete all,pdb,ingress -l app=consolportals-sa-stc-vcp
```

## 🔧 Common Issues

### Init containers stuck?
```bash
# Check if services are up
kubectl get svc -l app=consolportals-sa-stc-vcp
kubectl get endpoints -l app=consolportals-sa-stc-vcp

# View init container logs
kubectl logs <pod-name> -c wait-for-httpd
```

### Health probes failing?
```bash
# Check probe configuration
kubectl get pod <pod-name> -o yaml | grep -A 20 "livenessProbe\|readinessProbe"

# Test endpoint manually
kubectl exec <pod-name> -- wget -O- http://localhost:8080/adminportal
```

### Out of resources?
```bash
# Check node capacity
kubectl describe nodes | grep -A 5 "Allocated resources"

# Reduce replicas temporarily
kubectl scale deployment/<name> --replicas=1
```

## 📝 Port Reference

| Service | Internal Port | Component |
|---------|--------------|-----------|
| httpd | 80, 443 | Reverse proxy |
| a3gw | 8444, 8445 | Gateway |
| adminportal | 8080 | Admin portal |
| ccportal | 8081 | CC portal |
| partnerportal | 8082 | Partner portal |

## 🌐 Access

```bash
# Via Ingress (if configured)
curl http://<ingress-host>/

# Port-forward for local access
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 8080:80

# Then access: http://localhost:8080
```
