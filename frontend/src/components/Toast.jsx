import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span className="toast-msg">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}
