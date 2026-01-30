# Ingress on Docker Desktop Kubernetes (MacOS)
### Enabling the Ingress-NGINX Controller

Docker Desktop does not come with an Ingress controller **pre-installed**. But you can install the popular NGINX Ingress Controller manually in just a couple of commands:

#### **Install via `kubectl` + official manifests**

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
```

This sets up everything in the `ingress-nginx` namespace. After a minute or two, you can check if it’s running:

```bash
kubectl get pods -n ingress-nginx
```

---

### Uninstalling the Ingress Controller

Just delete the whole setup:

```bash
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
```

Alternatively, nuke the namespace directly:

```bash
kubectl delete namespace ingress-nginx
```

---

### To Enable/Disable Kubernetes Itself on Docker Desktop

If you need to toggle K8s support:

1. Go to **Docker Desktop Preferences** → **Kubernetes**.
2. Check or uncheck **"Enable Kubernetes"**.
3. Apply & Restart.

_(Doesn't manage ingress by itself, but it's the master switch for all K8s things.)_

---

### Note on Accessing Services
When you deploy services in Kubernetes, they are not directly accessible via `localhost` unless you set up an Ingress or use port-forwarding.

Since we're using Docker Desktop locally:

* The **Ingress controller runs as a pod**, so you access it via `localhost:<NodePort>` **OR** port-forwarding unless you expose it with a LoadBalancer via tools like **MetalLB** or **minikube tunnel** (not native on Docker Desktop).

TODO: Write a sample `Ingress` rule or exposing the service cleanly?


### consolportals-sa-stc-vcp-httpd-ingress.yaml

**Single Entry Point**: Instead of having multiple ingress rules for different paths, you have one clean entry through HTTPD
**Centralized Proxy Logic**: All the Apache ProxyPass rules handle the routing complexity
**Simpler Ingress**: The ingress just needs to route everything to HTTPD on port 80/443
**Consistent with the Architecture**: Matches the "Layer 1 → Layer 2" proxy design

```yaml

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: consolportals-sa-stc-vcp-httpd-ingress
  annotations:
    # Optional: If you need to handle large file uploads
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    # Optional: Timeout settings for longer requests
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
spec:
  ingressClassName: nginx
  rules:
    - http:
        paths:
          # Main entry point - route everything to HTTPD
          - pathType: Prefix
            path: "/"
            backend:
              service:
                name: consolportals-sa-stc-vcp-httpd-service
                port:
                  number: 80

---

# For local development with localhost
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: consolportals-sa-stc-vcp-httpd-ingress-local
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
spec:
  ingressClassName: nginx
  rules:
    - host: localhost
      http:
        paths:
          - pathType: Prefix
            path: "/"
            backend:
              service:
                name: consolportals-sa-stc-vcp-httpd-service
                port:
                  number: 80

```


### About Local Testing (Docker Desktop - on MacOS)
To set up the Ingress for local development on Docker Desktop, you can use the following steps and considerations:
1. **NGINX Ingress Controller Required**: 
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   ```
   
2. **Run the Deployment Script**: 
   ```bash
    # Navigate to the project directory
    cd stc/vcp/k8s
    # Make sure the deployment script is executable
    chmod +x deploy-to-k8s.sh
    # Run the deployment script
    ./deploy-to-k8s.sh
   
   ```
   >    The script will handle building the images, deploying the services, and ask you if you want to set up port forwarding.
   >    If you've enabled the Ingress controller, press `N`, no port forwarding will be set up, and you can access the services via the Ingress.
   >    If you want to use port forwarding, press `Y`, and it will set up port forwarding for the HTTPD service. You can access the portals via the `9080` and `9443` ports. (e.g., `http://localhost:9080/adminportal`).

3. **Access Methods**:
   - **With Ingress**: `http://localhost/adminportal` (requires ingress controller)
     
     ```bash
     
       # Apply the Ingress resource
       kubectl apply -f "k8s/consolportals-sa-stc-vcp-httpd-ingress.yaml" -n stc-vcp-services
     
     ``` 
   > This will work once the NGINX ingress controller is set up and the Ingress resource is applied.
   > Make sure to replace `stc-vcp-services` with your actual namespace if it's different.



   - **With Port Forward**: `http://localhost:9080/adminportal` (simpler for local dev)


**Very simple!** Just delete the ingress and then start port forwarding:

## Switching from Ingress to Port Forwarding

### Step 1: Delete the Ingress Resource
```bash
kubectl delete -f "k8s/consolportals-sa-stc-vcp-httpd-ingress.yaml" -n stc-vcp-services
```

Or if you don't have the YAML file handy:
```bash
kubectl delete ingress consolportals-sa-stc-vcp-httpd-ingress -n stc-vcp-services
```
**Verify Ingress is Gone:**
```bash
kubectl get ingress -n stc-vcp-services
# Should show "No resources found"
```


### Step 2: Start Port Forwarding
```bash
# HTTPD service
kubectl port-forward svc/consolportals-sa-stc-vcp-httpd-service 9080:80 9443:443 -n stc-vcp-services &

# A3GW service  
kubectl port-forward svc/consolportals-sa-stc-vcp-a3gw-service 9444:8444 9445:8445 -n stc-vcp-services &
```

## Quick Check

After deleting ingress and starting port forwarding:

- **Ingress access** (won't work): ❌ `http://localhost/adminportal` --> 404 Not Found
- **Port forward access** (will work): ✅ `http://localhost:9080/adminportal` --> Login page of Admin Portal

The services and deployments remain running - you're just changing how you access them.

### Other Useful Commands

```bash

# Kill all kubectl port-forward processes (Most common and reliable option)
pkill -f "kubectl port-forward"

# Find & kill all port-forward processes
ps aux | grep "kubectl port-forward"
# Kill specific process by PID
kill <PID>

# Find what's using a specific port
lsof -ti:9080 | xargs kill
# Or for multiple ports
lsof -ti:9080,9443,9444,9445 | xargs kill

# Show all kubectl processes and let you choose
ps aux | grep kubectl
# Then use kill <PID> for the ones you want to stop

# Stop all kubectl processes (nuclear option)
# This will stop ALL kubectl commands, not just port-forward
pkill kubectl

# Verify they're stopped
# Check if any port-forwards are still running
ps aux | grep "kubectl port-forward"
# Should return nothing if all are stopped

```



---

---
*Last updated: June 2025*
