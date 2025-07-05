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
  const { theme } = useTheme();
  
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`backdrop-blur-md shadow-lg rounded-lg p-4 border max-w-sm animate-in slide-in-from-right ${
        theme === 'light'
          ? 'bg-white/90 border-gray-200/60'
          : 'bg-black/80 border-white/10'
      }`}>
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className={`text-sm font-medium ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            {message}
          </p>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors duration-200 ${
              theme === 'light'
                ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;