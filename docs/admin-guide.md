# 📋 Guía del Panel de Administración - La Aldea

**Última actualización:** Enero 2026  
**Versión:** 1.0

---

## 🔐 Acceso al Panel

### URL de Acceso
```
https://tu-dominio.com/admin
```
En desarrollo: `http://localhost:3000/admin`

### Credenciales
- **Contraseña:** Solicitar a Enrique o al administrador del sistema
- ⚠️ **IMPORTANTE:** No compartir la contraseña por WhatsApp o email. Siempre en persona o llamada.

### Iniciar Sesión
1. Ir a `/admin/login`
2. Ingresar la contraseña
3. Click en "Acceder al Panel"
4. La sesión dura **24 horas**, después hay que volver a ingresar

### Cerrar Sesión
- Click en el botón **"Salir"** en el menú lateral (esquina inferior)
- ⚠️ Siempre cerrar sesión al terminar, especialmente en computadoras compartidas

---

## 📊 Dashboard (Página Principal)

Al entrar al panel, verás el **Dashboard** con información resumida:

### Tarjetas de Estadísticas
| Tarjeta | Qué significa |
|---------|---------------|
| **Pendientes** | Pedidos que esperan pago o confirmación |
| **Pagados** | Pedidos pagados listos para procesar |
| **Ingresos** | Total facturado (pedidos pagados, enviados, entregados) |
| **Productos** | Cantidad de productos activos en la tienda |

### Acciones Rápidas
- **Ver Pendientes:** Ir directo a pedidos pendientes
- **Gestionar Productos:** Ir al listado de productos
- **Ver Todos los Pedidos:** Listado completo de pedidos

### Pedidos Recientes
Tabla con los últimos 5 pedidos. Muestra:
- Número de pedido (ej: LA-2026-0001)
- Nombre del cliente
- Total
- Estado (con color)
- Fecha

---

## 📦 Gestión de Pedidos

### Acceder
Menu lateral → **"Pedidos"**

### Filtrar por Estado
Usa los botones de filtro arriba de la tabla:
- **Todos:** Ver todos los pedidos
- **Pendiente:** Esperando pago
- **Pagado:** Pago confirmado, listo para preparar
- **Procesando:** En preparación
- **Enviado:** Ya despachado
- **Entregado:** Completado
- **Cancelado:** Pedidos cancelados

### Columnas de la Tabla
| Columna | Descripción |
|---------|-------------|
| Pedido | Número único (ej: LA-2026-0015) |
| Cliente | Nombre del comprador |
| Pago | Método usado (MercadoPago o Transferencia) |
| Total | Monto total del pedido |
| Estado | Estado actual con color |
| Fecha | Cuándo se realizó |
| Acciones | Botón "Ver" para detalles |

### Ver Detalle de un Pedido
1. Click en **"Ver"** en la fila del pedido
2. Verás toda la información:
   - **Productos:** Lista de items comprados con cantidades y precios
   - **Cliente:** Nombre, teléfono, email
   - **Envío:** Dirección y tipo de envío
   - **Pago:** Método y IDs de MercadoPago (si aplica)

### Cambiar Estado de un Pedido
1. En el detalle del pedido, buscar la sección **"Estado del Pedido"**
2. Seleccionar el nuevo estado haciendo click en el botón correspondiente
3. Click en **"Guardar Cambios"**
4. ✅ Aparece mensaje de confirmación

### Flujo Normal de Estados
```
Pendiente → Pagado → Procesando → Enviado → Entregado
```

### Contactar al Cliente
En el detalle del pedido hay botones rápidos:
- **📱 WhatsApp:** Abre chat directo con el cliente
- **✉️ Email:** Abre el cliente de correo

---

## 🛍️ Gestión de Productos

### Acceder
Menu lateral → **"Productos"**

### Buscar Productos
- Usa el campo de búsqueda arriba de la tabla
- Busca por **nombre** o **SKU**
- La búsqueda es instantánea

### Columnas de la Tabla
| Columna | Descripción |
|---------|-------------|
| Producto | Imagen miniatura y nombre |
| SKU | Código único del producto |
| Categoría | Tipo de producto |
| Precio | Precio en UYU |
| Stock | Cantidad disponible (⚠️ amarillo si bajo) |
| Estado | Activo/Inactivo |
| Acciones | Ver en tienda, Editar |

### Crear Nuevo Producto
1. Click en **"+ Nuevo Producto"** (botón azul arriba a la derecha)
2. Completar el formulario:
   - **SKU:** Código único (ej: BOMBA-CENT-1HP) ⚠️ No se puede repetir
   - **Marca:** Opcional
   - **Nombre:** Nombre descriptivo del producto
   - **Descripción:** Descripción detallada
   - **Categoría:** Seleccionar de la lista
   - **Precio:** En pesos uruguayos
   - **Stock:** Cantidad disponible
   - **Imágenes:** Pegar URLs de imágenes (una por una)
   - **Producto activo:** Si está visible en la tienda
3. Click en **"Crear Producto"**

### Editar un Producto
1. Click en el ícono de **lápiz** en la fila del producto
2. Modificar los campos necesarios
3. Click en **"Guardar Cambios"**

### Agregar Imágenes
1. Pegar la URL de la imagen en el campo
2. Click en el botón **"+"**
3. La imagen aparece en la galería
4. La primera imagen es la **principal** (se muestra en listados)
5. Para eliminar una imagen, pasar el mouse sobre ella y click en la **X roja**

### Eliminar un Producto
1. Editar el producto
2. Scroll hasta abajo
3. Click en **"Eliminar Producto"** (botón rojo)
4. Confirmar en el diálogo

⚠️ **Nota:** Si el producto tiene pedidos asociados, no se elimina sino que se **desactiva** automáticamente.

---

## 🎫 Cupones (Próximamente)

Esta sección permitirá:
- Crear códigos de descuento
- Definir porcentaje o monto fijo
- Establecer fecha de vencimiento
- Ver cuántas veces se usó cada cupón

---

## ⭐ Reseñas (Próximamente)

Esta sección permitirá:
- Ver reseñas pendientes de aprobación
- Aprobar o rechazar reseñas
- Responder a clientes

---

## 📱 Tips de Uso

### Navegación Rápida
- El menú lateral está siempre visible
- Click en **"La Aldea Admin"** vuelve al Dashboard
- **"Ver tienda"** abre la tienda en otra pestaña

### Desde el Celular
- El panel es **responsive** (funciona en celular)
- El menú se oculta automáticamente
- Click en el ícono de menú (☰) para mostrarlo

### Recargar Datos
- Los datos se cargan **en tiempo real** del servidor
- Si algo no aparece, refrescar la página (F5)

---

## ⚠️ Preguntas Frecuentes

### ¿Qué hago si un cliente pagó pero aparece "Pendiente"?
1. Verificar en MercadoPago si el pago fue exitoso
2. Si está aprobado, cambiar estado manualmente a "Pagado"
3. El webhook debería hacerlo automático, pero a veces hay demoras

### ¿Puedo cambiar el precio de un producto con pedidos pendientes?
Sí, pero los pedidos ya realizados mantienen el precio original. Solo afecta a nuevos pedidos.

### ¿Qué pasa si borro un producto por error?
Si tiene pedidos, solo se desactiva. Contactar al desarrollador para reactivarlo.

### ¿Por qué no puedo ver ciertos pedidos?
Verificar los filtros de estado. Puede que esté filtrado por un estado específico.

### ¿Cómo sé si hay poco stock?
Los productos con stock bajo (menos de 5) aparecen con **fondo amarillo** en la columna de stock.

---

## 🆘 Soporte Técnico

Si hay problemas con el panel:

1. **Verificar conexión a internet**
2. **Refrescar la página** (F5)
3. **Limpiar caché** (Ctrl+Shift+R)
4. **Cerrar sesión y volver a entrar**

Si el problema persiste, contactar a:
- **Desarrollador:** [Agregar contacto]
- **Email técnico:** [Agregar email]

---

## 🔄 Historial de Cambios

| Fecha | Versión | Cambios |
|-------|---------|---------|
| Enero 2026 | 1.0 | Versión inicial - Dashboard, Pedidos, Productos |

---

*Este documento es confidencial y de uso interno de La Aldea.*
