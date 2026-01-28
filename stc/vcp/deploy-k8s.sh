#!/bin/bash

set -e  # Exit on error

# Configuration
VERSION="1.0.0.1"
REGISTRY="nexus.telenity.com/com/telenity"
REPOSITORY="consolportals-sa-stc"
K8MANIFEST="consolportals_sa_stc_vcp"
SITE="vcp"
NAMESPACE="stc-vcp-services"
PORTALS=("adminportal" "ccportal" "partnerportal")
ALL_SERVICES=("httpd" "a3gw")

for portal in "${PORTALS[@]}"; do
    ALL_SERVICES+=("${SITE}-${portal}")
done

# Frame dimensions
BOX_WIDTH=80
TEXT_WIDTH=$((BOX_WIDTH - 4))
BORDER_CHAR="═"

# Enhanced color palette
if [[ -t 1 ]]; then
  # Terminal supports color
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  PURPLE='\033[0;35m'
  CYAN='\033[0;36m'
  BCYAN='\033[0;96m'
  WHITE='\033[1;37m'
  BOLD='\033[1m'
  GRAY='\033[38;5;240m'
  DIM='\033[2m'
  DIMGRAY='\033[2;38;5;240m'
  ORANGE='\033[38;5;208m'
  LBLUE='\033[38;5;75m'
  LGREEN='\033[38;5;120m'
  RESET='\033[0m'

  # Status indicators
  CHECK="✓"
  CROSS="✗"
  ARROW="→"
  LARROW="└──→"
  BULLET="•"
  STAR="★"
else
  # Fallback: no colors
  GREEN='' RED='' YELLOW='' BLUE='' PURPLE='' CYAN='' BCYAN='' WHITE='' BOLD=''
  GRAY='' DIM='' DIMGRAY='' ORANGE='' LBLUE='' LGREEN='' RESET=''
  CHECK="[OK]" CROSS="[ERR]" ARROW="->" LARROW="--->" BULLET="*" STAR="*"
fi

#===============================================================================
# FRAME DRAWING FUNCTIONS
# These functions create the visual framework for displaying information in
# bordered boxes with consistent formatting throughout the script
#===============================================================================

# draw_frame_top() - Creates the top border of a frame box
# Uses UTF-8 box drawing characters to create a professional-looking header
# Returns: Prints the top border line with corner characters
draw_frame_top() {
    local border_length=$((BOX_WIDTH - 2))
    local horizontal_border
    horizontal_border=$(printf "%0.s${BORDER_CHAR}" $(seq 1 "$border_length"))
    echo -e "${CYAN}╔${horizontal_border}╗${RESET}"
}

# draw_frame_section() - Creates a section divider within a frame
# Used to separate different sections of content within the same frame
# Returns: Prints a horizontal divider line with junction characters
draw_frame_section() {
    local border_length=$((BOX_WIDTH - 2))
    local horizontal_border
    horizontal_border=$(printf "%0.s${BORDER_CHAR}" $(seq 1 "$border_length"))
    echo -e "${CYAN}╠${horizontal_border}╣${RESET}"
}

# draw_frame_bottom() - Creates the bottom border of a frame box
# Completes the frame started by draw_frame_top()
# Returns: Prints the bottom border line with corner characters
draw_frame_bottom() {
    local border_length=$((BOX_WIDTH - 2))
    local horizontal_border
    horizontal_border=$(printf "%0.s${BORDER_CHAR}" $(seq 1 "$border_length"))
    echo -e "${CYAN}╚${horizontal_border}╝${RESET}"
}

# frame_text_line() - Formats and displays text within frame borders
# Handles word wrapping and proper spacing to maintain frame alignment
# Supports colored text while calculating proper padding
# Parameters:
#   $1 - Text content to display (may contain ANSI color codes)
# Returns: Prints formatted text lines with proper frame borders and padding
frame_text_line() {
    local IFS=''
    local input="$1"
    local line visual_length padding clean_line

    echo -e "$input" | fold -s -w "$TEXT_WIDTH" | while IFS= read -r line; do
        # Extract visible length by stripping ANSI
        clean_line=$(echo -e "$line" | sed -E 's/\x1B\[[0-9;]*[mK]//g')
        visual_length=${#clean_line}
        padding=$((TEXT_WIDTH - visual_length))

        # Print the line with padding *after* the colorized part ends
        printf "${CYAN}║${RESET} "
        printf "%s" "$line"
        printf "%*s ${CYAN}║\n${RESET}" "$padding" ""
    done
}

#===============================================================================
# LOGGING FUNCTIONS
# Provide consistent, timestamped logging with visual indicators for different
# message types. All logs include timestamps and appropriate color coding.
#===============================================================================

# log() - Basic logging function with timestamp
# Used for general informational messages
# Parameters:
#   $1 - Message text to log
# Returns: Prints timestamped message to stdout
log() {
    echo -e "${DIMGRAY}[${RESET}${DIM}$(date '+%H:%M:%S')${RESET}${DIMGRAY}]${RESET} $1"
}

# log_success() - Logs successful operations with green checkmark
# Used to indicate successful completion of tasks
# Parameters:
#   $1 - Success message text
# Returns: Prints timestamped success message with checkmark indicator
log_success() {
    echo -e "${DIMGRAY}[${RESET}${DIM}$(date '+%H:%M:%S')${RESET}${DIMGRAY}]${RESET} ${LGREEN}${CHECK}${RESET} $1"
}

# log_error() - Logs error conditions with red cross mark
# Used to indicate failures or error conditions
# Parameters:
#   $1 - Error message text
# Returns: Prints timestamped error message with cross indicator
log_error() {
    echo -e "${DIMGRAY}[${RESET}${DIM}$(date '+%H:%M:%S')${RESET}${DIMGRAY}]${RESET} ${RED}${CROSS}${RESET} $1"
}

# log_info() - Logs informational messages with bullet indicator
# Used for general information that doesn't indicate success or failure
# Parameters:
#   $1 - Informational message text
# Returns: Prints timestamped info message with bullet indicator
log_info() {
    echo -e "${DIMGRAY}[${RESET}${DIM}$(date '+%H:%M:%S')${RESET}${DIMGRAY}]${RESET} ${LBLUE}${BULLET}${RESET} $1"
}

# log_step() - Logs process steps with arrow indicator
# Used to indicate the start of a new step or process
# Parameters:
#   $1 - Step description text
# Returns: Prints timestamped step message with arrow indicator
log_step() {
    echo -e "${DIMGRAY}[${RESET}${DIM}$(date '+%H:%M:%S')${RESET}${DIMGRAY}]${RESET} ${YELLOW}${ARROW}${RESET} $1"
}

#===============================================================================
# PROGRESS INDICATOR FUNCTION
# Displays a visual progress bar with percentage completion for long-running
# operations that can be tracked incrementally
#===============================================================================

# show_progress() - Displays a progress bar with percentage and task description
# Creates a visual progress indicator with filled/empty segments
# Automatically clears the line when progress reaches 100%
# Parameters:
#   $1 - Current progress value (numeric)
#   $2 - Total/maximum progress value (numeric)
#   $3 - Task description string
# Returns: Prints progress bar on same line (overwrites previous), newline when complete
show_progress() {
    local current=$1
    local total=$2
    local task=$3
    local percent=$((current * 100 / total))
    local filled=$((percent / 5))
    local empty=$((20 - filled))

    printf "\r${DIMGRAY}[${RESET}${DIM}$(date '+%H:%M:%S')${RESET}${DIMGRAY}]${RESET} "
    printf "${CYAN}["
    # Filled blocks
    if [ $filled -gt 0 ]; then
        printf "%0.s${LGREEN}█${RESET}" $(seq 1 $filled)
    fi

    # Empty blocks
    if [ $empty -gt 0 ]; then
        printf "%0.s${DIMGRAY}░${RESET}" $(seq 1 $empty)
    fi

    # Percentage display
    printf "${CYAN}] ${YELLOW}%3d%%${RESET} ${task}${RESET}" $percent

}

#===============================================================================
# BANNER AND INFORMATION DISPLAY FUNCTIONS
# Create formatted displays for deployment information, status, and instructions
#===============================================================================

# banner() - Displays the main application banner with deployment information
# Shows script title, version, timestamp, and configuration details in a formatted frame
# Lists all services that will be deployed with their full image names
# Parameters:
#   $1 - Banner title text
# Returns: Prints complete banner frame with all deployment configuration details
banner() {
    draw_frame_top
    frame_text_line ""
    frame_text_line "$(printf "${BOLD}${YELLOW}%-55s${RESET}" "$1")"
    frame_text_line "$(printf "${BOLD}${DIMGRAY}%-55s${RESET}" "It Works on My Machine™")"
    frame_text_line ""
    draw_frame_section
    frame_text_line ""
    frame_text_line "${DIMGRAY}${BOLD}$(date '+%Y-%m-%d %H:%M:%S')${RESET}"
    frame_text_line "${GRAY}Deployment Script ${BOLD}v$VERSION${RESET}"
    frame_text_line ""
    frame_text_line "$(printf "${DIM}%-15s ${BOLD}${ORANGE}%40s${RESET}" "Registry:" "$REGISTRY")"
    frame_text_line "$(printf "${DIM}%-15s ${BOLD}${ORANGE}%40s${RESET}" "Repository:" "$REPOSITORY")"
    frame_text_line "$(printf "${DIM}%-15s ${BOLD}${ORANGE}%40s${RESET}" "Site:" "$SITE")"
    frame_text_line "$(printf "${DIM}%-15s ${BOLD}${ORANGE}%40s${RESET}" "Namespace:" "$NAMESPACE")"
    frame_text_line ""
    frame_text_line "${DIM}${BOLD}Services to deploy:${RESET}"
    for service in "${ALL_SERVICES[@]}"; do
        local deployment_name="$REPOSITORY-${service}-service:$VERSION"
        frame_text_line "$(printf "${WHITE}%-10s ${BOLD}%-55s${RESET}" "$LARROW" "$deployment_name")"
    done
    frame_text_line ""
    draw_frame_bottom
    echo ""
}

# logframe() - Creates a framed display for log messages or multi-line content
# Wraps text content in a bordered frame, handling word wrapping automatically
# Useful for displaying longer messages or structured information
# Parameters:
#   $1 - Text content to display in frame (can be multi-line)
# Returns: Prints framed content with proper borders and text wrapping
logframe() {
    local border_length=$((BOX_WIDTH - 2))
    local text_width=$((BOX_WIDTH - 4))
    local border_char="═"
    local horizontal_border=""
    local IFS

    if ! command -v fold &>/dev/null; then
        log_error "'fold' command not found. Cannot word-wrap logframe content."
        return 1
    fi

    horizontal_border=$(printf "%0.s${border_char}" $(seq 1 "$border_length"))

    echo -e "${CYAN}╔${horizontal_border}╗${RESET}"

    IFS=''
    echo -e "$1" | fold -s -w "$text_width" | while IFS= read -r line; do
        frame_text_line "$line"
    done

    echo -e "${CYAN}╚${horizontal_border}╝${RESET}"
}

#===============================================================================
# KUBERNETES DEPLOYMENT FUNCTIONS
# Handle the core deployment process including cleanup, building, and deployment
#===============================================================================

# cleanup_namespace() - Removes existing namespace and cleans up Docker images
# Phase 1 of deployment: Ensures clean state by removing previous deployments
# Deletes the target namespace if it exists and cleans up related Docker images
# Provides helpful Docker cleanup commands for manual maintenance
# Returns: Success/failure status, exits script on critical failures
cleanup_namespace() {
    logframe "${BCYAN}${BOLD}Phase 1:${RESET} ${BCYAN}Cleaning up previous deployment...${RESET}"

    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_step "Deleting existing namespace: ${BOLD}$NAMESPACE${RESET}"

        kubectl delete namespace "$NAMESPACE" --wait=true | while IFS= read -r line; do
            echo -e "${DIMGRAY}    $line${RESET}"
        done

        log_step "Cleaning up Docker images..."
        docker images | grep "nexus.telenity.com/com/telenity" | awk '{print $1":"$2}' | xargs docker rmi 2>/dev/null | while IFS= read -r line; do
            echo -e "${DIMGRAY}    $line${RESET}"
        done

        log_success "Cleanup completed"
        echo ""

        log_info "${YELLOW}Useful Docker cleanup commands:${RESET}"
        echo -e "    ${DIMGRAY}docker image prune -f                               # Remove dangling images${RESET}"
        echo -e "    ${DIMGRAY}docker image prune -a -f                            # Remove unused images${RESET}"
        echo -e "    ${DIMGRAY}docker image prune -a --filter \"until=24h\" -f       # Remove by age${RESET}"
        echo -e "    ${DIMGRAY}docker container prune -f                           # Remove containers${RESET}"
        echo ""
    else
        log_info "Namespace ${BOLD}$NAMESPACE${RESET} not found - skipping deletion"
    fi
}

# build_images() - Builds all required Docker images for the deployment
# Phase 2 of deployment: Creates Docker images for httpd, a3gw, and all portal services
# Uses progress indicators to show build status for each image
# Builds images with no-cache flag to ensure fresh builds
# Parameters: Uses global configuration variables for image names and versions
# Returns: Success/failure status, exits script if any build fails
build_images() {
    echo ""
    logframe "${BCYAN}${BOLD}Phase 2:${RESET} ${BCYAN}Building Docker images...${RESET}"

    local build_name="${REGISTRY}/${REPOSITORY}-${SITE}"
    local total_images=$((2 + ${#PORTALS[@]}))
    local current=0

    log_info "Using build name: ${BOLD}$build_name${RESET}"
    echo ""

    # Build Apache (httpd) image
    ((current++))
    show_progress $current $total_images "Building HTTPD image..."
    if docker build --no-cache -t "$build_name-httpd:$VERSION" \
        -f ./httpd/Dockerfile."$SITE".k8slocal ./httpd &>/dev/null; then
        log_success "HTTPD image built"
    else
        log_error "Failed to build HTTPD image"
        exit 1
    fi

    # Build A3GW image
    ((current++))
    show_progress $current $total_images "Building A3GW image..."
    if docker build --no-cache -t "$build_name-a3gw:$VERSION" \
        -f ./a3gw/Dockerfile."$SITE".k8slocal ./a3gw &>/dev/null; then
        log_success "A3GW image built"
    else
        log_error "Failed to build A3GW image"
        exit 1
    fi

    # Build portal images
    for portal in "${PORTALS[@]}"; do
        ((current++))
        show_progress $current $total_images "Building $portal image..."
        if docker build -t "$build_name-$portal:$VERSION" \
            -f "./$SITE-$portal/Dockerfile.prod" "./$SITE-$portal" &>/dev/null; then
            log_success "$portal image built"
        else
            log_error "Failed to build $portal image"
            exit 1
        fi
    done

    echo ""
    log_success "${BOLD}All images built successfully!${RESET}"
}

# setup_kubernetes() - Prepares Kubernetes environment for deployment
# Phase 3 of deployment: Configures kubectl context and creates target namespace
# Switches to docker-desktop context for local development deployment
# Creates the target namespace where all services will be deployed
# Returns: Success/failure status, exits script on critical failures
setup_kubernetes() {
    echo ""
    logframe "${BCYAN}${BOLD}Phase 3:${RESET} ${BCYAN}Setting up Kubernetes environment...${RESET}"

    log_step "Switching to docker-desktop context..."
    if kubectl config use-context docker-desktop &>/dev/null; then
        log_success "Context switched to docker-desktop"
    else
        log_error "Failed to switch context"
        exit 1
    fi

    log_step "Creating namespace: ${BOLD}$NAMESPACE${RESET}"
    if kubectl create namespace "$NAMESPACE" &>/dev/null; then
        log_success "Namespace created successfully"
    else
        log_error "Failed to create namespace"
        exit 1
    fi
}

# deploy_services() - Deploys all Kubernetes services and deployments
# Phase 4 of deployment: Applies Kubernetes manifests for all services
# Deploys httpd, a3gw, and all portal services with their corresponding deployments and services
# Uses progress indicators to show deployment status for each service
# Returns: Success/failure status, exits script if any deployment fails
deploy_services() {
    echo ""
    logframe "${BCYAN}${BOLD}Phase 4:${RESET} ${BCYAN}Deploying services...${RESET}"

    local total_services=$((2 + ${#PORTALS[@]}))
    local current=0

    # Deploy HTTPD
    ((current++))
    show_progress $current $total_services "Deploying HTTPD service..."
    if kubectl apply -f "k8s/${K8MANIFEST}_httpd.deployment.yaml" -n "$NAMESPACE" &>/dev/null && \
       kubectl apply -f "k8s/${K8MANIFEST}_httpd.service.yaml" -n "$NAMESPACE" &>/dev/null; then
        log_success "HTTPD service deployed"
    else
        log_error "Failed to deploy Apache (httpd) service"
        exit 1
    fi

    # Deploy A3GW
    ((current++))
    show_progress $current $total_services "Deploying A3GW service..."
    if kubectl apply -f "k8s/${K8MANIFEST}_a3gw.deployment.yaml" -n "$NAMESPACE" &>/dev/null && \
       kubectl apply -f "k8s/${K8MANIFEST}_a3gw.service.yaml" -n "$NAMESPACE" &>/dev/null; then
        log_success "A3GW service deployed"
    else
        log_error "Failed to deploy A3GW service"
        exit 1
    fi

    # Deploy portals
    for portal in "${PORTALS[@]}"; do
        ((current++))
        show_progress $current $total_services "Deploying $portal service..."
        if kubectl apply -f "k8s/${K8MANIFEST}_${portal}.deployment.yaml" -n "$NAMESPACE" &>/dev/null && \
           kubectl apply -f "k8s/${K8MANIFEST}_${portal}.service.yaml" -n "$NAMESPACE" &>/dev/null; then
            log_success "$portal service deployed"
        else
            log_error "Failed to deploy $portal service"
            exit 1
        fi
    done

    echo ""
    log_success "${BOLD}All services deployed successfully!${RESET}"
}

# wait_for_pods() - Provides a waiting period for pod initialization
# Phase 5 of deployment: Allows time for pods to start and become ready
# Displays a countdown timer to show initialization progress
# Gives pods time to pull images and start up before checking status
# Returns: Always succeeds after waiting period
wait_for_pods() {
    echo ""
    logframe "${BCYAN}${BOLD}Phase 5:${RESET} ${BCYAN}Waiting for pods to initialize...${RESET}"

    log_step "Waiting for pods to be ready..."
    for i in {1..15}; do
        printf "\r${DIMGRAY}[${RESET}${DIM}$(date '+%H:%M:%S')${RESET}${DIMGRAY}]${RESET} ${YELLOW}${ARROW}${RESET} Waiting... ${CYAN}%2d${RESET}s" $i
        sleep 1
    done
    echo ""
    log_success "Wait period completed"
}

#===============================================================================
# STATUS AND INFORMATION DISPLAY FUNCTIONS
# Provide detailed status information and usage instructions for the deployment
#===============================================================================

# show_status() - Displays current status of all deployed pods and services
# Shows comprehensive status information including pod readiness, service endpoints
# Uses color coding to indicate different service types and status conditions
# Provides formatted tables for easy reading of status information
# Returns: Displays formatted status tables for pods and services
show_status() {
    echo ""
    logframe "${BCYAN}${BOLD}Deployment Status${RESET}"
    echo ""

    echo -e "${BOLD}${STAR} PODS STATUS:${RESET}"
    echo -e "${DIMGRAY}$(printf "%-70s %-8s %-12s %-8s" "NAME" "READY" "STATUS" "AGE")${RESET}"
    echo -e "${DIMGRAY}$(printf "%0.s─" {1..105})${RESET}"

    kubectl get pods -n "$NAMESPACE" --no-headers | while IFS= read -r line; do
        name=$(echo "$line" | awk '{print $1}')
        ready=$(echo "$line" | awk '{print $2}')
        status=$(echo "$line" | awk '{print $3}')
        age=$(echo "$line" | awk '{print $5}')

        case $status in
            Running)   color="$LGREEN" ;;
            Pending)   color="$YELLOW" ;;
            Error|CrashLoopBackOff) color="$RED" ;;
            *)         color="$RESET" ;;
        esac

        printf "${color}%-70s %-8s %-12s %-8s${RESET}\n" "$name" "$ready" "$status" "$age"
    done

    echo ""
    echo -e "${BOLD}${STAR} SERVICES STATUS:${RESET}"
    echo -e "${DIMGRAY}$(printf "%-50s %-12s %-15s %-12s" "NAME" "TYPE" "CLUSTER-IP" "PORTS")${RESET}"
    echo -e "${DIMGRAY}$(printf "%0.s─" {1..90})${RESET}"

    kubectl get services -n "$NAMESPACE" -o custom-columns="NAME:.metadata.name,TYPE:.spec.type,CLUSTER-IP:.spec.clusterIP,PORTS:.spec.ports[*].port" --no-headers | while IFS= read -r line; do
        name=$(echo "$line" | awk '{print $1}')
        type=$(echo "$line" | awk '{print $2}')
        cluster_ip=$(echo "$line" | awk '{print $3}')
        ports=$(echo "$line" | awk '{print $4}')

        case $name in
            *a3gw*)                   color="$CYAN" ;;
            *httpd*)                  color="$BLUE" ;;
            *portal*)                 color="$YELLOW" ;;
            *)                        color="$RESET" ;;
        esac

        printf "${color}%-50s${RESET} %-12s %-15s %-12s\n" "$name" "$type" "$cluster_ip" "$ports"
    done
}

# show_usage_info() - Displays comprehensive usage instructions and commands
# Provides quick reference for monitoring, port forwarding, and log viewing
# Shows specific commands for each service with proper ports and service names
# Organized into logical sections for different operational tasks
# Returns: Displays formatted reference guide with copy-paste ready commands
show_usage_info() {
    echo ""
    logframe "${BCYAN}${BOLD}Quick Reference${RESET}"
    echo ""

    echo -e "${BOLD}${WHITE}${STAR} ${DIM}${YELLOW}MONITORING COMMANDS:${RESET}"
    echo -e "  ${DIM}kubectl get pods -n $NAMESPACE${RESET}"
    echo -e "  ${DIM}kubectl get services -n $NAMESPACE${RESET}"
    echo -e "  ${DIM}kubectl describe pod <pod-name> -n $NAMESPACE${RESET}"
    echo -e "  ${DIM}kubectl logs <pod-name> -n $NAMESPACE${RESET}"
    echo ""

    echo -e "${BOLD}${WHITE}${STAR} ${DIM}${YELLOW}PORT FORWARDING:${RESET}"
    echo -e "  ${DIM}${LBLUE}# Apache (httpd)${RESET}"
    echo -e "  ${DIM}kubectl port-forward svc/$REPOSITORY-$SITE-httpd-service 9080:80 9443:443 -n $NAMESPACE${RESET}"
    echo -e "  ${DIM}${LBLUE}# A3GW${RESET}"
    echo -e "  ${DIM}kubectl port-forward svc/$REPOSITORY-$SITE-a3gw-service 8444:8444 8445:8445 -n $NAMESPACE${RESET}"

    for i in "${!PORTALS[@]}"; do
        PORT=$((8080 + i))
        echo -e "  ${DIM}${LBLUE}# ${PORTALS[$i]} ${RESET}"
        echo -e "  ${DIMGRAY}kubectl port-forward svc/$REPOSITORY-$SITE-${PORTALS[$i]}-service $PORT:$PORT -n $NAMESPACE${RESET}"
    done

    echo ""
    echo -e "${BOLD}${WHITE}${STAR} ${DIM}${YELLOW}LOG MONITORING:${RESET}"
    echo -e "  ${DIM}kubectl logs -f deployment/$REPOSITORY-$SITE-httpd-deployment -n $NAMESPACE${RESET}"
    echo -e "  ${DIM}kubectl logs -f deployment/$REPOSITORY-$SITE-a3gw-deployment -n $NAMESPACE${RESET}"

    for portal in "${PORTALS[@]}"; do
        echo -e "  ${DIMGRAY}kubectl logs -f deployment/$REPOSITORY-$SITE-${portal}-deployment -n $NAMESPACE${RESET}"
    done
}

# start_port_forward() - Initiates port forwarding for key services
# Phase 6 of deployment: Sets up port forwarding for HTTPD and A3GW services
# Runs port forwarding in background and provides process management
# Waits for user interrupt (Ctrl+C) to stop port forwarding
# Returns: Runs indefinitely until interrupted, provides cleanup on exit
start_port_forward() {
    echo ""
    logframe "${BCYAN}${BOLD}Phase 6:${RESET} ${BCYAN}Starting port forwarding...${RESET}"

    log_info "Starting port forwarding for services..."
    log_info "Press ${BOLD}Ctrl+C${RESET} to stop port forwarding"
    echo ""

    # Start port forwarding in background and show status
    kubectl port-forward svc/"$REPOSITORY"-"$SITE"-httpd-service 9080:80 9443:443 -n "$NAMESPACE" &
    HTTPD_PID=$!

    kubectl port-forward svc/"$REPOSITORY"-"$SITE"-a3gw-service 9444:8444 9445:8445 -n "$NAMESPACE" &
    A3GW_PID=$!

    # Wait a moment then show the active forwards
    sleep 2
    log_success "Port forwarding active for HTTPD (PID: $HTTPD_PID) and A3GW (PID: $A3GW_PID)"

    # Wait for user interrupt
    wait
}

#===============================================================================
# MAIN EXECUTION AND CLEANUP FUNCTIONS
# Control the overall flow of the deployment process and handle graceful shutdown
#===============================================================================

# main() - Primary execution function that orchestrates the entire deployment
# Controls the flow of all deployment phases in the correct sequence
# Provides user interaction for optional port forwarding at the end
# Phases:
#   1. Display banner and configuration
#   2. Cleanup existing deployment
#   3. Build Docker images
#   4. Setup Kubernetes environment
#   5. Deploy all services
#   6. Wait for pod initialization
#   7. Show deployment status
#   8. Display usage information
#   9. Optional port forwarding
# Returns: Completes successfully or exits on any phase failure
main() {
    # Clear screen for better presentation
    clear

    banner "${BOLD}K8S LOCAL DEPLOYMENT SCRIPT${RESET}"

    logframe "$(printf "${BOLD}${YELLOW}Starting deployment process...${RESET}\n${DIMGRAY}Automating What Should’ve Been Automated a Year Ago™${RESET}" "$VERSION")"
    echo ""

    # Execute deployment phases
    cleanup_namespace
    build_images
    setup_kubernetes
    deploy_services
    wait_for_pods
    show_status

    echo ""
    logframe "${LGREEN}${BOLD}${CHECK} Deployment completed successfully!${RESET}"
    show_usage_info
    echo ""

    # Ask user if they want to start port forwarding
    echo -e "${BOLD}Start port forwarding now? ${RESET}${DIMGRAY}[y/N]${RESET}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        start_port_forward
    else
        echo ""
        log_info "Deployment complete. Use the commands above to manage your services."
        echo ""
    fi
}

# cleanup_on_exit() - Handles graceful cleanup when script is interrupted
# Trap function that runs when script receives termination signals
# Kills background port forwarding processes if they're running
# Provides informative message about deployment state after cleanup
# Returns: Always executes cleanup actions, informs user of remaining deployment
cleanup_on_exit() {
    if [[ -n "$HTTPD_PID" ]]; then kill $HTTPD_PID 2>/dev/null; fi
    if [[ -n "$A3GW_PID" ]]; then kill $A3GW_PID 2>/dev/null; fi
    echo ""
    log_info "Port forwarding stopped. Deployment remains active."
}

# Set up trap to handle script interruption gracefully
trap cleanup_on_exit EXIT

# Run main function
main
