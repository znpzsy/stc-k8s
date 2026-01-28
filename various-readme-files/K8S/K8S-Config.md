# What are K8S Contexts:

Contexts are shortcuts that bundle together three pieces of information:

1. **Which cluster** to connect to
2. **Which user/credentials** to authenticate as
3. **Which namespace** to default to (optional)

Think of a context as a "profile" or "connection preset" - instead of specifying cluster + user + namespace every time you run kubectl, you just switch contexts.

## Example structure

```yaml
contexts:
- context:
    cluster: docker-desktop          # which cluster
    user: docker-desktop             # which credentials
    namespace: default               # which namespace (optional)
  name: docker-desktop               # name of this context

- context:
    cluster: openshift-prod
    user: z-admin
    namespace: my-project
  name: openshift-prod

current-context: docker-desktop      # which one is active now
```


**Without contexts**, you'd need to specify everything each time:
```bash
kubectl get pods --server=https://cluster1:6443 --user=admin --namespace=production
```

**With contexts**, you just switch once:
```bash
kubectl config use-context openshift-prod
kubectl get pods  # automatically uses openshift-prod cluster + user + namespace
```

## Common commands

```bash
# List all contexts
kubectl config get-contexts

# See which context is active (marked with *)
kubectl config current-context

# Switch context
kubectl config use-context docker-desktop

# Override namespace temporarily
kubectl get pods -n different-namespace
```

# Configuration

The Kubernetes config file (typically `~/.kube/config`) is the main configuration file that `kubectl` and other Kubernetes tools use to connect to and authenticate with your clusters.

## What's in the config file

It's a YAML file with three main sections:

**1. Clusters** - Connection details for Kubernetes clusters
```yaml
clusters:
- cluster:
    certificate-authority-data: <base64-encoded-cert>
    server: https://kubernetes.docker.internal:6443
  name: docker-desktop
```
- `server`: API server endpoint
- `certificate-authority-data`: CA cert to verify the cluster's identity

**2. Users** - Authentication credentials
```yaml
users:
- name: docker-desktop
  user:
    client-certificate-data: <base64-encoded-cert>
    client-key-data: <base64-encoded-key>
```
- Contains certs, tokens, or other auth methods to prove your identity

**3. Contexts** - Combines a cluster + user + optional namespace
```yaml
contexts:
- context:
    cluster: docker-desktop
    user: docker-desktop
  name: docker-desktop
current-context: docker-desktop
```
- `current-context`: Which context kubectl should use by default

## How Kubernetes uses it

When you run `kubectl` commands:

1. **Reads current context** - Checks `current-context` to know which cluster to talk to
2. **Finds cluster endpoint** - Uses the server URL from the cluster section
3. **Authenticates** - Sends credentials from the user section
4. **Verifies cluster** - Validates the cluster's certificate against the CA

## Docker Desktop specifics

Docker Desktop creates a single-node Kubernetes cluster with:
- **Cluster name**: `docker-desktop`
- **API server**: `https://kubernetes.docker.internal:6443`
- **Auth**: Client certificate authentication
- Automatically sets itself as the current context

You can view your config with:
```bash
kubectl config view
```

Switch between contexts (if you have multiple clusters):
```bash
kubectl config use-context docker-desktop
```

The config file lets you manage multiple clusters (dev, staging, prod, Docker Desktop) from one machine by switching contexts.


# Other Ways To Connect

## 1. **Use a different kubeconfig file**

```bash
# Specify config file with --kubeconfig flag
kubectl get pods --kubeconfig=/path/to/other-config.yaml

# Or set environment variable
export KUBECONFIG=/path/to/other-config.yaml
kubectl get pods
```

## 2. **Merge multiple kubeconfig files**

```bash
# Temporarily use multiple configs (kubectl merges them)
export KUBECONFIG=~/.kube/config:~/.kube/cluster2.yaml:~/.kube/cluster3.yaml

# Or permanently merge them
KUBECONFIG=~/.kube/config:~/.kube/new-cluster.yaml kubectl config view --flatten > ~/.kube/merged-config.yaml
```

## 3. **Directly specify cluster details**

```bash
# Set cluster
kubectl config set-cluster my-cluster \
  --server=https://1.2.3.4:6443 \
  --certificate-authority=/path/to/ca.crt

# Set credentials
kubectl config set-credentials my-user \
  --client-certificate=/path/to/client.crt \
  --client-key=/path/to/client.key

# Create context
kubectl config set-context my-context \
  --cluster=my-cluster \
  --user=my-user \
  --namespace=default

# Use it
kubectl config use-context my-context
```

## 4. **In-cluster configuration** (for pods running inside Kubernetes)

Pods automatically get service account credentials mounted at `/var/run/secrets/kubernetes.io/serviceaccount/`. Applications use these to talk to the API server without needing kubeconfig.

## 5. **Direct API access** (programmatic)

You can bypass kubectl entirely and make HTTP requests directly to the API server with proper authentication headers.

## Common scenarios for your OpenShift/Kubernetes work:

**Switching between Docker Desktop and OpenShift:**
```bash
# Add OpenShift cluster (if you got a kubeconfig from your admin)
export KUBECONFIG=~/.kube/config:~/openshift-cluster.yaml

# List available contexts
kubectl config get-contexts

# Switch to OpenShift
kubectl config use-context openshift-prod

# Switch back to Docker Desktop
kubectl config use-context docker-desktop
```

The KUBECONFIG environment variable approach is probably most useful for you when working with both local Docker Desktop and remote OpenShift clusters.
