# Arquitectura

Este repositorio contiene una plantilla comun para varios clientes.

Cada empresa utilizara su propia configuracion, catalogo, imagenes y proyecto de Supabase para no mezclar datos entre clientes.

## Idiomas

Los precios, el inventario y las relaciones se guardan una sola vez. Los textos traducibles se almacenan por separado con los codigos `es-ES` y `ca-ES`.

## Responsabilidades

- GitHub conserva el codigo, la documentacion y las migraciones SQL.
- Supabase conserva los datos reales y aplica las politicas de acceso.
- El proveedor de pagos procesa las tarjetas.

## Personalizacion

La marca, los colores, el logotipo, los idiomas, la moneda y el contacto se mantienen separados del codigo comun siempre que sea posible.
