# Guía para crear una tienda de un nuevo cliente

Esta guía documenta la arquitectura y el procedimiento para que la instalación no dependa de la memoria ni de una conversación anterior.

## 1. Qué existe en este repositorio

- La tienda pública bilingüe en castellano y catalán.
- El panel comercial de cada tienda en `/es/admin/` y `/ca/admin/`.
- Las migraciones reutilizables de catálogo, inventario, clientes finales, pedidos y pagos.
- El panel interno de Nexautia en `/es/nexautia/` y `/ca/nexautia/`.
- La documentación de instalación y mantenimiento.

## 2. Separación obligatoria

El panel comercial administra una tienda concreta. El panel central administra la relación de Nexautia con todos sus clientes.

Las tablas `nexautia_clients`, `nexautia_client_stores` y `nexautia_control_users` son exclusivamente internas. **No deben copiarse al proyecto Supabase de un cliente.** Las tablas comerciales (`products`, `categories`, `orders`, etc.) sí forman parte de la plantilla reutilizable. El acceso central requiere pertenecer a `nexautia_control_users`; ser administrador de una tienda no concede ese permiso.

## 3. Situación durante las pruebas

Mientras no existan clientes reales, los clientes de demostración se guardan en el proyecto actual de Supabase. Son registros de prueba y no consumen proyectos adicionales. No crean automáticamente repositorios, dominios ni proyectos Supabase.

## 4. Alta de un cliente de prueba

1. Entrar en `/es/nexautia/` con un usuario incluido en `staff_users`.
2. Pulsar **Nuevo cliente**.
3. Completar nombre, correo y nombre de tienda.
4. Seleccionar idiomas y estado.
5. Guardar.
6. Verificar que el cliente aparece en el listado y puede activarse o desactivarse.

## 5. Alta de un cliente real

1. Crear o confirmar la cuenta de GitHub que será propietaria de la instalación.
2. Crear un repositorio nuevo a partir de esta plantilla.
3. Crear un proyecto Supabase en la cuenta del cliente, salvo acuerdo contractual distinto.
4. Aplicar únicamente las migraciones marcadas como reutilizables para tiendas.
5. No aplicar `202607190004_nexautia_control_panel.sql` en el proyecto del cliente.
6. Crear el usuario administrador del comercio y añadirlo a `staff_users` en su proyecto.
7. Configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` como secretos del repositorio o del entorno de publicación. Nunca subir claves reales al código.
8. Sustituir nombre comercial, logotipo, favicon, textos legales, contacto, dominio e idiomas.
9. Cargar productos y categorías del cliente.
10. Verificar seguridad, móvil, carrito, administración, SEO, GEO e idiomas antes de publicar.

## 6. Qué se copia y qué no

### Se copia a cada tienda

- Código de la tienda y del panel comercial.
- Migraciones `202607190001`, `202607190002` solo si se desean datos de demostración, y `202607190003`.
- Configuración de ejemplo sin secretos.
- Documentación técnica común.

### No se copia

- La migración `202607190004_nexautia_control_panel.sql`.
- Los clientes internos de Nexautia.
- Contraseñas, claves privadas, claves `service_role` o archivos `.env.local`.
- Datos, pedidos, usuarios o productos de otra empresa.

## 7. Modelo de costes y propiedad

Durante el desarrollo se utiliza el proyecto actual. Para un cliente real se recomienda que el proyecto Supabase esté en su propia cuenta. De este modo, sus límites, facturación y datos no consumen el plan de Nexautia y la separación es clara.

## 8. Comprobación final

- La tienda del cliente solo muestra sus propios datos.
- El panel comercial no permite acceder a otro cliente.
- El panel central de Nexautia no se ha instalado en el Supabase del cliente.
- Castellano y catalán no mezclan textos.
- Las credenciales no aparecen en GitHub.
- Las políticas RLS están activas.
- La web funciona en móvil y escritorio.
- Los metadatos SEO/GEO, políticas y datos comerciales son los del cliente.

## 9. Automatización futura

El botón de alta del panel central registra y organiza clientes. La creación automática de repositorios y proyectos Supabase será una fase posterior y requerirá integraciones autorizadas. Hasta entonces, la instalación real se realiza siguiendo esta guía para evitar altas accidentales o costes inesperados.
