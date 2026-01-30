#!/bin/bash

# ConsolPortals Helm Chart Installation Script
# This script helps with installing and managing the Helm chart

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
RELEASE_NAME="consolportals"
NAMESPACE="stc-vcp-services"
CHART_PATH="."
VALUES_FILE=""
ENVIRONMENT="development"

# Functions
print_header() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}ConsolPortals STC VCP Helm Chart Installer${NC}               ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    -e, --environment ENV    Environment (development|production|staging) [default: development]
    -n, --namespace NAME     Kubernetes namespace [default: stc-vcp-services]
    -r, --release NAME       Helm release name [default: consolportals]
    -f, --values FILE        Custom values file
    -u, --upgrade            Upgrade existing installation
    --uninstall             Uninstall the chart
    --dry-run               Perform a dry run (template only)
    -h, --help              Show this help message

Examples:
    # Install with development values
    $0 -e development

    # Install to production
    $0 -e production -n stc-vcp-services-prod

    # Upgrade existing installation
    $0 -u -e production

    # Dry run to see what will be deployed
    $0 --dry-run -e production

    # Custom values file
    $0 -f my-values.yaml

EOF
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check for kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Please install kubectl."
        exit 1
    fi
    print_success "kubectl found"
    
    # Check for helm
    if ! command -v helm &> /dev/null; then
        print_error "Helm not found. Please install Helm 3."
        exit 1
    fi
    print_success "Helm found"
    
    # Check Kubernetes connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster."
        exit 1
    fi
    print_success "Connected to Kubernetes cluster"
}

create_namespace() {
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_info "Namespace '$NAMESPACE' already exists"
    else
        print_info "Creating namespace '$NAMESPACE'..."
        kubectl create namespace "$NAMESPACE"
        print_success "Namespace created"
    fi
}

install_chart() {
    print_info "Installing Helm chart..."
    
    local helm_cmd="helm install $RELEASE_NAME $CHART_PATH -n $NAMESPACE"
    
    # Add values file if specified
    if [ -n "$VALUES_FILE" ]; then
        helm_cmd="$helm_cmd -f $VALUES_FILE"
    elif [ "$ENVIRONMENT" != "default" ]; then
        local env_values="values-${ENVIRONMENT}.yaml"
        if [ -f "$env_values" ]; then
            helm_cmd="$helm_cmd -f $env_values"
            print_info "Using environment values: $env_values"
        else
            print_warning "Values file $env_values not found, using default values"
        fi
    fi
    
    # Add dry-run flag if specified
    if [ "$DRY_RUN" = true ]; then
        helm_cmd="$helm_cmd --dry-run --debug"
        print_warning "Performing dry run..."
    fi
    
    echo
    echo -e "${CYAN}Executing: ${NC}$helm_cmd"
    echo
    
    eval "$helm_cmd"
    
    if [ "$DRY_RUN" != true ]; then
        print_success "Helm chart installed successfully!"
    fi
}

upgrade_chart() {
    print_info "Upgrading Helm chart..."
    
    local helm_cmd="helm upgrade $RELEASE_NAME $CHART_PATH -n $NAMESPACE"
    
    # Add values file if specified
    if [ -n "$VALUES_FILE" ]; then
        helm_cmd="$helm_cmd -f $VALUES_FILE"
    elif [ "$ENVIRONMENT" != "default" ]; then
        local env_values="values-${ENVIRONMENT}.yaml"
        if [ -f "$env_values" ]; then
            helm_cmd="$helm_cmd -f $env_values"
            print_info "Using environment values: $env_values"
        fi
    fi
    
    # Add dry-run flag if specified
    if [ "$DRY_RUN" = true ]; then
        helm_cmd="$helm_cmd --dry-run --debug"
        print_warning "Performing dry run..."
    fi
    
    echo
    echo -e "${CYAN}Executing: ${NC}$helm_cmd"
    echo
    
    eval "$helm_cmd"
    
    if [ "$DRY_RUN" != true ]; then
        print_success "Helm chart upgraded successfully!"
    fi
}

uninstall_chart() {
    print_warning "Uninstalling Helm chart..."
    helm uninstall "$RELEASE_NAME" -n "$NAMESPACE"
    print_success "Helm chart uninstalled"
}

show_status() {
    if [ "$DRY_RUN" = true ]; then
        return
    fi
    
    echo
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Deployment Status${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    
    echo
    print_info "Helm Release Status:"
    helm status "$RELEASE_NAME" -n "$NAMESPACE"
    
    echo
    print_info "Waiting for pods to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance="$RELEASE_NAME" -n "$NAMESPACE" --timeout=300s || true
    
    echo
    print_info "Pod Status:"
    kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
    
    echo
    print_info "Service Status:"
    kubectl get services -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
    
    echo
    print_info "Ingress Status:"
    kubectl get ingress -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
}

# Parse command line arguments
UPGRADE=false
UNINSTALL=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--release)
            RELEASE_NAME="$2"
            shift 2
            ;;
        -f|--values)
            VALUES_FILE="$2"
            shift 2
            ;;
        -u|--upgrade)
            UPGRADE=true
            shift
            ;;
        --uninstall)
            UNINSTALL=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_header
    
    print_info "Configuration:"
    echo "  Release Name: $RELEASE_NAME"
    echo "  Namespace:    $NAMESPACE"
    echo "  Environment:  $ENVIRONMENT"
    if [ -n "$VALUES_FILE" ]; then
        echo "  Values File:  $VALUES_FILE"
    fi
    echo
    
    check_prerequisites
    
    if [ "$UNINSTALL" = true ]; then
        uninstall_chart
        exit 0
    fi
    
    if [ "$DRY_RUN" != true ]; then
        create_namespace
    fi
    
    if [ "$UPGRADE" = true ]; then
        upgrade_chart
    else
        install_chart
    fi
    
    show_status
    
    echo
    print_success "Done!"
}

main
