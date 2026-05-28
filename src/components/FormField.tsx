import React from 'react';

export default function FormField({ label, value, onChange, type = 'text', placeholder = '' }: any) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input" type={type} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
