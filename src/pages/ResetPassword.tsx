import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      setMsg('');
      setError('');

      if (!token) {
        throw new Error('Token inválido.');
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }

      if (password !== confirmPassword) {
        throw new Error('As senhas não conferem.');
      }

      const data = await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password,
        }),
      });

      setMsg(data.message || 'Senha redefinida com sucesso.');
    } catch (err: any) {
      setError(err?.message || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card" style={{ maxWidth: 460, margin: '60px auto' }}>
        <h1>Redefinir senha</h1>

        <p style={{ marginTop: 8, opacity: 0.75 }}>
          Crie uma nova senha para acessar sua conta.
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
          <label>Nova senha</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua nova senha"
          />
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label>Confirmar nova senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirme sua nova senha"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={loading}
          style={{ marginTop: 18, width: '100%' }}
        >
          {loading ? 'Salvando...' : 'Redefinir senha'}
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
