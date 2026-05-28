import React from 'react';
import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import { api } from '../lib/api';

const empty = {
  amazon: {
    tag: '',
    cookies: '',
  },
  mercadoLivre: {
    tag: '',
    cookies: '',
  },
  shopee: {
    appId: '',
    appSecret: '',
  },
  magalu: {
    magazineId: '',
  },
  aliexpress: {
    apiKey: '',
    apiSecret: '',
    trackingId: '',
  },
};

export default function AffiliateSettings() {
  const [form, setForm] = useState<any>(empty);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    try {
      setLoading(true);
      setMsg('');
      setError('');

      const data = await api('/settings/affiliate');

      setForm({
        ...empty,
        ...(data?.setting?.payload || {}),
      });
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar configurações de afiliado.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function set(provider: string, key: string, value: string) {
    setForm((current: any) => ({
      ...current,
      [provider]: {
        ...current[provider],
        [key]: value,
      },
    }));
  }

  async function save() {
    try {
      setSaving(true);
      setMsg('');
      setError('');

      await api('/settings/affiliate', {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      setMsg('Configurações de afiliado salvas com sucesso.');

      await loadSettings();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar configurações de afiliado.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Configurações de Afiliado"
        subtitle="Dados usados pela automação para gerar links de afiliado automaticamente."
      />

      <Alert message={msg || error} />

      {loading && (
        <div className="card" style={{ marginBottom: 18 }}>
          Carregando configurações...
        </div>
      )}

      <div
        className="card"
        style={{
          marginBottom: 18,
          border: '1px solid rgba(245, 158, 11, 0.35)',
          background: 'rgba(245, 158, 11, 0.08)',
        }}
      >
        <h2>Informação importante</h2>

        <p style={{ marginTop: 8, opacity: 0.85, lineHeight: 1.6 }}>
          Só serão enviadas mensagens de ofertas das plataformas em que você
          cadastrou credenciais. Exemplo: se você cadastrou apenas as
          credenciais da Shopee, somente ofertas da Shopee serão processadas e
          enviadas. Ofertas de plataformas sem credenciais cadastradas serão
          ignoradas pela automação.
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Amazon</h2>

          <FormField
            label="Tag de afiliado"
            value={form.amazon?.tag || ''}
            onChange={(value: string) => set('amazon', 'tag', value)}
          />

          <FormField
            label="Cookies"
            value={form.amazon?.cookies || ''}
            onChange={(value: string) => set('amazon', 'cookies', value)}
          />
        </div>

        <div className="card">
          <h2>Mercado Livre</h2>

          <FormField
            label="Tag de afiliado"
            value={form.mercadoLivre?.tag || ''}
            onChange={(value: string) =>
              set('mercadoLivre', 'tag', value)
            }
          />

          <FormField
            label="Cookies"
            value={form.mercadoLivre?.cookies || ''}
            onChange={(value: string) =>
              set('mercadoLivre', 'cookies', value)
            }
          />
        </div>

        <div className="card">
          <h2>Shopee</h2>

          <FormField
            label="AppID"
            value={form.shopee?.appId || ''}
            onChange={(value: string) => set('shopee', 'appId', value)}
          />

          <FormField
            label="Senha/App Secret"
            value={form.shopee?.appSecret || ''}
            onChange={(value: string) =>
              set('shopee', 'appSecret', value)
            }
          />
        </div>

        <div className="card">
          <h2>Magalu</h2>

          <FormField
            label="ID Magazine Você"
            value={form.magalu?.magazineId || ''}
            onChange={(value: string) =>
              set('magalu', 'magazineId', value)
            }
          />
        </div>

        <div className="card">
          <h2>AliExpress</h2>

          <FormField
            label="API Key"
            value={form.aliexpress?.apiKey || ''}
            onChange={(value: string) =>
              set('aliexpress', 'apiKey', value)
            }
          />

          <FormField
            label="API Secret"
            value={form.aliexpress?.apiSecret || ''}
            onChange={(value: string) =>
              set('aliexpress', 'apiSecret', value)
            }
          />

          <FormField
            label="Tracking ID"
            value={form.aliexpress?.trackingId || ''}
            onChange={(value: string) =>
              set('aliexpress', 'trackingId', value)
            }
          />
        </div>
      </div>

      <br />

      <button
        className="btn btn-primary"
        onClick={save}
        disabled={saving || loading}
      >
        {saving ? 'Salvando...' : 'Salvar configurações'}
      </button>
    </>
  );
}
