import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, CreditCard, HelpCircle, LogOut, MessageCircle, Settings, Users, Info, List, Send } from 'lucide-react';
import { logout } from '../lib/api';

export default function AppLayout() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menu = [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/como-funciona', label: 'Como funciona', icon: Info },
    { to: '/billing', label: 'Assinatura', icon: CreditCard },
    { to: '/affiliate', label: 'Configurações de Afiliado', icon: Settings },
    { to: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { to: '/groups', label: 'Gestão de Grupos', icon: Users },
    { to: '/telegram', label: 'Telegram', icon: Send },
    { to: '/relay-logs', label: 'Histórico de Relay', icon: List },
    { to: '/help', label: 'Ajuda', icon: HelpCircle },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
<div className="sidebar-logo">  <img    src="/ofertarelay-logo.png"    alt="OfertaRelay"    className="logo-img"  />  <span>OfertaRelay</span></div>       
        
        <nav className="nav">
          {menu.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'}><item.icon size={18} />{item.label}</NavLink>)}
          <button onClick={logout}><LogOut size={18} />Sair</button>
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <strong>Painel do cliente</strong>
          <span>Olá, {user.name || 'Cliente'}</span>
        </header>
        <section className="content"><Outlet /></section>
      </main>
    </div>
  );
}
