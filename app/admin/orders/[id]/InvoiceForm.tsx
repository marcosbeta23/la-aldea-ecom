'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, CheckCircle, Upload, Mail, ExternalLink, X } from 'lucide-react';
import type { Order } from '@/types/database';

interface InvoiceFormProps {
  order: Order;
}

export default function InvoiceForm({ order }: InvoiceFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sendEmailToCustomer, setSendEmailToCustomer] = useState(true);
  
  const [invoiceData, setInvoiceData] = useState({
    invoice_number: order.invoice_number || '',
    invoice_type: order.invoice_type || 'consumer_final',
    invoice_tax_id: order.invoice_tax_id || '',
    invoice_business_name: order.invoice_business_name || '',
  });
  
  const canInvoice = ['paid_pending_verification', 'ready_to_invoice', 'paid'].includes(order.status);
  const isInvoiced = order.status === 'invoiced' || !!order.invoice_number;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Solo se permiten archivos PDF' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'El archivo debe ser menor a 5MB' });
        return;
      }
      setSelectedFile(file);
      setMessage(null);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoiceData.invoice_number.trim()) {
      setMessage({ type: 'error', text: 'El número de factura es obligatorio' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // Use FormData to support file upload
      const formData = new FormData();
      formData.append('invoice_number', invoiceData.invoice_number);
      formData.append('invoice_type', invoiceData.invoice_type);
      formData.append('invoice_tax_id', invoiceData.invoice_tax_id);
      formData.append('invoice_business_name', invoiceData.invoice_business_name);
      formData.append('send_email', sendEmailToCustomer ? 'true' : 'false');
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      const res = await fetch(`/api/admin/orders/${order.id}/upload-invoice`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar factura');
      }
      
      let successMsg = 'Factura registrada correctamente';
      if (data.email_sent) {
        successMsg += ' y enviada al cliente';
      }
      
      setMessage({ type: 'success', text: successMsg });
      router.refresh();
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        Facturación
      </h2>
      
      {/* Manual invoicing explanation */}
      {!isInvoiced && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
          <p className="text-slate-700">
            <strong>Proceso:</strong> Generá la factura en el sistema ERP/contable y luego registrá el número aquí para actualizar el estado del pedido.
          </p>
        </div>
      )}
      
      {isInvoiced && order.invoice_number && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-800">Factura emitida</p>
              <p className="text-sm text-green-600">N° {order.invoice_number}</p>
              {order.invoiced_at && (
                <p className="text-xs text-green-500">
                  {new Date(order.invoiced_at).toLocaleDateString('es-UY')}
                </p>
              )}
            </div>
          </div>
          {order.invoice_file_url && (
            <a
              href={order.invoice_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Ver/Descargar PDF
            </a>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tipo de comprobante
          </label>
          <select
            value={invoiceData.invoice_type}
            onChange={(e) => setInvoiceData({ ...invoiceData, invoice_type: e.target.value as 'consumer_final' | 'invoice_rut' })}
            disabled={isInvoiced}
            aria-label="Tipo de comprobante"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          >
            <option value="consumer_final">Consumidor Final (e-Ticket)</option>
            <option value="invoice_rut">Factura con RUT (e-Factura)</option>
          </select>
        </div>
        
        {/* RUT Fields - only show if invoice type is invoice_rut */}
        {invoiceData.invoice_type === 'invoice_rut' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                RUT del cliente
              </label>
              <input
                type="text"
                value={invoiceData.invoice_tax_id}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoice_tax_id: e.target.value })}
                disabled={isInvoiced}
                placeholder="Ej: 219999830019"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Razón social
              </label>
              <input
                type="text"
                value={invoiceData.invoice_business_name}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoice_business_name: e.target.value })}
                disabled={isInvoiced}
                placeholder="Nombre de la empresa"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
              />
            </div>
          </>
        )}
        
        {/* Invoice Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Número de factura / comprobante
          </label>
          <input
            type="text"
            value={invoiceData.invoice_number}
            onChange={(e) => setInvoiceData({ ...invoiceData, invoice_number: e.target.value })}
            disabled={isInvoiced}
            placeholder="Ej: A-0001-00012345"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            Ingresá el número del comprobante generado en tu ERP/sistema de facturación
          </p>
        </div>
        
        {/* File Upload */}
        {!isInvoiced && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Archivo PDF (opcional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="invoice-file"
            />
            
            {selectedFile ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium truncate max-w-45">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-blue-500">
                    ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="Quitar archivo"
                  aria-label="Quitar archivo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="invoice-file"
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Subir factura PDF
                </span>
              </label>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Máximo 5MB. Se guardará en el servidor y se podrá enviar al cliente.
            </p>
          </div>
        )}
        
        {/* Send Email Checkbox */}
        {!isInvoiced && order.customer_email && (
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={sendEmailToCustomer}
              onChange={(e) => setSendEmailToCustomer(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-700">
                Enviar factura al cliente por email
              </span>
            </div>
          </label>
        )}
        
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        {canInvoice && !isInvoiced && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Registrar Factura
              </>
            )}
          </button>
        )}
        
        {!canInvoice && !isInvoiced && (
          <p className="text-sm text-slate-500 text-center py-2">
            El pedido debe estar pagado para poder facturarlo
          </p>
        )}
      </form>
    </div>
  );
}
