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
