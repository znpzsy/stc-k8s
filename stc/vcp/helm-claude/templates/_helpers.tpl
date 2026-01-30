{{/*
Expand the name of the chart.
*/}}
{{- define "consolportals.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "consolportals.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "consolportals.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "consolportals.labels" -}}
helm.sh/chart: {{ include "consolportals.chart" . }}
{{ include "consolportals.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "consolportals.selectorLabels" -}}
app.kubernetes.io/name: {{ include "consolportals.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "consolportals.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "consolportals.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Component-specific labels
*/}}
{{- define "consolportals.componentLabels" -}}
{{- $component := .component }}
{{- $context := .context }}
{{ include "consolportals.labels" $context }}
app.kubernetes.io/component: {{ $component }}
component: {{ $component }}
{{- end }}

{{/*
Component-specific selector labels
*/}}
{{- define "consolportals.componentSelectorLabels" -}}
{{- $component := .component }}
{{- $context := .context }}
{{ include "consolportals.selectorLabels" $context }}
component: {{ $component }}
{{- end }}

{{/*
Generate deployment name for a component
*/}}
{{- define "consolportals.deploymentName" -}}
{{- $component := .component }}
{{- printf "consolportals-sa-stc-vcp-%s-deployment" $component }}
{{- end }}

{{/*
Generate service name for a component
*/}}
{{- define "consolportals.serviceName" -}}
{{- $component := .component }}
{{- printf "consolportals-sa-stc-vcp-%s-service" $component }}
{{- end }}

{{/*
Generate full image name
*/}}
{{- define "consolportals.image" -}}
{{- $image := .image }}
{{- printf "%s:%s" $image.repository ($image.tag | default $.Chart.AppVersion) }}
{{- end }}
