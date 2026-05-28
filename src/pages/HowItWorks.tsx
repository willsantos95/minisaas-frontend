import React from 'react';
import PageHeader from '../components/PageHeader';

const steps = [
  {
    number: '1',
    title: 'Faça sua assinatura',
    description:
      'Ative sua assinatura para liberar o uso da plataforma. Após o cadastro e assinatura, nossa equipe entrará em contato para orientar a ativação da automação.',
  },
  {
    number: '2',
    title: 'A ativação será feita com seu consentimento',
    description:
      'Nada será ativado ou configurado sem sua autorização. Antes de qualquer automação começar a funcionar, entraremos em contato para confirmar os dados, validar as configurações e seguir somente com o seu consentimento.',
  },
  {
    number: '3',
    title: 'Conecte seu WhatsApp',
    description:
      'Conecte seu WhatsApp pela Evolution API. O sistema trabalha com grupos configurados e não realiza envio em massa individual. Recomendamos usar a automação com responsabilidade, respeitando limites e boas práticas da plataforma.',
  },
  {
    number: '4',
    title: 'Cadastre suas credenciais de afiliado',
    description:
      'Na página Configuração do Afiliado, cadastre as credenciais das plataformas que você utiliza, como Shopee, Mercado Livre, Amazon, Magalu ou AliExpress.',
  },
  {
    number: '5',
    title: 'Defina os grupos de origem',
    description:
      'Escolha os grupos onde você recebe ofertas e quer fazer o relay das mensagens. Normalmente são grupos de ofertas de outras pessoas dos quais você participa.',
  },
  {
    number: '6',
    title: 'Defina os grupos de destino',
    description:
      'Escolha os grupos que receberão as mensagens já processadas com o seu link de afiliado. Importante: só é permitido configurar grupos de destino onde você é administrador e tem autorização para publicar mensagens.',
  },
  {
    number: '7',
    title: 'A automação só envia ofertas com credenciais cadastradas',
    description:
      'Se você cadastrar apenas a API da Shopee, por exemplo, somente ofertas da Shopee serão processadas e enviadas. Se não cadastrar as credenciais do Mercado Livre, as ofertas do Mercado Livre não serão encaminhadas.',
  },
];

const lightBoxStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.92)',
  color: '#0f172a',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
};

export default function HowItWorks() {
  return (
    <>
      <PageHeader
        title="Como funciona"
        subtitle="Entenda o passo a passo para configurar o OfertaRelay e automatizar seus grupos de ofertas com segurança e consentimento."
      />

      <div className="card" style={lightBoxStyle}>
        <h2 style={{ color: '#0f172a' }}>Fluxo geral da automação</h2>

        <p style={{ marginTop: 8, color: '#334155', lineHeight: 1.7 }}>
          O OfertaRelay conecta seu WhatsApp, identifica ofertas nos grupos de
          origem, gera seus links de afiliado com base nas credenciais
          cadastradas e envia as mensagens para os grupos de destino que você
          configurar.
        </p>

        <div
          className="copy-box"
          style={{
            marginTop: 18,
            fontSize: 15,
            lineHeight: 1.7,
            background: '#f8fafc',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
          }}
        >
          Grupos de origem → OfertaRelay → Link de afiliado → Grupos de destino
        </div>
      </div>

      <div
        className="card"
        style={{
          ...lightBoxStyle,
          marginTop: 18,
          border: '1px solid rgba(34, 197, 94, 0.45)',
          background: '#f0fdf4',
        }}
      >
        <h2 style={{ color: '#14532d' }}>Ativação acompanhada</h2>

        <p style={{ marginTop: 8, color: '#166534', lineHeight: 1.7 }}>
          Após o cadastro, entraremos em contato para orientar a ativação da
          automação. Nenhuma configuração será feita sem o seu consentimento.
          Tudo será validado com você antes de colocar a automação em
          funcionamento.
        </p>
      </div>

      <div className="card" style={{ ...lightBoxStyle, marginTop: 18 }}>
        <h2 style={{ color: '#0f172a' }}>Passo a passo</h2>

        <div
          style={{
            display: 'grid',
            gap: 16,
            marginTop: 18,
          }}
        >
          {steps.map((step) => (
            <div
              key={step.number}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr',
                gap: 14,
                alignItems: 'flex-start',
                padding: 16,
                borderRadius: 16,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#dcfce7',
                  color: '#15803d',
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                {step.number}
              </div>

              <div>
                <h3 style={{ margin: 0, color: '#0f172a' }}>{step.title}</h3>
                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#475569',
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ ...lightBoxStyle, marginTop: 18 }}>
        <h2 style={{ color: '#0f172a' }}>Regras importantes de uso</h2>

        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gap: 14,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: '1px solid #f59e0b',
              background: '#fffbeb',
              color: '#78350f',
            }}
          >
            <h3 style={{ margin: 0, color: '#78350f' }}>
              Consentimento obrigatório
            </h3>

            <p style={{ margin: '8px 0 0', lineHeight: 1.6 }}>
              Após o cadastro, nossa equipe entrará em contato para confirmar as
              informações e orientar a ativação. Nada será feito sem sua
              autorização e consentimento.
            </p>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: '1px solid #ef4444',
              background: '#fef2f2',
              color: '#7f1d1d',
            }}
          >
            <h3 style={{ margin: 0, color: '#7f1d1d' }}>
              Envio apenas em grupos permitidos
            </h3>

            <p style={{ margin: '8px 0 0', lineHeight: 1.6 }}>
              Só é permitido configurar o envio de mensagens para grupos onde
              você é administrador e tem autorização para publicar. Não utilize a
              automação em grupos onde você não tem permissão para enviar
              ofertas.
            </p>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: '1px solid #f59e0b',
              background: '#fffbeb',
              color: '#78350f',
            }}
          >
            <h3 style={{ margin: 0, color: '#78350f' }}>
              Credenciais obrigatórias por plataforma
            </h3>

            <p style={{ margin: '8px 0 0', lineHeight: 1.6 }}>
              As mensagens só serão enviadas quando a plataforma identificar uma
              oferta compatível com as credenciais cadastradas. Exemplo: se você
              cadastrou apenas as credenciais da Shopee, somente ofertas da
              Shopee serão processadas e enviadas aos grupos de destino.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
