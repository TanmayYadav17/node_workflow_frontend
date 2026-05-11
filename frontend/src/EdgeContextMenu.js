// EdgeContextMenu.js
import React, { useEffect, useRef } from 'react';

export const EdgeContextMenu = ({ x, y, onClose, onDelete }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: y,
        left: x,
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px var(--shadow-color)',
        zIndex: 2000,
        minWidth: '150px',
        overflow: 'hidden',
      }}
    >
      <div
        onClick={onDelete}
        style={{
          padding: '10px 16px',
          cursor: 'pointer',
          color: '#ef4444',
          fontSize: '13px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          borderBottom: '1px solid var(--border-color)',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(239, 68, 68, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent';
        }}
      >
        🗑️ Delete Edge
      </div>
      <div
        onClick={onClose}
        style={{
          padding: '10px 16px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: '13px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'var(--surface-hover)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent';
        }}
      >
        Cancel
      </div>
    </div>
  );
};