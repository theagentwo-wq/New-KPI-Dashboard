import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'default' | 'large' | 'fullscreen';
  headerControls?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'default', headerControls }) => {
  const getSizeClass = () => {
    switch (size) {
      case 'large':
        return 'w-full max-w-4xl';
      case 'fullscreen':
        return 'w-screen h-screen max-w-none rounded-none';
      default:
        return 'w-full max-w-2xl';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`bg-slate-800/60 backdrop-blur-2xl rounded-lg shadow-2xl text-slate-200 border border-slate-600/80 flex flex-col ${getSizeClass()}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700/80">
              <h2 className="text-xl font-bold text-cyan-400">{title}</h2>
              <div className="flex items-center gap-2">
                {headerControls}
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                  <Icon name="x" className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};