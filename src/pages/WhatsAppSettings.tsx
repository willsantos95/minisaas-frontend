import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { api } from '../lib/api';

type ConnectResponse = {
  success: boolean;
  message?: string;
  instanceName?: string;
  phone?: string;
  status?: string;
  qrcode?: string;
  pairingCode?: string;
};

type StatusResponse = {
  success: boolean;
  connected: boolean;
  status: string;
  instanceName?: string;
  phone?: string;
};

function formatQrCode(qrcode: string) {
  if (!qrcode) return '';

  if (qrcode.startsWith('data:image')) {
    return qrcode;
  }

  return `data:image/png;base64,${qrcode}`;
}

function getStatusLabel(status: string, connected: boolean) {
  if (connected) return 'Conectado';

  const labels: Record<string, string> = {
    not_created: 'Não conectado',
    waiting_connection: 'Aguardando conexão',
    connecting: 'Conectando',
    close: 'Desconectado',
    disconnected: 'Desconectado',
    unknown: 'Status desconhecido',
  };

  return labels[status] || status;
}

function getStatusColor(status: string, connected: boolean) {
  if (connected) return '#22c55e';

  if (status === 'waiting_connection' || status === 'connecting') {
    return '#f59e0b';
  }

  if (status === 'close' || status === 'disconnected') {
    return '#ef4444';
  }

  return '#94a3b8';
}

export default function WhatsAppSettings() {
  const [phone, setPhone] = useState('');
  const [qrcode, setQrcode] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [status, setStatus] = useState('not_created');
  const [instanceName, setInstanceName] = useState('');
  const [connectedPhone, setConnectedPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [syncingGroups, setSyncingGroups] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const connected = status === 'connected' || status === 'open';

  async function notifyN8nOnConnect(currentInstanceName: string) {
    try {
      const storageKey = `n8n_notified_${currentInstanceName}`;
      if (localStorage.getItem(storageKey)) return;

      await fetch(
        'https://n8n.relampagodeofertas.shop/webhook/2a92f9c3-48bc-46d8-a9fe-8ca817ae1481',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instancia: currentInstanceName }),
        }
      );

      localStorage.setItem(storageKey, 'true');
    } catch (err) {
      console.warn('Não foi possível notificar o n8n sobre a conexão:', err);
    }
  }

  async function startGroupsSyncIfNeeded(currentInstanceName?: string) {
    try {
      const instance = currentInstanceName || instanceName;

      if (!instance) return;

      const storageKey = `groups_sync_started_${instance}`;
      const alreadyStarted = localStorage.getItem(storageKey);

      if (alreadyStarted) {
        return;
      }

      setSyncingGroups(true);

      const data = await api('/whatsapp/groups/sync', {
        method: 'POST',
      });

      localStorage.setItem(storageKey, 'true');

      setMsg(
        data?.message ||
          'WhatsApp conectado. A sincronização dos grupos foi iniciada em segundo plano.'
      );
    } catch (err: any) {
      console.warn('Não foi possível iniciar a sincronização automática:', err);

      setMsg(
        'WhatsApp conectado. Se os grupos ainda não aparecerem, vá em Gestão de Grupos e clique em Sincronizar grupos.'
      );
    } finally {
      setSyncingGroups(false);
    }
  }

  async function handleConnect() {
    try {
      setLoading(true);
      setMsg('');
      setError('');
      setQrcode('');
      setPairingCode('');

      const data: ConnectResponse = await api('/whatsapp/connect', {
        method: 'POST',
        body: JSON.stringify({
          phone,
        }),
      });

      setQrcode(data.qrcode || '');
      setPairingCode(data.pairingCode || '');
      setStatus(data.status || 'waiting_connection');
      setInstanceName(data.instanceName || '');
      setConnectedPhone(data.phone || phone);

      setMsg('QR Code gerado. Agora escaneie pelo WhatsApp para conectar.');
    } catch (err: any) {
      setError(err?.message || 'Erro ao conectar WhatsApp.');
    } finally {
      setLoading(false);
    }
  }

  async function checkStatus() {
    try {
      setCheckingStatus(true);
      setError('');

      const data: StatusResponse = await api('/whatsapp/status');

      if (data.success) {
        setStatus(data.status || 'unknown');

        if (data.instanceName) {
          setInstanceName(data.instanceName);
        }

        if (data.phone) {
          setConnectedPhone(data.phone);
          setPhone((current) => current || data.phone || '');
        }

        if (data.connected) {
          setQrcode('');
          setPairingCode('');

          await startGroupsSyncIfNeeded(data.instanceName);

          if (data.instanceName) {
            await notifyN8nOnConnect(data.instanceName);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao consultar status do WhatsApp.');
    } finally {
      setCheckingStatus(false);
    }
  }

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (connected) return;

    const interval = setInterval(() => {
      checkStatus();
    }, 8000);

    return () => clearInterval(interval);
  }, [connected]);

  return (
    <>
      <PageHeader
        title="WhatsApp"
        subtitle="Conecte seu WhatsApp para que o OfertaRelay consiga ler os grupos de origem e enviar ofertas para os grupos de destino configurados."
      />

      <Alert message={msg || error} />

      <div className="grid grid-2">
        <div className="card">
          <h2>Conectar WhatsApp</h2>

          <p style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.6 }}>
            Informe o número que será usado na automação. O sistema criará uma
            instância na Evolution API e exibirá um QR Code para conexão.
          </p>

          <div className="field" style={{ marginTop: 18 }}>
            <label>Número do WhatsApp</label>

            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Ex: 14999999999"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={loading}
            style={{ marginTop: 14, width: '100%' }}
          >
            {loading ? 'Gerando QR Code...' : 'Conectar WhatsApp'}
          </button>

          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 16,
              border: '1px solid rgba(34, 197, 94, 0.35)',
              background: 'rgba(34, 197, 94, 0.08)',
              lineHeight: 1.6,
            }}
          >
            <strong>Uso controlado:</strong>
            <br />
            O OfertaRelay trabalha com grupos configurados por você e não realiza
            envio em massa individual para contatos privados.
          </div>
        </div>

        <div className="card">
          <h2>Status da conexão</h2>

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p style={{ margin: 0, opacity: 0.75 }}>Situação atual</p>

              <strong
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  color: getStatusColor(status, connected),
                  fontSize: 22,
                }}
              >
                {getStatusLabel(status, connected)}
              </strong>
            </div>

            <span
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: connected
                  ? 'rgba(34, 197, 94, 0.14)'
                  : 'rgba(245, 158, 11, 0.14)',
                color: getStatusColor(status, connected),
                fontWeight: 700,
              }}
            >
              {connected ? 'Online' : 'Pendente'}
            </span>
          </div>

          <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
            {connectedPhone && (
              <div className="copy-box">
                <strong>Número conectado</strong>
                <br />
                {connectedPhone}
              </div>
            )}

            {instanceName && (
              <div className="copy-box">
                <strong>Instância</strong>
                <br />
                <code style={{ fontSize: 12 }}>{instanceName}</code>
              </div>
            )}

            {syncingGroups && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  lineHeight: 1.6,
                }}
              >
                <strong>Sincronizando grupos...</strong>
                <br />
                A busca dos grupos foi iniciada em segundo plano. Você pode ir
                para Gestão de Grupos e acompanhar o carregamento.
              </div>
            )}
          </div>

          <button
            className="btn"
            onClick={checkStatus}
            disabled={checkingStatus}
            style={{ marginTop: 18 }}
          >
            {checkingStatus ? 'Verificando...' : 'Verificar status'}
          </button>
        </div>
      </div>

      {qrcode && !connected && (
        <div className="card" style={{ marginTop: 18, textAlign: 'center' }}>
          <h2>Escaneie o QR Code</h2>

          <p style={{ marginTop: 8, opacity: 0.78 }}>
            Abra o WhatsApp no celular e escaneie o código abaixo para conectar.
          </p>

          <div
            style={{
              display: 'inline-flex',
              marginTop: 22,
              padding: 18,
              borderRadius: 22,
              background: '#ffffff',
              boxShadow: '0 18px 50px rgba(0,0,0,0.18)',
            }}
          >
            <img
              src={formatQrCode(qrcode)}
              alt="QR Code WhatsApp"
              style={{
                width: 280,
                height: 280,
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}

      {pairingCode && !connected && (
        <div className="card" style={{ marginTop: 18 }}>
          <h2>Código de pareamento</h2>

          <p style={{ marginTop: 8, opacity: 0.78 }}>
            Caso prefira conectar por código, use o código abaixo no WhatsApp.
          </p>

          <div
            style={{
              marginTop: 16,
              padding: 18,
              borderRadius: 16,
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.55)',
              border: '1px solid rgba(148, 163, 184, 0.24)',
            }}
          >
            <span
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: 4,
                color: '#22c55e',
              }}
            >
              {pairingCode}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h2>Como conectar?</h2>

          <ol style={{ marginTop: 14, lineHeight: 1.9, opacity: 0.86 }}>
            <li>Abra o WhatsApp no celular.</li>
            <li>
              Vá em <strong>Configurações</strong>.
            </li>
            <li>
              Entre em <strong>Aparelhos conectados</strong>.
            </li>
            <li>
              Clique em <strong>Conectar aparelho</strong>.
            </li>
            <li>Escaneie o QR Code exibido nesta tela.</li>
          </ol>
        </div>

        <div className="card">
          <h2>Como desconectar?</h2>

          <p style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.6 }}>
            É possível desconectar o WhatsApp a qualquer momento pelo app.
          </p>

          <div
            style={{
              marginTop: 14,
              padding: 16,
              borderRadius: 16,
              border: '1px solid rgba(239, 68, 68, 0.35)',
              background: 'rgba(239, 68, 68, 0.08)',
              lineHeight: 1.7,
            }}
          >
            <strong>Caminho no WhatsApp:</strong>
            <br />
            WhatsApp → Configurações → Aparelhos conectados → selecione a sessão
            conectada → Desconectar.
          </div>

          <p style={{ marginTop: 14, opacity: 0.72, fontSize: 14 }}>
            Depois de desconectar pelo app, volte nesta página e clique em
            <strong> Verificar status</strong> para atualizar a conexão no
            sistema.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>O que acontece depois de conectar?</h2>

        <div className="grid grid-3" style={{ marginTop: 16 }}>
          <div className="copy-box">
            <strong>1. Sincronizar grupos</strong>
            <br />
            Assim que o WhatsApp for conectado, o sistema tenta iniciar a
            sincronização dos grupos em segundo plano.
          </div>

          <div className="copy-box">
            <strong>2. Definir origem</strong>
            <br />
            Você escolhe os grupos onde recebe ofertas e deseja fazer o relay.
          </div>

          <div className="copy-box">
            <strong>3. Definir destino</strong>
            <br />
            Você escolhe os grupos que receberão as mensagens com seu link de
            afiliado.
          </div>
        </div>
      </div>
    </>
  );
}
