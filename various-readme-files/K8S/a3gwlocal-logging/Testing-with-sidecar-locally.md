
## Local Testing Guide

### Prerequisites Check

```bash
# 1. Check Docker Desktop Kubernetes is running
kubectl cluster-info
# kubectl config get-contexts

# 2. Check current context (should show docker-desktop)
kubectl config current-context
# If not, please use:
# kubectl config use-context docker-desktop  

# 3. Verify namespace exists or create it
kubectl create namespace stc-vcp-services --dry-run=client -o yaml | kubectl apply -f -
```

---

## Step 1: Dry-Run Testing (No Deployment)

Test your Helm templates **without actually deploying anything**:

```bash
# Navigate to your chart directory
# cd /path/to/your/helm/chart
cd stc/vcp/helm

# Dry-run with production values
helm install consolportals . \
  -f values.yaml \
  --dry-run=client --debug \
  -n stc-vcp-services

# Dry-run with local values
helm install consolportals . \
  -f values.yaml \
  -f values-local.yaml \
  --dry-run=client --debug \
  -n stc-vcp-services

# Dry-run with NodePort values
helm install consolportals . \
  -f values.yaml \
  -f values-local-nodeport.yaml \
  --dry-run=client --debug \
  -n stc-vcp-services
```

**What to check:**
- No YAML syntax errors
- Session affinity appears in a3gw service
- Sidecar container appears in a3gw deployment
- Correct image tags (1.0.0.1 without -amd64 for local & local-nodeport)
- Volumes and volumeMounts are present

**Look for session affinity:**
```yaml
# Should appear in the output:
apiVersion: v1
kind: Service
metadata:
  name: consolportals-sa-stc-vcp-a3gw-service
spec:
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
```

---

## Step 2: Validate Templates

Check that all templates render correctly:

```bash
# Render all templates
helm template consolportals . \
  -f values.yaml \
  -f values-local.yaml \
  -n stc-vcp-services > rendered-templates.yaml

# Review the rendered templates
less rendered-templates.yaml

# Or check specific resources
helm template consolportals . \
  -f values.yaml \
  -f values-local.yaml \
  -n stc-vcp-services \
  -s templates/a3gw-service.yaml

helm template consolportals . \
  -f values.yaml \
  -f values-local.yaml \
  -n stc-vcp-services \
  -s templates/a3gw-deployment.yaml
```

---

## Step 3: Verify Images Exist

Make sure your images are available:

```bash
# Check if images exist in nexus registry
# For Mac (no -amd64 suffix)
docker pull nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-a3gw:1.0.0.1
docker pull nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.1
docker pull nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-adminportal:1.0.0.1
docker pull nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-ccportal:1.0.0.1
docker pull nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-partnerportal:1.0.0.1

# If images don't exist, you'll need to push them first
# (assuming you already built them)
```

---

## Step 4: Deploy Locally (NodePort - Easiest)

```bash
# Install with NodePort (no ingress controller needed)
helm install consolportals . \
  -f values.yaml \
  -f values-local-nodeport.yaml \
  -n stc-vcp-services

# Watch pods start up
kubectl get pods -n stc-vcp-services -w

# Wait until all pods show "Running" and "2/2" ready
# Press Ctrl+C when done watching
```

**Expected output:**
```
NAME                                                    READY   STATUS    RESTARTS
consolportals-sa-stc-vcp-a3gw-deployment-xxx            2/2     Running   0
consolportals-sa-stc-vcp-a3gw-deployment-yyy            2/2     Running   0
consolportals-sa-stc-vcp-adminportal-deployment-xxx     1/1     Running   0
consolportals-sa-stc-vcp-adminportal-deployment-yyy     1/1     Running   0
consolportals-sa-stc-vcp-ccportal-deployment-xxx        1/1     Running   0
consolportals-sa-stc-vcp-ccportal-deployment-yyy        1/1     Running   0
consolportals-sa-stc-vcp-partnerportal-deployment-xxx   1/1     Running   0
consolportals-sa-stc-vcp-partnerportal-deployment-yyy   1/1     Running   0
consolportals-sa-stc-vcp-httpd-deployment-xxx           1/1     Running   0
consolportals-sa-stc-vcp-httpd-deployment-yyy           1/1     Running   0
```

**Note:** a3gw pods should show **2/2** (main container + sidecar)

---

## Step 5: Verify Session Affinity

```bash
# Check if session affinity is configured
kubectl get service consolportals-sa-stc-vcp-a3gw-service -n stc-vcp-services -o yaml

# Look for this section:
# spec:
#   sessionAffinity: ClientIP
#   sessionAffinityConfig:
#     clientIP:
#       timeoutSeconds: 10800
```

**Or use grep:**
```bash
kubectl get svc consolportals-sa-stc-vcp-a3gw-service -n stc-vcp-services -o yaml | grep -A5 sessionAffinity
```

---

## Step 6: Test Logging Sidecar

```bash
# Get pod name
POD=$(kubectl get pods -n stc-vcp-services -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}')

# 1. Verify sidecar exists
kubectl get pod $POD -n stc-vcp-services -o jsonpath='{.spec.containers[*].name}'
# Should show: vcp-a3gw a3gw-log-tail

# 2. Check sidecar logs (should show waiting message or actual logs)
kubectl logs $POD -c a3gw-log-tail -n stc-vcp-services

# 3. Check if log directory exists
kubectl exec -it $POD -n stc-vcp-services -c vcp-a3gw -- ls -la /space/a3gw/logs/

# 4. Generate some logs by accessing the application
open http://localhost:30080/adminportal

# 5. Check logs again (kubectl logs)
kubectl logs -f $POD -c a3gw-log-tail -n stc-vcp-services
```

**Expected sidecar output:**
```
[a3gw-log-tail] waiting for log files...
total 12
drwxr-xr-x    2 node     node          4096 Jan 28 10:30 .
drwxr-xr-x    8 node     node          4096 Jan 28 10:30 ..
-rw-r--r--    1 node     node          1234 Jan 28 10:35 adminportal.log
-rw-r--r--    1 node     node           567 Jan 28 10:35 ccportal.log
-rw-r--r--    1 node     node           890 Jan 28 10:35 partnerportal.log
==> /space/a3gw/logs/adminportal.log <==

==> /space/a3gw/logs/ccportal.log <==

==> /space/a3gw/logs/partnerportal.log <==

==> /space/a3gw/logs/adminportal.log <==
{"timestamp":"2026-01-28T18:50:35.564+0300", "transactionId":"hmky7c8l5","username":"znpzsy","service":"Download Service","method":"GET","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36","url":"/cms/file/6731b90c79a4ad2109bfce4e?ts=1769615435090", ...}  
{"timestamp":"2026-01-28T18:49:13.919+0300", "transactionId":"hmky78d3k","username":"admin","service":"SSM Query Subscribers Service","method":"GET","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...}  
```

---

## Step 7: Test Application Access

### With NodePort:

```bash
# Access via httpd (normal flow)
open http://localhost:30080/adminportal
open http://localhost:30080/ccportal
open http://localhost:30080/partnerportal
open https://localhost:30443/adminportal
open https://localhost:30443/ccportal
open https://localhost:30443/partnerportal

# Direct to a3gw (bypass httpd for debugging)  
# (won't be able to log into the portals, but the login page should be displayed)
open http://localhost:30444/adminportal   
open http://localhost:30444/ccportal  
open http://localhost:30444/partnerportal
```

### Check if services are accessible:

```bash
# Test httpd
# Should display "It Works!"
curl http://localhost:30080/
curl https://localhost:30443/

# Test a3gw
# server.json is auth protected and you should see "Forbidden!"  
curl http://localhost:30444/conf/server.json 
# site.json is public and you should see the json content.  
curl http://localhost:30444/site.json  
# You should be able to see "Redirect!" 
# If you open in the browser, the login page will display, but you won't be able to log in.
curl http://localhost:30444/adminportal


# Check service endpoints
kubectl get svc -n stc-vcp-services
kubectl get endpoints -n stc-vcp-services
```

---

## Step 8: Test Session Affinity Behavior [TODO - NO STICKY SESSIONS ON HTTPD]

This test verifies that user sessions stick to the same pod.

```bash
# 1. Get both a3gw pod names
kubectl get pods -n stc-vcp-services -l component=vcp-a3gw

# 2. Watch logs from both pods in separate terminals 
# Terminal 1 - Watch Pod 1's sidecar logs
POD1=$(kubectl get pods -n stc-vcp-services -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}')
kubectl logs -f $POD1 -c a3gw-log-tail -n stc-vcp-services

# Terminal 2 - Watch Pod 2's sidecar logs
POD2=$(kubectl get pods -n stc-vcp-services -l component=vcp-a3gw -o jsonpath='{.items[1].metadata.name}')
kubectl logs -f $POD2 -c a3gw-log-tail -n stc-vcp-services

# Terminal 3 - Make requests
open http://localhost:30080/adminportal
# Login, click around, refresh pages
```

**Expected:** All requests from your browser go to Pod1 OR Pod2, but not both (because of session affinity).
**CURRENT STATE:** Will get logs on both sides.

### Important Notes:

Session affinity is configured on the a3gw service (Replicas: 2), but it's not helping because httpd doesn't have sticky sessions just yet:
```text

Your Browser (IP: 192.168.1.100)
↓
httpd Service (ClusterIP)
↓
httpd Pod 1 (IP: 10.244.1.5)  OR  httpd Pod 2 (IP: 10.244.1.6)
↓
a3gw Service (with session affinity based on ClientIP)
↓
a3gw Pod 1  OR  a3gw Pod 2

```
The issue:

(Session affinity might be working perfectly at the a3gw level, but it's binding to the httpd pod IP, not the user's session!)

- Session affinity looks at the source IP of the request
- The source IP is the httpd pod IP, NOT your browser IP!
- You have 2 httpd replicas with different IPs
- So requests alternate between httpd pods
- Each httpd pod has a different IP
- a3gw service sees different client IPs → routes to different a3gw pods

### TODO: Solution 1: Reduce httpd to 1 Replica (Quick Fix)

```bash
# values-local.yaml or values-local-nodeport.yaml
httpd:
  replicaCount: 1  # Only 1 httpd pod

# Keep a3gw at 2 replicas for HA
a3gw:
  replicaCount: 2
  
```
### TODO: Solution 2: Configure httpd with Sticky Sessions 

```text
# In your httpd.conf
<Proxy "balancer://a3gw-cluster">
    BalancerMember "http://a3gw-pod-1:8444"
    BalancerMember "http://a3gw-pod-2:8444"
    ProxySet stickysession=JSESSIONID
    ProxySet lbmethod=byrequests
</Proxy>

ProxyPass /adminportal balancer://a3gw-cluster/adminportal
ProxyPassReverse /adminportal balancer://a3gw-cluster/adminportal
```

**Pros:**
- Maintains HA for both httpd and a3gw
- True session stickiness based on user session

**Cons:**
- Requires httpd configuration changes
- More complex setup

---

### TODO: Solution 3: Shared Session Storage (Production Solution)

Store sessions in Redis or a database instead of in-memory:
```
Browser → httpd → a3gw Pod 1 → Redis (shared session store)
Browser → httpd → a3gw Pod 2 → Redis (same sessions!)

```
---

## Step 9: Check for Issues

```bash
# Check pod status
kubectl get pods -n stc-vcp-services

# Check for pod errors
kubectl describe pods -n stc-vcp-services | grep -A10 "Events:"

# Check logs for errors
POD=$(kubectl get pods -n stc-vcp-services -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}')
kubectl logs $POD -c vcp-a3gw -n stc-vcp-services | grep -i error

# Check sidecar logs
kubectl logs $POD -c a3gw-log-tail -n stc-vcp-services

# Check all events in namespace
kubectl get events -n stc-vcp-services --sort-by='.lastTimestamp'
```

---

## Step 10: Clean Up After Testing

```bash
# Uninstall the release
helm uninstall consolportals -n stc-vcp-services

# Verify pods are gone
kubectl get pods -n stc-vcp-services

# Optional: Delete namespace
kubectl delete namespace stc-vcp-services
```

---

## Testing Checklist

Before moving to production, verify:

- [ ] Dry-run shows no errors
- [ ] Session affinity appears in a3gw service YAML
- [ ] All pods start successfully
- [ ] a3gw pods show **2/2** containers (main + sidecar)
- [ ] `kubectl logs` works for sidecar container
- [ ] Application is accessible via browser
- [ ] Session affinity keeps requests on same pod (TODO)
- [ ] Logging files are created and visible
- [ ] No errors in pod events or logs

---

## Common Local Testing Issues

### Issue: "ImagePullBackOff"
```bash
# Check if image exists
docker pull nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-a3gw:1.0.0.1

# If it doesn't exist, build and push it first
cd /path/to/a3gw
docker build -t nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-a3gw:1.0.0.1 .
docker push nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-a3gw:1.0.0.1
```

### Issue: a3gw pod shows "1/2" instead of "2/2"
```bash
# Check which container is failing
kubectl describe pod $POD -n stc-vcp-services

# Check sidecar logs
kubectl logs $POD -c a3gw-log-tail -n stc-vcp-services

# Common cause: Log files don't exist yet
# Solution: Access the application to generate logs
```

### Issue: "No such file or directory" in sidecar logs
```bash
# Your sidecar already handles this, but you can manually create:
kubectl exec -it $POD -n stc-vcp-services -c vcp-a3gw -- mkdir -p /space/a3gw/logs
kubectl exec -it $POD -n stc-vcp-services -c vcp-a3gw -- touch /space/a3gw/logs/adminportal.log
```

### Issue: Can't access http://localhost:30080
```bash
# Check if service is NodePort
kubectl get svc consolportals-sa-stc-vcp-httpd-service -n stc-vcp-services

# Check if port 30080 is actually assigned
kubectl get svc -n stc-vcp-services -o wide

# Try the other ports
kubectl get svc consolportals-sa-stc-vcp-httpd-service -n stc-vcp-services -o jsonpath='{.spec.ports[*].nodePort}'
```

---

## 📝 Quick Test Script

Save this as `test-local.sh`:

```bash
#!/bin/bash

NAMESPACE="stc-vcp-services"
RELEASE="consolportals"

echo "🧪 Testing ConsolPortals Helm Chart Locally"
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."
kubectl cluster-info > /dev/null 2>&1 || { echo "❌ Kubernetes not running"; exit 1; }
echo "  ✅ Kubernetes is running"

# Dry-run
echo ""
echo "✓ Running dry-run test..."
helm install $RELEASE . -f values.yaml -f values-local-nodeport.yaml -n $NAMESPACE --dry-run > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Dry-run passed"
else
    echo "  ❌ Dry-run failed"
    exit 1
fi

# Deploy
echo ""
echo "✓ Deploying to local cluster..."
helm install $RELEASE . -f values.yaml -f values-local-nodeport.yaml -n $NAMESPACE

echo ""
echo "✓ Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l component=vcp-a3gw -n $NAMESPACE --timeout=300s

# Get pod
POD=$(kubectl get pods -n $NAMESPACE -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}')

# Check containers
echo ""
echo "✓ Checking containers in pod $POD..."
CONTAINERS=$(kubectl get pod $POD -n $NAMESPACE -o jsonpath='{.spec.containers[*].name}')
echo "  Containers: $CONTAINERS"

if echo "$CONTAINERS" | grep -q "a3gw-log-tail"; then
    echo "  ✅ Logging sidecar present"
else
    echo "  ❌ Logging sidecar missing"
fi

# Check session affinity
echo ""
echo "✓ Checking session affinity..."
kubectl get svc consolportals-sa-stc-vcp-a3gw-service -n $NAMESPACE -o yaml | grep -q "sessionAffinity: ClientIP"
if [ $? -eq 0 ]; then
    echo "  ✅ Session affinity configured"
else
    echo "  ❌ Session affinity NOT configured"
fi

# Check logs
echo ""
echo "✓ Checking sidecar logs..."
kubectl logs $POD -c a3gw-log-tail -n $NAMESPACE --tail=5

echo ""
echo "🎉 Testing complete!"
echo ""
echo "Access the application:"
echo "  http://localhost:30080/adminportal"
echo "  http://localhost:30080/ccportal"
echo "  http://localhost:30080/partnerportal"
echo ""
echo "View logs:"
echo "  kubectl logs -f $POD -c a3gw-log-tail -n $NAMESPACE"
echo ""
echo "Cleanup when done:"
echo "  helm uninstall $RELEASE -n $NAMESPACE"
```

**Run it:**
```bash
chmod +x test-local.sh
./test-local.sh
```

---

Yes, you absolutely can and should test locally first! This way you can verify everything works before deploying to your production cluster. Let me know if you hit any issues!
