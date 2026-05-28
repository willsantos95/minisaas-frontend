export const API_URL = import.meta.env.VITE_API_URL || '/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

function buildUrl(path: string) {
  if (path.startsWith('http')) {
    return path;
  }

  return `${API_URL}${path}`;
}

export async function api(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('Erro API:', {
      status: response.status,
      path,
      data,
    });

    throw new Error(
      data.message ||
        data.error ||
        data.detail ||
        `Erro ${response.status} na requisição`
    );
  }

  return data;
}

/**
 * Configurações de afiliado do usuário logado.
 *
 * Usa token do login:
 * Authorization: Bearer TOKEN
 *
 * Backend esperado:
 * GET /api/affiliate
 */
export async function getAffiliateSettings() {
  return api('/affiliate');
}

/**
 * Salva configurações de afiliado do usuário logado.
 *
 * Backend esperado:
 * POST /api/affiliate
 */
export async function saveAffiliateSettings(payload: any) {
  return api('/affiliate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Novo modo da API para o n8n:
 * busca configurações pela instância da Evolution,
 * sem precisar de x-api-key.
 *
 * Backend esperado:
 * GET /api/n8n/settings?instance=NOME_DA_INSTANCIA
 */
export async function getN8nSettingsByInstance(instanceName: string, niche?: string) {
  const params = new URLSearchParams();

  params.set('instance', instanceName);

  if (niche) {
    params.set('niche', niche);
  }

  return api(`/n8n/settings?${params.toString()}`);
}

/**
 * Busca grupos de origem pela instância.
 *
 * Backend esperado:
 * GET /api/n8n/groups?instance=NOME_DA_INSTANCIA&copy=true
 */
export async function getOriginGroupsByInstance(instanceName: string) {
  const params = new URLSearchParams();

  params.set('instance', instanceName);
  params.set('copy', 'true');

  return api(`/n8n/groups?${params.toString()}`);
}

/**
 * Busca grupos de destino pela instância.
 *
 * Backend esperado:
 * GET /api/n8n/groups?instance=NOME_DA_INSTANCIA&send=true
 */
export async function getDestinationGroupsByInstance(
  instanceName: string,
  niche?: string
) {
  const params = new URLSearchParams();

  params.set('instance', instanceName);
  params.set('send', 'true');

  if (niche) {
    params.set('niche', niche);
  }

  return api(`/n8n/groups?${params.toString()}`);
}

/**
 * Configurações do WhatsApp do usuário logado.
 */
export async function getWhatsAppStatus() {
  return api('/whatsapp/status');
}

/**
 * Dashboard do usuário logado.
 */
export async function getDashboard() {
  return api('/whatsapp/dashboard');
}
