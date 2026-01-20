-- ============================================
-- TEST PRODUCTS FOR LA ALDEA
-- Run this in Supabase SQL Editor to add test products
-- ============================================

-- Clear existing test products (optional)
-- DELETE FROM products WHERE sku LIKE 'TEST-%';

-- Insert 5 test products
INSERT INTO products (sku, name, description, category, brand, price_numeric, stock, images, is_active) VALUES
(
  'BOMBA-1HP',
  'Bomba Centrífuga 1 HP',
  'Bomba centrífuga de 1 HP para uso doméstico. Ideal para sistemas de riego y suministro de agua. Incluye motor eléctrico monofásico.',
  'Bombas',
  'Pedrollo',
  15000,
  10,
  ARRAY['https://placehold.co/600x400/png?text=Bomba+1HP'],
  true
),
(
  'BOMBA-2HP',
  'Bomba Centrífuga 2 HP',
  'Bomba centrífuga de 2 HP para uso industrial. Mayor caudal y presión. Motor trifásico.',
  'Bombas',
  'Pedrollo',
  25000,
  5,
  ARRAY['https://placehold.co/600x400/png?text=Bomba+2HP'],
  true
),
(
  'MANGUERA-25MM',
  'Manguera de Riego 25mm x 50m',
  'Manguera de PVC reforzada de 25mm de diámetro. Rollo de 50 metros. Resistente a la presión y rayos UV.',
  'Riego',
  'Plastimec',
  3500,
  20,
  ARRAY['https://placehold.co/600x400/png?text=Manguera+25mm'],
  true
),
(
  'ASPERSORES-KIT',
  'Kit de Aspersores (Pack x 6)',
  'Kit completo con 6 aspersores ajustables. Incluye conectores y abrazaderas. Radio de alcance regulable.',
  'Riego',
  'Gardena',
  2800,
  15,
  ARRAY['https://placehold.co/600x400/png?text=Kit+Aspersores'],
  true
),
(
  'TANQUE-500L',
  'Tanque de Agua 500 Litros',
  'Tanque de polietileno de alta densidad para almacenamiento de agua. Resistente a la intemperie. Color negro.',
  'Almacenamiento',
  'Rotoplas',
  8500,
  8,
  ARRAY['https://placehold.co/600x400/png?text=Tanque+500L'],
  true
);

-- Verify insertion
SELECT id, sku, name, price_numeric, stock FROM products WHERE sku IN (
  'BOMBA-1HP', 
  'BOMBA-2HP', 
  'MANGUERA-25MM', 
  'ASPERSORES-KIT', 
  'TANQUE-500L'
);
