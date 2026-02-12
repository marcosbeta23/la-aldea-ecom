'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

interface ParsedProduct {
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price_numeric: string;
  currency: string;
  stock: string;
  is_active: string;
  [key: string]: string;
}

const REQUIRED_COLUMNS = ['sku', 'name', 'price_numeric'];
const EXPECTED_COLUMNS = ['sku', 'name', 'description', 'category', 'brand', 'price_numeric', 'currency', 'stock', 'is_active'];

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

  // Parse rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').trim();
    });
    // Skip completely empty rows
    if (Object.values(row).some(v => v)) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

// Handle CSV with quoted fields (commas inside quotes)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedProduct[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');
    setResult(null);

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Solo se aceptan archivos .csv');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers: parsedHeaders, rows } = parseCSV(text);

      // Validate required columns
      const missing = REQUIRED_COLUMNS.filter(col => !parsedHeaders.includes(col));
      if (missing.length > 0) {
        setError(`Columnas requeridas faltantes: ${missing.join(', ')}`);
        return;
      }

      setFile(selectedFile);
      setHeaders(parsedHeaders);
      setPreview(rows.slice(0, 10) as ParsedProduct[]);
    };
    reader.readAsText(selectedFile, 'utf-8');
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError('');
    setResult(null);

    try {
      const text = await file.text();
      const { rows } = parseCSV(text);

      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: rows }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error en la importación');
      }

      setResult(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const csvContent = [
      EXPECTED_COLUMNS.join(','),
      'BOMBA-001,Bomba Centrífuga 1HP,Bomba centrífuga para riego,Bombas,Gianni,15000,UYU,10,True',
      'FILT-001,Filtro Disco 2",Filtro de disco para riego por goteo,Filtros,Hidroservice,85,USD,5,True',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Importar Productos (CSV)</h1>
            <p className="text-slate-500 text-sm mt-1">
              Cargá productos masivamente desde un archivo CSV
            </p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Descargar plantilla
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">Formato del CSV</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Columnas requeridas:</strong> sku, name, price_numeric</p>
          <p><strong>Columnas opcionales:</strong> description, category, brand, currency (UYU/USD), stock, is_active, shipping_type, weight_kg</p>
          <p><strong>Moneda:</strong> Si no se especifica, se usa UYU por defecto</p>
          <p><strong>Imágenes:</strong> Se agregan después desde el panel de edición del producto</p>
          <p><strong>SKUs duplicados:</strong> Se omiten automáticamente (no se sobreescriben)</p>
        </div>
      </div>

      {/* File Upload */}
      {!result && (
        <div
          onClick={() => !importing && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
            ${file ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
            ${importing ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <FileSpreadsheet className="h-12 w-12 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{file.name}</p>
                <p className="text-sm text-green-700">{preview.length > 0 ? `${preview.length}+ productos encontrados` : 'Procesando...'}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="text-sm text-slate-500 hover:text-red-600 underline"
              >
                Cambiar archivo
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-12 w-12 text-slate-400" />
              <div>
                <p className="font-medium text-slate-700">Arrastrá un archivo CSV o hacé click para seleccionar</p>
                <p className="text-sm text-slate-400 mt-1">Solo archivos .csv · Máximo 500 productos por importación</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && !result && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Vista previa (primeros 10)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['SKU', 'Nombre', 'Categoría', 'Marca', 'Precio', 'Moneda', 'Stock'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-xs">{row.sku}</td>
                    <td className="px-4 py-2 max-w-[200px] truncate">{row.name}</td>
                    <td className="px-4 py-2">{row.category || '—'}</td>
                    <td className="px-4 py-2">{row.brand || '—'}</td>
                    <td className="px-4 py-2 font-medium">
                      {(row.currency || 'UYU') === 'USD' ? 'US$' : '$'}{parseFloat(row.price_numeric || '0').toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        (row.currency || 'UYU') === 'USD' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {row.currency || 'UYU'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{row.stock || '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Import Button */}
      {file && !result && (
        <button
          onClick={handleImport}
          disabled={importing}
          className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {importing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Importando productos...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Importar productos
            </>
          )}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900">Importación completada</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-700">{result.created}</p>
                <p className="text-sm text-green-600">Productos creados</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-amber-700">{result.skipped}</p>
                <p className="text-sm text-amber-600">Omitidos</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  Detalles ({result.errors.length} avisos):
                </h4>
                <div className="max-h-48 overflow-y-auto bg-slate-50 rounded-lg p-3 space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-slate-600">{err}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Importar más productos
            </button>
            <Link
              href="/admin/products"
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              Ver productos → Agregar imágenes
            </Link>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h3 className="font-medium text-slate-700 mb-2">💡 Workflow recomendado</h3>
        <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
          <li>Importá todos los productos desde CSV (precios + datos básicos)</li>
          <li>Andá a la lista de productos</li>
          <li>Editá cada producto para agregar imágenes (drag & drop)</li>
          <li>Marcá los destacados y configurá envíos</li>
        </ol>
      </div>
    </div>
  );
}
