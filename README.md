# Nexautia E-commerce Template

Base privada y reutilizable para crear comercios electrónicos para distintos clientes.

## Estado actual

- Esquema inicial de Supabase con 20 tablas.
- Seguridad RLS activada en las tablas públicas.
- Contenido preparado para español (`es-ES`) y catalán (`ca-ES`).
- Separación entre datos comunes y traducciones.
- Estructura pensada para que cada cliente tenga su propio proyecto de Supabase.

## Estructura

```text
config/                 Configuración de ejemplo de una tienda
docs/                   Documentación funcional y técnica
supabase/migrations/    Plano SQL reproducible de la base de datos
.env.example            Variables necesarias, sin claves reales
```

## Seguridad

Nunca se deben guardar en GitHub contraseñas, claves `service_role`, archivos `.env`
reales ni datos privados de clientes. `.env.example` solo documenta los nombres de
las variables.

## Próximos pasos

1. Crear la aplicación web.
2. Conectarla al proyecto de desarrollo de Supabase.
3. Construir catálogo, ficha de producto y carrito.
4. Añadir autenticación y zona de cliente.
5. Integrar pagos mediante un proveedor como Stripe.

