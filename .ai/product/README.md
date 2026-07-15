# Producto (capa compartida) — POINTER, no editar acá

> **Esta capa NO vive en el frontend.** El QUÉ del negocio (visión, actores, reglas de negocio, flujos, roadmap) es **único y compartido** por backend y frontend, y su fuente de verdad canónica está en el **backend**.

## Dónde está la verdad

```
Backend-Inmobiliaria/.ai/product/
├── vision.md            ← visión, actores/roles, módulos, entidades, stack
├── business-rules.md    ← reglas transversales (permisos, publicación, búsqueda, leads, seguridad)
├── functional-flows.md  ← flujos funcionales / viaje del usuario (guía directa del frontend)
└── roadmap.md           ← qué se hizo / qué viene
```

Y el **contrato de API** (el límite back↔front):
```
Backend-Inmobiliaria/.ai/contracts/api-contract.md
```

## Regla

- **No dupliques** estas reglas acá. Si necesitás una regla de negocio, leela del backend.
- Si detectás que una regla de negocio **cambió** o falta, se edita en el **backend** (es la fuente canónica), no en el front.
- Lo que sí vive en el front es el **CÓMO** técnico de React (`.ai/context`, `.ai/policies`, `.ai/workflows`) y el **estado** del front (`PROJECT-MAP.md`).

> Si en el futuro se extrae `product/` a un repo de ecosistema propio, este README pasa a apuntar ahí.
