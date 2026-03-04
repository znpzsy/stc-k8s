# How to Test: Docker Compose

This guide walks you through running and testing the VCP stack using **Docker Compose** only (no Kubernetes). Two modes are supported: **development** (hot reload, dev configs) and **production-like** (built images, healthchecks).

---

## Prerequisites

- **Docker** and **Docker Compose** (v2 or later) installed and running.
- **Make** (optional but recommended for the commands below).
- Enough resources: suggest at least 4 GB RAM and 2 CPUs for all services.

---

## 1. Development Mode (Hot Reload)

Development mode mounts source and config so you can edit code without rebuilding. httpd is mapped to **9080** (HTTP) and **9443** (HTTPS) on the host so it works even when port 80/443 are in use; portals and a3gw are also exposed.

### 1.1 Start the stack

From the **repository root**:

```bash
cd stc/vcp
make start dev
```

Or without Make:

```bash
cd stc/vcp
docker compose -f docker-compose.dev.yml up --build -d
```

### 1.2 Wait for containers to be healthy

Containers have healthchecks. Wait 30–60 seconds, then check:

```bash
docker compose -f docker-compose.dev.yml ps
```

All services should show `healthy` (or `running` with no `unhealthy`).

### 1.3 Test the portals

Use **http** (port 9080) or **https** (port 9443; self-signed cert, accept browser warning):

| Portal          | URL (HTTP)                              | URL (HTTPS)                                |
|-----------------|-----------------------------------------|--------------------------------------------|
| Admin Portal    | http://localhost:9080/adminportal       | https://localhost:9443/adminportal        |
| CC Portal       | http://localhost:9080/ccportal          | https://localhost:9443/ccportal            |
| Partner Portal  | http://localhost:9080/partnerportal     | https://localhost:9443/partnerportal      |

**Expected:** The AngularJS app loads (login page or dashboard). You may see “will not be able to authenticate” if no backend is connected; the UI itself should still load.

### 1.4 Test config and proxy endpoints

From a terminal:

```bash
# Public site config (no auth)
curl -s http://localhost:9080/site.json | head -20

# A3GW reachable via httpd (port 9080)
curl -s -o /dev/null -w "%{http_code}" http://localhost:9080/adminportal
# Expect 200
```

### 1.5 View logs

```bash
make logs dev
# or
docker compose -f docker-compose.dev.yml logs -f
```

### 1.6 Stop and cleanup (dev)

```bash
make stop dev
# Optional: remove volumes and built images
make reset dev
```

---

## 2. Production-like Mode (Built Images)

Production-like mode uses the same topology but built images and healthchecks, with httpd on **9080/9443** to avoid clashing with dev.

### 2.1 Start the stack

From `stc/vcp`:

```bash
make start prod
```

Or:

```bash
cd stc/vcp
docker compose -f docker-compose.prod.yml up --build -d
```

First run will build all images (a3gw, httpd, adminportal, ccportal, partnerportal); this can take several minutes.

### 2.2 Wait for health

```bash
docker compose -f docker-compose.prod.yml ps
```

Wait until all services report `healthy`.

### 2.3 Test the portals (prod ports)

| Portal          | URL (HTTP)                              | URL (HTTPS)                                |
|-----------------|-----------------------------------------|--------------------------------------------|
| Admin Portal    | http://localhost:9080/adminportal       | https://localhost:9443/adminportal         |
| CC Portal       | http://localhost:9080/ccportal          | https://localhost:9443/ccportal           |
| Partner Portal  | http://localhost:9080/partnerportal     | https://localhost:9443/partnerportal       |

**Expected:** Same as dev: AngularJS app loads; auth may fail without a real backend.

### 2.4 Test config and health

```bash
# Site config via httpd
curl -s http://localhost:9080/site.json | head -20

# Health (Docker HEALTHCHECK uses these internally)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9080/adminportal
# Expect 200
```

### 2.5 Stop and cleanup (prod)

```bash
make stop prod
# Optional: full cleanup including images
make reset prod
```

---

## 3. Verification Checklist

Use this to confirm the Compose setup is working:

| Check | Dev | Prod | Command / URL |
|-------|-----|------|----------------|
| httpd responds | 9080 / 9443 | 9080 / 9443 | `curl -sI http://localhost:9080/` |
| Admin portal loads | :9080/adminportal | :9080/adminportal | Open in browser |
| CC portal loads | :9080/ccportal | :9080/ccportal | Open in browser |
| Partner portal loads | :9080/partnerportal | :9080/partnerportal | Open in browser |
| site.json returns JSON | :9080/site.json | :9080/site.json | `curl -s http://localhost:9080/site.json` |
| All containers healthy | ✓ | ✓ | `docker compose -f docker-compose.<env>.yml ps` |

---

## 4. Troubleshooting

### 4.1 Dev mode: cannot access portals in the browser

**Common causes:**

1. **httpd not reachable** — Dev maps httpd to **9080** and **9443**. Use **http://localhost:9080/adminportal** (and /ccportal, /partnerportal). For a3gw only (no httpd): **http://localhost:8444/adminportal**.

2. **Wrong URL** — Use **http://localhost:9080/adminportal** (or /ccportal, /partnerportal), not just `http://localhost:9080`. The path is required.

3. **Containers still starting** — In dev, portal containers run `gulp server`, which can take 1–2 minutes. You may see 502/503 until they are ready.  
   - Check: `docker compose -f docker-compose.dev.yml ps` and `docker compose -f docker-compose.dev.yml logs vcpadminportal`; wait until gulp is listening.  
   - Fix: Wait 2–3 minutes after `make start dev`, then try again.

**Quick diagnostic (from `stc/vcp`):**  
`curl -sI http://localhost:9080/adminportal` · `docker compose -f docker-compose.dev.yml ps` · `docker compose -f docker-compose.dev.yml logs --tail=30 httpd a3gw`

**Containers stay “starting” or become “unhealthy”**

- Give it 1–2 minutes for a3gw and httpd to become ready.
- Check logs: `docker compose -f docker-compose.<env>.yml logs httpd a3gw`.
- On Apple Silicon: `docker-compose.prod.yml` sets `platform: linux/arm64`; build may be slower first time.

**Port already in use**

- Dev & prod uses 9080/9443. Stop other services on those ports or change the compose `ports` mapping.
- If 8080/8081/8082 are in use, change the portal port mappings in the compose file.

**Portal shows blank or 502**

- Ensure httpd and a3gw are healthy first; portals depend on them.
- Confirm you’re using the correct base URL (e.g. `http://localhost:9080/adminportal` for prod, not just `:9080`).

**Build fails (Dockerfile)**

- Run from `stc/vcp` so build contexts (e.g. `./a3gw`, `./httpd`) are correct.
- For portals, ensure `npm-shrinkwrap.original.json` and bower/gulp deps exist; run `docker compose -f docker-compose.prod.yml build --no-cache <service>` for a clean build.

---

## 5. Reference: Compose Files and Make Targets

| File | Purpose |
|------|---------|
| `stc/vcp/docker-compose.dev.yml`  | Development: hot reload, httpd on 9080/9443 |
| `stc/vcp/docker-compose.prod.yml`| Production-like: built images, httpd on 9080/9443 |

| Make target | Action |
|-------------|--------|
| `make start dev` / `make start prod`  | Build (if needed) and start in background |
| `make stop dev` / `make stop prod`   | Stop containers |
| `make logs dev` / `make logs prod`   | Follow logs |
| `make ps dev` / `make ps prod`       | List containers |
| `make health dev` / `make health prod`| Show health status |
| `make restart dev` / `make restart prod` | Restart with rebuild |
| `make reset dev` / `make reset prod`  | Stop, remove containers, volumes, and images |

All `make` commands must be run from `stc/vcp` with the correct `<env>` (e.g. `make start dev`).
