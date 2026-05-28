import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import OnboardingWizard from '../components/OnboardingWizard';
import { api } from '../lib/api';

type DashboardGroup = {
  id: string | number;
  group_name: string;
  group_jid: string;
  group_code?: string;
  niche: string;
  role: 'origin' | 'destination';
  status: string;
};

type DashboardData = {
  success: boolean;
  instance: {
    instance_name: string;
    phone: string;
    status: string;
  } | null;
  summary: {
    total_groups: number;
    origin_groups: number;
    destination_groups: number;
  };
  originGroups: DashboardGroup[];
  destinationGroups: DashboardGroup[];
};

type RelayStats = {
  today: number;
  week: number;
  month: number;
  total: number;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [relayStats, setRelayStats] = useState<RelayStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');

      const [dashRes, statsRes] = await Promise.allSettled([
        api('/whatsapp/dashboard'),
        api('/relay/stats'),
      ]);

      if (dashRes.status === 'fulfilled') setData(dashRes.value);
      if (statsRes.status === 'fulfilled') setRelayStats(statsRes.value?.stats || null);

      if (dashRes.status === 'rejected') throw dashRes.reason;
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const instance = data?.instance;
  const summary = data?.summary;
  const originGroups = data?.originGroups || [];
  const destinationGroups = data?.destinationGroups || [];

  const isDisconnected =
    instance &&
    instance.status !== 'connected' &&
    instance.status !== 'open';

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Acompanhe a instância conectada e os grupos configurados para copiar e enviar mensagens."
      />

      <OnboardingWizard />

      {isDisconnected && (
        <div
          style={{
            background: 'rgba(239,68,68,.08)',
            border: '1px solid rgba(239,68,68,.35)',
            borderRadius: 12,
            padding: '14px 20px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong style={{ color: '#dc2626' }}>⚠️ WhatsApp desconectado</strong>
            <p style={{ fontSize: '.88rem', marginTop: 4, opacity: .85 }}>
              O relay está pausado. Reconecte para retomar o envio automático de ofertas.
            </p>
          </div>
          <a href="/whatsapp" className="btn btn-primary" style={{ background: '#dc2626', whiteSpace: 'nowrap' }}>
            Reconectar agora
          </a>
        </div>
      )}

      <Alert message={error} />

      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2>Status do WhatsApp</h2>

            {loading ? (
              <p style={{ marginTop: 8, opacity: 0.75 }}>Carregando informações...</p>
            ) : instance ? (
              <div style={{ marginTop: 8 }}>
                <p>
                  Instância: <strong>{instance.instance_name}</strong>
                </p>
                <p>
                  Número: <strong>{instance.phone}</strong>
                </p>
                <p>
                  Status:{' '}
                  <strong
                    style={{
                      color:
                        instance.status === 'connected' || instance.status === 'open'
                          ? '#22c55e'
                          : '#ef4444',
                    }}
                  >
                    {instance.status === 'connected' || instance.status === 'open'
                      ? '● Conectado'
                      : '● Desconectado'}
                  </strong>
                </p>
              </div>
            ) : (
              <p style={{ marginTop: 8, opacity: 0.75 }}>
                Nenhuma instância de WhatsApp conectada ainda.
              </p>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Atualizar dashboard'}
          </button>
        </div>
      </div>

      {/* Stats de relay */}
      {relayStats !== null && (
        <div className="grid grid-4" style={{ marginTop: 18 }}>
          {[
            { label: 'Relays hoje', value: relayStats.today },
            { label: 'Esta semana', value: relayStats.week },
            { label: 'Este mês', value: relayStats.month },
            { label: 'Total relayado', value: relayStats.total },
          ].map((s) => (
            <div className="card" key={s.label}>
              <h2 style={{ fontSize: '.88rem' }}>{s.label}</h2>
              <p style={{ fontSize: 32, fontWeight: 800, marginTop: 6, color: '#22c55e' }}>
                {s.value}
              </p>
              <p style={{ opacity: 0.6, fontSize: '.8rem' }}>ofertas</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-3" style={{ marginTop: 18 }}>
        <div className="card">
          <h2>Total de grupos</h2>
          <p style={{ fontSize: 34, fontWeight: 800, marginTop: 8 }}>
            {summary?.total_groups ?? 0}
          </p>
          <p style={{ opacity: 0.7 }}>grupos configurados</p>
        </div>

        <div className="card">
          <h2>Grupos de origem</h2>
          <p style={{ fontSize: 34, fontWeight: 800, marginTop: 8 }}>
            {summary?.origin_groups ?? 0}
          </p>
          <p style={{ opacity: 0.7 }}>de onde copiamos</p>
        </div>

        <div className="card">
          <h2>Grupos de destino</h2>
          <p style={{ fontSize: 34, fontWeight: 800, marginTop: 8 }}>
            {summary?.destination_groups ?? 0}
          </p>
          <p style={{ opacity: 0.7 }}>para onde enviamos</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h2>Grupos que serão copiados</h2>

          {loading ? (
            <p style={{ marginTop: 16 }}>Carregando grupos...</p>
          ) : originGroups.length === 0 ? (
            <p style={{ marginTop: 16, opacity: 0.75 }}>
              Nenhum grupo marcado para copiar.
            </p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: 16 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Nicho</th>
                    <th>Código</th>
                  </tr>
                </thead>
                <tbody>
                  {originGroups.map((group) => (
                    <tr key={`origin-${group.id}`}>
                      <td>
                        <strong>{group.group_name || 'Grupo sem nome'}</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: 'rgba(59, 130, 246, 0.12)',
                          }}
                        >
                          {group.niche || 'geral'}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: 12 }}>
                          {group.group_jid || group.group_code}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Grupos que receberão mensagens</h2>

          {loading ? (
            <p style={{ marginTop: 16 }}>Carregando grupos...</p>
          ) : destinationGroups.length === 0 ? (
            <p style={{ marginTop: 16, opacity: 0.75 }}>
              Nenhum grupo marcado para receber mensagens.
            </p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: 16 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Nicho</th>
                    <th>Código</th>
                  </tr>
                </thead>
                <tbody>
                  {destinationGroups.map((group) => (
                    <tr key={`destination-${group.id}`}>
                      <td>
                        <strong>{group.group_name || 'Grupo sem nome'}</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: 'rgba(34, 197, 94, 0.12)',
                          }}
                        >
                          {group.niche || 'geral'}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: 12 }}>
                          {group.group_jid || group.group_code}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
