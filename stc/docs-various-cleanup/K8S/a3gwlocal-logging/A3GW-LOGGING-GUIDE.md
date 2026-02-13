# A3GW Logging Guide

Your a3gw application writes logs to files inside the container:
- `/space/a3gw/logs/adminportal.log`
- `/space/a3gw/logs/ccportal.log`
- `/space/a3gw/logs/partnerportal.log`

Kubernetes doesn't automatically capture file-based logs (only stdout/stderr), so you need one of these approaches:

---

## Option 1: kubectl exec (Quick & Easy - Development)

**Direct access to log files inside containers:**

```bash
# Get the a3gw pod name
POD=$(kubectl get pods -n stc-vcp-services -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}')

# Tail adminportal logs
kubectl exec -it $POD -n stc-vcp-services -- tail -f /space/a3gw/logs/adminportal.log

# Tail all logs at once
kubectl exec -it $POD -n stc-vcp-services -- tail -f /space/a3gw/logs/*.log

# View last 100 lines
kubectl exec -it $POD -n stc-vcp-services -- tail -n 100 /space/a3gw/logs/ccportal.log

# Search for errors
kubectl exec -it $POD -n stc-vcp-services -- grep "ERROR" /space/a3gw/logs/adminportal.log

# List all log files
kubectl exec -it $POD -n stc-vcp-services -- ls -lh /space/a3gw/logs/
```

**Bash helper function** (add to `~/.bashrc` or `~/.zshrc`):

```bash
# Tail a3gw logs easily
a3gw-logs() {
    local namespace="${2:-stc-vcp-services}"
    local pod=$(kubectl get pods -n "$namespace" -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$pod" ]; then
        echo "No a3gw pod found in namespace $namespace"
        return 1
    fi
    
    case "$1" in
        admin|adminportal)
            kubectl exec -it "$pod" -n "$namespace" -- tail -f /space/a3gw/logs/adminportal.log
            ;;
        cc|ccportal)
            kubectl exec -it "$pod" -n "$namespace" -- tail -f /space/a3gw/logs/ccportal.log
            ;;
        partner|partnerportal)
            kubectl exec -it "$pod" -n "$namespace" -- tail -f /space/a3gw/logs/partnerportal.log
            ;;
        all|*)
            kubectl exec -it "$pod" -n "$namespace" -- tail -f /space/a3gw/logs/*.log
            ;;
    esac
}

# Usage:
# a3gw-logs admin              # Tail adminportal.log
# a3gw-logs cc                 # Tail ccportal.log
# a3gw-logs partner            # Tail partnerportal.log
# a3gw-logs all                # Tail all logs
# a3gw-logs admin my-namespace # Specify different namespace
```

**Pros:**
- ✅ Simple, no configuration needed
- ✅ Works immediately
- ✅ Good for quick debugging

**Cons:**
- ❌ Requires manual pod selection
- ❌ Can't use `kubectl logs` command
- ❌ Logs lost when pod restarts
- ❌ Not suitable for log aggregation tools

---

## Option 2: Logging Sidecar Containers (Recommended for Development) 🚀

Add sidecar containers that tail the log files and output to stdout, making logs available via `kubectl logs`.

### Enable in Helm Chart

**Update values-local.yaml:**
```yaml
a3gw:
  logging:
    sidecar:
      enabled: true  # Enable logging sidecars
```

**Deploy:**
```bash
helm upgrade consolportals . -f values.yaml -f values-local.yaml -n stc-vcp-services
```

### How It Works

The deployment will have 4 containers:
1. **vcp-a3gw** - Main application
2. **log-tailer-adminportal** - Tails adminportal.log → stdout
3. **log-tailer-ccportal** - Tails ccportal.log → stdout
4. **log-tailer-partnerportal** - Tails partnerportal.log → stdout

They share a volume (`emptyDir`) for the `/space/a3gw/logs` directory.

### Usage

```bash
# Get pod name
POD=$(kubectl get pods -n stc-vcp-services -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}')

# View adminportal logs via kubectl logs
kubectl logs -f $POD -c log-tailer-adminportal -n stc-vcp-services

# View ccportal logs
kubectl logs -f $POD -c log-tailer-ccportal -n stc-vcp-services

# View partnerportal logs
kubectl logs -f $POD -c log-tailer-partnerportal -n stc-vcp-services

# View main application container (PM2 output)
kubectl logs -f $POD -c vcp-a3gw -n stc-vcp-services

# Get logs from all containers
kubectl logs $POD -n stc-vcp-services --all-containers=true
```

**Enhanced bash helper:**
```bash
a3gw-logs-sidecar() {
    local namespace="${2:-stc-vcp-services}"
    local pod=$(kubectl get pods -n "$namespace" -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}')
    
    case "$1" in
        admin|adminportal)
            kubectl logs -f "$pod" -c log-tailer-adminportal -n "$namespace"
            ;;
        cc|ccportal)
            kubectl logs -f "$pod" -c log-tailer-ccportal -n "$namespace"
            ;;
        partner|partnerportal)
            kubectl logs -f "$pod" -c log-tailer-partnerportal -n "$namespace"
            ;;
        all)
            kubectl logs "$pod" -n "$namespace" --all-containers=true
            ;;
        *)
            echo "Usage: a3gw-logs-sidecar [admin|cc|partner|all] [namespace]"
            ;;
    esac
}
```

**Pros:**
- ✅ Use standard `kubectl logs` command
- ✅ Works with log aggregation tools (Fluentd, Filebeat)
- ✅ Each portal has separate log stream
- ✅ No manual pod exec needed

**Cons:**
- ❌ Uses more resources (3 extra containers)
- ❌ Logs still lost on pod restart (unless persistence enabled)
- ❌ Slight complexity in pod structure

**Resource Impact:**
Each sidecar is just a busybox container running `tail`, very lightweight (~1-2MB memory each).

---

## Option 3: Persistent Volume (For Production)

Store logs on persistent storage so they survive pod restarts.

### Enable in Helm Chart

**Update values.yaml or values-prod.yaml:**
```yaml
a3gw:
  logging:
    persistence:
      enabled: true
      storageClass: ""  # Use default, or specify like "gp2", "standard"
      size: 1Gi
    sidecar:
      enabled: true  # Combine with sidecars for kubectl logs access
```

**Deploy:**
```bash
helm upgrade consolportals . -f values.yaml -f values-prod.yaml -n stc-vcp-services
```

### What This Does

Creates a PersistentVolumeClaim (PVC) mounted to `/space/a3gw/logs`:
- Logs persist across pod restarts
- Logs available even after pod deletion
- Can be backed up separately

**View persistent logs:**
```bash
# List PVCs
kubectl get pvc -n stc-vcp-services

# Describe PVC
kubectl describe pvc a3gw-logs-pvc -n stc-vcp-services

# Access logs (if pod is running)
kubectl exec -it $POD -n stc-vcp-services -- tail -f /space/a3gw/logs/adminportal.log

# Or via sidecar if enabled
kubectl logs -f $POD -c log-tailer-adminportal -n stc-vcp-services
```

**Pros:**
- ✅ Logs survive pod restarts
- ✅ Can be backed up independently
- ✅ Historical log analysis possible

**Cons:**
- ❌ Requires persistent storage provisioner
- ❌ More complex setup
- ❌ Logs can fill up storage (need rotation)

---

## Option 4: Future - Kafka Integration (Your Mentioned Use Case)

For centralized logging to Kafka:

### Approach A: Modify Application (Best)
Update a3gw to write logs directly to Kafka (in addition to or instead of files).

### Approach B: Log Shipper Sidecar
Add a Fluent Bit or Filebeat sidecar to ship logs to Kafka.

**Example with Fluent Bit sidecar:**

```yaml
# In a3gw deployment
- name: fluent-bit
  image: fluent/fluent-bit:2.1
  volumeMounts:
    - name: logs
      mountPath: /logs
      readOnly: true
    - name: fluent-bit-config
      mountPath: /fluent-bit/etc/
  env:
    - name: KAFKA_BROKERS
      value: "kafka-broker:9092"
---
# ConfigMap for Fluent Bit
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush        5
        Log_Level    info

    [INPUT]
        Name              tail
        Path              /logs/*.log
        Tag               a3gw.*
        Refresh_Interval  5

    [OUTPUT]
        Name        kafka
        Match       *
        Brokers     ${KAFKA_BROKERS}
        Topics      a3gw-logs
```

---

## Comparison Table

| Method | Setup | kubectl logs? | Survives Restart? | Resource Usage | Best For |
|--------|-------|---------------|-------------------|----------------|----------|
| **kubectl exec** | None | ❌ | ❌ | Low | Quick debugging |
| **Logging Sidecar** | Easy | ✅ | ❌ | Medium | Development |
| **Persistent Volume** | Medium | ✅* | ✅ | Medium | Production |
| **Kafka Integration** | Complex | ✅* | ✅ | High | Enterprise |

*When combined with sidecars

---

## Recommendations by Environment

### Local Development (Mac)
**Use: kubectl exec OR logging sidecar**

```yaml
# values-local.yaml
a3gw:
  logging:
    sidecar:
      enabled: true  # Makes kubectl logs work
```

```bash
# Quick access
a3gw-logs admin
a3gw-logs-sidecar admin
```

### Development/Staging Environment
**Use: Logging sidecar + optional persistence**

```yaml
# values-dev.yaml
a3gw:
  logging:
    sidecar:
      enabled: true
    persistence:
      enabled: true
      size: 5Gi
```

### Production
**Use: Persistent volume + log aggregation (Kafka/ELK)**

```yaml
# values-prod.yaml
a3gw:
  logging:
    sidecar:
      enabled: true  # For kubectl logs access
    persistence:
      enabled: true
      size: 10Gi
```

Plus: Add Kafka integration or log shipper (Fluent Bit/Filebeat)

---

## Common Commands

```bash
# Quick reference card

# kubectl exec method
POD=$(kubectl get pods -n stc-vcp-services -l component=vcp-a3gw -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $POD -n stc-vcp-services -- tail -f /space/a3gw/logs/adminportal.log

# Sidecar method (if enabled)
kubectl logs -f $POD -c log-tailer-adminportal -n stc-vcp-services

# Search for errors
kubectl exec -it $POD -n stc-vcp-services -- grep "ERROR" /space/a3gw/logs/*.log

# Check log file sizes
kubectl exec -it $POD -n stc-vcp-services -- ls -lh /space/a3gw/logs/

# Copy logs to local machine
kubectl cp $POD:/space/a3gw/logs/adminportal.log ./adminportal.log -n stc-vcp-services -c vcp-a3gw

# Stream logs to local file
kubectl exec -it $POD -n stc-vcp-services -- cat /space/a3gw/logs/adminportal.log > local-adminportal.log
```

---

## Troubleshooting

### "No such file or directory" error
The log files might not exist yet if the application hasn't written to them.

```bash
# Check if logs directory exists
kubectl exec -it $POD -n stc-vcp-services -- ls -la /space/a3gw/

# Check if log files exist
kubectl exec -it $POD -n stc-vcp-services -- ls -la /space/a3gw/logs/

# Create logs directory if missing (shouldn't be necessary)
kubectl exec -it $POD -n stc-vcp-services -- mkdir -p /space/a3gw/logs
```

### Sidecar containers crash looping
The sidecar uses `tail -F` which waits for files to be created. If files don't exist, it might fail.

**Solution:** Update your Dockerfile to create empty log files:
```dockerfile
# In Dockerfile
RUN mkdir -p /space/a3gw/logs && \
    touch /space/a3gw/logs/adminportal.log && \
    touch /space/a3gw/logs/ccportal.log && \
    touch /space/a3gw/logs/partnerportal.log
```

### Logs filling up storage
Implement log rotation in your application or add a log rotation sidecar.

```yaml
# Example: Add logrotate sidecar
- name: logrotate
  image: alpine:3.18
  command: ["/bin/sh"]
  args:
    - -c
    - |
      while true; do
        find /logs -name "*.log" -size +100M -exec truncate -s 10M {} \;
        sleep 3600  # Check every hour
      done
  volumeMounts:
    - name: logs
      mountPath: /logs
```

---

## Next Steps

1. **For now:** Use `kubectl exec` method with bash helper function
2. **Short term:** Enable logging sidecars in your Helm chart for easier access
3. **Future:** Plan Kafka integration for centralized logging

Would you like me to update your Helm chart templates to include the logging sidecar configuration?



----


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
