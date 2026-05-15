import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  entityName: string; // The name/id the user must type
  confirmationPhrase?: string; // Optional second phrase, default "delete my [type]"
  entityType: string; // e.g. "course", "project"
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  entityName,
  confirmationPhrase,
  entityType
}) => {
  const [inputName, setInputName] = useState('');
  const [inputPhrase, setInputPhrase] = useState('');
  
  const targetPhrase = confirmationPhrase || `delete my ${entityType}`;
  const isConfirmed = inputName === entityName && inputPhrase === targetPhrase;

  useEffect(() => {
    if (isOpen) {
      setInputName('');
      setInputPhrase('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-[#0b1120]/60 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[2.5rem] p-8 lg:p-10 w-full max-w-lg shadow-[20px_20px_0px_#0b1120] border-[4px] border-[#0b1120]"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-black text-[#0b1120]">{title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent hover:border-[#0b1120]">
                <X className="w-6 h-6 text-[#0b1120]" />
              </button>
            </div>

            <p className="text-gray-500 font-bold mb-8 leading-relaxed">
              {description}
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  To confirm, type <span className="text-[#0b1120]">"{entityName}"</span>
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl focus:ring-[6px] ring-red-100 outline-none transition-all font-bold text-[#0b1120]"
                  placeholder={entityName}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  To confirm, type <span className="text-[#0b1120]">"{targetPhrase}"</span>
                </label>
                <input
                  type="text"
                  value={inputPhrase}
                  onChange={(e) => setInputPhrase(e.target.value)}
                  className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl focus:ring-[6px] ring-red-100 outline-none transition-all font-bold text-[#0b1120]"
                  placeholder={targetPhrase}
                />
              </div>

              <div className="bg-red-50 border-[3px] border-red-100 rounded-2xl p-5 flex gap-4 items-center">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                <p className="text-sm font-black text-red-600 uppercase tracking-tight">
                  Deleting {entityName} cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={onClose}
                className="flex-1 px-8 py-4 border-[3px] border-[#0b1120] rounded-2xl font-black text-[#0b1120] hover:bg-gray-50 transition-all shadow-[4px_4px_0px_#0b1120] hover:shadow-none translate-y-[-4px] hover:translate-y-0"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (isConfirmed) onConfirm();
                }}
                disabled={!isConfirmed}
                className={`flex-1 px-8 py-4 rounded-2xl font-black text-white transition-all border-[3px] border-[#0b1120] ${
                  isConfirmed 
                    ? 'bg-red-500 shadow-[4px_4px_0px_#0b1120] hover:shadow-none translate-y-[-4px] hover:translate-y-0 cursor-pointer' 
                    : 'bg-gray-300 border-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                Delete {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
