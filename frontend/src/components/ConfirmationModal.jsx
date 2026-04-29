import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ShoppingBag, CheckCircle2 } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Proceed",
  confirmColor = "bg-[#412918]",
  icon: Icon = AlertCircle
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-[#F5F1ED] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-[#8B5E3C]" />
                </div>
                <h3 className="text-2xl font-black text-[#412918] mb-3">{title}</h3>
                <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                  {message}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={onClose}
                    className="py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`py-4 rounded-2xl font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 ${confirmColor}`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
