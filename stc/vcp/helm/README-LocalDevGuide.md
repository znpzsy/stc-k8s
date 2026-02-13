# Local Development - Quick Reference

## Three Ways to Run Locally on Mac

### Option 1: NodePort (Easiest - No Port Forwarding Needed) ⭐

**Setup:**
```bash
# Install with NodePort values
helm install consolportals . \
  -f values.yaml \
  -f values-local-nodeport.yaml \
  -n stc-vcp-services
```

**Access:**
```bash
# Primary access through httpd (normal flow)
http://localhost:30080/adminportal
http://localhost:30080/ccportal
http://localhost:30080/partnerportal

# HTTPS
https://localhost:30443/adminportal

# Debug: Direct to a3gw (bypass httpd)
http://localhost:30444/adminportal
http://localhost:30445/auth
```

**Pros:**
- ✅ No port-forwarding needed
- ✅ Access immediately after deployment
- ✅ Services stay running (no terminal dependency)
- ✅ Can still test full httpd→a3gw→portals flow

**Cons:**
- ❌ Different ports than production (30080 vs 80)
- ❌ Less like production setup

**Port Map:**
| Service | Port | Access URL |
|---------|------|------------|
| httpd HTTP | 30080 | http://localhost:30080/adminportal |
| httpd HTTPS | 30443 | https://localhost:30443/adminportal |
| a3gw portals | 30444 | http://localhost:30444/adminportal |
| a3gw auth | 30445 | http://localhost:30445/auth |

---

### Option 2: ClusterIP + Port Forwarding (Most Flexible)

**Setup:**
```bash
# Install with regular local values
helm install consolportals . \
  -f values.yaml \
  -f values-local.yaml \
  -n stc-vcp-services

# Start port forwarding
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 9080:80 9443:443 -n stc-vcp-services &
kubectl port-forward svc/consolportals-sa-stc-vcp-a3gw-service 9444:8444 9445:8445 -n stc-vcp-services &
```

**Access:**
```bash
# Through httpd
http://localhost:9080/adminportal

# Direct to a3gw
http://localhost:9444/adminportal
```

**Pros:**
- ✅ Choose your own port numbers
- ✅ Matches production architecture (ClusterIP)
- ✅ More secure (services not exposed)
- ✅ Can selectively forward only what you need

**Cons:**
- ❌ Have to manually start port-forwards
- ❌ Stops when terminal closes (unless backgrounded)
- ❌ Extra step after deployment

**Managing Port Forwards:**
```bash
# Kill all port forwards
pkill -f "kubectl port-forward"

# Check running port forwards
ps aux | grep "kubectl port-forward"

# Forward in background (note the &)
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 9080:80 -n stc-vcp-services &
```

---

### Option 3: ClusterIP + Ingress (Most Production-Like)

**Setup:**
```bash
# Install NGINX Ingress Controller (one-time)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml

# Install with local values (ingress enabled)
helm install consolportals . \
  -f values.yaml \
  -f values-local.yaml \
  -n stc-vcp-services
```

**Access:**
```bash
# Clean URLs (just like production)
http://localhost/adminportal
http://localhost/ccportal
http://localhost/partnerportal
```

**Pros:**
- ✅ Exact same setup as production
- ✅ Clean URLs (no weird ports)
- ✅ Tests full ingress flow
- ✅ SSL termination at ingress

**Cons:**
- ❌ Requires NGINX Ingress Controller setup
- ❌ Extra component to manage

---

## Comparison Table

| Feature | NodePort | Port Forward | Ingress |
|---------|----------|--------------|---------|
| **Setup Complexity** | 🟢 Easy | 🟡 Medium | 🔴 Complex |
| **URLs** | localhost:30080 | localhost:9080 | localhost |
| **Port Forwarding** | Not needed | Required | Not needed |
| **Ingress Controller** | Not needed | Not needed | Required |
| **Like Production?** | 🟡 Somewhat | 🟢 Yes | 🟢 Yes |
| **Terminal Dependency** | ❌ No | ⚠️ Yes (unless &) | ❌ No |

---

## Switching Between Setups

### From NodePort → Port Forward
```bash
# Uninstall
helm uninstall consolportals -n stc-vcp-services

# Reinstall with ClusterIP
helm install consolportals . -f values.yaml -f values-local.yaml -n stc-vcp-services

# Start port forwarding
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 9080:80 -n stc-vcp-services
```

### From Port Forward → NodePort
```bash
# Kill port forwards
pkill -f "kubectl port-forward"

# Upgrade to NodePort
helm upgrade consolportals . -f values.yaml -f values-local-nodeport.yaml -n stc-vcp-services
```

### From ClusterIP → Ingress
```bash
# Just enable ingress
helm upgrade consolportals . -f values.yaml -f values-local.yaml --set ingress.enabled=true -n stc-vcp-services
```

---

## My Recommendation

**For daily Mac development:** Use **Option 1 (NodePort)** 
- Fastest to get started
- No manual port-forwarding needed
- Still allows testing full flow through httpd

**For testing production-like setup:** Use **Option 3 (Ingress)**
- Most similar to production
- Tests full ingress routing

**For debugging specific services:** Use **Option 2 (Port Forward)**
- Most flexible
- Can forward only what you need

---

## Quick Start (NodePort - Recommended for Mac)

```bash
# 1. Create namespace
kubectl create namespace stc-vcp-services

# 2. Install with NodePort
helm install consolportals . \
  -f values.yaml \
  -f values-local-nodeport.yaml \
  -n stc-vcp-services

# 3. Wait for pods
kubectl get pods -n stc-vcp-services -w

# 4. Access immediately
open http://localhost:30080/adminportal
```

No port-forwarding, no ingress controller - just works! 🚀

---

## Troubleshooting NodePort

### "Connection refused" on localhost:30080
```bash
# Check if service is NodePort
kubectl get svc -n stc-vcp-services
# Should show TYPE: NodePort

# Check if pods are running
kubectl get pods -n stc-vcp-services

# Check NodePort assignment
kubectl describe svc consolportals-sa-stc-vcp-httpd-service -n stc-vcp-services
# Look for "NodePort: http 30080/TCP"
```

### Want to use different ports?
Edit `values-local-nodeport.yaml`:
```yaml
service:
  httpd:
    type: NodePort
    ports:
    - name: http
      nodePort: 32080  # Change to whatever you want (30000-32767)
```

### Need direct access to portals?
Uncomment the portal service overrides in `values-local-nodeport.yaml`:
```yaml
service:
  adminportal:
    type: NodePort
    ports:
    - port: 8080
      targetPort: 8080
      nodePort: 31080  # Direct access at localhost:31080
```

```bash


# 1. Upgrade and apply the new config
helm upgrade consolportals . -f values.yaml -f values-local.yaml -n stc-vcp-services

# 2. Check the checksum changed
kubectl get deployment consolportals-sa-stc-vcp-a3gw-deployment -n stc-vcp-services \
-o jsonpath='{.spec.template.metadata.annotations}'

# 3. Watch the rollout
kubectl rollout status deployment consolportals-sa-stc-vcp-a3gw-deployment -n stc-vcp-services

# 4. Confirm the pod is reading the new file
kubectl exec -it deployment/consolportals-sa-stc-vcp-a3gw-deployment \
-n stc-vcp-services -- cat /space/a3gw/src/conf/server_config.json

```
