#!/bin/bash

###############################################################################
# SSL Certificate Migration Script
# 
# This script helps you migrate SSL certificates from httpd to Ingress
#
# Usage: ./migrate-ssl-to-ingress.sh
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_info() {
    echo -e "${BLUE}INFO:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓ SUCCESS:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}✗ ERROR:${NC} $1"
}

###############################################################################
# Step 1: Verify Prerequisites
###############################################################################

print_header "Step 1: Verifying Prerequisites"

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl not found. Please install kubectl first."
    exit 1
fi
print_success "kubectl is installed"

# Check cluster access
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi
print_success "Connected to Kubernetes cluster"

# Get namespace
NAMESPACE="${NAMESPACE:-default}"
print_info "Using namespace: $NAMESPACE"

###############################################################################
# Step 2: Current SSL Setup
###############################################################################

print_header "Step 2: Understanding Current SSL Setup"

echo "In your current setup:"
echo ""
echo "Browser ----HTTPS----> Ingress ----HTTP----> httpd ----HTTP----> a3gw"
echo "              ↑                                 ↑"
echo "         SSL TERMINATES HERE          Receives plain HTTP"
echo ""
print_info "SSL termination is ALREADY at Ingress level!"
print_info "httpd is receiving plain HTTP, not HTTPS"
echo ""

read -p "Do you understand that SSL won't change when removing httpd? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please review the SSL_CERTIFICATE_GUIDE.md for more details"
    exit 0
fi

###############################################################################
# Step 3: Choose Certificate Management Approach
###############################################################################

print_header "Step 3: Choose Certificate Management Approach"

echo "You have 4 options:"
echo ""
echo "1. Manual (use existing certificates)"
echo "2. cert-manager with Let's Encrypt (automatic, free)"
echo "3. cert-manager with Private CA"
echo "4. Cloud Provider Certificate Manager"
echo ""
read -p "Choose option (1-4): " choice

case $choice in
    1)
        CERT_METHOD="manual"
        print_info "Selected: Manual certificate management"
        ;;
    2)
        CERT_METHOD="letsencrypt"
        print_info "Selected: cert-manager with Let's Encrypt"
        ;;
    3)
        CERT_METHOD="privateca"
        print_info "Selected: cert-manager with Private CA"
        ;;
    4)
        CERT_METHOD="cloud"
        print_info "Selected: Cloud Provider Certificate Manager"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

###############################################################################
# Step 4: Execute Based on Choice
###############################################################################

if [ "$CERT_METHOD" = "manual" ]; then
    print_header "Step 4: Manual Certificate Setup"
    
    # Check if certificates exist
    echo "Looking for existing certificates..."
    
    # Default paths (adjust if needed)
    CERT_PATH="./vcp/openssl.prod/server.crt"
    KEY_PATH="./vcp/openssl.prod/server.key"
    
    if [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
        print_success "Found certificates at default location"
        echo "  Certificate: $CERT_PATH"
        echo "  Key: $KEY_PATH"
    else
        print_warning "Certificates not found at default location"
        read -p "Enter path to certificate file (.crt): " CERT_PATH
        read -p "Enter path to key file (.key): " KEY_PATH
        
        if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
            print_error "Certificate or key file not found"
            exit 1
        fi
    fi
    
    # Validate certificate
    print_info "Validating certificate..."
    if openssl x509 -in "$CERT_PATH" -noout &> /dev/null; then
        print_success "Certificate is valid"
        
        # Show certificate details
        echo ""
        echo "Certificate Details:"
        openssl x509 -in "$CERT_PATH" -noout -subject -issuer -dates
        echo ""
    else
        print_error "Invalid certificate file"
        exit 1
    fi
    
    # Create Kubernetes secret
    SECRET_NAME="vcp-tls-secret"
    
    print_info "Creating Kubernetes TLS secret..."
    
    # Check if secret already exists
    if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" &> /dev/null; then
        print_warning "Secret $SECRET_NAME already exists"
        read -p "Do you want to replace it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kubectl delete secret "$SECRET_NAME" -n "$NAMESPACE"
            print_info "Deleted existing secret"
        else
            print_info "Keeping existing secret"
        fi
    fi
    
    # Create new secret
    if ! kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" &> /dev/null; then
        kubectl create secret tls "$SECRET_NAME" \
            --cert="$CERT_PATH" \
            --key="$KEY_PATH" \
            --namespace="$NAMESPACE"
        
        print_success "TLS secret created: $SECRET_NAME"
    fi
    
    # Verify secret
    print_info "Verifying TLS secret..."
    if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -noout &> /dev/null; then
        print_success "TLS secret is valid"
    else
        print_error "TLS secret verification failed"
        exit 1
    fi

elif [ "$CERT_METHOD" = "letsencrypt" ]; then
    print_header "Step 4: Setting up cert-manager with Let's Encrypt"
    
    # Check if cert-manager is installed
    print_info "Checking cert-manager installation..."
    if kubectl get namespace cert-manager &> /dev/null; then
        print_success "cert-manager namespace exists"
    else
        print_warning "cert-manager is not installed"
        read -p "Do you want to install cert-manager now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Installing cert-manager..."
            kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
            
            print_info "Waiting for cert-manager to be ready..."
            kubectl wait --for=condition=Available --timeout=300s \
                deployment/cert-manager -n cert-manager
            
            print_success "cert-manager installed successfully"
        else
            print_error "cert-manager is required for Let's Encrypt option"
            exit 1
        fi
    fi
    
    # Get email for Let's Encrypt
    read -p "Enter email for Let's Encrypt notifications: " LE_EMAIL
    
    # Create ClusterIssuer
    print_info "Creating Let's Encrypt ClusterIssuer..."
    
    cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-production
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: $LE_EMAIL
    privateKeySecretRef:
      name: letsencrypt-production
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
    
    print_success "Let's Encrypt ClusterIssuer created"
    print_info "Certificate will be automatically requested when Ingress is applied"
    
else
    print_warning "Other certificate methods require manual configuration"
    print_info "Please refer to SSL_CERTIFICATE_GUIDE.md for detailed instructions"
fi

###############################################################################
# Step 5: Apply Ingress Configuration
###############################################################################

print_header "Step 5: Applying Ingress Configuration"

# Check if domain is set
read -p "Enter your domain name (e.g., example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    print_error "Domain name is required"
    exit 1
fi

print_info "Domain: $DOMAIN"

# Create Ingress configuration
INGRESS_FILE="ingress-tls-${DOMAIN}.yaml"

print_info "Creating Ingress configuration: $INGRESS_FILE"

cat > "$INGRESS_FILE" <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: consolportals-sa-stc-vcp-ingress
  annotations:
    # Force HTTPS
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    
    # SSL Configuration
    nginx.ingress.kubernetes.io/ssl-protocols: "TLSv1.2 TLSv1.3"
    nginx.ingress.kubernetes.io/ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384"
    
    # HSTS
    nginx.ingress.kubernetes.io/hsts: "true"
    nginx.ingress.kubernetes.io/hsts-max-age: "31536000"
    nginx.ingress.kubernetes.io/hsts-include-subdomains: "true"
EOF

if [ "$CERT_METHOD" = "letsencrypt" ]; then
    cat >> "$INGRESS_FILE" <<EOF
    
    # cert-manager
    cert-manager.io/cluster-issuer: "letsencrypt-production"
    acme.cert-manager.io/http01-edit-in-place: "true"
EOF
fi

cat >> "$INGRESS_FILE" <<EOF
    
    # Session affinity
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/session-cookie-name: "vcp-sticky"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "10800"
    nginx.ingress.kubernetes.io/session-cookie-secure: "true"
    
    # Proxy settings
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - $DOMAIN
      secretName: vcp-tls-secret
  rules:
    - host: $DOMAIN
      http:
        paths:
          - pathType: Prefix
            path: "/adminportal"
            backend:
              service:
                name: consolportals-sa-stc-vcp-a3gw-service
                port:
                  number: 8444
          - pathType: Prefix
            path: "/ccportal"
            backend:
              service:
                name: consolportals-sa-stc-vcp-a3gw-service
                port:
                  number: 8444
          - pathType: Prefix
            path: "/partnerportal"
            backend:
              service:
                name: consolportals-sa-stc-vcp-a3gw-service
                port:
                  number: 8444
          - pathType: Prefix
            path: "/"
            backend:
              service:
                name: consolportals-sa-stc-vcp-a3gw-service
                port:
                  number: 8444
EOF

print_success "Ingress configuration created: $INGRESS_FILE"

read -p "Do you want to apply this Ingress configuration now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    kubectl apply -f "$INGRESS_FILE" -n "$NAMESPACE"
    print_success "Ingress applied"
    
    # Show Ingress status
    print_info "Ingress status:"
    kubectl get ingress consolportals-sa-stc-vcp-ingress -n "$NAMESPACE"
else
    print_info "Ingress configuration saved to $INGRESS_FILE"
    print_info "Apply it manually with: kubectl apply -f $INGRESS_FILE"
fi

###############################################################################
# Step 6: Verification
###############################################################################

print_header "Step 6: Verification Steps"

echo "Next steps to verify your SSL setup:"
echo ""
echo "1. Check Ingress status:"
echo "   kubectl describe ingress consolportals-sa-stc-vcp-ingress -n $NAMESPACE"
echo ""
echo "2. Test HTTPS access:"
echo "   curl -I https://$DOMAIN/adminportal"
echo ""
echo "3. Verify certificate:"
echo "   openssl s_client -connect $DOMAIN:443 -servername $DOMAIN | openssl x509 -noout -dates"
echo ""
echo "4. Check for HTTP to HTTPS redirect:"
echo "   curl -I http://$DOMAIN/adminportal"
echo "   (Should return 301/308 redirect to HTTPS)"
echo ""

if [ "$CERT_METHOD" = "letsencrypt" ]; then
    echo "5. Monitor certificate issuance:"
    echo "   kubectl get certificate vcp-tls-secret -n $NAMESPACE -w"
    echo "   (Wait for 'Certificate is up to date')"
    echo ""
fi

echo "6. Run full test suite:"
echo "   ./test-httpd-removal.sh https://$DOMAIN"
echo ""

###############################################################################
# Summary
###############################################################################

print_header "Summary"

print_success "SSL certificate migration setup complete!"
echo ""
echo "What was done:"
if [ "$CERT_METHOD" = "manual" ]; then
    echo "  ✓ Created TLS secret from existing certificates"
elif [ "$CERT_METHOD" = "letsencrypt" ]; then
    echo "  ✓ Installed/verified cert-manager"
    echo "  ✓ Created Let's Encrypt ClusterIssuer"
    echo "  ✓ Configured automatic certificate issuance"
fi
echo "  ✓ Created Ingress configuration with TLS"
echo ""
echo "Important notes:"
echo "  • SSL termination happens at Ingress (NGINX)"
echo "  • a3gw receives plain HTTP from Ingress"
echo "  • Removing httpd does NOT change SSL flow"
echo "  • All HTTPS traffic is encrypted until Ingress"
echo ""
echo "Documentation:"
echo "  • Full guide: SSL_CERTIFICATE_GUIDE.md"
echo "  • Testing: test-httpd-removal.sh"
echo "  • Migration: MIGRATION_GUIDE.md"
echo ""

print_success "You're ready to remove httpd!"
