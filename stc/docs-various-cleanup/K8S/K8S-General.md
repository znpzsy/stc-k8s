# Concepts

## The 20,000-foot model (what Kubernetes *is*)

Kubernetes is a **cluster manager** that schedules and runs **containers** across **machines** (nodes), keeps them healthy, connects them on a network, and exposes them to the outside world.

Think in layers:

1. **Cluster**: a bunch of machines (nodes) under one control plane.
2. **Namespace**: a logical “workspace” inside the cluster (like folders/projects).
3. **Workloads**: things that create and maintain pods (Deployments, StatefulSets, etc.).
4. **Networking**: Services give stable addresses; Ingress gives HTTP routing from outside.
5. **Packaging**: Helm is “package manager + templating” for Kubernetes.

---

## kubectl, kubeconfig, contexts, clusters, users

### kubeconfig

Your kubeconfig file stores:

* **clusters** (API server endpoints + certs)
* **users** (credentials)
* **contexts** (a *combo* of cluster + user + default namespace)

### context (in kubectl terms)

A **context** is “which cluster + which identity + which default namespace am I using right now?”

That’s why these matter:

* `kubectl config get-contexts`
* `kubectl config use-context <name>`
* `kubectl config set-context --current --namespace <ns>`

If you’ve ever accidentally hit the wrong cluster with `kubectl apply`, context discipline is why.

---

## Namespaces

A **namespace** is a logical partition inside a cluster.

Use them to separate:

* environments: `dev`, `test`, `prod`
* teams: `platform`, `payments`, `vcp`
* apps: `adminportal`, `partnerportal`

**Important**: most objects are namespaced (pods, services, deployments). Some are **cluster-scoped** (nodes, persistent volumes, some CRDs).

Common commands:

* `kubectl get ns`
* `kubectl get all -n <ns>`

---

## Nodes

A **node** is a machine (VM or physical) that runs pods.

* In Docker Desktop K8s, you typically have *one* node.
* In corp clusters, you have many nodes.

You rarely “deploy to a node.” K8s schedules pods onto nodes based on resources/constraints.

Commands:

* `kubectl get nodes -o wide`
* `kubectl describe node <node>`

---

## Pods

A **pod** is the smallest runnable unit in K8s.

* A pod contains **one or more containers** that share:

    * the same IP (inside the cluster)
    * the same network namespace
    * volumes mounted into them

In practice, most pods are “1 main container + maybe sidecars.”

**Pods are ephemeral.** K8s can kill/recreate them anytime. You should not treat a pod as a “server you SSH into and keep forever.”

Commands:

* `kubectl get pods -n <ns>`
* `kubectl logs -n <ns> <pod> [-c <container>]`
* `kubectl exec -it -n <ns> <pod> -- sh`

---

## Deployments (stateless workloads)

A **Deployment** manages a set of identical pods for stateless apps (most web apps, APIs, proxies).
It gives you:

* **replicas** (scale up/down)
* **rolling updates** (safe rollout)
* self-healing (if a pod dies, it replaces it)

Under the hood, Deployment → ReplicaSet → Pods.

For your world:

* `adminportal` (nginx serving static)
* `httpd`
* `a3gw`
  are typically Deployments.

Commands:

* `kubectl get deploy -n <ns>`
* `kubectl rollout status deploy/<name> -n <ns>`
* `kubectl rollout history deploy/<name> -n <ns>`

---

## Services (stable networking)

Pods come and go and their IPs change. A **Service** is a stable virtual endpoint in front of pods.

A Service selects pods by **labels**.

* Pod labels: `app=adminportal`
* Service selector: `app=adminportal`
  → traffic goes to whatever pods match.

Common Service types:

### ClusterIP (default)

Only reachable **inside** the cluster.
Used for pod-to-pod communication.

### NodePort

Exposes a port on **every node** (e.g., `nodeIP:30080`) and forwards to the service.
Often used for quick testing, but not ideal as your long-term “real ingress.”

### LoadBalancer

Asks the infrastructure/cloud to provision an external load balancer.
Works great in real clouds; in local clusters it may require add-ons.

Commands:

* `kubectl get svc -n <ns>`
* `kubectl describe svc <name> -n <ns>`

---

## Ingress (HTTP routing from outside)

A Service gives you a stable endpoint *inside* the cluster. **Ingress** gives you *HTTP routing* from the outside.

Ingress typically provides:

* host-based routing: `admin.example.com → service A`
* path-based routing: `/api → service B`
* TLS termination (HTTPS) (depending on setup)
* rewrite rules (depending on controller)

**Important**: Ingress is just a *resource*. You also need an **Ingress Controller** running in the cluster (nginx ingress, Traefik, HAProxy, etc.) to *implement* it.

In your setup:

* Ingress might route `/adminportal` to `httpd` or `nginx` service,
* then `httpd` forwards “/api” to a3gw,
* a3gw forwards to backend services.

Commands:

* `kubectl get ingress -n <ns>`
* `kubectl describe ingress <name> -n <ns>`

---

## StatefulSets (stateful workloads)

A **StatefulSet** is for things where identity and storage matter:

* databases (Postgres, Mongo, Elasticsearch nodes)
* Kafka, Redis (depending on mode)

Differences vs Deployments:

* stable pod names: `db-0`, `db-1`, …
* stable network identity
* stable storage per replica (usually via PVC templates)
* ordered rollout (often)

If your app needs persistent data, that’s where StatefulSets + PersistentVolumes come in.

---

## Ports & exposure recap (how traffic gets in)

Here’s the “how do I reach it?” ladder:

* **Pod IP**: internal only, changes often
* **Service ClusterIP**: stable inside cluster
* **NodePort**: open a port on each node (rough but simple)
* **Ingress**: HTTP routing “front door” (usually best for web apps)
* **LoadBalancer**: cloud-provisioned external LB

---

## Helm (packaging + templating)

Helm is:

1. **Templating**: generate YAML from parameters (`values.yaml`)
2. **Packaging**: a “chart” is an installable app bundle
3. **Release management**: install/upgrade/rollback with a release name

Key concepts:

* **Chart**: the package
* **Values**: your configuration knobs
* **Templates**: YAML with placeholders
* **Release**: an installed instance of a chart

Typical flow:

* `helm install my-adminportal ./chart -n vcp --create-namespace`
* `helm upgrade my-adminportal ./chart -n vcp -f values-stc.yaml`
* `helm rollback my-adminportal 2 -n vcp`

Helm is perfect for your “same structure, different customer/site” reality: one chart, multiple values files.

---

## How this maps to your VCP reality

A mental model for your web stack on K8s:

* **Deployment**(nginx-adminportal) → Pods serve static UI
* **Service**(adminportal) exposes those pods inside cluster
* **Deployment**(httpd) → Pods act like your “front router / headers / reverse proxy”
* **Service**(httpd)
* **Deployment**(a3gw) → authz + routing to backend microservices
* **Service**(a3gw)
* **Ingress** routes external traffic to **Service(httpd)** (or direct to nginx, depending on design)

---

## The minimum commands you should feel comfortable with

If you can do these, you’re functional:

* **Where am I?**

    * `kubectl config current-context`
    * `kubectl config get-contexts`

* **What’s running?**

    * `kubectl get ns`
    * `kubectl get all -n <ns>`
    * `kubectl get pods -n <ns> -o wide`

* **Why is it broken?**

    * `kubectl describe pod <pod> -n <ns>`
    * `kubectl logs <pod> -n <ns>`
    * `kubectl describe deploy <name> -n <ns>`
    * `kubectl describe ingress <name> -n <ns>`
    * `kubectl describe svc <name> -n <ns>`

* **Helm sanity**

    * `helm list -n <ns>`
    * `helm template ./chart -n <ns>` (render YAML without installing)
    * `helm install/upgrade`

---

## Tiny “quiz” to lock it in (2 minutes)

If you can answer these, your mental model is solid:

1. Why do we need a Service in front of pods?
2. What does a Deployment give you that a Pod alone doesn’t?
3. What extra thing do you need besides an Ingress resource for it to work?
4. When would you choose StatefulSet over Deployment?
5. What exactly does “context” include?

---
