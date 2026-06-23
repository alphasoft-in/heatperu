import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, X, FileText, CheckCircle, Clock } from 'lucide-react';

interface Complaint {
  id: number;
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
  status: string;
  createdAt: Date;
}

export default function ComplaintActions({ complaint }: { complaint: Complaint }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(complaint.status);

  const toggleModal = () => setIsOpen(!isOpen);

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/reclamaciones/${complaint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setStatus(newStatus);
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

  return (
    <>
      <button 
        onClick={toggleModal}
        className="text-[#f04f23] bg-[#f04f23]/10 hover:bg-[#f04f23]/20 p-1.5 rounded-md transition-colors"
        title="Ver detalles y gestionar"
      >
        <FileText size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-slate-800">
                Ticket #{complaint.id} - {complaint.complaintType}
              </h3>
              <button 
                onClick={toggleModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 text-left">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-[12px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Estado Actual</p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    status === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {status === 'Pendiente' ? <Clock size={14} /> : <CheckCircle size={14} />}
                    {status}
                  </div>
                </div>
                
                <div>
                  <p className="text-[12px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Acciones Rápidas</p>
                  <div className="flex gap-2">
                    {status !== 'Atendido' && (
                      <button 
                        onClick={() => updateStatus('Atendido')}
                        disabled={isUpdating}
                        className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <CheckCircle size={14} /> Marcar como Atendido
                      </button>
                    )}
                    {status !== 'Pendiente' && (
                      <button 
                        onClick={() => updateStatus('Pendiente')}
                        disabled={isUpdating}
                        className="bg-amber-500 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Clock size={14} /> Revertir a Pendiente
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider border-l-2 border-[#f04f23] pl-2">Datos del Consumidor</h4>
                  <ul className="space-y-3 text-sm">
                    <li><span className="font-semibold text-gray-600 block text-xs">Nombre:</span> {complaint.consumerName}</li>
                    <li><span className="font-semibold text-gray-600 block text-xs">Documento:</span> {complaint.documentType} - {complaint.documentNumber}</li>
                    <li><span className="font-semibold text-gray-600 block text-xs">Email:</span> <a href={`mailto:${complaint.email}`} className="text-[#f04f23] hover:underline">{complaint.email}</a></li>
                    <li><span className="font-semibold text-gray-600 block text-xs">Teléfono:</span> <a href={`tel:${complaint.phone}`} className="text-[#f04f23] hover:underline">{complaint.phone}</a></li>
                    <li><span className="font-semibold text-gray-600 block text-xs">Dirección:</span> {complaint.address}</li>
                    <li><span className="font-semibold text-gray-600 block text-xs">Fecha:</span> {new Date(complaint.createdAt).toLocaleString()}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider border-l-2 border-[#f04f23] pl-2">Detalle del Bien</h4>
                  <ul className="space-y-3 text-sm">
                    <li><span className="font-semibold text-gray-600 block text-xs">Tipo:</span> {complaint.productType}</li>
                    <li><span className="font-semibold text-gray-600 block text-xs">Monto Reclamado:</span> S/ {complaint.amount}</li>
                    <li><span className="font-semibold text-gray-600 block text-xs">Descripción:</span> {complaint.productDescription}</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider border-l-2 border-[#f04f23] pl-2">Detalle de la Reclamación</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                    {complaint.complaintDetail}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider border-l-2 border-[#f04f23] pl-2">Pedido del Consumidor</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                    {complaint.consumerRequest}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
