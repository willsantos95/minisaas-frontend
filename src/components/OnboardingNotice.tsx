import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'ofertarelay_onboarding_seen';

export default function OnboardingNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadySeen = localStorage.getItem(STORAGE_KEY);

    if (!alreadySeen) {
      setVisible(true);
    }
  }, []);

  function closeNotice() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 880,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 24,
          background: '#f8fafc',
          color: '#0f172a',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          padding: 26,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              color: '#0f172a',
            }}
          >
            Bem-vindo ao OfertaRelay
          </h2>

          <p
            style={{
              margin: '10px 0 0',
              color: '#475569',
              lineHeight: 1.6,
            }}
          >
            Antes de começar, veja como a plataforma funciona. O OfertaRelay foi
            criado para automatizar o processo de copiar ofertas de grupos de
            origem, gerar seus links de afiliado e enviar essas ofertas para os
            grupos dos seus assinantes.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div
            className="copy-box"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(203, 213, 225, 0.9)',
              borderRadius: 16,
              padding: 16,
              lineHeight: 1.6,
            }}
          >
            <strong>1. Faça sua assinatura</strong>
            <br />
            Para usar a automação, primeiro é necessário ativar sua assinatura.
            Com o plano ativo, você libera o acesso às funcionalidades do
            sistema, como conexão com WhatsApp, configuração de grupos e cadastro
            das credenciais de afiliado.
          </div>

          <div
            className="copy-box"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(203, 213, 225, 0.9)',
              borderRadius: 16,
              padding: 16,
              lineHeight: 1.6,
            }}
          >
            <strong>2. Conecte seu WhatsApp</strong>
            <br />
            A conexão é feita via Evolution API. Você informa seu número, o
            sistema cria uma instância e exibe o QR Code para conectar o
            WhatsApp. O OfertaRelay trabalha com grupos configurados e não faz
            envio em massa individual para contatos privados.
            <br />
            <br />
            Recomendação: use a automação com responsabilidade, respeitando os
            limites e boas práticas da plataforma.
          </div>

          <div
            className="copy-box"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(203, 213, 225, 0.9)',
              borderRadius: 16,
              padding: 16,
              lineHeight: 1.6,
            }}
          >
            <strong>3. Cadastre suas credenciais de afiliado</strong>
            <br />
            Na página <strong>Configuração do Afiliado</strong>, você deve
            cadastrar as credenciais das plataformas que deseja usar, como
            Shopee, Mercado Livre, Amazon ou outras integrações disponíveis.
            Essas credenciais são usadas para gerar seus links de afiliado
            automaticamente.
          </div>

          <div
            className="copy-box"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(203, 213, 225, 0.9)',
              borderRadius: 16,
              padding: 16,
              lineHeight: 1.6,
            }}
          >
            <strong>4. Defina os grupos de origem</strong>
            <br />
            Na página <strong>Gestão de Grupos</strong>, escolha quais grupos
            serão usados como origem das ofertas. Esses são os grupos onde você
            já recebe promoções e que normalmente pertencem a outras pessoas.
            Quando uma oferta chegar nesses grupos, o OfertaRelay poderá
            identificar e processar a mensagem.
          </div>

          <div
            className="copy-box"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(203, 213, 225, 0.9)',
              borderRadius: 16,
              padding: 16,
              lineHeight: 1.6,
            }}
          >
            <strong>5. Defina os grupos de destino</strong>
            <br />
            Depois, escolha quais grupos receberão as mensagens processadas.
            Esses são os seus grupos de assinantes ou grupos próprios, onde as
            ofertas serão enviadas já com o seu link de afiliado.
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: '1px solid rgba(245, 158, 11, 0.45)',
              background: '#fffbeb',
              color: '#78350f',
              lineHeight: 1.6,
            }}
          >
            <strong>Informação importante:</strong>
            <br />
            Só serão enviadas mensagens de ofertas das plataformas em que você
            cadastrou credenciais.
            <br />
            <br />
            Exemplo: se você cadastrou apenas as credenciais da Shopee, o
            sistema só vai processar e enviar ofertas da Shopee. Se chegar uma
            oferta do Mercado Livre, mas você não cadastrou as credenciais do
            Mercado Livre, essa oferta não será enviada.
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: '1px solid rgba(34, 197, 94, 0.45)',
              background: '#ecfdf5',
              color: '#064e3b',
              lineHeight: 1.6,
            }}
          >
            <strong>Resumo do fluxo:</strong>
            <br />
            Assinatura ativa → WhatsApp conectado → Credenciais cadastradas →
            Grupos de origem definidos → Grupos de destino definidos →
            Automação funcionando.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
            marginTop: 24,
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/como-funciona"
            className="btn"
            onClick={closeNotice}
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(203, 213, 225, 0.9)',
            }}
          >
            Ver página completa
          </Link>

          <button
            className="btn btn-primary"
            onClick={closeNotice}
            style={{
              background: '#16a34a',
              color: '#ffffff',
              border: '1px solid #16a34a',
            }}
          >
            Entendi, quero começar
          </button>
        </div>
      </div>
    </div>
  );
}
