#!/usr/bin/env python3
"""
CHICA ROSA - SCRIPT DE OPTIMIZACIÓN DE IMÁGENES POR PRODUCTO
--------------------------------------------------------------------------------
Este script procesa las 4 imágenes asociadas a cada producto:
1. Detecta archivos duplicados mediante hash criptográfico (SHA-256).
2. Redimensiona manteniendo la proporción original (Full: max 800x800, Thumb: max 300x300).
3. Convierte los archivos a WebP optimizado con compresión de alta calidad (calidad 82).
4. Guarda las imágenes optimizadas en `public/images/products/` con nombres predecibles:
   `[referencia-o-slug]-01.webp`, `[referencia-o-slug]-02.webp`, etc.
5. Genera un inventario JSON (`public/images/products/manifest.json`) para verificar el mapeo.
6. NUNCA sobrescribe los archivos originales fuente.

REQUISITOS:
    pip install Pillow

USO:
    python scripts/optimize-images.py --source ./raw_images --output ./public/images/products
"""

import os
import sys
import argparse
import hashlib
import json
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("\n[ERROR] Se requiere la librería 'Pillow' para procesar imágenes.")
    print("Instálala ejecutando: pip install Pillow\n")
    sys.exit(1)

SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'}

def calculate_sha256(filepath):
    """Calcula el hash SHA-256 de un archivo para detectar duplicados."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def clean_slug(text):
    """Normaliza un texto para usarlo de forma segura en nombres de archivo."""
    import re
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def optimize_image(source_path, target_path, max_size=(800, 800), quality=82):
    """Abre la imagen, corrige orientación EXIF, redimensiona y guarda en WebP."""
    with Image.open(source_path) as img:
        # Corregir orientación basada en EXIF si proviene de teléfono celular
        img = ImageOps.exif_transpose(img)
        
        # Convertir a RGBA si tiene transparencia, o RGB si no
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert('RGBA')
        else:
            img = img.convert('RGB')
        
        # Redimensionar conservando proporción si supera el tamaño máximo
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Guardar en WebP
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        img.save(target_path, 'WEBP', quality=quality, method=6)
        
        return os.path.getsize(target_path)

def process_catalog_images(source_dir, output_dir, max_images_per_product=4):
    source = Path(source_dir)
    output = Path(output_dir)
    
    if not source.exists():
        print(f"[ERROR] El directorio origen no existe: {source}")
        return

    output.mkdir(parents=True, exist_ok=True)

    print(f"\n=======================================================")
    print(f"CHICA ROSA — PROCESAMIENTO DE IMÁGENES A WEBP")
    print(f"Origen:  {source.resolve()}")
    print(f"Destino: {output.resolve()}")
    print(f"=======================================================\n")

    seen_hashes = {}
    manifest = {}
    total_processed = 0
    total_duplicates = 0
    original_total_bytes = 0
    optimized_total_bytes = 0

    # Agrupar archivos por carpeta de producto o prefijo
    # Estructura recomendada en origen:
    # raw_images/
    #   CR-VES-001/
    #     foto1.jpg, foto2.jpg, foto3.jpg, foto4.jpg
    # O archivos nombrados: CR-VES-001_1.jpg, CR-VES-001_2.jpg
    
    subdirs = [d for d in source.iterdir() if d.is_dir()]
    
    if subdirs:
        print(f"Detectadas {len(subdirs)} carpetas de productos.")
        for product_dir in sorted(subdirs):
            product_key = clean_slug(product_dir.name)
            manifest[product_key] = []
            
            image_files = [f for f in product_dir.iterdir() if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS]
            image_files.sort(key=lambda x: x.name)
            
            valid_index = 1
            for img_file in image_files:
                if valid_index > max_images_per_product:
                    print(f"  [AVISO] {product_key}: se superó el límite de {max_images_per_product} imágenes. Omitiendo {img_file.name}")
                    break
                
                # Comprobar duplicados
                file_hash = calculate_sha256(img_file)
                if file_hash in seen_hashes:
                    print(f"  [DUPLICADO] {img_file.name} es idéntico a {seen_hashes[file_hash]}. Omitiendo.")
                    total_duplicates += 1
                    continue
                
                seen_hashes[file_hash] = str(img_file)
                orig_size = img_file.stat().st_size
                original_total_bytes += orig_size
                
                # Nombre destino predecible
                target_filename = f"{product_key}-{valid_index:02d}.webp"
                target_path = output / target_filename
                
                new_size = optimize_image(img_file, target_path)
                optimized_total_bytes += new_size
                
                public_url = f"/images/products/{target_filename}"
                manifest[product_key].append(public_url)
                
                saving_pct = ((orig_size - new_size) / orig_size) * 100 if orig_size > 0 else 0
                print(f"  ✓ {target_filename}: {orig_size // 1024} KB -> {new_size // 1024} KB (Ahorro: {saving_pct:.1f}%)")
                
                valid_index += 1
                total_processed += 1
    else:
        # Si no hay subcarpetas, buscar todos los archivos planos
        print("Buscando imágenes en el directorio raíz origen...")
        all_files = [f for f in source.iterdir() if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS]
        for img_file in sorted(all_files):
            file_hash = calculate_sha256(img_file)
            if file_hash in seen_hashes:
                total_duplicates += 1
                continue
            seen_hashes[file_hash] = str(img_file)
            
            base_name = clean_slug(img_file.stem)
            target_filename = f"{base_name}.webp"
            target_path = output / target_filename
            
            orig_size = img_file.stat().st_size
            original_total_bytes += orig_size
            new_size = optimize_image(img_file, target_path)
            optimized_total_bytes += new_size
            
            manifest[base_name] = [f"/images/products/{target_filename}"]
            total_processed += 1

    # Guardar manifiesto de correspondencia
    manifest_path = output / "manifest.json"
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print("\n-------------------------------------------------------")
    print(f"RESUMEN DEL PROCESAMIENTO:")
    print(f"  Imágenes optimizadas a WebP: {total_processed}")
    print(f"  Duplicados detectados y omitidos: {total_duplicates}")
    if original_total_bytes > 0:
        total_saving_pct = ((original_total_bytes - optimized_total_bytes) / original_total_bytes) * 100
        print(f"  Peso original:  {original_total_bytes // 1024} KB")
        print(f"  Peso optimizado: {optimized_total_bytes // 1024} KB")
        print(f"  Ahorro total de transferencia: {total_saving_pct:.1f}%")
    print(f"  Manifiesto guardado en: {manifest_path}")
    print("-------------------------------------------------------\n")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Optimizador de imágenes WebP para Chica Rosa")
    parser.add_argument('--source', default='./raw_images', help="Directorio con imágenes originales")
    parser.add_argument('--output', default='./public/images/products', help="Directorio destino WebP")
    args = parser.parse_args()
    
    process_catalog_images(args.source, args.output)
