import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { api } from '../lib/api';

type TelegramForm = {
  botToken: string;
  chatIds: string;  // one per line in textarea, stored as array
  status: 'active' | 'inactive';
};

function parseChatIds(raw: string): string[] {
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TelegramSettings() {
  const [form, setForm] = useState<TelegramForm>({
    botToken: '',
    chatIds: '',
    status: 'inactive',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    api('/settings/telegram')
      .then((d) => {
        const payload = d?.setting?.payload || {};
        setForm({
          botToken: payload.botToken || '',
          chatIds: Array.isArray(payload.chatIds)
            ? payload.chatIds.join('\n')
            : payload.chatId || '',
          status: payload.status || 'inactive',
        });
      })
      .catch(() => {});
  }, []);

  async function save() {
    try {
      setSaving(true);
      setMsg('');
      setError('');

      await api('/settings/telegram', {
        method: 'PUT',
        body: JSON.stringify({
          botToken: form.botToken.trim(),
          chatIds: parseChatIds(form.chatIds),
          status: form.status,
        }),
      });

      setMsg('Configuração do Telegram salva com sucesso.');
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar configuração.');
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    try {
      setTesting(true);
      setMsg('');
      setError('');

      const chatIds = parseChatIds(form.chatIds);

      if (!form.botToken.trim()) {
        setError('Informe o Bot Token antes de testar.');
        return;
      }

      if (chatIds.length === 0) {
        setError('Informe ao menos um Chat ID antes de testar.');
        return;
      }

      const data = await api('/settings/telegram/test', {
        method: 'POST',
        body: JSON.stringify({
          botToken: form.botToken.trim(),
          chatIds,
        }),
      });

      if (data?.success) {
        setMsg(`✅ Conexão testada com sucesso! Mensagem enviada para ${chatIds.length} destino(s).`);
      } else {
        setError(data?.message || 'Falha ao testar conexão.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao testar conexão com o Telegram.');
    } finally {
      setTesting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Telegram"
        subtitle="Configure um bot do Telegram para receber as ofertas relayadas em canais ou grupos."
      />

      <Alert message={msg || error} />

      <div className="grid grid-2">
        <div className="card">
          <h2>Credenciais do Bot</h2>

          <div className="field" style={{ marginTop: 18 }}>
            <label>Bot Token</label>
            <input
              type="password"
              value={form.botToken}
              onChange={(e) => setForm({ ...form, botToken: e.target.value })}
              placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
            />
            <small style={{ color: '#6b7280', marginTop: 4, display: 'block' }}>
              Obtenha com o @BotFather no Telegram.
            </small>
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Chat IDs de destino</label>
            <textarea
              value={form.chatIds}
              onChange={(e) => setForm({ ...form, chatIds: e.target.value })}
              placeholder={`@meucanal\n-100123456789\n@outrogrupo`}
              rows={5}
              style={{
                width: '100%',
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '.88rem',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--input-bg, #fff)',
              }}
            />
            <small style={{ color: '#6b7280', marginTop: 4, display: 'block' }}>
              Um por linha. Use @username para canais públicos ou o ID numérico para grupos privados.
            </small>
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Status da integração</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as 'active' | 'inactive' })
              }
            >
              <option value="active">Ativo — envia para o Telegram</option>
              <option value="inactive">Inativo — não envia</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar configuração'}
            </button>
            <button className="btn" onClick={testConnection} disabled={testing}>
              {testing ? 'Testando...' : 'Testar conexão'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card">
            <h2>Como configurar o bot</h2>
            <ol style={{ marginTop: 14, lineHeight: 2, opacity: .88 }}>
              <li>Abra o Telegram e pesquise por <strong>@BotFather</strong>.</li>
              <li>Envie <code>/newbot</code> e escolha um nome e username.</li>
              <li>O BotFather enviará o <strong>Bot Token</strong> — copie-o acima.</li>
              <li>Adicione o bot ao canal ou grupo onde quer enviar as ofertas.</li>
              <li>Promova o bot a <strong>Administrador</strong> do canal/grupo.</li>
              <li>Cole o Chat ID do destino acima e clique em <strong>Testar conexão</strong>.</li>
            </ol>
          </div>

          <div className="card">
            <h2>Como descobrir o Chat ID</h2>
            <div style={{ marginTop: 14, lineHeight: 1.7, opacity: .88 }}>
              <p><strong>Canal público:</strong> use <code>@username</code> do canal.</p>
              <p style={{ marginTop: 10 }}>
                <strong>Grupo ou canal privado:</strong> adicione o bot{' '}
                <code>@userinfobot</code> ao grupo e envie qualquer mensagem — ele responde com o ID numérico (ex: <code>-100123456789</code>).
              </p>
              <p style={{ marginTop: 10 }}>
                <strong>Múltiplos destinos:</strong> coloque um Chat ID por linha para enviar para vários canais/grupos ao mesmo tempo.
              </p>
            </div>
          </div>

          <div className="card">
            <h2>Como funciona o relay</h2>
            <div
              style={{
                marginTop: 12,
                padding: 16,
                borderRadius: 12,
                background: 'rgba(34,197,94,.07)',
                border: '1px solid rgba(34,197,94,.3)',
                lineHeight: 1.7,
                fontSize: '.9rem',
              }}
            >
              <strong>WhatsApp</strong> recebe a oferta
              <br />↓ OfertaRelay gera o link de afiliado
              <br />↓ Envia para grupos WhatsApp destino
              <br />↓ <strong>Envia também para os chats do Telegram</strong>
            </div>
            <p style={{ marginTop: 12, fontSize: '.85rem', opacity: .75 }}>
              O Telegram recebe a legenda completa com o link de afiliado. A integração é opcional — se estiver inativa, só o WhatsApp é usado.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
