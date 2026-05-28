import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { api } from '../lib/api';

type WhatsAppGroup = {
  id: string;
  group_jid: string;
  group_name: string;
  participants_count?: number | null;
  is_origin: boolean;
  is_destination: boolean;
  niche: string;
  synced_at?: string | null;
};

type WhatsAppStatus = {
  success: boolean;
  connected: boolean;
  status: string;
  instanceName?: string;
  phone?: string;
};

type SyncJob = {
  id: number;
  user_id: string;
  instance_name: string;
  status: 'running' | 'finished' | 'failed';
  message?: string;
  total_received?: number;
  saved?: number;
  ignored?: number;
  started_at?: string;
  finished_at?: string | null;
};

const niches = [
  { value: 'geral', label: 'Geral' },
  { value: 'pet', label: 'Pet' },
  { value: 'bebe', label: 'Bebê' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'casa', label: 'Casa' },
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'moda', label: 'Moda' },
];

function getStatusLabel(status?: string, connected?: boolean) {
  if (connected) return 'Conectado';

  const labels: Record<string, string> = {
    not_created: 'Não conectado',
    waiting_connection: 'Aguardando conexão',
    connecting: 'Conectando',
    close: 'Desconectado',
    disconnected: 'Desconectado',
    unknown: 'Status desconhecido',
  };

  return labels[status || 'unknown'] || status || 'Status desconhecido';
}

function getStatusColor(status?: string, connected?: boolean) {
  if (connected) return '#22c55e';

  if (status === 'waiting_connection' || status === 'connecting') {
    return '#f59e0b';
  }

  if (status === 'close' || status === 'disconnected') {
    return '#ef4444';
  }

  return '#94a3b8';
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Groups() {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [instanceName, setInstanceName] = useState('');
  const [whatsappStatus, setWhatsappStatus] = useState('not_created');
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncJob, setSyncJob] = useState<SyncJob | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadStatus() {
    try {
      setLoadingStatus(true);
      setError('');

      const data: WhatsAppStatus = await api('/whatsapp/status');

      setWhatsappStatus(data.status || 'unknown');
      setWhatsappConnected(!!data.connected);

      if (data.instanceName) {
        setInstanceName(data.instanceName);
      }

      if (data.phone) {
        setPhone(data.phone);
      }

      return data;
    } catch (err: any) {
      setWhatsappStatus('unknown');
      setWhatsappConnected(false);
      setError(err?.message || 'Erro ao consultar status do WhatsApp.');
      return null;
    } finally {
      setLoadingStatus(false);
    }
  }

  async function loadGroupsFromCache() {
    try {
      setLoadingGroups(true);
      setError('');
      setMsg('');

      const data = await api('/whatsapp/groups/cache');

      const receivedGroups = Array.isArray(data.groups) ? data.groups : [];

      setGroups(receivedGroups);

      if (data.instanceName) {
        setInstanceName(data.instanceName);
      }

      if (receivedGroups.length === 0) {
        setMsg(
          'Nenhum grupo salvo ainda. Clique em Sincronizar grupos para buscar os grupos da Evolution API.'
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar grupos salvos.');
    } finally {
      setLoadingGroups(false);
    }
  }

  async function checkSyncStatus() {
    const data = await api('/whatsapp/groups/sync/status');
    const job = data.job || null;

    setSyncJob(job);

    return job as SyncJob | null;
  }

  async function checkSyncStatusUntilFinished() {
    let attempts = 0;
    const maxAttempts = 80;

    while (attempts < maxAttempts) {
      attempts++;

      const job = await checkSyncStatus();

      if (!job) {
        setMsg('Sincronização iniciada.');
      } else if (job.status === 'running') {
        setMsg(job.message || 'Sincronizando grupos...');
      } else if (job.status === 'finished') {
        setMsg(
          `Sincronização concluída. Recebidos: ${job.total_received || 0} | Salvos: ${job.saved || 0}`
        );

        await loadGroupsFromCache();
        return;
      } else if (job.status === 'failed') {
        throw new Error(job.message || 'Erro ao sincronizar grupos.');
      }

      await sleep(3000);
    }

    setMsg(
      'A sincronização ainda está em andamento. Aguarde alguns segundos e clique em Carregar salvos.'
    );
  }

  async function syncGroups() {
    try {
      setSyncing(true);
      setError('');
      setMsg('');

      const data = await api('/whatsapp/groups/sync', {
        method: 'POST',
      });

      setSyncJob(data.job || null);
      setMsg(data.message || 'Sincronização iniciada.');

      await checkSyncStatusUntilFinished();
    } catch (err: any) {
      setError(
        err?.message ||
          'Erro ao iniciar sincronização de grupos. Tente novamente em alguns segundos.'
      );
    } finally {
      setSyncing(false);
    }
  }

  async function loadPage() {
    await loadStatus();
    await loadGroupsFromCache();

    try {
      const job = await checkSyncStatus();

      if (job?.status === 'running') {
        setSyncing(true);

        try {
          await checkSyncStatusUntilFinished();
        } finally {
          setSyncing(false);
        }
      }
    } catch {
      // Não trava a página por erro no status do job.
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  function updateGroup(
    groupJid: string,
    field: 'is_origin' | 'is_destination' | 'niche',
    value: boolean | string
  ) {
    setGroups((current) =>
      current.map((group) =>
        group.group_jid === groupJid
          ? {
              ...group,
              [field]: value,
            }
          : group
      )
    );
  }

  const filteredGroups = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return groups;

    return groups.filter((group) => {
      return (
        group.group_name?.toLowerCase().includes(term) ||
        group.group_jid?.toLowerCase().includes(term) ||
        group.niche?.toLowerCase().includes(term)
      );
    });
  }, [groups, search]);

  function markAllFilteredAsOrigin(value: boolean) {
    const ids = new Set(filteredGroups.map((group) => group.group_jid));

    setGroups((current) =>
      current.map((group) =>
        ids.has(group.group_jid)
          ? {
              ...group,
              is_origin: value,
            }
          : group
      )
    );
  }

  function markAllFilteredAsDestination(value: boolean) {
    const ids = new Set(filteredGroups.map((group) => group.group_jid));

    setGroups((current) =>
      current.map((group) =>
        ids.has(group.group_jid)
          ? {
              ...group,
              is_destination: value,
            }
          : group
      )
    );
  }

  async function save() {
    try {
      setSaving(true);
      setError('');
      setMsg('');

      const selectedGroups = groups.filter(
        (group) => group.is_origin || group.is_destination
      );

      const data = await api('/whatsapp/groups/save', {
        method: 'POST',
        body: JSON.stringify({
          groups: selectedGroups,
        }),
      });

      const origins =
        data?.summary?.origins ??
        selectedGroups.filter((group) => group.is_origin).length;

      const destinations =
        data?.summary?.destinations ??
        selectedGroups.filter((group) => group.is_destination).length;

      setMsg(
        `Configuração salva com sucesso. Origens: ${origins} | Destinos: ${destinations}`
      );
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar configuração dos grupos.');
    } finally {
      setSaving(false);
    }
  }

  const originCount = useMemo(
    () => groups.filter((group) => group.is_origin).length,
    [groups]
  );

  const destinationCount = useMemo(
    () => groups.filter((group) => group.is_destination).length,
    [groups]
  );

  const lastSync = useMemo(() => {
    const dates = groups
      .map((group) => group.synced_at)
      .filter(Boolean)
      .map((date) => new Date(String(date)).getTime());

    if (dates.length === 0) return null;

    return new Date(Math.max(...dates)).toISOString();
  }, [groups]);

  const loading = loadingStatus || loadingGroups;

  return (
    <>
      <PageHeader
        title="Gestão de Grupos"
        subtitle="Liste os grupos sincronizados da sua instância e selecione quais serão copiados e quais receberão os disparos."
      />

      <Alert message={msg || error} />

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
            <h2>Grupos da instância WhatsApp</h2>

            <p style={{ marginTop: 6, opacity: 0.75, lineHeight: 1.6 }}>
              Status:{' '}
              <strong
                style={{
                  color: getStatusColor(whatsappStatus, whatsappConnected),
                }}
              >
                {getStatusLabel(whatsappStatus, whatsappConnected)}
              </strong>
              {phone ? (
                <>
                  {' '}
                  · Número: <strong>{phone}</strong>
                </>
              ) : null}
            </p>

            {instanceName ? (
              <p style={{ marginTop: 4, opacity: 0.75 }}>
                Instância: <strong>{instanceName}</strong>
              </p>
            ) : (
              <p style={{ marginTop: 4, opacity: 0.75 }}>
                Conecte uma instância na página WhatsApp antes de sincronizar os grupos.
              </p>
            )}

            {lastSync && (
              <p style={{ marginTop: 4, opacity: 0.75 }}>
                Última sincronização: <strong>{formatDate(lastSync)}</strong>
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" onClick={loadStatus} disabled={loadingStatus}>
              {loadingStatus ? 'Verificando...' : 'Verificar conexão'}
            </button>

            <button
              className="btn"
              onClick={loadGroupsFromCache}
              disabled={loadingGroups}
            >
              {loadingGroups ? 'Carregando...' : 'Carregar salvos'}
            </button>

            <button
              className="btn btn-primary"
              onClick={syncGroups}
              disabled={syncing || !whatsappConnected}
            >
              {syncing ? 'Sincronizando...' : 'Sincronizar grupos'}
            </button>
          </div>
        </div>

        {syncJob?.status === 'running' && (
          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 16,
              border: '1px solid rgba(245, 158, 11, 0.35)',
              background: 'rgba(245, 158, 11, 0.08)',
              lineHeight: 1.6,
            }}
          >
            <strong>Sincronização em andamento:</strong>
            <br />
            {syncJob.message || 'Buscando grupos na Evolution API...'}
          </div>
        )}

        {!whatsappConnected && (
          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 16,
              border: '1px solid rgba(245, 158, 11, 0.35)',
              background: 'rgba(245, 158, 11, 0.08)',
              lineHeight: 1.6,
            }}
          >
            Para sincronizar os grupos, primeiro conecte o WhatsApp na página{' '}
            <strong>WhatsApp</strong>. Depois volte aqui e clique em{' '}
            <strong>Sincronizar grupos</strong>.
          </div>
        )}

        <div className="grid grid-3" style={{ marginTop: 18 }}>
          <div className="copy-box">
            <strong>Total de grupos salvos</strong>
            <br />
            <span style={{ fontSize: 28 }}>{groups.length}</span>
          </div>

          <div className="copy-box">
            <strong>Selecionados para copiar</strong>
            <br />
            <span style={{ fontSize: 28 }}>{originCount}</span>
          </div>

          <div className="copy-box">
            <strong>Selecionados para enviar</strong>
            <br />
            <span style={{ fontSize: 28 }}>{destinationCount}</span>
          </div>
        </div>

        <div className="field" style={{ marginTop: 18 }}>
          <label>Buscar grupo</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite o nome, código ou nicho do grupo..."
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <h2>Grupos do usuário</h2>

          {filteredGroups.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn"
                type="button"
                onClick={() => markAllFilteredAsOrigin(true)}
              >
                Marcar filtrados como origem
              </button>

              <button
                className="btn"
                type="button"
                onClick={() => markAllFilteredAsDestination(true)}
              >
                Marcar filtrados como destino
              </button>

              <button
                className="btn"
                type="button"
                onClick={() => {
                  markAllFilteredAsOrigin(false);
                  markAllFilteredAsDestination(false);
                }}
              >
                Limpar filtrados
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <p style={{ marginTop: 16 }}>
            {loadingStatus
              ? 'Verificando conexão com WhatsApp...'
              : 'Carregando grupos salvos...'}
          </p>
        ) : filteredGroups.length === 0 ? (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 16,
              border: '1px solid rgba(148, 163, 184, 0.22)',
              background: 'rgba(148, 163, 184, 0.08)',
              lineHeight: 1.6,
            }}
          >
            <strong>Nenhum grupo encontrado.</strong>
            <br />
            Clique em <strong>Sincronizar grupos</strong> para buscar os grupos
            da Evolution API e salvar no banco. Depois disso, a tela carregará
            os grupos rapidamente pelo cache.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Código</th>
                  <th>Nicho</th>
                  <th>Copiar?</th>
                  <th>Enviar?</th>
                </tr>
              </thead>

              <tbody>
                {filteredGroups.map((group) => (
                  <tr key={group.group_jid}>
                    <td>
                      <strong>{group.group_name || 'Grupo sem nome'}</strong>

                      {group.participants_count ? (
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                          {group.participants_count} participantes
                        </div>
                      ) : null}

                      {group.synced_at ? (
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                          Sincronizado em {formatDate(group.synced_at)}
                        </div>
                      ) : null}
                    </td>

                    <td>
                      <code style={{ fontSize: 12 }}>{group.group_jid}</code>
                    </td>

                    <td>
                      <select
                        value={group.niche || 'geral'}
                        onChange={(e) =>
                          updateGroup(group.group_jid, 'niche', e.target.value)
                        }
                      >
                        {niches.map((niche) => (
                          <option key={niche.value} value={niche.value}>
                            {niche.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        checked={!!group.is_origin}
                        onChange={(e) =>
                          updateGroup(
                            group.group_jid,
                            'is_origin',
                            e.target.checked
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        checked={!!group.is_destination}
                        onChange={(e) =>
                          updateGroup(
                            group.group_jid,
                            'is_destination',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{
            marginTop: 18,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving || loading || groups.length === 0}
          >
            {saving ? 'Salvando...' : 'Salvar configuração'}
          </button>
        </div>
      </div>

    
    </>
  );
}
