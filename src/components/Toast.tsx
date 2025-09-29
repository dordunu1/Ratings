import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 3000 }) => {
  const { } = useTheme();
  
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`backdrop-blur-md rounded-lg p-4 border max-w-sm animate-in slide-in-from-right`} style={{backgroundColor: 'var(--sepia-50)', borderColor: 'var(--border-dark)', boxShadow: '0 8px 0 0 #C4843C'}}>
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className={`text-sm font-medium`} style={{color: 'var(--text-primary-dark)'}}>
            {message}
          </p>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors duration-200`}
            style={{color: 'var(--text-secondary)'}}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;