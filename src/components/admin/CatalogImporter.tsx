import React, { useState } from 'react';
import type { Product, Category } from '../../types/product';
import { catalogService } from '../../services/catalogService';
import { Upload, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface CatalogImporterProps {
  categories: Category[];
  onImportCompleted: () => void;
}

interface RowValidationResult {
  row: number;
  data: Partial<Product>;
  isValid: boolean;
  errors: string[];
}

export const CatalogImporter: React.FC<CatalogImporterProps> = ({ categories, onImportCompleted }) => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<RowValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Plantilla CSV de ejemplo para descargar o copiar
  const csvTemplate = `name,reference,description,price_cop,compare_at_price_cop,category_id,image_1,image_2,image_3,image_4,is_active,is_available,is_featured
Vestido Floral Rosa,CR-VES-010,Vestido con estampado primaveral,85000,105000,${categories[0]?.id || 'cat-vestidos-01'},/images/placeholders/product-placeholder.svg,,,true,true,true
Blusa Elegance Blanco,CR-BLU-011,Blusa de seda delicada,52000,,${categories[1]?.id || 'cat-blusas-02'},/images/placeholders/product-placeholder.svg,,,true,true,false`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_catalogo_chica_rosa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleValidate = () => {
    setSuccessMessage(null);
    if (!inputText.trim()) {
      setResults([]);
      return;
    }

    const lines = inputText.trim().split(/\r?\n/);
    if (lines.length <= 1) {
      alert('El texto debe incluir una fila de cabecera y al menos una fila de datos.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const validationList: RowValidationResult[] = [];
    const seenRefs = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim());
      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = cols[idx] ?? '';
      });

      const errors: string[] = [];
      const name = rowObj['name'] || '';
      const reference = rowObj['reference'] || '';
      const priceStr = rowObj['price_cop'] || '';
      const compareStr = rowObj['compare_at_price_cop'] || '';
      const catId = rowObj['category_id'] || categories[0]?.id || '';

      if (!name) {
        errors.push('El nombre es obligatorio.');
      }

      if (reference) {
        if (seenRefs.has(reference)) {
          errors.push(`Referencia duplicada en esta importación (${reference}).`);
        } else {
          seenRefs.add(reference);
        }
      }

      const price = parseInt(priceStr, 10);
      if (isNaN(price) || price < 0) {
        errors.push(`Precio COP inválido (${priceStr}). Debe ser entero no negativo.`);
      }

      let comparePrice: number | null = null;
      if (compareStr) {
        comparePrice = parseInt(compareStr, 10);
        if (isNaN(comparePrice) || comparePrice <= price) {
          errors.push(`Precio anterior (${compareStr}) debe ser mayor que el precio de venta (${price}).`);
        }
      }

      // Reunir hasta 4 imágenes
      const images: string[] = [];
      ['image_1', 'image_2', 'image_3', 'image_4'].forEach((key) => {
        if (rowObj[key]) images.push(rowObj[key]);
      });

      const parsedProduct: Partial<Product> = {
        name,
        reference: reference || null,
        description: rowObj['description'] || '',
        price_cop: price,
        compare_at_price_cop: comparePrice,
        category_id: catId,
        image_urls: images.length > 0 ? images : ['/images/placeholders/product-placeholder.svg'],
        is_active: rowObj['is_active'] ? rowObj['is_active'].toLowerCase() === 'true' : true,
        is_available: rowObj['is_available'] ? rowObj['is_available'].toLowerCase() === 'true' : true,
        is_featured: rowObj['is_featured'] ? rowObj['is_featured'].toLowerCase() === 'true' : false,
      };

      validationList.push({
        row: i,
        data: parsedProduct,
        isValid: errors.length === 0,
        errors,
      });
    }

    setResults(validationList);
  };

  const handleApplyImport = async () => {
    const validRows = results.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('No hay filas válidas para importar.');
      return;
    }

    setIsProcessing(true);
    let count = 0;
    for (const r of validRows) {
      const res = await catalogService.saveProduct(r.data);
      if (res.success) count++;
    }
    setIsProcessing(false);

    setSuccessMessage(`Se importaron exitosamente ${count} productos al catálogo.`);
    setInputText('');
    setResults([]);
    onImportCompleted();
  };

  const validCount = results.filter((r) => r.isValid).length;
  const errorCount = results.filter((r) => !r.isValid).length;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--space-8)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)' }}>
            Importador Masivo de Catálogo (CSV)
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            Carga o actualiza múltiples productos a la vez validando campos y precios antes de guardar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="btn btn-secondary"
          style={{ fontSize: 'var(--font-size-xs)', padding: '6px 12px' }}
        >
          <Download size={14} />
          <span>Descargar Plantilla CSV</span>
        </button>
      </div>

      {successMessage && (
        <div
          role="alert"
          style={{
            backgroundColor: '#EBF8F1',
            color: 'var(--text-success)',
            border: '1px solid #BFEAD3',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Área de texto CSV */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '4px' }}>
          Pega el contenido CSV aquí:
        </label>
        <textarea
          className="form-input"
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`name,reference,description,price_cop,compare_at_price_cop,category_id,image_1,image_2,image_3,image_4,is_active,is_available,is_featured\n...`}
          style={{ fontFamily: 'monospace', fontSize: '12px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleValidate}
          disabled={!inputText.trim()}
          style={{ fontSize: 'var(--font-size-xs)' }}
        >
          <FileText size={14} />
          <span>Validar y Previsualizar</span>
        </button>

        {results.length > 0 && validCount > 0 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleApplyImport}
            disabled={isProcessing}
            style={{ fontSize: 'var(--font-size-xs)' }}
          >
            <Upload size={14} />
            <span>
              {isProcessing ? 'Importando...' : `Confirmar e Importar (${validCount} productos válidos)`}
            </span>
          </button>
        )}
      </div>

      {/* Resultados de validación */}
      {results.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
            <span style={{ color: 'var(--text-success)', fontWeight: 'bold' }}>
              ✓ {validCount} filas válidas
            </span>
            {errorCount > 0 && (
              <span style={{ color: 'var(--text-danger)', fontWeight: 'bold' }}>
                ✕ {errorCount} filas con errores (no se importarán)
              </span>
            )}
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {results.map((res) => (
              <div
                key={res.row}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                {res.isValid ? (
                  <CheckCircle size={14} style={{ color: 'var(--text-success)', flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={14} style={{ color: 'var(--text-danger)', flexShrink: 0 }} />
                )}
                <span>
                  <strong>Fila {res.row}:</strong> {res.data.name || 'Sin nombre'}
                  {res.data.reference && ` [${res.data.reference}]`}
                </span>
                {!res.isValid && (
                  <span style={{ color: 'var(--text-danger)', marginLeft: 'auto' }}>
                    {res.errors.join(' | ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
