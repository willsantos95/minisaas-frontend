const API_URL = import.meta.env.VITE_API_URL || "";

function getToken() {
  return localStorage.getItem("token");
}

export async function connectWhatsApp(phone: string) {
  const response = await fetch(`${API_URL}/api/whatsapp/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ phone }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erro ao conectar WhatsApp.");
  }

  return data;
}

export async function getWhatsAppStatus() {
  const response = await fetch(`${API_URL}/api/whatsapp/status`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erro ao consultar status.");
  }

  return data;
}
