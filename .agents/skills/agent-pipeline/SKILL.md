---
name: agent-pipeline
description: >
  Instrucciones para construir y modificar el pipeline del agente de IA de AGENTI.
  Cargar cuando se trabaje con: el webhook de WhatsApp, process-message,
  construcción del prompt, llamadas a LLM, cálculo de confidence, guardrails,
  creación de Suggestions o Escalations, o el mecanismo de aprendizaje.
---

# Agent Pipeline — AGENTI

> Leer junto con `docs/backend-logic.md` y `docs/tad.md` para el detalle completo.
> Este skill resume los principios y reglas de implementación del pipeline.

## Regla fundamental

El webhook de Meta tiene un timeout de 5 segundos. Si no respondemos en ese tiempo, Meta reintentará el mensaje. Por eso:

1. El webhook responde 200 INMEDIATAMENTE — antes de hacer cualquier procesamiento.
2. El mensaje se encola en `webhook_queue`.
3. `process-message` consume la queue de forma async.

Nunca procesar síncronamente en el handler del webhook.

## Capa de abstracción LLM

Toda llamada a modelo de lenguaje usa estas dos funciones. Sin excepciones:

```typescript
// Para respuestas del agente (calidad, razonamiento)
import { callPrimaryLLM } from '@/lib/llm'
const response = await callPrimaryLLM(userPrompt, systemPrompt)

// Para clasificación e inferencias ligeras (velocidad, costo)
import { callFastLLM } from '@/lib/llm'
const classification = await callFastLLM(userPrompt, systemPrompt)
```

Si el proveedor falla, el error se propaga con contexto suficiente para loggear en `system_logs`. El pipeline no se rompe silenciosamente.

## Estructura del prompt del agente — 6 bloques

El prompt se construye en este orden exacto. Ver `docs/backend-logic.md` Parte 3 para el contenido de cada bloque:

```
Bloque 1: Identidad y rol del agente + tabla de traducción de tono
Bloque 2: KnowledgeItems Capa 1 (estructurados) y Capa 2 (operativos) como instrucciones directas
Bloque 3: KnowledgeItems Capa 3 (narrativos) y Capa 4 (aprendidos)
Bloque 4: EscalationRules como imperativos
Bloque 5: Historial de conversación — últimos 6 mensajes (SIEMPRE real-time, NUNCA cacheado)
Bloque 6: Instrucción de output JSON estructurado (estático, igual para todos los negocios)
```

Los Bloques 1-4 se cachean en `agent_context_cache` con TTL de 1 hora.
El cache se invalida automáticamente cuando cambia cualquier KnowledgeItem del negocio.
El Bloque 5 se construye en tiempo real para cada mensaje. Nunca va al cache.

## Cálculo de confidence_tier

El confidence_tier es determinístico — no lo decide el LLM. Se calcula así:

```typescript
function calculateConfidenceTier(
  hadSufficientContext: boolean,  // del output JSON del LLM
  approvalRate7d: number,          // de CompetencyTopic.approval_rate_7d
  coveragePercentage: number       // de CompetencyTopic.coverage_percentage
): 'high' | 'medium' | 'low' {
  if (!hadSufficientContext) return 'low'
  if (approvalRate7d >= 0.85 && coveragePercentage >= 80) return 'high'
  if (approvalRate7d >= 0.60 && coveragePercentage >= 50) return 'medium'
  return 'low'
}
```

## Los 3 guardrails — aplicar siempre

Después de recibir el output del LLM, verificar:

1. **Guardrail de precios:** si la respuesta menciona precios que no están en los KnowledgeItems de Capa 1, degradar a `low` confidence.
2. **Guardrail de horarios:** si la respuesta menciona horarios que contradicen los KnowledgeItems, degradar a `low` confidence.
3. **Guardrail de contacto:** si la respuesta incluye información de contacto no presente en el perfil del negocio, degradar a `low` confidence y remover la información.

## Decisión: Suggestion vs Escalation

```
si output.had_sufficient_context == false → Escalation informative
si output contiene keyword de emergencia → Escalation urgent
si output.requires_escalation == true → Escalation según nivel indicado
si guardrail falla y confidence == low → Suggestion con confidence low (el dueño decide)
si todo OK → Suggestion con confidence calculado
```

## Output JSON esperado del LLM

El modelo siempre debe retornar este JSON. Si no puede parsearlo, crear Escalation informative:

```json
{
  "proposed_response": "texto de la respuesta al cliente",
  "had_sufficient_context": true,
  "detected_intent": "consulta_horario",
  "knowledge_items_used": ["horario de atención", "días de cierre"],
  "requires_escalation": false,
  "escalation_reason": null,
  "escalation_level": null,
  "confidence_self_assessed": 0.85
}
```

`knowledge_items_used` son descripciones breves, no UUIDs. El sistema resuelve a IDs por comparación.

## Manejo del aprendizaje

Cuando el dueño edita una Suggestion y la clasifica como permanente:
1. Se crea un `KnowledgeSource` de tipo `correction`
2. El modelo fast/cheap abstrae el dato (texto generalizable vs caso específico)
3. Si confidence de abstracción >= 0.7 → crear KnowledgeItem en la capa correcta
4. Si confidence < 0.7 → crear KnowledgeItem como Capa 4 con el texto literal
5. Invalidar `agent_context_cache` del negocio
6. El próximo mensaje ya usa el nuevo conocimiento

Capa 1 y Capa 2 NUNCA se sobreescriben por aprendizaje implícito. Solo por instrucción explícita del dueño confirmada.
