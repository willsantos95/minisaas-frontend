import PageHeader from '../components/PageHeader';
const CHECKOUT_URL = import.meta.env.VITE_CHECKOUT_URL || 'https://checkout.exemplo.com/relampago-199';
export default function Subscription() {
  return <><PageHeader title="Assinatura" subtitle="Plano comercial para automação de grupos de ofertas." />
  <div className="grid grid-2"><div className="card"><span className="badge">15 dias grátis</span><h1>R$199/mês</h1><p>Setup totalmente grátis somente para a primeira vaga.</p><a className="btn btn-primary" href={CHECKOUT_URL} target="_blank">Ir para checkout</a></div>
  <div className="card"><h2>Benefícios inclusos</h2><ul><li>Automação funcionando 24h por dia</li><li>Recebe ofertas automaticamente</li><li>Gera links para Shopee, Mercado Livre e Amazon</li><li>Melhorias mapeadas: AliExpress, Magazine Luiza e Telegram</li><li>Formata a mensagem pronta para envio</li><li>Dispara automaticamente para grupos</li><li>Suporte básico + manutenção inclusos</li><li>Sem limite de grupos</li></ul></div></div></>;
}
