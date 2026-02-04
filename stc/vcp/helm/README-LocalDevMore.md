Looks good ✅

With what you’ve shown, **no template changes are needed anymore** — your chart will render **two Ingress rules**:

* `localhost`
* `consolportals-dev.internal.telenity.com`

…and both will share the same **Ingress-level annotations**, so your **`vcp-sticky` cookie config applies to both hosts** (because `ingress.annotations` comes from `values.yaml` and you’re not overriding it in `values-local.yaml`).

### The only things you need to do now

1. **Make sure you install/upgrade with both values files (order matters):**

```bash
helm upgrade --install vcp . -f values.yaml -f values-local.yaml
```

2. **Make sure the dev hostname resolves to your local ingress IP**
   On macOS, the usual easiest way is `/etc/hosts`:

```bash
sudo sh -c 'echo "127.0.0.1 consolportals-dev.internal.telenity.com" >> /etc/hosts'
```

(If your ingress controller is not bound to 127.0.0.1 on your setup, then map it to whatever `kubectl get ingress` / ingress service external IP shows — but on Docker Desktop it’s commonly localhost-ish.)

3. **Sanity check what Helm rendered**

```bash
kubectl -n consolportals get ingress consolportals-sa-stc-vcp-ingress -o yaml
```

Confirm you see:

* `metadata.annotations` includes `session-cookie-name: vcp-sticky`
* `spec.rules` contains both hosts

4. **Quick cookie check**

```bash
curl -I http://localhost/ -H 'Host: localhost'
curl -I http://localhost/ -H 'Host: consolportals-dev.internal.telenity.com'
```

You should see a `Set-Cookie: vcp-sticky=...` in responses (assuming ingress-nginx is handling it).

If you paste the output of `kubectl get ingress ... -o yaml` (just the `metadata.annotations` + `spec.rules` parts), I can tell you immediately if it’s rendered exactly right.
