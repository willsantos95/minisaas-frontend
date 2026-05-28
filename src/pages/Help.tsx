import React from 'react';
import PageHeader from '../components/PageHeader';

const items = [
  {
    title: 'Você não precisa mexer no n8n',
    description:
      'O OfertaRelay já usa a automação por trás do sistema. Você não precisa acessar o n8n, criar fluxos, configurar nodes ou entender programação. Basta usar as páginas do painel para informar suas credenciais, conectar o WhatsApp e escolher os grupos.',
  },
  {
    title: 'Como funciona a automação',
    description:
      'O sistema identifica ofertas nos grupos de origem, reconhece a plataforma da oferta, gera o link com suas credenciais de afiliado e envia a mensagem para os grupos de destino que você configurou.',
  },
  {
    title: 'Configurações de afiliado',
    description:
      'Na página Configurações de Afiliado, cadastre as informações das plataformas que você usa, como Shopee, Mercado Livre, Amazon, Magalu ou AliExpress. A automação só envia ofertas das plataformas que tiverem credenciais cadastradas.',
  },
  {
    title: 'Conexão com WhatsApp',
    description:
      'Na página WhatsApp, informe seu número e conecte pelo QR Code. A conexão é feita via Evolution API. O sistema trabalha com grupos configurados e não realiza envio em massa individual para contatos privados.',
  },
  {
    title: 'Gestão de grupos',
    description:
      'Na página Gestão de Grupos, você escolhe quais grupos serão usados como origem e quais receberão as ofertas. Grupos de origem são os grupos onde você recebe promoções. Grupos de destino são seus grupos que receberão as mensagens com seu link de afiliado.',
  },
  {
    title: 'Sincronização dos grupos',
    description:
      'Após conectar o WhatsApp, o sistema tenta sincronizar seus grupos em segundo plano. Se os grupos ainda não aparecerem, acesse Gestão de Grupos e clique em Sincronizar grupos. Depois de salvos, eles carregam mais rápido pelo cache do sistema.',
  },
  {
    title: 'Telegram',
    description:
      'A integração com Telegram pode ser usada como canal adicional de publicação. Para isso, informe o Bot Token e o Chat ID na página Telegram, caso essa opção esteja disponível no seu plano.',
  },
  {
    title: 'Assinatura',
    description:
      'A assinatura mantém sua automação ativa, com acesso ao painel, conexão do WhatsApp, gestão de grupos, configurações de afiliado e manutenção básica do sistema.',
  },
];

export default function Help() {
  return (
    <>
      <PageHeader
        title="Ajuda"
        subtitle="Guia rápido para entender e configurar sua automação no OfertaRelay."
      />

      <div
        className="card"
        style={{
          marginBottom: 18,
          border: '1px solid rgba(34, 197, 94, 0.35)',
          background: 'rgba(34, 197, 94, 0.08)',
        }}
      >
        <h2>O painel foi feito para ser simples</h2>

        <p style={{ marginTop: 8, opacity: 0.85, lineHeight: 1.7 }}>
          Você não precisa aprender n8n, não precisa saber programar e não
          precisa configurar fluxos técnicos. Toda a parte de automação acontece
          nos bastidores. O que você precisa fazer é conectar seu WhatsApp,
          cadastrar suas credenciais de afiliado e escolher os grupos de origem
          e destino.
        </p>
      </div>

      <div className="grid grid-2">
        {items.map((item) => (
          <div className="card" key={item.title}>
            <h2>{item.title}</h2>

            <p style={{ marginTop: 8, opacity: 0.82, lineHeight: 1.7 }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div
        className="card"
        style={{
          marginTop: 18,
          border: '1px solid rgba(245, 158, 11, 0.35)',
          background: 'rgba(245, 158, 11, 0.08)',
        }}
      >
        <h2>Informação importante</h2>

        <p style={{ marginTop: 8, opacity: 0.85, lineHeight: 1.7 }}>
          As ofertas só serão enviadas quando a plataforma identificar uma oferta
          compatível com as credenciais cadastradas. Exemplo: se você cadastrou
          apenas as credenciais da Shopee, somente ofertas da Shopee serão
          processadas e enviadas. Ofertas de outras plataformas sem credenciais
          cadastradas serão ignoradas.
        </p>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>Precisa de suporte?</h2>

        <p style={{ marginTop: 8, opacity: 0.82, lineHeight: 1.7 }}>
          Para suporte, envie um e-mail para{' '}
          <a
            href="mailto:contato@ofertarelay.com.br"
            style={{
              color: 'inherit',
              fontWeight: 700,
              textDecoration: 'underline',
            }}
          >
            contato@ofertarelay.com.br
          </a>
          . Informe o e-mail da sua conta, o número conectado ao WhatsApp e uma
          breve descrição do problema.
        </p>
      </div>
    </>
  );
}
