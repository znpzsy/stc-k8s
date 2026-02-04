#!/bin/bash

###############################################################################
# httpd Removal Validation Test Script
# 
# This script tests your deployment after removing httpd to ensure:
# - All endpoints are accessible
# - Security headers are present
# - Session affinity works
# - Compression is enabled
# - Access logs are being generated
#
# Usage: ./test-httpd-removal.sh <ingress-url>
# Example: ./test-httpd-removal.sh https://your-domain.com
#          ./test-httpd-removal.sh https://192.168.1.100
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost}"
NAMESPACE="${NAMESPACE:-default}"
INGRESS_NAMESPACE="${INGRESS_NAMESPACE:-ingress-nginx}"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
    echo -e "${YELLOW}TEST:${NC} $1"
    ((TESTS_TOTAL++))
}

print_pass() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${BLUE}INFO:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed${NC}"
        exit 1
    fi
}

###############################################################################
# Pre-flight Checks
###############################################################################

print_header "Pre-flight Checks"

check_command curl
check_command kubectl

if [ -z "$BASE_URL" ]; then
    print_fail "BASE_URL not provided"
    echo "Usage: $0 <base-url>"
    exit 1
fi

print_info "Testing URL: $BASE_URL"
print_info "Namespace: $NAMESPACE"
print_info "Ingress Namespace: $INGRESS_NAMESPACE"

###############################################################################
# Test 1: Kubernetes Resources
###############################################################################

print_header "Test 1: Kubernetes Resources"

print_test "Checking if a3gw service exists"
if kubectl get service consolportals-sa-stc-vcp-a3gw-service -n "$NAMESPACE" &> /dev/null; then
    print_pass "a3gw service exists"
else
    print_fail "a3gw service not found"
fi

print_test "Checking if httpd service exists (should NOT exist)"
if kubectl get service consolportals-sa-stc-vcp-httpd-service -n "$NAMESPACE" &> /dev/null; then
    print_warning "httpd service still exists - not fully removed"
else
    print_pass "httpd service correctly removed"
fi

print_test "Checking if Ingress exists"
if kubectl get ingress consolportals-sa-stc-vcp-ingress -n "$NAMESPACE" &> /dev/null; then
    print_pass "Ingress exists"
else
    print_fail "Ingress not found"
fi

print_test "Checking a3gw pod status"
A3GW_PODS=$(kubectl get pods -n "$NAMESPACE" -l component=vcp-a3gw --no-headers 2>/dev/null | wc -l)
if [ "$A3GW_PODS" -gt 0 ]; then
    RUNNING_PODS=$(kubectl get pods -n "$NAMESPACE" -l component=vcp-a3gw --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)
    if [ "$RUNNING_PODS" -eq "$A3GW_PODS" ]; then
        print_pass "All $A3GW_PODS a3gw pods are running"
    else
        print_fail "Only $RUNNING_PODS/$A3GW_PODS a3gw pods are running"
    fi
else
    print_fail "No a3gw pods found"
fi

###############################################################################
# Test 2: Endpoint Accessibility
###############################################################################

print_header "Test 2: Endpoint Accessibility"

test_endpoint() {
    local path="$1"
    local expected_status="${2:-200}"
    local description="$3"
    
    print_test "$description"
    
    response=$(curl -k -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        print_pass "$path returned $expected_status"
    else
        print_fail "$path returned $response (expected $expected_status)"
    fi
}

test_endpoint "/site.json" "200" "Testing /site.json"
test_endpoint "/conf/server.json" "200" "Testing /conf/server.json (may require auth)"
test_endpoint "/adminportal" "200" "Testing /adminportal"
test_endpoint "/ccportal" "200" "Testing /ccportal"
test_endpoint "/partnerportal" "200" "Testing /partnerportal"
test_endpoint "/img/captcha.png" "200" "Testing /img/captcha.png"

###############################################################################
# Test 3: Security Headers
###############################################################################

print_header "Test 3: Security Headers"

test_security_header() {
    local header_name="$1"
    local expected_value="$2"
    local match_type="${3:-exact}"  # exact or contains
    
    print_test "Checking $header_name header"
    
    header_value=$(curl -k -s -I "${BASE_URL}/adminportal" | grep -i "^${header_name}:" | cut -d: -f2- | tr -d '\r\n' | sed 's/^ *//')
    
    if [ -z "$header_value" ]; then
        print_fail "$header_name header not found"
        return
    fi
    
    if [ "$match_type" = "exact" ]; then
        if [ "$header_value" = "$expected_value" ]; then
            print_pass "$header_name: $header_value"
        else
            print_fail "$header_name has wrong value: '$header_value' (expected: '$expected_value')"
        fi
    else
        if echo "$header_value" | grep -q "$expected_value"; then
            print_pass "$header_name contains expected value"
        else
            print_fail "$header_name doesn't contain expected value"
        fi
    fi
}

test_security_header "X-Frame-Options" "DENY"
test_security_header "X-Content-Type-Options" "nosniff"
test_security_header "X-XSS-Protection" "1; mode=block"
test_security_header "Content-Security-Policy" "default-src 'self'" "contains"
test_security_header "Referrer-Policy" "strict-origin-when-cross-origin"

# Check if Server header is hidden
print_test "Checking if Server header is hidden"
server_header=$(curl -k -s -I "${BASE_URL}/adminportal" | grep -i "^Server:" || echo "")
if [ -z "$server_header" ]; then
    print_pass "Server header successfully hidden"
else
    print_warning "Server header still present: $server_header"
fi

# Check if X-Powered-By is removed
print_test "Checking if X-Powered-By header is removed"
powered_by=$(curl -k -s -I "${BASE_URL}/adminportal" | grep -i "^X-Powered-By:" || echo "")
if [ -z "$powered_by" ]; then
    print_pass "X-Powered-By header successfully removed"
else
    print_warning "X-Powered-By header still present: $powered_by"
fi

###############################################################################
# Test 4: Compression
###############################################################################

print_header "Test 4: Compression"

print_test "Checking if gzip compression is enabled"
content_encoding=$(curl -k -s -H "Accept-Encoding: gzip" -I "${BASE_URL}/adminportal" | grep -i "^Content-Encoding:" | cut -d: -f2 | tr -d ' \r\n')

if [ "$content_encoding" = "gzip" ]; then
    print_pass "Gzip compression is enabled"
else
    print_warning "Gzip compression not detected (might be intentional for small responses)"
fi

###############################################################################
# Test 5: Session Affinity
###############################################################################

print_header "Test 5: Session Affinity"

print_test "Checking for session cookie"
cookie=$(curl -k -s -I "${BASE_URL}/adminportal" | grep -i "^Set-Cookie:" | grep "vcp-sticky" || echo "")

if [ -n "$cookie" ]; then
    print_pass "Session cookie 'vcp-sticky' is set"
    print_info "Cookie: $(echo $cookie | tr -d '\r\n')"
    
    # Check HTTPOnly flag
    if echo "$cookie" | grep -q "HTTPOnly"; then
        print_pass "Session cookie has HTTPOnly flag"
    else
        print_warning "Session cookie missing HTTPOnly flag"
    fi
    
    # Check SameSite
    if echo "$cookie" | grep -q "SameSite"; then
        print_pass "Session cookie has SameSite attribute"
    else
        print_warning "Session cookie missing SameSite attribute"
    fi
else
    print_warning "Session cookie not found (may be set only after authentication)"
fi

###############################################################################
# Test 6: CORS Headers
###############################################################################

print_header "Test 6: CORS Headers"

print_test "Checking CORS headers for images"
cors_header=$(curl -k -s -H "Origin: https://example.com" -I "${BASE_URL}/img/captcha.png" | grep -i "^Access-Control-Allow-Origin:" | cut -d: -f2 | tr -d ' \r\n')

if [ -n "$cors_header" ]; then
    print_pass "CORS headers present for images: $cors_header"
else
    print_info "CORS headers not found (may be intentional)"
fi

###############################################################################
# Test 7: Ingress Logs
###############################################################################

print_header "Test 7: Ingress Logs"

print_test "Checking if Ingress controller is generating logs"

# Get recent logs
ingress_logs=$(kubectl logs -n "$INGRESS_NAMESPACE" deployment/ingress-nginx-controller --tail=50 2>/dev/null || echo "")

if [ -n "$ingress_logs" ]; then
    log_count=$(echo "$ingress_logs" | wc -l)
    print_pass "Ingress controller logs accessible ($log_count recent lines)"
    
    # Check if our requests appear in logs
    if echo "$ingress_logs" | grep -q "/adminportal\|/ccportal\|/partnerportal"; then
        print_pass "Recent requests visible in Ingress logs"
    else
        print_info "Recent requests not yet in logs (check timing)"
    fi
else
    print_fail "Cannot access Ingress controller logs"
fi

###############################################################################
# Test 8: Performance Check
###############################################################################

print_header "Test 8: Performance Check"

print_test "Measuring response time to /adminportal"
response_time=$(curl -k -s -o /dev/null -w "%{time_total}" "${BASE_URL}/adminportal" 2>/dev/null)

if [ -n "$response_time" ]; then
    # Convert to milliseconds
    response_ms=$(echo "$response_time * 1000" | bc)
    print_pass "Response time: ${response_ms}ms"
    
    # Warn if response is slow
    if (( $(echo "$response_time > 1.0" | bc -l) )); then
        print_warning "Response time > 1 second (${response_ms}ms)"
    fi
else
    print_fail "Could not measure response time"
fi

###############################################################################
# Test 9: Static Files
###############################################################################

print_header "Test 9: Static Files"

print_test "Testing if static assets load"

# Test common static file patterns
test_static() {
    local path="$1"
    local content_type="${2:-}"
    
    if [ -n "$content_type" ]; then
        actual_type=$(curl -k -s -I "${BASE_URL}${path}" | grep -i "^Content-Type:" | cut -d: -f2 | tr -d ' \r\n' | cut -d';' -f1)
        if [ "$actual_type" = "$content_type" ]; then
            print_pass "$path has correct Content-Type"
        else
            print_info "$path Content-Type: $actual_type (expected: $content_type)"
        fi
    fi
}

# These are examples - adjust based on your actual static files
test_static "/site.json" "application/json"

###############################################################################
# Test 10: Backend Connectivity
###############################################################################

print_header "Test 10: Backend Connectivity"

print_test "Checking connectivity to backend services"

# Test auth endpoint
auth_response=$(curl -k -s -o /dev/null -w "%{http_code}" "${BASE_URL}/cmpf-auth-rest" 2>/dev/null || echo "000")
if [ "$auth_response" != "000" ]; then
    print_pass "Auth endpoint accessible (status: $auth_response)"
else
    print_fail "Auth endpoint not accessible"
fi

# Test services endpoint
services_response=$(curl -k -s -o /dev/null -w "%{http_code}" "${BASE_URL}/vcp/services" 2>/dev/null || echo "000")
if [ "$services_response" != "000" ]; then
    print_pass "Services endpoint accessible (status: $services_response)"
else
    print_fail "Services endpoint not accessible"
fi

###############################################################################
# Test 11: Health Checks
###############################################################################

print_header "Test 11: Health Checks"

print_test "Checking a3gw pod health"

# Get a3gw pod name
A3GW_POD=$(kubectl get pods -n "$NAMESPACE" -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$A3GW_POD" ]; then
    # Check if pod is ready
    pod_ready=$(kubectl get pod "$A3GW_POD" -n "$NAMESPACE" -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "Unknown")
    
    if [ "$pod_ready" = "True" ]; then
        print_pass "a3gw pod is Ready"
    else
        print_fail "a3gw pod is not Ready (status: $pod_ready)"
    fi
    
    # Check restart count
    restart_count=$(kubectl get pod "$A3GW_POD" -n "$NAMESPACE" -o jsonpath='{.status.containerStatuses[0].restartCount}' 2>/dev/null || echo "0")
    
    if [ "$restart_count" -eq 0 ]; then
        print_pass "a3gw pod has no restarts"
    else
        print_warning "a3gw pod has restarted $restart_count time(s)"
    fi
else
    print_fail "Cannot find a3gw pod"
fi

###############################################################################
# Test Summary
###############################################################################

print_header "Test Summary"

echo -e "Total Tests: $TESTS_TOTAL"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

success_rate=$(echo "scale=2; $TESTS_PASSED * 100 / $TESTS_TOTAL" | bc)
echo -e "\nSuccess Rate: ${success_rate}%"

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}httpd removal appears successful!${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
elif [ "$TESTS_PASSED" -ge $(($TESTS_TOTAL * 80 / 100)) ]; then
    echo -e "\n${YELLOW}========================================${NC}"
    echo -e "${YELLOW}⚠ MOSTLY PASSING${NC}"
    echo -e "${YELLOW}Some issues detected but migration looks good overall${NC}"
    echo -e "${YELLOW}========================================${NC}"
    exit 0
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}✗ SIGNIFICANT ISSUES DETECTED${NC}"
    echo -e "${RED}Review failures before proceeding${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
