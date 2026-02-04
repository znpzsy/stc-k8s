# SSL/TLS Certificate Management Guide

## Overview

When you remove httpd, SSL/TLS termination happens at the **Ingress Controller** level. This is actually **better** than having httpd handle it because:

✅ Centralized certificate management  
✅ Automatic certificate renewal (with cert-manager)  
✅ Better performance (NGINX is optimized for this)  
✅ Simpler architecture  

## Current vs Future SSL Flow

### CURRENT (with httpd):
```
┌─────────┐
│ Browser │ 
└────┬────┘
     │ HTTPS (443)
     ▼
┌────────────────┐
│    Ingress     │ ◄── SSL TERMINATION (already here!)
│   (NGINX)      │
└────┬───────────┘
     │ HTTP (80)
     ▼
┌────────────────┐
│     httpd      │ ◄── Receives plain HTTP
└────┬───────────┘
     │ HTTP
     ▼
┌────────────────┐
│     a3gw       │
└────────────────┘
```

### AFTER httpd removal:
```
┌─────────┐
│ Browser │
└────┬────┘
     │ HTTPS (443)
     ▼
┌────────────────┐
│    Ingress     │ ◄── SSL TERMINATION (same place!)
│   (NGINX)      │
└────┬───────────┘
     │ HTTP (8444/8445)
     ▼
┌────────────────┐
│     a3gw       │ ◄── Receives plain HTTP
└────────────────┘
```

**Nothing changes for SSL!** It's already at Ingress.

---

## Certificate Management Options

You have **4 main options** for managing TLS certificates:

### Option 1: Manual Certificate Management (Simplest)

Use existing certificates (`server.crt`, `server.key` from your Dockerfile).

#### Step 1: Create Kubernetes Secret

```bash
# Using your existing certificates
kubectl create secret tls vcp-tls-secret \
  --cert=/path/to/server.crt \
  --key=/path/to/server.key \
  --namespace=default

# Verify secret was created
kubectl get secret vcp-tls-secret
```

#### Step 2: Reference in Ingress

```yaml
spec:
  tls:
    - hosts:
        - your-domain.com
      secretName: vcp-tls-secret  # ← References the secret above
```

#### Step 3: Update certificates (when they expire)

```bash
# Delete old secret
kubectl delete secret vcp-tls-secret

# Create new secret with updated certificates
kubectl create secret tls vcp-tls-secret \
  --cert=/path/to/new-server.crt \
  --key=/path/to/new-server.key

# Ingress will automatically pick up the new certificate
```

**Pros:**
- ✅ Simple and straightforward
- ✅ Works with any certificate source
- ✅ No additional tools required

**Cons:**
- ⚠️ Manual renewal process
- ⚠️ Need to track expiry dates

---

### Option 2: cert-manager with Let's Encrypt (Recommended) ⭐

Automatically obtain and renew FREE certificates from Let's Encrypt.

#### Step 1: Install cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager
```

#### Step 2: Create ClusterIssuer (Let's Encrypt)

```yaml
# letsencrypt-production.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-production
spec:
  acme:
    # Let's Encrypt production server
    server: https://acme-v02.api.letsencrypt.org/directory
    
    # Your email for certificate expiry notifications
    email: your-email@company.com
    
    # Secret to store the ACME account private key
    privateKeySecretRef:
      name: letsencrypt-production
    
    # HTTP-01 challenge (validates domain ownership)
    solvers:
    - http01:
        ingress:
          class: nginx
```

```bash
kubectl apply -f letsencrypt-production.yaml
```

#### Step 3: Update Ingress with cert-manager annotations

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: consolportals-sa-stc-vcp-ingress
  annotations:
    # cert-manager annotations
    cert-manager.io/cluster-issuer: "letsencrypt-production"
    acme.cert-manager.io/http01-edit-in-place: "true"
    
    # ... other annotations ...
    
spec:
  tls:
    - hosts:
        - your-domain.com
      secretName: vcp-tls-secret  # cert-manager will create this automatically
  rules:
    - host: your-domain.com
      # ... paths ...
```

**That's it!** cert-manager will:
1. Request a certificate from Let's Encrypt
2. Complete domain validation via HTTP-01 challenge
3. Store the certificate in the Secret
4. Auto-renew before expiry (60 days before)

**Pros:**
- ✅ Fully automatic certificate management
- ✅ Free certificates (Let's Encrypt)
- ✅ Auto-renewal
- ✅ Industry standard solution

**Cons:**
- ⚠️ Requires cert-manager installation
- ⚠️ Domain must be publicly accessible for validation

---

### Option 3: cert-manager with Private CA

Use your organization's internal Certificate Authority.

#### Step 1: Install cert-manager (same as Option 2)

#### Step 2: Create CA Issuer

```yaml
# ca-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: ca-issuer
spec:
  ca:
    # Reference to Secret containing your CA certificate and key
    secretName: ca-key-pair
```

#### Step 3: Create CA Secret

```bash
# Create secret with your CA certificate and key
kubectl create secret tls ca-key-pair \
  --cert=/path/to/ca.crt \
  --key=/path/to/ca.key \
  --namespace=cert-manager
```

#### Step 4: Update Ingress

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: "ca-issuer"
```

**Pros:**
- ✅ Works with internal/private CAs
- ✅ Automatic renewal
- ✅ Good for internal networks

**Cons:**
- ⚠️ Requires access to CA infrastructure
- ⚠️ Clients need to trust your CA

---

### Option 4: Cloud Provider Certificate Manager

Use native cloud provider solutions (AWS ACM, GCP Certificate Manager, Azure Key Vault).

#### AWS (with ALB Ingress Controller)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: consolportals-sa-stc-vcp-ingress
  annotations:
    # Use AWS ALB Ingress Controller
    kubernetes.io/ingress.class: alb
    
    # Reference AWS ACM certificate ARN
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:region:account-id:certificate/certificate-id
    
    # SSL policy
    alb.ingress.kubernetes.io/ssl-policy: ELBSecurityPolicy-TLS-1-2-2017-01
```

#### GCP (with GKE Ingress)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    # Use GCP-managed certificate
    networking.gke.io/managed-certificates: vcp-cert
```

```yaml
# managed-cert.yaml
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: vcp-cert
spec:
  domains:
    - your-domain.com
```

**Pros:**
- ✅ Fully managed by cloud provider
- ✅ Integrated with cloud infrastructure
- ✅ Automatic renewal

**Cons:**
- ⚠️ Vendor lock-in
- ⚠️ May incur cloud costs
- ⚠️ Specific to cloud provider

---

## Comparison Table

| Feature | Manual | cert-manager + Let's Encrypt | cert-manager + Private CA | Cloud Provider |
|---------|--------|------------------------------|---------------------------|----------------|
| **Cost** | Certificate cost | FREE | Certificate cost | Varies |
| **Automation** | ❌ Manual | ✅ Fully automatic | ✅ Fully automatic | ✅ Fully automatic |
| **Renewal** | ❌ Manual | ✅ Auto (60 days before) | ✅ Auto | ✅ Auto |
| **Setup Complexity** | ⭐ Simple | ⭐⭐ Moderate | ⭐⭐⭐ Complex | ⭐⭐ Moderate |
| **Public Domain** | Any | ✅ Required | ❌ Not required | ✅ Required |
| **Private Network** | ✅ Works | ⚠️ Limited | ✅ Best option | ⚠️ Depends |
| **Vendor Lock-in** | ❌ None | ❌ None | ❌ None | ⚠️ Yes |

---

## Step-by-Step: Migrating Your Certificates

### Scenario 1: You Have Existing Certificates

**Current:** Certificates in Dockerfile (`server.crt`, `server.key`)

**Migration:**

```bash
# 1. Extract certificates from your current setup
# (From your stc/vcp/httpd/vcp/openssl.prod/ directory)

# 2. Create Kubernetes secret
kubectl create secret tls vcp-tls-secret \
  --cert=./server.crt \
  --key=./server.key \
  --namespace=default

# 3. Apply Ingress with TLS
kubectl apply -f ingress-with-tls-complete.yaml

# 4. Test HTTPS
curl -k https://your-domain.com/adminportal

# 5. Verify certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com | openssl x509 -noout -dates
```

### Scenario 2: You Want Automatic Certificates (Let's Encrypt)

```bash
# 1. Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml

# 2. Wait for cert-manager to be ready
kubectl wait --for=condition=Available --timeout=300s \
  deployment/cert-manager -n cert-manager

# 3. Create Let's Encrypt issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-production
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@company.com
    privateKeySecretRef:
      name: letsencrypt-production
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# 4. Update Ingress with cert-manager annotation
# (Edit ingress-with-tls-complete.yaml to add:)
#   cert-manager.io/cluster-issuer: "letsencrypt-production"

# 5. Apply and wait for certificate
kubectl apply -f ingress-with-tls-complete.yaml

# 6. Check certificate status
kubectl describe certificate vcp-tls-secret

# 7. Wait for "Certificate is up to date and has not expired"
kubectl get certificate vcp-tls-secret -w
```

---

## Testing SSL Configuration

### Test 1: Basic HTTPS Access

```bash
# Should return 200 OK
curl -v https://your-domain.com/adminportal

# Check certificate details
curl -vI https://your-domain.com 2>&1 | grep -A 10 "Server certificate"
```

### Test 2: Verify TLS Version

```bash
# Test TLS 1.2
openssl s_client -connect your-domain.com:443 -tls1_2

# Test TLS 1.3
openssl s_client -connect your-domain.com:443 -tls1_3

# Should succeed for both
```

### Test 3: Check Security Headers with HTTPS

```bash
curl -I https://your-domain.com/adminportal

# Should see:
# - Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# - All other security headers
```

### Test 4: Verify HTTP to HTTPS Redirect

```bash
# Try HTTP
curl -I http://your-domain.com/adminportal

# Should get:
# HTTP/1.1 308 Permanent Redirect
# Location: https://your-domain.com/adminportal
```

### Test 5: SSL Labs Test

```bash
# Get professional SSL analysis
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com

# Goal: A or A+ rating
```

---

## Certificate Monitoring

### Check Certificate Expiry

```bash
# View certificate expiry date
kubectl get secret vcp-tls-secret -o jsonpath='{.data.tls\.crt}' | \
  base64 -d | \
  openssl x509 -noout -dates

# Example output:
# notBefore=Jan  1 00:00:00 2026 GMT
# notAfter=Apr  1 00:00:00 2026 GMT
```

### Monitor cert-manager Certificates

```bash
# List all certificates
kubectl get certificate

# Check specific certificate status
kubectl describe certificate vcp-tls-secret

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager -f
```

### Set Up Expiry Alerts

If using cert-manager, it automatically renews certificates. But you can still monitor:

```yaml
# Prometheus alert rule (if you use Prometheus)
- alert: CertificateExpiringSoon
  expr: certmanager_certificate_expiration_timestamp_seconds - time() < (30 * 24 * 60 * 60)
  annotations:
    summary: "Certificate {{ $labels.name }} expiring soon"
```

---

## Troubleshooting

### Problem: Certificate not applied

**Symptoms:**
- Browser shows "not secure"
- Certificate is self-signed or invalid

**Solution:**
```bash
# Check if secret exists
kubectl get secret vcp-tls-secret

# Check Ingress TLS configuration
kubectl describe ingress consolportals-sa-stc-vcp-ingress | grep -A 5 "TLS:"

# Check NGINX Ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller | grep -i tls
```

### Problem: cert-manager not issuing certificate

**Symptoms:**
- Certificate stuck in "Pending"
- No certificate secret created

**Solution:**
```bash
# Check certificate status
kubectl describe certificate vcp-tls-secret

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager -f

# Common issues:
# 1. Domain not accessible from internet (for Let's Encrypt)
# 2. DNS not pointing to cluster
# 3. Ingress class mismatch
```

### Problem: Mixed content warnings

**Symptoms:**
- Page loads but some resources fail
- Browser console shows mixed content errors

**Solution:**
```bash
# Ensure ALL resources load via HTTPS
# Check your application code for hardcoded http:// URLs

# Force HTTPS in Ingress
nginx.ingress.kubernetes.io/force-ssl-redirect: "true"

# Check Content-Security-Policy allows HTTPS
# Should have: upgrade-insecure-requests directive
```

---

## Best Practices

### 1. Use Strong TLS Configuration

```yaml
# In Ingress annotations
nginx.ingress.kubernetes.io/ssl-protocols: "TLSv1.2 TLSv1.3"
nginx.ingress.kubernetes.io/ssl-prefer-server-ciphers: "true"
nginx.ingress.kubernetes.io/ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:..."
```

### 2. Enable HSTS

```yaml
nginx.ingress.kubernetes.io/hsts: "true"
nginx.ingress.kubernetes.io/hsts-max-age: "31536000"
nginx.ingress.kubernetes.io/hsts-include-subdomains: "true"
```

### 3. Monitor Certificate Expiry

- Set up alerts 30 days before expiry
- Use cert-manager for auto-renewal
- Test renewal process regularly

### 4. Use Separate Secrets for Different Environments

```bash
# Production
kubectl create secret tls vcp-tls-production --cert=... --key=...

# Staging
kubectl create secret tls vcp-tls-staging --cert=... --key=...
```

### 5. Rotate Certificates Regularly

Even with auto-renewal, practice manual rotation:

```bash
# Every 90 days or according to policy
kubectl delete secret vcp-tls-secret
kubectl create secret tls vcp-tls-secret --cert=new.crt --key=new.key
```

---

## Migration Checklist

- [ ] Understand current SSL setup (it's already at Ingress!)
- [ ] Choose certificate management approach
- [ ] Extract existing certificates (if manual)
- [ ] Create Kubernetes TLS Secret
- [ ] Update Ingress with TLS configuration
- [ ] Test HTTPS access
- [ ] Verify HTTP→HTTPS redirect works
- [ ] Check all security headers present
- [ ] Validate certificate with SSL Labs
- [ ] Set up certificate monitoring
- [ ] Document certificate renewal process
- [ ] Test certificate rotation procedure

---

## Conclusion

**Key Takeaway:** SSL/TLS is already handled by Ingress in your current setup! Removing httpd changes nothing about SSL termination. You just need to ensure the Ingress has the proper TLS configuration and certificate.

**Recommended Approach:**
1. Start with **manual certificates** (Option 1) - use your existing `server.crt`/`server.key`
2. Later migrate to **cert-manager with Let's Encrypt** (Option 2) for automation

This gives you a safe, gradual migration path while maintaining security throughout.
