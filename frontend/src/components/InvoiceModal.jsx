import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, ShoppingBag } from 'lucide-react';

export default function InvoiceModal({ 
  order, 
  onClose, 
  onAction, 
  onPrint, 
  showPaymentPrompt, 
  setShowPaymentPrompt 
}) {
  if (!order) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-[500px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] pointer-events-auto"
        >
          {/* Header - Invoice Style */}
          <div className="p-8 border-b-2 border-dashed border-[#EBE3D5] bg-white relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <Coffee className="w-6 h-6 text-[#8B5E3C]" />
                   <h1 className="text-2xl font-serif font-black text-[#412918] tracking-tight">SOCIETY CAFÉ</h1>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Good Food, Close to Home</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-black text-[#EBE3D5] leading-none mb-1">INVOICE</h2>
                <p className="text-xs font-bold text-[#8B5E3C]">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Bill To:</p>
                <p className="font-bold text-[#412918] text-base">{order.customer?.name || 'Walk-in Customer'}</p>
                <p className="text-gray-500 font-medium">Bldg {order.customer?.building || 'N/A'}, Flat {order.customer?.flat || 'N/A'}</p>
                <p className="text-gray-500 font-medium">📞 {order.customer?.phone || 'N/A'}</p>
              </div>
              <div className="text-right">
                <div className="mb-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider">Date & Time:</p>
                  <p className="font-bold text-[#412918]">{new Date(order.createdAt || order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs font-medium text-gray-500">{new Date(order.createdAt || order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider">Billing Mode:</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${order.order_type === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    {order.order_type} Order
                  </span>
                </div>
              </div>
            </div>


          </div>

          {/* Invoice Body */}
          <div className="flex-1 overflow-y-auto p-8 bg-white" id="invoice-content">
            <div className="w-full mb-6">
              <div className="flex text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
                <span className="flex-1">Description</span>
                <span className="w-16 text-center">Qty</span>
                <span className="w-24 text-right">Price</span>
                <span className="w-24 text-right">Total</span>
              </div>
              
              <div className="space-y-4">
                {order.items?.map(item => (
                  <div key={item.id} className="flex items-center text-sm">
                    <div className="flex-1">
                      <p className="font-bold text-[#412918]">{item.product?.name || 'Unknown Item'}</p>
                      <p className="text-[10px] text-gray-400">Unit Price: ₹{parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <span className="w-16 text-center font-bold text-gray-600">x{item.quantity}</span>
                    <span className="w-24 text-right font-medium text-gray-500">₹{parseFloat(item.price).toFixed(2)}</span>
                    <span className="w-24 text-right font-bold text-[#412918]">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-dashed border-[#EBE3D5] space-y-2">
               <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{parseFloat(order.total_price).toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                  <span>Service Charge (Included)</span>
                  <span>₹0.00</span>
               </div>
               <div className="flex justify-between items-center pt-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Payment Method:</p>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded ${order.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {order.payment_status === 'paid' ? `Paid via ${order.payment_method?.toUpperCase() || 'Online/Cash'}` : 'Payment Pending'}
                    </span>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-bold text-gray-400 uppercase mb-1">Grand Total</p>
                     <p className="text-3xl font-black text-[#8B5E3C]">₹{parseFloat(order.total_price).toFixed(2)}</p>
                  </div>
               </div>
            </div>

            {/* Actions Section (Conditional) */}
            <div className="mt-8 pt-6 border-t border-gray-100 print:hidden">
              {onAction && order.status === 'pending' && (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onAction(order.id, 'reject')}
                    className="py-3 rounded-xl font-bold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => onAction(order.id, 'accept')}
                    className="py-3 rounded-xl font-bold bg-green-500 text-white shadow-md hover:bg-green-600 transition-colors"
                  >
                    Accept Order
                  </button>
                </div>
              )}

              {onAction && order.status === 'accepted' && (
                <button 
                  onClick={() => setShowPaymentPrompt(true)}
                  className="w-full py-3 rounded-xl font-bold bg-[#8B5E3C] text-white shadow-md hover:bg-[#6c482e] transition-colors"
                >
                  Mark as Delivered
                </button>
              )}

              {(order.status === 'delivered' || order.status === 'rejected') && (
                <div className="flex flex-col gap-3">
                  <div className="text-center py-2 text-sm font-bold text-gray-500 uppercase">
                    Order is {order.status === 'delivered' ? 'Completed' : 'Cancelled'}
                  </div>
                  {onPrint && (
                    <button 
                      onClick={onPrint}
                      className="w-full py-3 rounded-xl font-bold bg-[#412918] text-white shadow-md hover:bg-[#2c1b10] transition-colors flex items-center justify-center gap-2"
                    >
                       Print Invoice
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="p-6 bg-[#412918] text-white text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Thank you for visiting Society Café</p>
          </div>
        </motion.div>
      </div>

      {/* Payment Prompt (Inner Modal) */}
      <AnimatePresence>
        {showPaymentPrompt && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPaymentPrompt(false)}
              className="fixed inset-0 bg-black/40 z-[150] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-white rounded-3xl shadow-2xl z-[160] overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-[#F5F1ED] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-[#8B5E3C]" />
                </div>
                <h3 className="text-xl font-bold text-[#412918] mb-2">Select Payment Method</h3>
                <p className="text-sm text-gray-500 mb-6">How did the customer pay for this order?</p>
                
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => onAction(order.id, 'deliver', { payment_method: 'online' })}
                    className="py-4 rounded-2xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex flex-col items-center gap-1"
                  >
                    <span className="text-lg">Online Payment</span>
                    <span className="text-[10px] opacity-80 uppercase tracking-widest">UPI / Card / App</span>
                  </button>
                  <button 
                    onClick={() => onAction(order.id, 'deliver', { payment_method: 'offline' })}
                    className="py-4 rounded-2xl font-bold bg-[#8B5E3C] text-white shadow-lg shadow-amber-200 hover:bg-[#6c482e] transition-all flex flex-col items-center gap-1"
                  >
                    <span className="text-lg">Cash / Offline</span>
                    <span className="text-[10px] opacity-80 uppercase tracking-widest">Collected at counter</span>
                  </button>
                  <button 
                    onClick={() => setShowPaymentPrompt(false)}
                    className="mt-2 py-2 text-sm font-bold text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
