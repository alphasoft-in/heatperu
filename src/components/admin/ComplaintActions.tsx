import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, X, FileText, CheckCircle, Clock, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Complaint {
  id: string;
  consumerName: string;
  documentType: string;
  documentNumber: string;
  address: string;
  phone: string;
  email: string;
  productType: string;
  amount: string;
  productDescription: string;
  complaintType: string;
  complaintDetail: string;
  consumerRequest: string;
  securityToken: string;
  status: string;
  resolutionType?: string | null;
  resolutionMessage?: string | null;
  createdAt: Date;
  resolvedAt?: Date | null;
}

export default function ComplaintActions({ complaint }: { complaint: Complaint }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(complaint.status);
  const [expanded, setExpanded] = useState({
    consumidor: true,
    bien: true,
    reclamacion: true,
    pedido: true
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const [isResolving, setIsResolving] = useState(false);
  const [resType, setResType] = useState('Fundado');
  const [resMessage, setResMessage] = useState('');

  const toggleModal = () => setIsOpen(!isOpen);

  const generatePDF = () => {
    const img = new Image();
    img.src = '/logoheat.avif'; // Assuming this is the logo in public
    
    img.onerror = () => {
      createPDF(); // Fallback if image fails to load
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        try {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const aspect = img.height / img.width;
          const logoWidth = 40; // width in mm
          const logoHeight = logoWidth * aspect;
          createPDF(imgData, logoWidth, logoHeight);
        } catch (e) {
          createPDF();
        }
      } else {
        createPDF();
      }
    };
  };

  const createPDF = (logoData?: string, logoW?: number, logoH?: number) => {
    const doc = new jsPDF();
    
    if (logoData && logoW && logoH) {
      doc.addImage(logoData, 'JPEG', 20, 15, logoW, logoH);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(240, 79, 35);
      doc.text('LIBRO DE RECLAMACIONES', 190, 24, { align: 'right' });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(`Hoja de Reclamación: Expediente N° ${complaint.id}`, 190, 30, { align: 'right' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${new Date(complaint.createdAt).toLocaleDateString()} ${new Date(complaint.createdAt).toLocaleTimeString()}`, 190, 36, { align: 'right' });
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(240, 79, 35);
      doc.text('LIBRO DE RECLAMACIONES', 105, 20, { align: 'center' });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text(`Expediente N° ${complaint.id}`, 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${new Date(complaint.createdAt).toLocaleString()}`, 105, 38, { align: 'center' });
    }
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
    
    let y = 55;
    
    const addSection = (title: string, data: Record<string, string>) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      // Draw Header Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, y - 5, 170, 10, 'FD');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(title, 23, y + 1.5);
      
      y += 10;
      
      doc.setFontSize(9);
      
      Object.entries(data).forEach(([key, value]) => {
        doc.setFont("helvetica", "bold");
        const keyText = `${key}:`;
        const isLongField = ['Sustento', 'Detalle', 'Pedido', 'Descripción'].includes(key);

        if (isLongField) {
          doc.setTextColor(100, 116, 139);
          doc.text(keyText, 25, y);
          y += 6;
          
          const valueLines = doc.splitTextToSize(value, 165);
          if (y + (valueLines.length * 5) > 280) {
            doc.addPage();
            y = 20;
            doc.setFont("helvetica", "bold");
          }
          
          doc.setFont("helvetica", "normal");
          doc.setTextColor(15, 23, 42);
          doc.text(valueLines, 25, y);
          y += (valueLines.length * 5) + 3;
        } else {
          const keyWidth = doc.getTextWidth(keyText);
          let startX = 70;
          
          if (25 + keyWidth + 5 > 70) {
            startX = 25 + keyWidth + 5;
          }

          const valueLines = doc.splitTextToSize(value, 195 - startX);
          if (y + (valueLines.length * 5) > 280) {
            doc.addPage();
            y = 20;
            doc.setFont("helvetica", "bold");
          }
          
          doc.setTextColor(100, 116, 139);
          doc.text(keyText, 25, y);
          
          doc.setFont("helvetica", "normal");
          doc.setTextColor(15, 23, 42);
          doc.text(valueLines, startX, y);
          
          y += (valueLines.length * 5) + 3;
        }
      });
      
      y += 5;
    };
    
    addSection('1. DATOS DEL CONSUMIDOR', {
      'Nombre': complaint.consumerName,
      'Documento': `${complaint.documentType} - ${complaint.documentNumber}`,
      'Email': complaint.email,
      'Teléfono': complaint.phone,
      'Dirección': complaint.address
    });
    
    addSection('2. DETALLE DEL BIEN CONTRATADO', {
      'Tipo': complaint.productType,
      'Monto': `S/ ${complaint.amount}`,
      'Descripción': complaint.productDescription
    });
    
    addSection('3. DETALLE DE LA RECLAMACIÓN Y PEDIDO', {
      'Tipo de Trámite': complaint.complaintType,
      'Detalle': complaint.complaintDetail,
      'Pedido': complaint.consumerRequest
    });

    if (complaint.status === 'Atendido') {
      const getBusinessDaysElapsed = (startDate: Date, endDate?: Date) => {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        let count = 0;
        let current = new Date(start);
        
        while (current < end) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
          }
          current.setDate(current.getDate() + 1);
        }
        return count;
      };

      const daysElapsed = complaint.resolvedAt ? getBusinessDaysElapsed(complaint.createdAt, complaint.resolvedAt) : getBusinessDaysElapsed(complaint.createdAt);
      const withinDeadline = daysElapsed <= 15 ? 'Sí' : 'No';

      addSection('4. RESOLUCIÓN DEL CASO', {
        'Estado': complaint.status,
        'Tipo de Resolución': complaint.resolutionType || '',
        'Fecha de Respuesta': complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleString() : new Date().toLocaleString(),
        'Fecha de Emisión del Documento': new Date().toLocaleString(),
        'Atendido en Plazo Legal (15 días hábiles)': withinDeadline,
        'Sustento': complaint.resolutionMessage || ''
      });
    } else {
      addSection('4. RESOLUCIÓN DEL CASO', {
        'Estado': complaint.status,
      });
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Token de Seguridad: ${complaint.securityToken}`, 20, 290);
      doc.text(`Página ${i} de ${totalPages}`, 190, 290, { align: 'right' });
    }

    const safeName = complaint.consumerName.replace(/[/\\?%*:|"<>]/g, '');
    doc.save(`Expediente_${complaint.id} - ${safeName} - ${complaint.documentNumber}.pdf`);
  };

  const updateStatus = async (newStatus: string, rType?: string, rMessage?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/reclamaciones/${complaint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          resolutionType: rType,
          resolutionMessage: rMessage
        })
      });
      
      if (res.ok) {
        setStatus(newStatus);
        setIsResolving(false);
        toast.success(`Estado actualizado a ${newStatus}`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error('Error al actualizar el estado');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de red');
    } finally {
      setIsUpdating(false);
    }
  };

  const submitResolution = () => {
    if (!resMessage.trim()) {
      toast.error('El argumento es obligatorio');
      return;
    }
    updateStatus('Atendido', resType, resMessage);
  };

  return (
    <>
      <button 
        onClick={generatePDF}
        className="text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer p-1.5 rounded-md transition-colors"
        title="Descargar PDF"
      >
        <Download size={16} />
      </button>
      <button 
        onClick={toggleModal}
        className="text-[#f04f23] bg-[#f04f23]/10 hover:bg-[#f04f23]/20 cursor-pointer p-1.5 rounded-md transition-colors"
        title="Ver detalles y gestionar"
      >
        <FileText size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl m-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-6 sm:py-4 border-b border-gray-100 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#f04f23] font-black text-xl">{complaint.id}</span>
                  <h3 className="text-lg font-bold text-slate-800">
                    {complaint.complaintType}
                  </h3>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  status === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  {status === 'Pendiente' ? <Clock size={12} /> : <CheckCircle size={12} />}
                  {status}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {status !== 'Atendido' && !isResolving && (
                    <button 
                      onClick={() => {
                        setIsResolving(true);
                        setExpanded({ consumidor: false, bien: false, reclamacion: true, pedido: false });
                      }}
                      disabled={isUpdating}
                      className="text-[12px] px-4 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm bg-slate-800 text-white hover:bg-slate-900 cursor-pointer"
                    >
                      <CheckCircle size={14} /> Atender Expediente
                    </button>
                  )}
                  {status !== 'Pendiente' && (
                    <button 
                      onClick={() => updateStatus('Pendiente')}
                      disabled={isUpdating}
                      className="bg-white border border-gray-200 text-slate-600 text-[12px] px-3 py-1.5 rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Clock size={14} /> Revertir
                    </button>
                  )}
                </div>
                {!isResolving && (
                  <>
                    <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
                    <button 
                      onClick={toggleModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5 text-left">

              {/* DATOS DEL CONSUMIDOR - ACORDEÓN */}
              <div className="mb-4">
                <button 
                  onClick={() => toggleSection('consumidor')}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider border-l-2 border-[#f04f23] pl-2 group-hover:text-[#f04f23] transition-colors">Datos del Consumidor</h4>
                  {expanded.consumidor ? <ChevronUp size={16} className="text-gray-400 group-hover:text-[#f04f23] transition-colors" /> : <ChevronDown size={16} className="text-gray-400 group-hover:text-[#f04f23] transition-colors" />}
                </button>
                
                {expanded.consumidor && (
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-100 mt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider min-w-[85px]">Nombre:</span> 
                        <span className="text-slate-800 font-medium">{complaint.consumerName}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider min-w-[85px]">Documento:</span> 
                        <span className="text-slate-800">{complaint.documentType} - {complaint.documentNumber}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider min-w-[85px]">Email:</span> 
                        <a href={`mailto:${complaint.email}`} className="text-[#f04f23] hover:underline font-medium">{complaint.email}</a>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider min-w-[85px]">Teléfono:</span> 
                        <a href={`tel:${complaint.phone}`} className="text-[#f04f23] hover:underline font-medium">{complaint.phone}</a>
                      </div>
                      <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider min-w-[85px] mt-0.5">Dirección:</span> 
                        <span className="text-slate-800 leading-snug">{complaint.address}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider min-w-[85px]">Fecha:</span> 
                        <span className="text-slate-800">{new Date(complaint.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DETALLE DEL BIEN - ACORDEÓN */}
              <div className="mb-4">
                <button 
                  onClick={() => toggleSection('bien')}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider border-l-2 border-[#f04f23] pl-2 group-hover:text-[#f04f23] transition-colors">Detalle del Bien</h4>
                  {expanded.bien ? <ChevronUp size={16} className="text-gray-400 group-hover:text-[#f04f23] transition-colors" /> : <ChevronDown size={16} className="text-gray-400 group-hover:text-[#f04f23] transition-colors" />}
                </button>
                
                {expanded.bien && (
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-100 mt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider min-w-[85px]">Tipo:</span> 
                        <span className="text-slate-800 font-medium">{complaint.productType}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider min-w-[85px]">Monto:</span> 
                        <span className="text-slate-800">S/ {complaint.amount}</span>
                      </div>
                      <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider min-w-[85px] mt-0.5">Descripción:</span> 
                        <span className="text-slate-800 leading-snug">{complaint.productDescription}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DETALLE DE LA RECLAMACIÓN Y PEDIDO - ACORDEÓN */}
              <div className="space-y-4">
                <div>
                  <button 
                    onClick={() => toggleSection('reclamacion')}
                    className="w-full flex items-center justify-between text-left group cursor-pointer"
                  >
                    <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider border-l-2 border-[#f04f23] pl-2 group-hover:text-[#f04f23] transition-colors">Detalle de la Reclamación</h4>
                    {expanded.reclamacion ? <ChevronUp size={16} className="text-gray-400 group-hover:text-[#f04f23] transition-colors" /> : <ChevronDown size={16} className="text-gray-400 group-hover:text-[#f04f23] transition-colors" />}
                  </button>
                  
                  {expanded.reclamacion && (
                    <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-100 text-[13px] text-gray-700 whitespace-pre-wrap max-h-[200px] overflow-y-auto leading-relaxed mt-3">
                      {complaint.complaintDetail}
                    </div>
                  )}
                </div>

                <div>
                  <button 
                    onClick={() => toggleSection('pedido')}
                    className="w-full flex items-center justify-between text-left group cursor-pointer"
                  >
                    <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider border-l-2 border-[#f04f23] pl-2 group-hover:text-[#f04f23] transition-colors">Pedido del Consumidor</h4>
                    {expanded.pedido ? <ChevronUp size={16} className="text-gray-400 group-hover:text-[#f04f23] transition-colors" /> : <ChevronDown size={16} className="text-gray-400 group-hover:text-[#f04f23] transition-colors" />}
                  </button>
                  
                  {expanded.pedido && (
                    <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-100 text-[13px] text-gray-700 whitespace-pre-wrap max-h-[200px] overflow-y-auto leading-relaxed mt-3">
                      {complaint.consumerRequest}
                    </div>
                  )}
                </div>
              </div>

              {/* EMITIR RESOLUCIÓN BLOCK (MOVED TO BOTTOM) */}
              {isResolving && (
                <div className="mt-6 p-4 sm:p-5 bg-slate-50/50 border border-gray-200 rounded-xl shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-[#f04f23]/10">
                        <FileText size={12} className="text-[#f04f23]" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Emitir Resolución
                      </h4>
                    </div>
                    
                    <div className="flex gap-1.5 p-1 bg-gray-200/50 rounded-lg border border-gray-200/50">
                      <button
                        type="button"
                        onClick={() => setResType('Fundado')}
                        className={`py-1 px-3 rounded-md flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                          resType === 'Fundado' 
                            ? 'bg-white text-green-700 shadow-sm border border-green-200' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <CheckCircle size={12} className={resType === 'Fundado' ? 'text-green-600' : 'text-gray-400'} /> 
                        Fundado
                      </button>
                      <button
                        type="button"
                        onClick={() => setResType('Infundado')}
                        className={`py-1 px-3 rounded-md flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                          resType === 'Infundado' 
                            ? 'bg-white text-red-700 shadow-sm border border-red-200' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <X size={12} className={resType === 'Infundado' ? 'text-red-600' : 'text-gray-400'} /> 
                        Infundado
                      </button>
                    </div>
                  </div>

                  <div className="mt-1">
                    <textarea 
                      value={resMessage}
                      onChange={(e) => setResMessage(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-[#f04f23]/20 focus:border-[#f04f23] min-h-[90px] outline-none transition-all resize-none shadow-sm bg-white"
                      placeholder="Sustento Legal o Comercial: Redacte aquí los motivos de la decisión tomada..."
                    ></textarea>
                    
                    <div className="flex gap-2.5 justify-end mt-3">
                      <button 
                        onClick={submitResolution}
                        disabled={isUpdating || !resMessage.trim() || !resType}
                        className="px-4 py-1.5 text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors disabled:opacity-50 shadow-sm flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Guardar
                      </button>
                      <button 
                        onClick={() => {
                          setIsResolving(false);
                          setExpanded({ consumidor: true, bien: true, reclamacion: true, pedido: true });
                        }}
                        className="px-4 py-1.5 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 shadow-sm hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {status === 'Atendido' && (complaint.resolutionType || complaint.resolutionMessage) && (
                <div className="mt-4 sm:mt-6 bg-green-50/50 p-4 sm:p-5 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider border-l-2 border-green-600 pl-2 m-0 leading-none">Resolución del Reclamo</h4>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      complaint.resolutionType === 'Fundado' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {complaint.resolutionType || 'Atendido'}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-100/50 text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {complaint.resolutionMessage || 'Sin argumento proporcionado.'}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
