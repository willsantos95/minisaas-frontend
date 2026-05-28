import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Step = {
  key: string;
  label: string;
  description: string;
  path: string;
  actionLabel: string;
};

const STEPS: Step[] = [
  {
    key: 'subscription',
    label: 'Assinar plano',
    description: 'Ative sua assinatura para liberar o relay automático.',
    path: '/billing',
    actionLabel: 'Assinar agora',
  },
  {
    key: 'whatsapp',
    label: 'Conectar WhatsApp',
    description: 'Escaneie o QR Code para vincular seu número.',
    path: '/whatsapp',
    actionLabel: 'Conectar',
  },
  {
    key: 'affiliate',
    label: 'Configurar afiliados',
    description: 'Cadastre suas credenciais de afiliado (Amazon, Shopee…).',
    path: '/affiliate',
    actionLabel: 'Configurar',
  },
  {
    key: 'groups',
    label: 'Sincronizar grupos',
    description: 'Importe e classifique seus grupos de origem e destino.',
    path: '/groups',
    actionLabel: 'Ir para grupos',
  },
];

type StepStatus = 'done' | 'current' | 'pending';

function getStepStatus(key: string, completed: Set<string>, currentIdx: number, stepIdx: number): StepStatus {
  if (completed.has(key)) return 'done';
  if (stepIdx === currentIdx) return 'current';
  return 'pending';
}

export default function OnboardingWizard() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('onboarding_dismissed') === 'true'
  );

  useEffect(() => {
    async function checkState() {
      try {
        const done = new Set<string>();

        const [billing, whatsapp, settings, groups] = await Promise.allSettled([
          api('/billing/me'),
          api('/whatsapp/status'),
          api('/settings/affiliate'),
          api('/whatsapp/dashboard'),
        ]);

        // 1. Assinatura
        if (billing.status === 'fulfilled') {
          const status = billing.value?.user?.plan_status;
          if (status === 'active' || status === 'trial') done.add('subscription');
        }

        // 2. WhatsApp
        if (whatsapp.status === 'fulfilled' && whatsapp.value?.connected) {
          done.add('whatsapp');
        }

        // 3. Afiliado — considera preenchido se tiver pelo menos uma chave
        if (settings.status === 'fulfilled') {
          const payload = settings.value?.settings?.payload || settings.value?.payload || {};
          if (Object.keys(payload).some((k) => payload[k])) done.add('affiliate');
        }

        // 4. Grupos
        if (groups.status === 'fulfilled') {
          const summary = groups.value?.summary;
          if (summary?.origin_groups > 0 && summary?.destination_groups > 0) {
            done.add('groups');
          }
        }

        setCompleted(done);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    }

    if (!dismissed) checkState();
    else setLoading(false);
  }, [dismissed]);

  if (loading || dismissed) return null;

  const allDone = STEPS.every((s) => completed.has(s.key));
  if (allDone) return null;

  const currentIdx = STEPS.findIndex((s) => !completed.has(s.key));
  const currentStep = STEPS[currentIdx];

  function dismiss() {
    localStorage.setItem('onboarding_dismissed', 'true');
    setDismissed(true);
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
        border: '1px solid #bbf7d0',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#166534', marginBottom: 4 }}>
            🚀 Configure o OfertaRelay em 4 passos
          </p>
          <p style={{ fontSize: '.85rem', color: '#15803d' }}>
            {STEPS.filter((s) => completed.has(s.key)).length} de {STEPS.length} concluídos
          </p>
        </div>
        <button
          onClick={dismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '1.1rem', lineHeight: 1 }}
          title="Dispensar"
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        {STEPS.map((step, idx) => {
          const status = getStepStatus(step.key, completed, currentIdx, idx);
          return (
            <div
              key={step.key}
              style={{
                flex: '1 1 180px',
                background: status === 'done' ? '#dcfce7' : status === 'current' ? 'white' : '#f9fafb',
                border: `1px solid ${status === 'current' ? '#22c55e' : status === 'done' ? '#86efac' : '#e5e7eb'}`,
                borderRadius: 12,
                padding: '14px 16px',
                opacity: status === 'pending' ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: status === 'done' ? '#22c55e' : status === 'current' ? '#22c55e' : '#d1d5db',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '.7rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {status === 'done' ? '✓' : idx + 1}
                </span>
                <strong style={{ fontSize: '.85rem' }}>{step.label}</strong>
              </div>
              <p style={{ fontSize: '.78rem', color: '#4b5563', marginBottom: 10 }}>{step.description}</p>
              {status === 'current' && (
                <a
                  href={step.path}
                  style={{
                    display: 'inline-block',
                    background: '#22c55e',
                    color: 'white',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: '.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {step.actionLabel} →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
