import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { api } from '../lib/api';

type RelayLog = {
  id: number;
  instance_name: string;
  origin_group_name: string | null;
  destination_group_name: string | null;
  store: string | null;
  niche: string | null;
  affiliate_url: string | null;
  status: string | null;
  relayed_at: string;
};

type Stats = {
  today: number;
  week: number;
  month: number;
  total: number;
};

const NICHES = ['geral', 'pet', 'baby', 'fitness', 'home', 'electronics', 'fashion'];

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function RelayLogs() {
  const [logs, setLogs] = useState<RelayLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(p = 1, n = niche) {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({ page: String(p), limit: '50' });
      if (n) params.set('niche', n);

      const [logsRes, statsRes] = await Promise.all([
        api(`/relay/logs?${params}`),
        stats === null ? api('/relay/stats') : Promise.resolve(null),
      ]);

      setLogs(logsRes.logs || []);
      setTotal(logsRes.total || 0);
      if (statsRes) setStats(statsRes.stats);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar histórico.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1, '');
  }, []);

  function handleNicheChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    setNiche(v);
    setPage(1);
    load(1, v);
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <>
      <PageHeader
        title="Histórico de Relay"
        subtitle="Registros de ofertas relayadas pelo n8n com seus links de afiliado."
      />

      <Alert message={error} />

      {stats && (
        <div className="grid grid-4" style={{ marginBottom: 18 }}>
          {[
            { label: 'Hoje', value: stats.today },
            { label: 'Esta semana', value: stats.week },
            { label: 'Este mês', value: stats.month },
            { label: 'Total', value: stats.total },
          ].map((s) => (
            <div className="card" key={s.label}>
              <p style={{ opacity: 0.7, fontSize: '.85rem' }}>{s.label}</p>
              <p style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>{s.value}</p>
              <p style={{ opacity: 0.6, fontSize: '.8rem' }}>relays</p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <h2 style={{ flex: 1 }}>Logs ({total})</h2>
          <div className="field" style={{ margin: 0, minWidth: 160 }}>
            <select value={niche} onChange={handleNicheChange}>
              <option value="">Todos os nichos</option>
              {NICHES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button className="btn" onClick={() => load(page)} disabled={loading}>
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>

        {loading && <p>Carregando logs...</p>}

        {!loading && logs.length === 0 && (
          <p style={{ opacity: 0.7, padding: '24px 0' }}>
            Nenhum relay registrado ainda. O n8n registra aqui cada oferta enviada.
          </p>
        )}

        {!loading && logs.length > 0 && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Data/hora</th>
                    <th>Origem</th>
                    <th>Destino</th>
                    <th>Loja</th>
                    <th>Nicho</th>
                    <th>Status</th>
                    <th>Link afiliado</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const ok = !log.status || log.status === 'success';
                    return (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '.82rem' }}>
                        {formatDate(log.relayed_at)}
                      </td>
                      <td style={{ fontSize: '.85rem' }}>{log.origin_group_name || '—'}</td>
                      <td style={{ fontSize: '.85rem' }}>{log.destination_group_name || '—'}</td>
                      <td>
                        {log.store ? (
                          <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, background: 'rgba(99,102,241,.12)', fontSize: '.78rem', fontWeight: 600 }}>
                            {log.store}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, background: 'rgba(34,197,94,.12)', fontSize: '.78rem' }}>
                          {log.niche || 'geral'}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: '.75rem', fontWeight: 700, background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#16a34a' : '#dc2626' }}>
                          {ok ? '✓ enviado' : '✗ erro'}
                        </span>
                      </td>
                      <td style={{ fontSize: '.78rem' }}>
                        {log.affiliate_url ? (
                          <a href={log.affiliate_url} target="_blank" rel="noreferrer" style={{ color: '#22c55e' }}>ver link</a>
                        ) : '—'}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
                <button
                  className="btn"
                  disabled={page <= 1}
                  onClick={() => { setPage(page - 1); load(page - 1); }}
                >
                  ← Anterior
                </button>
                <span style={{ opacity: 0.7, fontSize: '.85rem' }}>
                  Página {page} de {totalPages}
                </span>
                <button
                  className="btn"
                  disabled={page >= totalPages}
                  onClick={() => { setPage(page + 1); load(page + 1); }}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
