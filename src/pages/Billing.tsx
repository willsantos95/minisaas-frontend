import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { api } from '../lib/api';


const PLAN_NAME = import.meta.env.VITE_PLAN_NAME || 'OfertaRelay Pro';
const PLAN_AMOUNT = import.meta.env.VITE_PLAN_AMOUNT || '49.90';

type BillingUser = {
  id: string;
  name: string;
  email: string;
  plan_status: string;
};

type Subscription = {
  id: string | number;
  provider: string;
  provider_subscription_id: string;
  provider_customer_id?: string | null;
  plan_name: string;
  amount: string | number;
  currency: string;
  status: string;
  checkout_url?: string | null;
  started_at?: string | null;
  next_payment_at?: string | null;
  cancelled_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type BillingData = {
  success: boolean;
  user: BillingUser | null;
  subscription: Subscription | null;
};

function getStatusLabel(status?: string | null) {
  if (!status) return 'Sem assinatura';

  const labels: Record<string, string> = {
    trial: 'Teste grátis',
    pending: 'Aguardando pagamento',
    active: 'Ativa',
    authorized: 'Ativa',
    past_due: 'Pagamento pendente',
    paused: 'Pausada',
    cancelled: 'Cancelada',
    inactive: 'Inativa',
  };

  return labels[status] || status;
}

function getStatusColor(status?: string | null) {
  if (status === 'active' || status === 'authorized' || status === 'trial') {
    return '#22c55e';
  }

  if (status === 'pending' || status === 'past_due' || status === 'paused') {
    return '#f59e0b';
  }

  if (status === 'cancelled' || status === 'inactive') {
    return '#ef4444';
  }

  return '#94a3b8';
}

function formatMoney(value?: string | number | null) {
  const amount = Number(value || 0);

  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function Billing() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function loadBilling() {
    try {
      setLoading(true);
      setMsg('');
      setError('');

      const data = await api('/billing/me');

      setBilling(data);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar assinatura.');
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout() {
    try {
      setCreatingCheckout(true);
      setMsg('');
      setError('');

      const data = await api('/billing/checkout', {
        method: 'POST',
      });

      if (!data.checkoutUrl) {
        throw new Error('Checkout não retornou URL de pagamento.');
      }

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setError(err?.message || 'Erro ao iniciar checkout.');
    } finally {
      setCreatingCheckout(false);
    }
  }

  async function syncSubscription() {
    try {
      setSyncing(true);
      setMsg('');
      setError('');

      const data = await api('/billing/sync', {
        method: 'POST',
      });

      setMsg(
        `Assinatura sincronizada. Status: ${getStatusLabel(data.planStatus)}`
      );

      await loadBilling();
    } catch (err: any) {
      setError(err?.message || 'Erro ao sincronizar assinatura.');
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    loadBilling();
  }, []);

  const user = billing?.user || null;
  const subscription = billing?.subscription || null;
  const planStatus = user?.plan_status || 'inactive';

  return (
    <>
      <PageHeader
        title="Assinatura"
        subtitle="Gerencie o plano mensal da sua automação."
      />

      <Alert message={msg || error} />

      <div className="grid grid-2">
        <div className="card">
        <h2>{PLAN_NAME}</h2>

          <p style={{ marginTop: 8, opacity: 0.75 }}>
            Automação Relay de Ofertas 24h, conexão com WhatsApp, gestão de grupos por nicho e suporte.
          </p>

          <div style={{ marginTop: 24 }}>
          <strong style={{ fontSize: 38 }}>
          R${PLAN_AMOUNT}
          </strong>
          <span style={{ opacity: 0.75 }}>/mês</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <p>
              Status do plano:{' '}
              <strong style={{ color: getStatusColor(planStatus) }}>
                {getStatusLabel(planStatus)}
              </strong>
            </p>

            {user?.email && (
              <p style={{ opacity: 0.75, marginTop: 4 }}>
                Conta: <strong>{user.email}</strong>
              </p>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={startCheckout}
            disabled={creatingCheckout}
            style={{ marginTop: 24 }}
          >
            {creatingCheckout ? 'Gerando checkout...' : 'Assinar agora'}
          </button>

          <button
            className="btn"
            onClick={loadBilling}
            disabled={loading}
            style={{ marginTop: 12, marginLeft: 8 }}
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        <div className="card">
          <h2>Status da cobrança</h2>

          {!subscription ? (
            <p style={{ marginTop: 16, opacity: 0.75 }}>
              Nenhuma assinatura criada ainda.
            </p>
          ) : (
            <div style={{ marginTop: 16 }}>
              <p>
                Provedor: <strong>{subscription.provider}</strong>
              </p>

              <p>
                Plano: <strong>{subscription.plan_name}</strong>
              </p>

              <p>
                Valor:{' '}
                <strong>
                  {formatMoney(subscription.amount)}
                  /mês
                </strong>
              </p>

              <p>
                Status gateway:{' '}
                <strong style={{ color: getStatusColor(subscription.status) }}>
                  {getStatusLabel(subscription.status)}
                </strong>
              </p>

              <p>
                Próximo pagamento:{' '}
                <strong>{formatDate(subscription.next_payment_at)}</strong>
              </p>

              <p>
                Criada em: <strong>{formatDate(subscription.created_at)}</strong>
              </p>

              {subscription.provider_subscription_id && (
                <p style={{ marginTop: 8, opacity: 0.75 }}>
                  ID assinatura:{' '}
                  <code style={{ fontSize: 12 }}>
                    {subscription.provider_subscription_id}
                  </code>
                </p>
              )}

              {subscription.checkout_url && (
                <a
                  className="btn btn-primary"
                  href={subscription.checkout_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: 18,
                    textDecoration: 'none',
                  }}
                >
                  Abrir checkout
                </a>
              )}

              <button
                className="btn"
                onClick={syncSubscription}
                disabled={syncing}
                style={{ marginTop: 18, marginLeft: 8 }}
              >
                {syncing ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>O que está incluso</h2>

        <div className="grid grid-3" style={{ marginTop: 16 }}>
          <div className="copy-box">
            <strong>WhatsApp conectado</strong>
            <br />
            Instância conectada via Evolution API.
          </div>

          <div className="copy-box">
            <strong>Grupos por nicho</strong>
            <br />
            Configure grupos de origem e destino.
          </div>

          <div className="copy-box">
            <strong>Automação n8n</strong>
            <br />
            Use as configurações salvas no seu fluxo.
          </div>
        </div>
      </div>
    </>
  );
}
