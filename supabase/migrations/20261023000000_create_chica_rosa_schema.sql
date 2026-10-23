-- ==============================================================================
-- CHICA ROSA - ESQUEMA DE BASE DE DATOS POSTGRESQL (SUPABASE)
-- Migración inicial: Tablas, Índices, Políticas RLS y Triggers
-- ==============================================================================

-- 1. Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    reference TEXT UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    price_cop INTEGER NOT NULL CHECK (price_cop >= 0),
    compare_at_price_cop INTEGER CHECK (compare_at_price_cop IS NULL OR compare_at_price_cop > price_cop),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image_urls TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Índices para consultas públicas eficientes y rápidas
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price_cop);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- 5. Función y Trigger para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilitar RLS de forma obligatoria en ambas tablas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Políticas para categories:
-- - Lectura pública: Solo categorías activas para visitantes no autenticados (anon)
-- - Escritura: Exclusiva para usuarios autenticados (administradores)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Lectura publica de categorias activas" ON public.categories;
CREATE POLICY "Lectura publica de categorias activas"
    ON public.categories
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Escritura de categorias para administradores" ON public.categories;
CREATE POLICY "Escritura de categorias para administradores"
    ON public.categories
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- Políticas para products:
-- - Lectura pública: Solo productos activos para visitantes anónimos
-- - Escritura: Exclusiva para usuarios autenticados (administradores)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Lectura publica de productos activos" ON public.products;
CREATE POLICY "Lectura publica de productos activos"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Escritura de productos para administradores" ON public.products;
CREATE POLICY "Escritura de productos para administradores"
    ON public.products
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- 7. STORAGE DE IMÁGENES (Opcional para subidas desde el panel)
-- ==============================================================================
-- Crear bucket público para imágenes de productos si se utiliza almacenamiento en Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política de lectura pública de imágenes del bucket
DROP POLICY IF EXISTS "Lectura publica de imagenes" ON storage.objects;
CREATE POLICY "Lectura publica de imagenes"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'product-images');

-- Política de subida para administradores autenticados
DROP POLICY IF EXISTS "Subida de imagenes para administradores" ON storage.objects;
CREATE POLICY "Subida de imagenes para administradores"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
