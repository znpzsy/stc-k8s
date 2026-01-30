Perfect. Here’s the exact **build+push linux/amd64** set using your real paths, tagging everything as **`1.0.0.2-amd64`**.

I’m assuming you’ll run these from the **repo root** (the directory that contains `stc/`).

---

## 0) One-time: make sure buildx builder is active

```bash
docker buildx use telenity-builder || docker buildx create --name telenity-builder --use
docker buildx inspect --bootstrap
docker login nexus.telenity.com
```

---

## 1) Build + push (explicit Dockerfiles + correct contexts)

### a3gw (k8slocal)

```bash
docker buildx build --platform linux/amd64 \
  -f stc/vcp/a3gw/Dockerfile.vcp.k8slocal \
  -t nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-a3gw:1.0.0.2-amd64 \
  --push \
  stc/vcp/a3gw
```

### httpd (k8slocal)

```bash
docker buildx build --platform linux/amd64 \
  -f stc/vcp/httpd/Dockerfile.vcp.k8slocal \
  -t nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.2-amd64 \
  --push \
  stc/vcp/httpd
```

### adminportal (prod)

```bash
docker buildx build --platform linux/amd64 \
  -f stc/vcp/vcp-adminportal/Dockerfile.prod \
  -t nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-adminportal:1.0.0.2-amd64 \
  --push \
  stc/vcp/vcp-adminportal
```

### ccportal (prod)

```bash
docker buildx build --platform linux/amd64 \
  -f stc/vcp/vcp-ccportal/Dockerfile.prod \
  -t nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-ccportal:1.0.0.2-amd64 \
  --push \
  stc/vcp/vcp-ccportal
```

### partnerportal (prod)

```bash
docker buildx build --platform linux/amd64 \
  -f stc/vcp/vcp-partnerportal/Dockerfile.prod \
  -t nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-partnerportal:1.0.0.2-amd64 \
  --push \
  stc/vcp/vcp-partnerportal
```

---

## 2) Verify one image in Nexus is really amd64

Pick `httpd`:

```bash
docker pull nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.2-amd64
docker image inspect nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.2-amd64 \
  --format '{{.Os}}/{{.Architecture}}'
```

Expected:

```
linux/amd64
```

(Repeat for others only if you’re paranoid — one is usually enough if they were built the same way.)

---

## 3) Don’t forget Helm must point to the new tag

If your chart has per-component tags, you’ll want something like:

```bash
--set a3gw.image.tag=1.0.0.2-amd64 \
--set httpd.image.tag=1.0.0.2-amd64 \
--set adminportal.image.tag=1.0.0.2-amd64 \
--set ccportal.image.tag=1.0.0.2-amd64 \
--set partnerportal.image.tag=1.0.0.2-amd64
```

If you paste your `values.yaml` image section (or `helm show values . | grep -n image -n`), I’ll map these keys **exactly** to your chart so you don’t guess.

---

### Tiny gotcha (worth stating once)

If any Dockerfile does `COPY ../something ...`, the build context I used (the component folder) might not include it. If you hit a `COPY failed: file not found` error, tell me the line and we’ll switch that component’s context to `stc/vcp` (or repo root) while keeping `-f` as-is.

You’re lined up perfectly now.


----
You did everything right — the “HOW” here is **Docker being literal** again.

### What’s happening

You **built and pushed only linux/amd64** (good).
Then you ran:

```bash
docker pull nexus...:1.0.0.2-amd64
```

On your **Apple Silicon** machine, Docker tries to pull **for your default platform** (`linux/arm64/v8`). Since that tag contains **only amd64**, Docker says:

> no matching manifest for linux/arm64/v8

That’s expected and actually confirms you pushed an amd64-only image.

So: **Nothing is wrong with the push.** Your local pull command is the problem.

---

## Correct verification on Apple Silicon

When pulling an amd64-only image from an M-series Mac, you must specify platform:

```bash
docker pull --platform linux/amd64 nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.2-amd64
docker image inspect nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.2-amd64 \
  --format '{{.Os}}/{{.Architecture}}'
```

Do the same for a3gw if you want:

```bash
docker pull --platform linux/amd64 nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-a3gw:1.0.0.2-amd64
docker image inspect nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-a3gw:1.0.0.2-amd64 \
  --format '{{.Os}}/{{.Architecture}}'
```

You should see:

```
linux/amd64
```

---

## Even better: verify without pulling (registry-side)

This avoids local-arch confusion completely:

```bash
docker buildx imagetools inspect nexus.telenity.com/com/telenity/consolportals-sa-stc-vcp-httpd:1.0.0.2-amd64
```

You should see an entry for:

* `linux/amd64`

(And **no** arm64.)

---

## Why did build output say “manifest list” if it’s single-arch?

Buildx often pushes an “index/manifest list” even when it contains a **single platform**. That’s normal. Your tag is effectively “amd64-only”.

---

## Next step (now you’re unblocked)

Your corporate cluster is **x86_64**, so it will pull amd64 by default and be happy.

Now update Helm to use the new tags:

```bash
helm upgrade --install consolportals-test . -n consolportals-test \
  --set global.namespace=consolportals-test \
  --set a3gw.image.tag=1.0.0.2-amd64 \
  --set httpd.image.tag=1.0.0.2-amd64 \
  --set adminportal.image.tag=1.0.0.2-amd64 \
  --set ccportal.image.tag=1.0.0.2-amd64 \
  --set partnerportal.image.tag=1.0.0.2-amd64
```

(Adjust the value keys if your chart uses different ones.)

---

### Tiny optional quality-of-life tip

If you’re going to frequently pull amd64 images on Apple Silicon, you can temporarily do:

```bash
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

Then plain `docker pull` will default to amd64 in that terminal.

---

If you paste your `values.yaml` image section (or `helm show values . | grep -n "image" -n`), I’ll map the **exact** `--set` keys so you don’t guess and accidentally deploy old ARM tags again.
