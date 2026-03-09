---
description: Obliga a leer toda la documentación relevante y generar planes exhaustivos mapeados al DoD antes de codificar.
---
# Protocolo Riguroso de Planeación (Bloques de Desarrollo)

Este workflow es OBLIGATORIO antes de iniciar la ejecución de un nuevo bloque de desarrollo. Garantiza que la IA y el desarrollador estén perfectamente alineados en arquitectura, alcance y Definition of Done (DoD).

## Pasos Obligatorios

1. **Lectura del Contexto Maestro (Sin excepciones)**:
   - Ejecuta el workflow `/check-docs` para encontrar los flujos y entidades relevantes.
   - **CRÍTICO**: Usa `view_file` en `docs/development-plan.md`. Lee la sección del Bloque activo. Extrae las Tareas y el "Definition of Done" (DoD).
   - **CRÍTICO**: Usa `view_file` en `docs/screen-specs.md`. Lee la sección correspondiente a las pantallas del bloque. Domina el comportamiento UI, estados, constraints de diseño y lineamientos de UX Writing.
   - Si no lees estos documentos, tu plan será deficiente y fallarás.

2. **Auditoría del Estado Actual**:
   - Revisa el esquema de SQL actual (migraciones), las API routes existentes y el árbol de componentes para saber qué reusar y qué construir desde cero.

3. **Generación del Plan Exhaustivo**:
   El plan de implementación DEBE tener la siguiente estructura exacta. No omitas ninguna sección:
   
   - **Resumen**: Objetivo del bloque.
   - **Archivos a Crear/Modificar**: Agrupados lógicamente (Migraciones SQL, API Routes, Layouts/Pages, Componentes UI, LLM Layer).
   - **Tabla de Decisiones Técnicas**: Problema -> Resolución -> Justificación.
   - **Mapeo al Definition of Done (DoD)**: Tabla cruzando cada criterio del DoD de `development-plan.md` con la solución técnica (Cómo se cumple).
   - **Orden de Ejecución Lineal**: Nivel de granularidad paso a paso.
   - **Identificación de Riesgos**: Puntos de fallo técnico y mitigación.

4. **Self-Correction antes de entregar**:
   - Verificación final interna: "¿El plan menciona cómo extraer contenido de links? ¿Menciona las notas de voz con Gemini? ¿Cumple con TODAS las métricas del DoD?" Si falta alguna, el plan es rechazado y debe reescribirse.
