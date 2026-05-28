import React, { useState } from 'react';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      setMsg('');
      setError('');

      const data = await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setMsg(data.message || 'Verifique seu e-mail.');
    } catch (err: any) {
      setError(err?.message || 'Erro ao solicitar redefinição.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card" style={{ maxWidth: 460, margin: '60px auto' }}>
        <h1>Esqueci minha senha</h1>

        <p style={{ marginTop: 8, opacity: 0.75 }}>
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        {msg && (
          <div style={{ marginTop: 16, color: '#22c55e' }}>
            {msg}
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16, color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div className="field" style={{ marginTop: 18 }}>
          <label>E-mail</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seuemail@exemplo.com"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={loading}
          style={{ marginTop: 18, width: '100%' }}
        >
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
        </button>

        <a
          href="/login"
          style={{
            display: 'block',
            marginTop: 18,
            textAlign: 'center',
            color: 'inherit',
            opacity: 0.75,
          }}
        >
          Voltar para o login
        </a>
      </div>
    </div>
  );
}
