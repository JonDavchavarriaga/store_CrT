#!/usr/bin/env node
/**
 * CHICA ROSA - VALIDADOR DE CATÁLOGO (NODE.JS)
 * --------------------------------------------------------------------------------
 * Valida la consistencia de archivos de catálogo CSV o JSON antes de publicarlos.
 * 
 * USO:
 *   node scripts/validate-catalog.mjs path/to/catalog.csv
 *   node scripts/validate-catalog.mjs path/to/catalog.json
 */

import fs from 'node:fs';
import path from 'node:path';

const filePath = process.argv[2];

if (!filePath) {
  console.log('\n[USO] node scripts/validate-catalog.mjs <archivo-catalogo.csv|json>\n');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`\n[ERROR] El archivo no existe: ${filePath}\n`);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf-8');
const isJSON = filePath.endsWith('.json');

let items = [];

if (isJSON) {
  try {
    items = JSON.parse(content);
    if (!Array.isArray(items)) {
      console.error('[ERROR] El archivo JSON debe contener un arreglo de productos.');
      process.exit(1);
    }
  } catch (err) {
    console.error('[ERROR] JSON inválido:', err.message);
    process.exit(1);
  }
} else {
  // Parse CSV
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) {
    console.error('[ERROR] El archivo CSV debe contener encabezados y al menos una fila.');
    process.exit(1);
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',').map((c) => c.trim());
    const obj = { _line: i + 1 };
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    items.push(obj);
  }
}

console.log(`\nValidando ${items.length} productos en ${path.basename(filePath)}...\n`);

let errorsFound = 0;
const seenReferences = new Set();

items.forEach((item, idx) => {
  const lineNum = item._line || idx + 1;
  const name = item.name;
  const reference = item.reference;
  const priceRaw = item.price_cop;
  const compareRaw = item.compare_at_price_cop;

  const itemErrors = [];

  if (!name || String(name).trim().length === 0) {
    itemErrors.push('Campo obligatorio "name" ausente.');
  }

  if (reference) {
    if (seenReferences.has(reference)) {
      itemErrors.push(`Referencia duplicada: "${reference}".`);
    } else {
      seenReferences.add(reference);
    }
  }

  const price = parseInt(priceRaw, 10);
  if (isNaN(price) || price < 0) {
    itemErrors.push(`Precio COP inválido: "${priceRaw}". Debe ser entero >= 0.`);
  }

  if (compareRaw) {
    const compare = parseInt(compareRaw, 10);
    if (isNaN(compare) || compare <= price) {
      itemErrors.push(`Precio promocional anterior "${compareRaw}" debe ser estrictamente mayor al precio actual (${price}).`);
    }
  }

  // Comprobar imágenes
  const images = [];
  ['image_1', 'image_2', 'image_3', 'image_4'].forEach((k) => {
    if (item[k]) images.push(item[k]);
  });
  if (Array.isArray(item.image_urls)) {
    images.push(...item.image_urls);
  }

  if (images.length > 4) {
    itemErrors.push(`Tiene ${images.length} imágenes. El máximo permitido es 4.`);
  }

  if (itemErrors.length > 0) {
    errorsFound += itemErrors.length;
    console.error(`  ✕ [Fila/Índice ${lineNum}] ${name || '(Sin nombre)'}:`);
    itemErrors.forEach((err) => console.error(`      - ${err}`));
  }
});

console.log('\n-------------------------------------------------------');
if (errorsFound === 0) {
  console.log(`✓ VALIDACIÓN EXITOSA: Los ${items.length} productos cumplen con todas las reglas de negocio.`);
  console.log('-------------------------------------------------------\n');
  process.exit(0);
} else {
  console.error(`✕ SE ENCONTRARON ${errorsFound} ERRORES. Corrige los campos indicados antes de importar.`);
  console.log('-------------------------------------------------------\n');
  process.exit(1);
}
