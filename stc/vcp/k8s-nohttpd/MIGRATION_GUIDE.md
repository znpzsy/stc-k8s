# httpd Removal Migration Guide

## Executive Summary

**Can you remove httpd?** YES ✅

**Should you remove httpd?** It depends on your priorities.

## Decision Matrix

| Factor | Keep httpd | Remove httpd |
|--------|-----------|--------------|
| **Architecture Complexity** | ⚠️ More layers (3-tier) | ✅ Simpler (2-tier) |
| **Resource Usage** | ⚠️ +2 pods, ~200MB memory | ✅ -2 pods, saves resources |
| **Performance** | ⚠️ Extra network hop (~2-5ms) | ✅ Direct routing |
| **Security Headers** | ✅ Mature Apache ecosystem | ⚠️ Must configure Ingress/a3gw |
| **Team Expertise** | ✅ If team knows Apache | ⚠️ Learning curve for Ingress |
| **Maintenance** | ⚠️ More configs to manage | ✅ Fewer moving parts |
| **Debugging** | ⚠️ More layers to troubleshoot | ✅ Simpler stack traces |
| **Cloud-Native** | ⚠️ Legacy approach | ✅ Kubernetes-native |
| **Cost** | ⚠️ Higher (more pods) | ✅ Lower |
| **Migration Effort** | ✅ No work needed | ⚠️ Upfront effort required |

## Recommended Approach

**Remove httpd** if:
- ✅ You want to modernize and simplify
- ✅ Cost/resource optimization is important
- ✅ Your team is comfortable with Kubernetes/NGINX Ingress
- ✅ You're willing to invest migration effort upfront

**Keep httpd** if:
- ✅ Team heavily relies on Apache expertise
- ✅ You have complex Apache-specific configurations not covered in this guide
- ✅ "If it ain't broke, don't fix it" is your philosophy
- ✅ Migration risk outweighs benefits in your context

## Current Architecture

```
┌─────────┐
│ Browser │
└────┬────┘
     │ HTTPS
     ▼
┌─────────────┐
│   Ingress   │  ← Kubernetes NGINX Ingress Controller
└─────┬───────┘
      │ HTTP
      ▼
┌─────────────┐
│    httpd    │  ← Apache (2 replicas)
│   (Port 80) │  • Serves static files
└─────┬───────┘  • Security headers
      │          • Reverse proxy
      │ HTTP
      ▼
┌─────────────┐
│    a3gw     │  ← Node.js Proxy (2 replicas)
│ (8444/8445) │  • Routes to backends
└─────┬───────┘  • Auth on 8445, portals on 8444
      │
      ▼
┌─────────────┐
│  Backend    │  ← Microservices
│  Services   │
└─────────────┘
```

## Proposed Architecture (httpd removed)

```
┌─────────┐
│ Browser │
└────┬────┘
     │ HTTPS
     ▼
┌─────────────────────┐
│   Ingress (NGINX)   │  ← Now handles:
│                     │  • Security headers
│  Security headers   │  • SSL termination
│  Session affinity   │  • Compression
│  Compression        │  • Path routing
│  Path routing       │  • Access logs
└─────────┬───────────┘
          │ HTTP
          ▼
┌─────────────────────┐
│       a3gw          │  ← Node.js Proxy (2 replicas)
│   (8444/8445)       │  • Serves static files
│                     │  • Routes to backends
│  (can also add     │  • Auth on 8445, portals on 8444
│   security headers  │
│   as backup)        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Backend Services   │
└─────────────────────┘
```

## What httpd Was Doing (and Where It Moves)

| httpd Function | New Location | Notes |
|----------------|--------------|-------|
| **Static file serving** | a3gw | Already has `/static` directory |
| **Reverse proxy routing** | Ingress | Path-based routing rules |
| **Security headers** | Ingress annotations | CSP, X-Frame-Options, etc. |
| **SSL/TLS termination** | Ingress | Already happening |
| **Session affinity** | Ingress | Cookie-based sticky sessions |
| **Compression (gzip)** | Ingress | Built-in NGINX compression |
| **Access logs** | Ingress | NGINX access logs → stdout |
| **CORS headers** | Ingress annotations | Cross-origin rules |
| **Request size limits** | Ingress annotations | `proxy-body-size` |
| **Timeouts** | Ingress annotations | Read/send timeouts |

## Access Logs: Yes, Ingress Has Them! ✅

### Default NGINX Ingress Logs

NGINX Ingress Controller logs to stdout/stderr:
```bash
# View ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller -f

# Example log entry:
192.168.1.100 - - [04/Feb/2026:10:15:30 +0000] "GET /adminportal HTTP/1.1" 200 1234 "-" "Mozilla/5.0..."
```

### Custom Log Format

You can customize the log format via ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ingress-nginx-controller
  namespace: ingress-nginx
data:
  log-format-upstream: |
    $remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent 
    "$http_referer" "$http_user_agent" $request_length $request_time 
    [$proxy_upstream_name] $upstream_addr $upstream_response_length 
    $upstream_response_time $upstream_status $req_id
```

### Log Aggregation

Integrate with your log aggregation system:

```yaml
# Fluent Bit / Filebeat / Logstash can collect these logs
# Example: Send to ELK stack, Splunk, CloudWatch, etc.

# Fluent Bit annotation example:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ingress-nginx-controller
  annotations:
    fluentbit.io/parser: nginx
```

### Access Log Fields Available

- Client IP (`$remote_addr`)
- Timestamp (`$time_local`)
- HTTP method and path (`$request`)
- Response status code (`$status`)
- Response size (`$body_bytes_sent`)
- Referer (`$http_referer`)
- User agent (`$http_user_agent`)
- Request processing time (`$request_time`)
- Upstream service (`$proxy_upstream_name`)
- Upstream response time (`$upstream_response_time`)
- Request ID (`$req_id`)

## Migration Steps

### Phase 1: Preparation ✅

1. **Test a3gw static file serving**
   ```bash
   # Verify a3gw can serve static files
   kubectl exec -it <a3gw-pod> -- ls -la /space/a3gw/static
   
   # Test direct access to a3gw (port-forward)
   kubectl port-forward svc/consolportals-sa-stc-vcp-a3gw-service 8444:8444
   curl http://localhost:8444/adminportal
   ```

2. **Ensure NGINX Ingress has required modules**
   ```bash
   # Check if nginx has headers_more module (for more_set_headers)
   kubectl exec -it -n ingress-nginx deployment/ingress-nginx-controller -- nginx -V 2>&1 | grep headers-more
   
   # If not present, you may need to use alternative header setting methods
   ```

3. **Backup current configuration**
   ```bash
   kubectl get ingress,svc,deployment -n <namespace> -o yaml > backup-before-httpd-removal.yaml
   ```

### Phase 2: Deploy New Ingress Configuration

1. **Apply the new Ingress**
   ```bash
   kubectl apply -f ingress-replacement-httpd.yaml
   ```

2. **Verify Ingress is created**
   ```bash
   kubectl get ingress consolportals-sa-stc-vcp-ingress
   kubectl describe ingress consolportals-sa-stc-vcp-ingress
   ```

3. **Check Ingress controller logs**
   ```bash
   kubectl logs -n ingress-nginx deployment/ingress-nginx-controller --tail=100 -f
   ```

### Phase 3: Testing (Before Removing httpd)

Run these tests **while httpd is still running** to validate:

1. **Test direct routing to a3gw** (with new Ingress)
   ```bash
   # Get Ingress IP
   kubectl get ingress
   
   # Test endpoints
   curl -k https://<ingress-ip>/adminportal
   curl -k https://<ingress-ip>/site.json
   curl -k https://<ingress-ip>/conf/server.json
   
   # Check security headers
   curl -I https://<ingress-ip>/adminportal | grep -E "X-Frame-Options|Content-Security-Policy|X-Content-Type-Options"
   ```

2. **Compare responses**
   ```bash
   # Old (via httpd)
   curl -I https://<old-endpoint>/adminportal > old-headers.txt
   
   # New (direct to a3gw)
   curl -I https://<new-ingress-endpoint>/adminportal > new-headers.txt
   
   # Compare
   diff old-headers.txt new-headers.txt
   ```

3. **Load testing**
   ```bash
   # Using Apache Bench
   ab -n 1000 -c 10 https://<ingress-ip>/adminportal
   
   # Using hey
   hey -n 1000 -c 10 https://<ingress-ip>/adminportal
   ```

### Phase 4: Remove httpd (After successful testing)

1. **Scale down httpd (don't delete yet)**
   ```bash
   kubectl scale deployment consolportals-sa-stc-vcp-httpd-deployment --replicas=0
   ```

2. **Monitor for 24-48 hours**
   - Check application logs
   - Monitor user reports
   - Watch metrics (response times, error rates)

3. **If all good, delete httpd resources**
   ```bash
   kubectl delete deployment consolportals-sa-stc-vcp-httpd-deployment
   kubectl delete service consolportals-sa-stc-vcp-httpd-service
   
   # Also remove the old ingress that pointed to httpd
   kubectl delete ingress consolportals-sa-stc-vcp-httpd-ingress
   kubectl delete ingress consolportals-sa-stc-vcp-httpd-ingress-local
   ```

### Phase 5: Rollback Plan (If Issues Occur)

If you encounter problems:

```bash
# 1. Scale httpd back up
kubectl scale deployment consolportals-sa-stc-vcp-httpd-deployment --replicas=2

# 2. Reapply old ingress
kubectl apply -f consolportals-sa-stc-vcp-httpd-ingress.yaml

# 3. Delete new ingress
kubectl delete ingress consolportals-sa-stc-vcp-ingress
kubectl delete ingress consolportals-sa-stc-vcp-ingress-local

# Wait for pods to be ready
kubectl get pods -w
```

## Testing Checklist

After migration, verify:

- [ ] All portal pages load (adminportal, ccportal, partnerportal)
- [ ] Static assets load (JS, CSS, images)
- [ ] `/site.json` and `/conf/server.json` accessible
- [ ] Authentication flow works (`/cmpf-auth-rest`)
- [ ] Backend API calls work (`/vcp/services`)
- [ ] CAPTCHA loads (`/img/captcha.png`)
- [ ] Session persistence works (sticky sessions)
- [ ] Security headers present in responses
- [ ] HTTPS redirect works
- [ ] Compression is working (check `Content-Encoding: gzip`)
- [ ] Access logs visible in Ingress controller
- [ ] No 404s or 500s in logs
- [ ] Response times acceptable (compare before/after)

## Monitoring After Migration

### Metrics to Watch

1. **Response Times**
   ```bash
   # Should be FASTER without httpd layer
   # Check p50, p95, p99 latencies
   ```

2. **Error Rates**
   ```bash
   # Watch for 404s, 500s, 502s, 503s
   kubectl logs -n ingress-nginx deployment/ingress-nginx-controller | grep -E "HTTP/[0-9.]+ (4|5)[0-9]{2}"
   ```

3. **Resource Usage**
   ```bash
   # Should see reduction in memory/CPU
   kubectl top pods
   ```

4. **Access Logs**
   ```bash
   # Ensure logs are flowing
   kubectl logs -n ingress-nginx deployment/ingress-nginx-controller -f
   ```

## Security Considerations

### Headers Verification

After migration, verify these headers are present:

```bash
curl -I https://your-domain.com/adminportal

# Should see:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: default-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
# Referrer-Policy: strict-origin-when-cross-origin
# X-Download-Options: noopen
# X-Permitted-Cross-Domain-Policies: none
# Feature-Policy: vibrate 'none'; geolocation 'none'
# Expect-CT: max-age=86400, enforce
```

### Defense in Depth

Even though Ingress sets security headers, consider adding them in a3gw as well (defense in depth):

See: `a3gw-security-middleware.js` (created separately)

## Cost Analysis

### Current (with httpd)

```
httpd pods:  2 replicas × ~100MB = 200MB
a3gw pods:   2 replicas × ~150MB = 300MB
Total:       500MB

Assuming $0.01/MB/month in your cluster:
Cost: ~$5/month for these components
```

### After Removal (without httpd)

```
a3gw pods:   2 replicas × ~150MB = 300MB
Total:       300MB

Cost: ~$3/month
Savings: ~$2/month (40% reduction)
```

*Note: Actual cost depends on your cluster pricing. This is illustrative.*

### Maintenance Hours Saved

```
Before: Managing httpd configs, updates, security patches
After:  One less component to maintain

Estimated: 2-4 hours/month saved in maintenance
```

## Common Pitfalls & Solutions

### Issue 1: Security Headers Not Appearing

**Problem:** Headers not showing up in responses

**Solution:**
```bash
# Check if headers-more module is loaded
kubectl exec -n ingress-nginx deployment/ingress-nginx-controller -- nginx -V 2>&1 | grep headers-more

# If not available, use standard nginx directives
# See alternative-ingress-annotations.yaml
```

### Issue 2: Session Affinity Not Working

**Problem:** Users getting logged out

**Solution:**
```yaml
# Ensure both Ingress and Service have session affinity
# See a3gw service definition with:
spec:
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
```

### Issue 3: Static Files Not Loading

**Problem:** 404s for CSS/JS files

**Solution:**
```bash
# Verify a3gw is configured to serve static files
# Check a3gw ecosystem.config.js or server config

# Ensure static files are in the right directory
kubectl exec -it <a3gw-pod> -- ls -la /space/a3gw/static
```

### Issue 4: CORS Errors

**Problem:** Browser console shows CORS errors

**Solution:**
```yaml
# Ensure these annotations are present
nginx.ingress.kubernetes.io/enable-cors: "true"
nginx.ingress.kubernetes.io/cors-allow-origin: "*"  # Or specify your domain
```

### Issue 5: Large File Uploads Failing

**Problem:** File uploads > 1MB failing

**Solution:**
```yaml
# Increase body size limit
nginx.ingress.kubernetes.io/proxy-body-size: "10m"  # Already in our config
```

## Alternative: Hybrid Approach

If you're not ready to fully remove httpd, consider this hybrid:

### Option A: httpd as Sidecar

```yaml
# Keep httpd but as a sidecar in a3gw pods
# Reduces separate deployment overhead
# Still gets security benefits of Apache
```

### Option B: Gradual Migration

1. **Phase 1:** Route 10% traffic to new ingress (canary)
2. **Phase 2:** Route 50% traffic
3. **Phase 3:** Route 100% traffic
4. **Phase 4:** Remove httpd

This can be done with weighted routing or A/B testing tools.

## Conclusion

**Bottom Line:**
- ✅ YES, you can remove httpd entirely
- ✅ Ingress can handle all httpd responsibilities
- ✅ Ingress DOES produce access logs
- ✅ You'll save resources and simplify architecture
- ⚠️ But requires upfront migration effort and testing

**My Recommendation:**
**Remove httpd** - the benefits outweigh the effort. Your current setup is adding an unnecessary layer. Modern Kubernetes Ingress controllers are mature enough to handle everything httpd was doing, plus you gain cloud-native benefits.

## Next Steps

1. Review the `ingress-replacement-httpd.yaml` file
2. Test in a dev/staging environment first
3. Follow the migration phases
4. Monitor closely during rollout
5. Keep rollback plan ready
6. Document any custom configurations

## Need Help?

If you encounter issues:
1. Check Ingress controller logs
2. Verify a3gw can serve static files
3. Test each endpoint individually
4. Compare headers before/after
5. Review security headers with browser dev tools

Good luck with your migration! 🚀
