import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../lib/api';
import Alert from '../components/Alert';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try {
      const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      setToken(data.token); localStorage.setItem('user', JSON.stringify(data.user)); navigate('/');
    } catch (err: any) { setError(err.message); }
  }
  return <div className="auth-page"><div className="auth-card"><div className="logo">R</div><h1>Criar cliente</h1><p>Crie uma conta para liberar API Key e dados isolados por usuário.</p><Alert message={error} type="error" /><form onSubmit={submit}>
    <div className="field"><label>Nome</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
    <div className="field"><label>E-mail</label><input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
    <div className="field"><label>Senha</label><input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
    <button className="btn btn-primary" style={{ width: '100%' }}>Criar conta</button>
  </form><p><Link to="/login">Voltar para login</Link></p></div></div>;
}
