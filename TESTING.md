# Testing MercadoPago - La Aldea

## 🎯 Credenciales Sandbox

**Access Token:** APP_USR-7323296378728809-011616-38fa5c7c42e15d2b1e08cb2c61fd9c07-3139064037  
**Public Key:** APP_USR-d01e5a59-a7ba-4310-acce-2aff87e501e3

> ⚠️ **Nota Uruguay:** Las credenciales de prueba en Uruguay usan el prefijo `APP_USR-` (no `TEST-`). La diferenciación entre test y producción se hace mediante los usuarios de prueba, no por el formato del token.

---

## 🧪 Usuarios de Prueba Creados

### Vendedor (Seller)
- **Usuario:** TESTUSER3327
- **Email:** test_user_3327@testuser.com
- **Password:** qatest2088
- **User ID:** 3139064037

### Comprador (Buyer)
- **Usuario:** TESTUSER5624
- **Email:** test_user_5624@testuser.com  
- **Password:** qatest5379
- **User ID:** 3139040161

**Uso recomendado:** Usar cuenta de comprador para simular pagos. La cuenta tiene saldo precargado de "dinero disponible" que es más confiable que las tarjetas de prueba.

---

## 🚀 Método Rápido: Script test-mp.js

En lugar de usar curl manualmente, el proyecto incluye `test-mp.js` para crear preferencias de forma más simple:

```bash
node test-mp.js
```

**Qué hace:**
- ✅ Crea una preferencia de pago con un producto de prueba ($100 UYU)
- ✅ Evita problemas de sintaxis de PowerShell con las comillas
- ✅ Muestra la URL del checkout lista para copiar y pegar
- ✅ Incluye back_urls configuradas para localhost:3000

**Output esperado:**
```
✅ Respuesta exitosa de MercadoPago:
{
  "id": "1234567890-abc",
  "sandbox_init_point": "https://sandbox.mercadopago.com.uy/checkout/v1/redirect?pref_id=..."
}

🎯 URL para probar el checkout:
https://sandbox.mercadopago.com.uy/checkout/v1/redirect?pref_id=...
```

Copiar la URL celeste y pegarla en el navegador para probar el pago.

---

## 💳 Tarjetas de Prueba Uruguay - Oficiales MercadoPago

> ⚠️ **Importante:** Las tarjetas de prueba en Uruguay sandbox son inconsistentes. **Se recomienda usar "dinero disponible"** del usuario de prueba en lugar de tarjetas.

### Mastercard
- **Número:** 5031 7557 3453 0604
- **CVV:** 123
- **Vencimiento:** 11/30
- **Nombre:** APRO (para aprobado) u otro estado
- **Documento:** 12345678 (CI) o 123456789 (otro)

### Visa
- **Número:** 4509 9535 6623 3704
- **CVV:** 123
- **Vencimiento:** 11/30
- **Nombre:** APRO (para aprobado) u otro estado
- **Documento:** 12345678 (CI) o 123456789 (otro)

### Visa Débito
- **Número:** 4213 0163 1470 6756
- **CVV:** 123
- **Vencimiento:** 11/30
- **Nombre:** APRO (para aprobado) u otro estado
- **Documento:** 12345678 (CI) o 123456789 (otro)

---

## ✅ Flujo de Pago Probado Exitosamente

### Pago Confirmado - Enero 2026
- **Operación:** #141682243149
- **Monto:** $100 UYU
- **Método:** Dinero disponible (saldo del usuario de prueba)
- **Estado:** Aprobado ✅
- **Usuario:** TESTUSER5624 (comprador)

### Pasos que funcionan:
1. Ejecutar `node test-mp.js`
2. Copiar la URL de `sandbox_init_point`
3. Abrir en navegador **sin estar logueado** en MercadoPago
4. Se abre sesión → ingresar con usuario comprador (TESTUSER5624)
5. Seleccionar método de pago: **"Dinero disponible"**
6. Confirmar pago → ✅ Aprobado
7. Redirect a `http://localhost:3000/gracias` (success URL)

---

## 🎭 Probar Diferentes Estados de Pago

**Completa el estado deseado en el campo NOMBRE del titular:**

| Nombre | Estado | Descripción | Documento |
|--------|--------|-------------|-----------|
| **APRO** | `approved` | ✅ Pago aprobado | (CI) 12345678 o (otro) 123456789 |
| **OTHE** | `rejected` | ❌ Rechazado por error general | (CI) 12345678 o (otro) 123456789 |
| **CONT** | `pending` | ⏳ Pendiente de pago | - |
| **CALL** | `rejected` | 📞 Rechazado - validación para autorizar | - |
| **FUND** | `rejected` | 💰 Rechazado por importe insuficiente | - |
| **SECU** | `rejected` | 🔒 Rechazado por CVV inválido | - |
| **EXPI** | `rejected` | 📅 Rechazado por fecha vencimiento | - |
| **FORM** | `rejected` | 📝 Rechazado por error de formulario | - |

**Ejemplo de uso:**
- Nombre: `APRO` → Pago aprobado
- Nombre: `FUND` → Rechazado por fondos insuficientes

---

## 🔄 Estados de Pago

- **pending:** Esperando pago
- **approved:** ✅ Pagado exitosamente
- **rejected:** ❌ Rechazado
- **cancelled:** 🚫 Cancelado
- **in_process:** ⏳ En proceso

---

## 🌐 URLs

**Sandbox Checkout:**
https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=TEST-xxxxx

**Webhook Local (con ngrok):**
https://abc123.ngrok.io/api/webhooks/mercadopago

**Webhook Producción:**
https://laaldeatala.com.uy/api/webhooks/mercadopago

---

## 📋 Comandos Útiles

### ⭐ Método Recomendado: test-mp.js

```bash
node test-mp.js
```

Crea preferencia y devuelve URL lista para testear.

---

### Test crear preferencia con curl (Alternativo)

```bash
curl -X POST https://api.mercadopago.com/checkout/preferences \
  -H "Authorization: Bearer APP_USR-7323296378728809-011616-38fa5c7c42e15d2b1e08cb2c61fd9c07-3139064037" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "title": "Bomba de Agua 1HP (Prueba)",
        "quantity": 1,
        "unit_price": 100,
        "currency_id": "UYU"
      }
    ],
    "payer": {
      "email": "test_user_123456@testuser.com"
    },
    "back_urls": {
      "success": "http://localhost:3000/gracias",
      "failure": "http://localhost:3000/error",
      "pending": "http://localhost:3000/pendiente"
    },
    "auto_return": "approved",
    "external_reference": "TEST-ORDER-001"
  }'
```

### Levantar ngrok (para webhooks en local)

```bash
ngrok http 3000
```

### Verificar respuesta de preferencia

Después de ejecutar el curl, deberías ver:

```json
{
  "id": "1234567890-abc123",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  ...
}
```

**Copiar el `sandbox_init_point` y pegarlo en el navegador para probar el pago.**

---

## 🔍 Troubleshooting

### Problema: Tarjetas de prueba no funcionan
**Solución:** Usar "dinero disponible" del usuario de prueba en lugar de tarjetas. El sandbox de Uruguay tiene inconsistencias con tarjetas pero el método de saldo siempre funciona.

### Problema: Error "auto_return invalid"
**Solución:** Remover el campo `auto_return` temporalmente de la preferencia, o asegurarse que las `back_urls` sean válidas y accesibles.

### Problema: Error "una de las partes es de prueba"
**Explicación:** Esto es **normal** en sandbox. Significa que estás usando credenciales y usuarios de prueba correctamente. No indica error.

### Problema: PowerShell da error con curl
**Solución:** Usar `test-mp.js` en lugar de curl. PowerShell tiene problemas con las comillas en comandos curl complejos.

---

## 📝 Notas Importantes

1. **Uruguay sandbox:** Comportamiento diferente a otros países
   - Credenciales usan `APP_USR-` (no `TEST-`)
   - Tarjetas de prueba poco confiables
   - Método recomendado: "dinero disponible"

2. **Usuarios de prueba:** Siempre usar usuarios creados en el panel (TESTUSER3327/TESTUSER5624)

3. **Mensajes "de prueba":** Son esperados en sandbox, no son errores

4. **Redirect URLs:** Deben ser accesibles. Para local usar `http://localhost:3000/...`

5. **External reference:** Usar para relacionar el pago con el pedido en tu DB (ej: `ORDER-${orderId}`)
