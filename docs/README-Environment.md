
## Sandbox Environment – Current State & Known Quirks

### 1. Purpose of This Repository

This repository is a **personal sandbox** used to explore and document the **evolution** of containerization and Kubernetes deployment for ConsolPortals.

It is **not** the original production repository.

The goals of this sandbox are:

* To prototype Docker, Kubernetes manifests, and Helm charts
* To document how the system evolved step-by-step
* To allow developers to run components independently in a local environment
* To prepare for eventually moving Docker/K8s/Helm assets back into the original repos

---

## 2. Known-Good State (What Currently Works)

### Environment

* **Docker Desktop** with Kubernetes enabled
* **ingress-nginx** installed via Helm
* Kubernetes LoadBalancer resolves to `localhost`
* Helm charts deploy into a namespace such as `consolportals` or `stc-vcp` for the time being.

### Deployment Flow (K8s + Helm / Working)

1. Run `deploy-k8s.sh`

    * Builds Docker images locally
    * Tags them with registry-style names
    * Deploys Kubernetes manifests directly
   
2. Helm install works **after images exist locally**
3. Services start correctly:

    * httpd
    * a3gw
    * adminportal
    * ccportal
    * partnerportal
4. Ingress routes `/` → httpd service successfully
5. Manual Docker push to Nexus works when VPN/auth is OK

---

## 3. Repository Structure Reality Check (Important)

### Sandbox Repo

* Contains code for two different customer/sites (mobily & stc)
* Includes:

    * Dockerfiles
    * Kubernetes manifests
    * Helm charts
    * Local deployment scripts (`deploy-k8s.sh`)
* Does **not** contain:

    * Jenkinsfiles
    * Parent/child Maven `pom.xml` hierarchy

### Original ConsolPortals Repos

* Contain:

    * Parent `pom.xml` (outdated)
    * Child modules per portal
    * Jenkins pipelines (to be created)
* These files are **out of scope for this sandbox repo**, but are required for CI/CD

---

## 4. Known Quirks 

### Image Build & Pull Behavior

* `deploy-k8s.sh` builds Docker images **locally**
* Images are tagged like they live in a registry:

  ```
  mersin.telenity.com/com/telenity/<image>:<version>
  ```
* These images are **not actually pushed** unless done manually

### Critical Gotcha After Cleanup

After running:

```bash
docker system prune -a --volumes
```

➡️ **Helm installs will fail** unless `deploy-k8s.sh` is run again.

Symptoms:

* `ErrImagePull`
* `ImagePullBackOff`
* `no such host`
* `pull access denied`

Why:

* Kubernetes tries to pull images from the registry hostname
* Images only exist locally
* Registry host may be unreachable (VPN / DNS)
* Helm has no awareness that images are “local only”

Mitigation:

* Run `deploy-k8s.sh` first
* Use `imagePullPolicy: IfNotPresent`
* Or push images to Nexus and update Helm values

---

## 5. Registry Transition Notes

* Old registry reference:

  ```
  mersin.telenity.com
  ```
* New registry target:

  ```
  nexus.telenity.com
  ```
* Manual workflow tested successfully:

  ```bash
  docker login nexus.telenity.com
  docker tag <old-image> nexus.telenity.com/<path>:<tag>
  docker push nexus.telenity.com/<path>:<tag>
  ```

Images appear in Nexus UI under:

```
Browse → Docker → /v2/com/telenity/<image-name>
```

---

## 6. Helm-Specific Notes

* Helm charts are currently **dependent on pre-existing images**
* Helm **does not build images**
* Helm installs fail silently if images are missing and registry is unreachable
* Dry runs (`--dry-run=client`) are useful to validate manifests only

---

## 7. Next Objectives (Planned Work)

1. **Review original repos**

    * Parent `pom.xml`
    * Child portal modules
    * Jenkinsfiles
2. Fix / modernize Jenkins pipeline:

    * Build artifacts
    * Build Docker images
    * Push images to Nexus
3. Align image naming across:

    * Jenkins
    * Docker
    * Helm values
4. Update Helm charts to:

    * Pull exclusively from Nexus
    * Remove reliance on local builds
5. Re-run full flow:

   ```
   Jenkins → Nexus → Helm → Kubernetes
   ```
6. Move Docker/K8s/Helm assets back into original repos (if feasible)

---

## 8. Why This Documentation Exists

This repo intentionally documents **how things evolved**, including mistakes, dead ends, and environment quirks.
The aim is **traceability**, not polish.

> “It worked on my machine” is a phase, not a solution.

---
