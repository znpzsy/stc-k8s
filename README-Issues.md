# Session Affinity + Ingress Cookie (No conf on httpd)

## What should happen (with working sticky)
https://github.com/kubernetes/ingress-nginx/blob/main/docs/examples/affinity/cookie/README.md

```
REQUEST 1 & 2: Both requests from same user
═══════════════════════════════════════════

Browser
   │
   ├─ Cookie: vcp-sticky=abc123
   │
   ▼
┌─────────────────────────────────────┐
│ Ingress Controller                  │
│ Reads cookie → ALWAYS httpd Pod #1  │ 
└──────────────┬──────────────────────┘
               │
               ▼
         ┌──────────┐
         │ httpd #1 │  ← SAME POD every time
         │ 10.1.5.47│  ← SAME IP every time
         └────┬─────┘
              │
              ▼
    ┌──────────────────────┐
    │ a3gw Service         │
    │ sessionAffinity:     │
    │ ClientIP (10.1.5.47) │
    └───┬──────────────┬───┘
        │              │
        ▼              ▼
   ┌────────┐    ┌────────┐
   │a3gw #1 │    │a3gw #2 │
   │captcha │    │        │
   └────────┘    └────────┘
        │
        └─► ALWAYS a3gw #1 (same source IP = same backend)
            
```

## The Auth vs Apps Server Request Issue


```
Same User Session:

Auth Request (/login or /authenticate)
   → httpd #1 → a3gw-service:8445 → a3gw #1

Service Request (/vcp/services/*)
   → httpd #1 → a3gw-service:8444 → a3gw #1
                      ↑
                  Same httpd source IP (10.1.5.47)
                  = sessionAffinity sends to SAME a3gw pod
```
 `sessionAffinity: ClientIP` works **per source IP**, not per port. So if httpd #1 (10.1.5.47) connects to the a3gw service on **any port** (8444 or 8445), it should always hit the same a3gw backend pod.


**DEMONSTRATE**

```bash

# 1. Get both a3gw pod names
kubectl get pods -n stc-vcp-services -l component=vcp-a3gw

# 2. Watch logs from both pods in separate terminals 
# Terminal 1 - Watch Pod 1's sidecar logs
POD1=$(kubectl get pods -n stc-vcp-services -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}')
kubectl logs -f $POD1 -n stc-vcp-services # pod itself
# kubectl logs -f $POD1 -c a3gw-log-tail -n stc-vcp-services # sidecar

# Terminal 2 - Watch Pod 2's sidecar logs
POD2=$(kubectl get pods -n stc-vcp-services -l component=vcp-a3gw -o jsonpath='{.items[1].metadata.name}')
kubectl logs -f $POD2 -n stc-vcp-services # pod itself
# kubectl logs -f $POD2 -c a3gw-log-tail -n stc-vcp-services

```
In the browser:

http://localhost/adminportal



----


```bash
# Get logs from all pods in a deployment
kubectl logs -n stc-vcp-services deployment/consolportals-sa-stc-vcp-a3gw-deployment

# Follow logs in real-time
kubectl logs -n stc-vcp-services deployment/consolportals-sa-stc-vcp-a3gw-deployment -f

# Get logs from all pods with a specific label (same result, different approach)
kubectl logs -n stc-vcp-services -l component=vcp-a3gw --all-containers=true

# See logs from all replicas with timestamps
kubectl logs -n stc-vcp-services deployment/consolportals-sa-stc-vcp-a3gw-deployment --all-containers=true --timestamps=true

# Tail last 100 lines from all pods
kubectl logs -n stc-vcp-services deployment/consolportals-sa-stc-vcp-a3gw-deployment --tail=100

# Get logs from previous container (if pod crashed/restarted)
kubectl logs -n stc-vcp-services deployment/consolportals-sa-stc-vcp-a3gw-deployment --previous


```
