# La Aldea E-Commerce - MVP Order Flow Guide

## 📋 Flujo Operativo MVP (Semi-Manual)

Este documento describe el flujo operativo del e-commerce con facturación semi-manual, ideal para el MVP antes de integrar facturación automática.

---

## 🔄 Flujo de Estados de Pedido

```
┌─────────────┐     ┌──────────────────────────┐     ┌─────────────────────┐
│   pending   │ ──▶ │ paid_pending_verification │ ──▶ │   ready_to_invoice  │
│  (Checkout) │     │     (Pago recibido)       │     │   (Stock OK)        │
└─────────────┘     └──────────────────────────┘     └─────────────────────┘
                              │                               │
                              │ Sin stock                     │
                              ▼                               ▼
                    ┌─────────────────┐             ┌─────────────────┐
                    │  awaiting_stock │             │    invoiced     │
                    │ (Contactar cli) │             │ (Factura emitida)│
                    └─────────────────┘             └─────────────────┘
                              │                               │
                              │ Reembolso                     │
                              ▼                               ▼
                    ┌─────────────────┐             ┌─────────────────┐
                    │    refunded     │             │   processing    │
                    └─────────────────┘             │   shipped       │
                                                    │   delivered     │
                                                    └─────────────────┘
```

---

## 📊 Estados del Pedido

| Estado | Descripción | Acción Requerida |
|--------|-------------|------------------|
| `pending` | Orden creada, esperando pago | Esperar webhook de MP |
| `paid_pending_verification` | Pago OK, stock reservado | Revisar y facturar |
| `awaiting_stock` | Pago OK pero sin stock | Contactar cliente, ofrecer reembolso o espera |
| `ready_to_invoice` | Verificado, listo para facturar | Emitir factura en ERP |
| `invoiced` | Factura emitida | Preparar envío |
| `processing` | En preparación | Preparando el pedido |
| `shipped` | Despachado | Seguimiento de envío |
| `delivered` | Entregado | Completado |
| `refunded` | Reembolsado | Caso cerrado |
| `cancelled` | Cancelado | Caso cerrado |

---

## 🛠️ Proceso Paso a Paso

### 1️⃣ Pago Recibido (Automático)

Cuando MercadoPago envía el webhook con `status: approved`:

1. **Sistema verifica** el monto del pago vs. total del pedido
2. **Intenta reservar stock** usando la función `reserve_stock_for_order`
3. Si hay stock:
   - Estado → `paid_pending_verification`
   - Stock reservado por 24 horas
4. Si NO hay stock:
   - Estado → `awaiting_stock`
   - Admin debe contactar al cliente

### 2️⃣ Verificación del Pedido (Manual)

El admin entra al panel y ve los pedidos en `paid_pending_verification`:

1. Revisar datos del cliente
2. Confirmar que los productos están físicamente disponibles
3. Decidir tipo de comprobante:
   - **Consumidor Final** (sin RUT) → e-Ticket
   - **Con RUT** (empresa) → e-Factura

### 3️⃣ Facturación (Semi-Manual)

El sistema actual es **semi-manual**:

1. Admin genera la factura en el **ERP/sistema de facturación** (Uruware, EFacuy, etc.)
2. Copia el **número de factura** en el campo del admin panel
3. Selecciona el **tipo de comprobante**
4. Click en "Registrar Factura"
5. Estado cambia a `invoiced`

> **IMPORTANTE:** La factura se genera FUERA del e-commerce por ahora. Más adelante se puede integrar API automática.

### 4️⃣ Preparación y Envío

1. Estado → `processing` (preparando)
2. Preparar el pedido físicamente
3. Estado → `shipped` (despachado)
4. Notificar al cliente con datos de envío
5. Estado → `delivered` cuando confirme recepción

---

## ⚠️ Manejo de Casos Especiales

### Caso: Sin Stock (`awaiting_stock`)

**Opciones para el cliente:**

1. **Reembolso completo** → Procesar en 48-72h
2. **Esperar** → Notificar cuando haya stock
3. **Producto alternativo** → Ajustar pedido

**Pasos admin:**
1. Contactar cliente por WhatsApp (usar plantilla)
2. Esperar respuesta
3. Si reembolso → usar botón "Procesar Reembolso"
4. Si espera → mantener en `awaiting_stock`

### Caso: Reembolso

**Política recomendada:**
- Por falta de stock: 48-72 horas
- Por arrepentimiento: 7 días (si no fue despachado)
- Parcial: caso por caso

**Proceso:**
1. Admin click "Procesar Reembolso"
2. Indicar monto (total o parcial)
3. Indicar motivo (obligatorio)
4. Marcar si reingresar stock
5. Sistema llama a MP Refund API
6. Estado → `refunded`

### Caso: Cliente Sin RUT

Para ventas a consumidores sin RUT:

1. Seleccionar **"Consumidor Final"** como tipo de comprobante
2. Generar **e-Ticket** en el ERP
3. No es necesario identificar al comprador (salvo montos > 10.000 UI)

---

## 📱 Plantillas de Mensajes

### Pago Recibido
```
Hola [Nombre] 👋
✅ Recibimos tu pago por el pedido #[ID]
Estamos verificando stock y en breve te confirmamos la factura y el envío.
Total: UYU [monto]
— La Aldea
```

### Sin Stock (awaiting_stock)
```
Hola [Nombre] 👋
⚠️ Aviso sobre tu pedido #[ID]
Lamentablemente no tenemos stock de [productos].
¿Qué preferís?
1️⃣ Reembolso completo (1-15 días)
2️⃣ Esperar hasta que tengamos stock
3️⃣ Producto alternativo
Respondé indicando qué preferís.
— La Aldea
```

### Factura Emitida
```
Hola [Nombre] 👋
📄 Tu factura N° [número] para el pedido #[ID] fue generada.
[Si retiro: Podés pasar a retirar cuando quieras.]
[Si envío: Te avisamos cuando despachemos.]
— La Aldea
```

### Reembolso Iniciado
```
Hola [Nombre] 👋
💸 Iniciamos el reembolso de UYU [monto] por tu pedido #[ID].
El proceso puede tardar 1-15 días según tu medio de pago.
— La Aldea
```

---

## ⏰ Reserva de Stock

El stock se **reserva automáticamente** por 24 horas cuando el pago es aprobado.

**Si el pedido no se factura en 24 horas:**
- Stock se libera automáticamente
- Orden pasa a `awaiting_stock`
- Admin es notificado

**Para extender la reserva:**
- Facturar antes de que expire
- O configurar manualmente reserved_until en la DB

---

## 📋 Checklist Diario del Admin

### Mañana
- [ ] Revisar pedidos en `paid_pending_verification`
- [ ] Facturar pedidos verificados
- [ ] Revisar alertas de reservas por vencer

### Durante el día
- [ ] Atender pedidos en `awaiting_stock`
- [ ] Procesar reembolsos pendientes
- [ ] Actualizar estados a `shipped`

### Fin del día
- [ ] Verificar conciliación MP
- [ ] Revisar pedidos sin resolver

---

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas
```
MP_ACCESS_TOKEN=tu_token_mercadopago
ADMIN_SESSION_SECRET=tu_secreto_admin
NEXT_PUBLIC_SUPABASE_URL=tu_url
SUPABASE_SERVICE_ROLE_KEY=tu_key
```

### Migración de Base de Datos
Ejecutar `scripts/mvp-order-flow-migration.sql` en Supabase SQL Editor.

### Funciones RPC Disponibles
- `reserve_stock_for_order(order_id, hours)` - Reservar stock
- `release_expired_reservations()` - Liberar reservas vencidas
- `restore_stock_for_order(order_id)` - Reingresar stock

---

## 🚀 Próximos Pasos (Post-MVP)

1. **Integración CFE automática** con Uruware/EFacuy
2. **Notificaciones automáticas** por email/WhatsApp
3. **Dashboard real-time** con WebSockets
4. **Precios en USD**
5. **Carga masiva** de productos (CSV)
