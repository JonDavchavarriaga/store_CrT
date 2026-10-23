-- ==============================================================================
-- CHICA ROSA - DATOS SEMILLA (SEED) PARA SUPABASE
-- Inserta categorías iniciales y productos de demostración claramente marcados
-- ==============================================================================

-- 1. Insertar Categorías Iniciales
INSERT INTO public.categories (id, name, slug, is_active, display_order)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Vestidos', 'vestidos', true, 1),
    ('c0000000-0000-0000-0000-000000000002', 'Blusas y Tops', 'blusas-y-tops', true, 2),
    ('c0000000-0000-0000-0000-000000000003', 'Accesorios', 'accesorios', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insertar Productos de Demostración (Claramente etiquetados como [DEMO])
INSERT INTO public.products (
    id,
    name,
    slug,
    reference,
    description,
    price_cop,
    compare_at_price_cop,
    category_id,
    image_urls,
    is_active,
    is_available,
    is_featured
)
VALUES
    (
        'p0000000-0000-0000-0000-000000000001',
        '[DEMO] Vestido Rosa Palo Elegance',
        'demo-vestido-rosa-palo-elegance',
        'CR-VES-001',
        'Vestido midi con caída suave, escote sutil y detalle en cintura. Ideal para ocasiones especiales o eventos de día.',
        89000,
        110000,
        'c0000000-0000-0000-0000-000000000001',
        ARRAY[
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg'
        ],
        true,
        true,
        true
    ),
    (
        'p0000000-0000-0000-0000-000000000002',
        '[DEMO] Blusa Soft Blossom Delicada',
        'demo-blusa-soft-blossom-delicada',
        'CR-BLU-002',
        'Blusa en tela fresca y transpirable con detalles en mangas y tonalidad rosa pastel. Confortable y versátil.',
        54000,
        NULL,
        'c0000000-0000-0000-0000-000000000002',
        ARRAY[
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg'
        ],
        true,
        true,
        true
    ),
    (
        'p0000000-0000-0000-0000-000000000003',
        '[DEMO] Cartera Compacta Rose Kiss',
        'demo-cartera-compacta-rose-kiss',
        'CR-ACC-003',
        'Bolso bandolera de acabado liso con broche dorado y compartimientos interiores prácticos.',
        68000,
        79000,
        'c0000000-0000-0000-0000-000000000003',
        ARRAY[
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg'
        ],
        true,
        true,
        false
    ),
    (
        'p0000000-0000-0000-0000-000000000004',
        '[DEMO] Vestido Flores Lavanda',
        'demo-vestido-flores-lavanda',
        'CR-VES-004',
        'Estampado floral sutil sobre fondo lavanda, tela ligera con forro interno. Ajuste cómodo.',
        95000,
        NULL,
        'c0000000-0000-0000-0000-000000000001',
        ARRAY[
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg'
        ],
        true,
        false, -- Agotado para probar feedback en frontend
        false
    ),
    (
        'p0000000-0000-0000-0000-000000000005',
        '[DEMO] Top Satinado Pink Carnation',
        'demo-top-satinado-pink-carnation',
        'CR-BLU-005',
        'Top de tirantes finos ajustables con caída fluida. Tejido sedoso y fácil de combinar.',
        42000,
        49000,
        'c0000000-0000-0000-0000-000000000002',
        ARRAY[
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg'
        ],
        true,
        true,
        true
    ),
    (
        'p0000000-0000-0000-0000-000000000006',
        '[DEMO] Set Aretes y Collar Perlas Rosa',
        'demo-set-aretes-collar-perlas-rosa',
        'CR-ACC-006',
        'Conjunto delicado hipoalergénico con baño dorado y cuentas en tonalidad cuarzo rosa.',
        36000,
        NULL,
        'c0000000-0000-0000-0000-000000000003',
        ARRAY[
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg',
            '/images/placeholders/product-placeholder.svg'
        ],
        true,
        true,
        false
    )
ON CONFLICT (slug) DO NOTHING;
