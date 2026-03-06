{{/*
Minimal helpers. Original resource names from manifests kept same to avoid surprises.
*/}}
{{- define "consolportals.namespace" -}}
{{- if .Values.global.namespace -}}
{{- .Values.global.namespace -}}
{{- else -}}
{{- .Release.Namespace -}}
{{- end -}}
{{- end -}}

{{- define "vcp.a3gw.configmapName" -}}
consolportals-sa-stc-vcp-a3gw-conf
{{- end -}}

{{/*
A3GW resource names (kept identical to existing manifests)
*/}}
{{- define "vcp.a3gw.configmapConfName" -}}
{{ include "vcp.a3gw.configmapName" . }}-conf
{{- end -}}

{{- define "vcp.a3gw.configmapStaticName" -}}
{{ include "vcp.a3gw.configmapName" . }}-static
{{- end -}}

{{- define "vcp.a3gw.secretName" -}}
{{ include "vcp.a3gw.configmapName" . }}-secret
{{- end -}}
