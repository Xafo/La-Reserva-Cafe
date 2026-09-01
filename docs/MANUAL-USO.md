# Manual de uso — LA RESERVA

## Acceso al panel

1. Abrir `<dominio>/admin/login`.
2. Iniciar sesión con el correo y contraseña de equipo.
3. El menú muestra solamente los módulos asignados al rol.

| Rol | Accesos |
| --- | --- |
| Administrador | Todos los módulos y usuarios. |
| Compras | Productos, calidad, órdenes y clientes/proveedores. |
| Ventas | Órdenes, clientes/proveedores y reportes. |
| Supervisor | Productos, calidad, órdenes, clientes/proveedores y reportes. |

Cerrar sesión al terminar, especialmente en equipos compartidos.

## Operación diaria

### Productos y calidad

- En **Productos**, crear un producto con sus datos comerciales, inventario,
  información de calidad y una imagen JPG, PNG o WebP.
- Verificar que precio, presentación y stock estén correctos antes de dejarlo
  activo en catálogo.
- En **Calidad**, seleccionar el producto y actualizar la ficha de variedad,
  altura, humedad, cosecha, productor, puntaje y grado.

### Órdenes

- En **Órdenes**, crear una orden indicando el cliente, uno o varios productos
  y las cantidades.
- Cambiar el estado conforme avance: Pendiente, Aprobada, Cancelada o
  Finalizada.
- Usar el botón de PDF en cada orden cuando se requiera una copia imprimible.

### Clientes, proveedores y usuarios

- En **Clientes y proveedores**, crear o editar el registro y seleccionar su
  tipo correcto.
- Solamente Administrador puede invitar, editar roles o desactivar miembros
  desde **Usuarios y roles**. No compartir cuentas: crear una por persona.

### Reportes y seguimiento

- **Reportes** permite descargar la información disponible en PDF o Excel.
- El **Dashboard** muestra indicadores, órdenes recientes, inventario bajo y
  actividad registrada por las acciones del equipo.

## Tienda y cuentas de clientes

- El visitante puede explorar la tienda, agregar productos al carrito y enviar
  una orden sin pasarela de pago; el pago se coordina fuera del portal.
- En **Crear cuenta**, el cliente completa sus datos y preferencias para
  recibir una recomendación. Desde **Cuenta** puede revisar y editar sus
  preferencias.

## Incidencias y seguridad

- No enviar contraseñas por chat o correo. Un Administrador crea o ajusta
  accesos desde el panel.
- Registrar producto, orden o usuario afectado y la hora al reportar una
  incidencia.
- La recuperación por correo queda pendiente de la configuración SMTP de
  producción. Hasta entonces, un Administrador debe gestionar el acceso de
  manera controlada.
