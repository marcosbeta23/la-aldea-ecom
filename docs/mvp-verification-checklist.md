# MVP Order Flow - Verification Checklist

## ✅ = Implemented | ⚠️ = Needs Testing | ❌ = Not Yet Done | 📝 = Manual Process

---

## 0) Principio Operativo
| Requisito | Estado | Ubicación |
|-----------|--------|-----------|
| Pago ≠ factura automática | ✅ | Webhook marca `paid_pending_verification`, admin factura manual |
| Reservar stock al pago | ✅ | `reserve_stock_for_order()` RPC |
| Lock temporal (24h) | ✅ | `reserved_until` field, `release_expired_reservations()` RPC |
| Clientes sin RUT → consumer_final | ✅ | `invoice_type = 'consumer_final'` en InvoiceForm |

---

## 1) Prioridad Inmediata

### Documentación del Flujo
| Requisito | Estado | Ubicación |
|-----------|--------|-----------|
| Documentar flujo MVP | ✅ | `docs/mvp-order-flow-guide.md` |
| Pago → webhook → reservar stock | ✅ | `app/api/webhooks/mercadopago/route.ts` |
| paid_pending_verification | ✅ | Nuevo status implementado |
| awaiting_stock | ✅ | Nuevo status implementado |
| ready_to_invoice | ✅ | Nuevo status implementado |
| invoiced | ✅ | Nuevo status implementado |

### Admin Panel Filtros
| Requisito | Estado | Ubicación |
|-----------|--------|-----------|
| Filtro paid_pending_verification | ✅ | `app/admin/orders/page.tsx` |
| Filtro awaiting_stock | ✅ | `app/admin/orders/page.tsx` |
| Filtro ready_to_invoice | ✅ | `app/admin/orders/page.tsx` |
| Filtro invoiced | ✅ | `app/admin/orders/page.tsx` |
| Filtro refunded | ✅ | `app/admin/orders/page.tsx` |

### Policy & Mensajes
| Requisito | Estado | Ubicación |
|-----------|--------|-----------|
| Policy de reembolso (texto) | ✅ | `docs/mvp-order-flow-guide.md` |
| Mensajes automáticos templates | ✅ | `lib/notifications.ts` |

---

## 2) DB — Cambios y Campos

| Campo | Estado | Migración |
|-------|--------|-----------|
| `status` (con nuevos valores) | ✅ | `scripts/mvp-order-flow-migration.sql` |
| `paid_at` | ✅ | ✅ |
| `mp_payment_id` | ✅ | Ya existía |
| `reserved_until` | ✅ | ✅ |
| `stock_reserved` | ✅ | ✅ |
| `invoice_number` | ✅ | ✅ |
| `invoice_type` | ✅ | ✅ |
| `invoice_tax_id` | ✅ | ✅ |
| `invoice_business_name` | ✅ | ✅ |
| `invoiced_at` | ✅ | ✅ |
| `refund_id` | ✅ | ✅ |
| `refund_amount` | ✅ | ✅ |
| `refund_reason` | ✅ | ✅ |
| `refund_status` | ✅ | ✅ |
| `refunded_at` | ✅ | ✅ |
| `inventory_locks` table | ✅ | ✅ |
| `order_logs` table | ✅ | ✅ |
| RPC `reserve_stock_for_order` | ✅ | ✅ |
| RPC `release_expired_reservations` | ✅ | ✅ |
| RPC `restore_stock_for_order` | ✅ | ✅ |
| RPC `log_order_event` | ✅ | ✅ |

---

## 3) Backend — Endpoints

| Endpoint | Estado | Ubicación |
|----------|--------|-----------|
| Webhook MP (idempotente) | ✅ | `app/api/webhooks/mercadopago/route.ts` |
| Validar firma MP | ✅ | Usa `verifyMPSignature()` |
| external_reference = order_id | ✅ | ✅ |
| reserveStockForOrder en transacción | ✅ | Llama RPC `reserve_stock_for_order` |
| Guardar mp_payment_id y meta | ✅ | ✅ |
| Admin: guardar invoice_number manual | ✅ | `InvoiceForm.tsx` + PATCH API |
| Admin: set status = invoiced | ✅ | ✅ |
| Refund endpoint | ✅ | `app/api/admin/orders/[id]/refund/route.ts` |
| Llama MP refund API | ✅ | `createMPRefund()` |
| Registra refund_id y status | ✅ | ✅ |
| Reingresar stock si aplica | ✅ | Llama `restore_stock_for_order` RPC |
| Guardar logs | ✅ | Inserta en `order_logs` |
| Worker para expiración | ✅ | `app/api/cron/release-stock/route.ts` - Vercel Cron |

---

## 4) UI / Admin — Cambios

| Requisito | Estado | Ubicación |
|-----------|--------|-----------|
| Filtros por status | ✅ | `app/admin/orders/page.tsx` |
| Mostrar MP payment id | ✅ | `app/admin/orders/[id]/page.tsx` |
| Mostrar paid_at | ✅ | `app/admin/orders/[id]/page.tsx` |
| Link al recibo MP | ✅ | `app/admin/orders/[id]/page.tsx` |
| Botón Emitir factura | ✅ | `InvoiceForm.tsx` |
| Campo invoice_number manual | ✅ | `InvoiceForm.tsx` |
| Botón Refund | ✅ | `RefundButton.tsx` |
| Refund partial/full | ✅ | Campo amount editable |
| Refund reason | ✅ | Campo obligatorio |
| Alerta reserved_until | ✅ | `page.tsx` muestra si próximo a vencer |
| Campo invoice_tax_id | ✅ | `InvoiceForm.tsx` |
| Campo invoice_type | ✅ | `InvoiceForm.tsx` |
| Logs/Activity visible | ✅ | Sección "Actividad" en order detail |

---

## 5) Procesos Operativos

| Rol | Estado | Documentación |
|-----|--------|---------------|
| CM/Soporte: alertas awaiting_stock | 📝 | `docs/mvp-order-flow-guide.md` |
| Admin: revisar y facturar | 📝 | `docs/mvp-order-flow-guide.md` |
| Almacén: control físico | 📝 | `docs/mvp-order-flow-guide.md` |
| Decisión: policy reserved_until | 📝 | Configurado 24h por defecto |

---

## 6) Cliente Sin RUT

| Requisito | Estado | Ubicación |
|-----------|--------|-----------|
| invoice_tax_id puede quedar vacío | ✅ | `InvoiceForm.tsx` - no es required |
| invoice_type = consumer_final | ✅ | Opción en select |
| Proceso para factura posterior | 📝 | Documentado en guía |

---

## 7) Reembolsos

| Requisito | Estado | Ubicación |
|-----------|--------|-----------|
| Policy texto | ✅ | `docs/mvp-order-flow-guide.md` |
| Endpoint refund | ✅ | `/api/admin/orders/[id]/refund` |
| Llama MP API | ✅ | `createMPRefund()` |
| Registra refund_id | ✅ | ✅ |
| Set status = refunded | ✅ | ✅ |
| Reingresar stock | ✅ | Checkbox + RPC |
| Notificar cliente | ✅ | Auto-genera mensaje en `order_logs` |

---

## 8) Mensajes Automáticos

| Template | Estado | Ubicación |
|----------|--------|-----------|
| Pago recibido | ✅ | `lib/notifications.ts` |
| awaiting_stock | ✅ | `lib/notifications.ts` |
| ready_to_invoice | ✅ | `lib/notifications.ts` |
| Factura emitida | ✅ | `lib/notifications.ts` |
| Reembolso iniciado | ✅ | `lib/notifications.ts` |
| Auto-generación al cambiar status | ✅ | `app/api/admin/orders/[id]/route.ts` |

---

## 9) Tests y QA

| Test | Estado |
|------|--------|
| Sandbox pago → webhook → reserve → invoice | ⚠️ Pendiente |
| Caso fail stock → awaiting_stock | ⚠️ Pendiente |
| Reembolso completo | ⚠️ Pendiente |
| Reembolso parcial | ⚠️ Pendiente |
| Idempotencia webhook | ✅ Implementado |
| Cliente sin RUT | ⚠️ Pendiente |
| E2E con ngrok | ⚠️ Pendiente |

---

## 10) Monitorización

| Requisito | Estado |
|-----------|--------|
| Log de webhooks | ✅ console.log + order_logs |
| Alertas reserveStock falla | ⚠️ Log existe, falta notificación |
| Dashboard awaiting_stock count | ⚠️ Falta implementar |
| Notificaciones Slack/Email fallas | ❌ No implementado |

---

## � IMPLEMENTACIÓN COMPLETA

### Críticos (listos para producción)
1. ✅ **CRON job** `app/api/cron/release-stock/route.ts` - Configurar en Vercel
2. ✅ **Auto-generación de mensajes** al cambiar status (guardados en order_logs)
3. ✅ **Mostrar paid_at** en order detail
4. ✅ **UI order_logs** - Sección "Actividad" en order detail
5. ✅ **Link al recibo MP** en order detail

### RECOMENDADO (mejoras futuras)
- Dashboard con contadores por status
- Notificaciones Slack/Email para fallas
- Test E2E completo
- Integración WhatsApp Business API para envío automático

---

## 📋 Comando para ejecutar migración

```sql
-- Copiar contenido de scripts/mvp-order-flow-migration.sql
-- Ejecutar en Supabase SQL Editor
```

## 📋 Para el CRON job (Supabase)

```sql
-- En Supabase, crear un pg_cron job:
SELECT cron.schedule(
  'release-expired-stock',
  '0 * * * *', -- Every hour
  $$SELECT release_expired_reservations()$$
);
```

O usar Vercel Cron:
```typescript
// app/api/cron/release-stock/route.ts
export async function GET() {
  const { data } = await supabaseAdmin.rpc('release_expired_reservations');
  return Response.json({ released: data });
}
```
