import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../lib/api';
import Alert from '../components/Alert';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);
      setError('');

      if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error('Preencha todos os campos.');
      }

      if (password !== confirm) {
        throw new Error('As senhas não coincidem.');
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }

      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      if (!data?.token) {
        throw new Error('Conta criada, mas o token não foi retornado.');
      }

      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user || {}));

      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar conta.');
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

        <h1>Criar sua conta</h1>

        <p>
          Configure sua automação de ofertas e comece a ganhar com seus links
          de afiliado.
        </p>

        <Alert message={error} type="error" />

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nome</label>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label>E-mail</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label>Confirmar senha</label>
            <input
              className="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar conta grátis'}
          </button>
        </form>

        <p style={{ marginTop: 16, textAlign: 'center' }}>
          Já tem uma conta?{' '}
          <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
