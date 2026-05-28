import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../lib/api';
import Alert from '../components/Alert';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);
      setError('');

      if (!email.trim() || !password.trim()) {
        throw new Error('Informe e-mail e senha.');
      }

      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!data?.token) {
        throw new Error('Login realizado, mas o token não foi retornado.');
      }

      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user || {}));

      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="sidebar-logo" style={{ justifyContent: 'center' }}>
          <img
            src="/ofertarelay-logo.png"
            alt="OfertaRelay"
            className="logo-img"
          />
          <span>OfertaRelay</span>
        </div>

        <h1>Entrar no painel</h1>

        <p>
          Gerencie sua automação, grupos e configurações de afiliado em um só
          lugar.
        </p>

        <Alert message={error} type="error" />

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>E-mail</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label>Senha</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/forgot-password" style={{ opacity: 0.75 }}>
            Esqueci minha senha
          </Link>

          {' · '}

          <Link to="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
