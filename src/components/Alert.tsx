
import React from 'react';
export default function Alert({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  if (!message) return null;
  return <div className={`alert ${type === 'error' ? 'error' : ''}`}>{message}</div>;
}
