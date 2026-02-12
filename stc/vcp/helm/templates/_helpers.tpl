{{/*
Minimal helpers. We keep the original resource names from your manifests to avoid surprises.
If you ever need release-prefixed names later, we can switch to fullname templates.
*/}}
{{- define "consolportals.namespace" -}}
{{- if .Values.global.namespace -}}
{{- .Values.global.namespace -}}
{{- else -}}
{{- .Release.Namespace -}}
{{- end -}}
{{- end -}}

{{/*
A3GW resource names (kept identical to existing manifests)
*/}}
{{- define "vcp.a3gw.configmapName" -}}
consolportals-sa-stc-vcp-a3gw-conf
{{- end -}}

{{- define "vcp.a3gw.secretName" -}}
consolportals-sa-stc-vcp-a3gw-conf-secret
{{- end -}}
