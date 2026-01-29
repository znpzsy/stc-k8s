```bash
kubectl config use-context docker-desktop
# kubectl config view
kubectl get ns
helm list -A 
# helm uninstall [name] -n [namespace]
helm uninstall test -n consolportals
# kubectl delete namespace [namespace]
kubectl delete namespace consolportals

```

```bash
zeynepozsoy@TELENITYs-MacBook-Pro stc-k8s % kubectl config use-context docker-desktop
Switched to context "docker-desktop".
zeynepozsoy@TELENITYs-MacBook-Pro stc-k8s % kubectl config view
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://kubernetes.docker.internal:6443
  name: docker-desktop
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://10.35.36.135:6443
  name: kubernetes
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://10.35.39.91:6443
  name: kubernetes-lab
contexts:
- context:
    cluster: docker-desktop
    user: docker-desktop
  name: docker-desktop
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
- context:
    cluster: kubernetes-lab
    user: kubernetes-admin-lab
  name: kubernetes-admin@kubernetes-lab
current-context: docker-desktop
kind: Config
users:
- name: docker-desktop
  user:
    client-certificate-data: DATA+OMITTED
    client-key-data: DATA+OMITTED
- name: kubernetes-admin
  user:
    client-certificate-data: DATA+OMITTED
    client-key-data: DATA+OMITTED
- name: kubernetes-admin-lab
  user:
    client-certificate-data: DATA+OMITTED
    client-key-data: DATA+OMITTED
zeynepozsoy@TELENITYs-MacBook-Pro stc-k8s % kubectl get ns
NAME              STATUS   AGE
consolportals     Active   25h
default           Active   217d
ingress-nginx     Active   7d6h
kube-node-lease   Active   217d
kube-public       Active   217d
kube-system       Active   217d
zeynepozsoy@TELENITYs-MacBook-Pro stc-k8s % helm list -A     
NAME            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
ingress-nginx   ingress-nginx   1               2026-01-20 22:55:45.316198 +0300 +03    deployed        ingress-nginx-4.14.1    1.14.1     
test            consolportals   1               2026-01-27 04:12:18.238163 +0300 +03    deployed        consolportals-vcp-0.1.0 1.0.0      
zeynepozsoy@TELENITYs-MacBook-Pro stc-k8s % kubectl config current-context

docker-desktop
zeynepozsoy@TELENITYs-MacBook-Pro stc-k8s % helm uninstall test -n consolportals

release "test" uninstalled
zeynepozsoy@TELENITYs-MacBook-Pro stc-k8s % helm list -A

NAME            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
ingress-nginx   ingress-nginx   1               2026-01-20 22:55:45.316198 +0300 +03    deployed        ingress-nginx-4.14.1    1.14.1     
zeynepozsoy@TELENITYs-MacBook-Pro stc-k8s % kubectl delete namespace consolportals

namespace "consolportals" deleted
zeynepozsoy@TELENITYs-MacBook-Pro stc-k8s % 


```
