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
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          {...({
            initial: { opacity: 0, backdropFilter: 'blur(0px)' },
            animate: { opacity: 1, backdropFilter: 'blur(8px)' },
            exit: { opacity: 0, backdropFilter: 'blur(0px)' },
            transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
          } as any)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
          onClick={onClose}
        >
          <motion.div
            {...({
              initial: { scale: 0.85, opacity: 0, y: 40 },
              animate: {
                scale: 1,
                opacity: 1,
                y: 0,
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8
                }
              },
              exit: {
                scale: 0.9,
                opacity: 0,
                y: 20,
                transition: {
                  duration: 0.2,
                  ease: [0.4, 0, 1, 1]
                }
              }
            } as any)}
            className={`
              relative
              bg-slate-800/40
              backdrop-blur-3xl
              rounded-2xl
              shadow-2xl
              text-slate-200
              border border-slate-600/30
              flex flex-col
              max-h-[90vh]
              ${getSizeClass()}
              before:absolute
              before:inset-0
              before:rounded-2xl
              before:bg-gradient-to-br
              before:from-cyan-500/10
              before:via-transparent
              before:to-blue-500/10
              before:pointer-events-none
              after:absolute
              after:inset-0
              after:rounded-2xl
              after:bg-gradient-to-t
              after:from-slate-900/50
              after:to-transparent
              after:pointer-events-none
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div
              {...({
                initial: { opacity: 0, y: -10 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.1, duration: 0.3 }
              } as any)}
              className="relative z-10 flex items-center justify-between p-4 border-b border-slate-700/50 backdrop-blur-sm"
            >
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {title}
              </h2>
              <div className="flex items-center gap-2">
                {headerControls}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Icon name="x" className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              {...({
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.15, duration: 0.3 }
              } as any)}
              className="relative z-10 p-6 flex-1 overflow-y-auto"
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};