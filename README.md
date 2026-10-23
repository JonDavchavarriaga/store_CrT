# Chica Rosa — Tienda Virtual

Aplicación web para **Chica Rosa** (Colombia). Catálogo digital mobile-first con carrito de compras en pesos colombianos (COP), pedidos directos por WhatsApp y panel administrativo para actualización de productos y precios.

## Tecnologías

- **Frontend:** React 19, TypeScript, Vite
- **Estilos:** Vanilla CSS con Variables CSS y diseño adaptable mobile-first
- **Iconografía:** Lucide React
- **Base de Datos & Auth:** Supabase (PostgreSQL con Row Level Security)
- **Canal de Pedido:** WhatsApp Web / Móvil

## Comandos del Proyecto

```bash
# Instalación de dependencias
npm install --legacy-peer-deps

# Servidor de desarrollo local
npm run dev

# Compilación para producción
npm run build

# Ejecución de pruebas automatizadas
npm test

# Previsualización del bundle de producción
npm run preview
```

## Variables de Entorno

Configuradas mediante `.env` (referencia en `.env.example`):

- `VITE_SUPABASE_URL`: URL del proyecto de Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY` (o `VITE_SUPABASE_ANON_KEY`): Clave anónima pública de Supabase.
- `VITE_WHATSAPP_NUMBER`: Número internacional de WhatsApp para recibir pedidos (ej. `573114677311`).
- `VITE_STORE_NAME`: Nombre de la tienda (`Chica Rosa`).
- `VITE_STORE_CURRENCY`: Moneda oficial (`COP`).

## Estructura del Catálogo

- **Categorías:** Identificador, nombre, slug y orden de visualización.
- **Productos:** Nombre, referencia SKU, descripción, precio en COP, precio promocional anterior opcional, categoría, hasta 4 imágenes en formato WebP, estado de visibilidad y disponibilidad.

## Licencia

Todos los derechos reservados — Chica Rosa.
