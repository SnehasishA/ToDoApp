
import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2800); // A bit shorter than the timeout in App.tsx to allow for fade-out
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
      style={{ zIndex: 100 }}
    >
      <CheckCircle size={20} />
      <p className="font-semibold text-sm">{message}</p>
    </div>
  );
};

export default Toast;
