// URL base da sua API Flask
// Ajuste se sua API estiver em outra porta ou endereço
const API_BASE_URL = "http://127.0.0.1:5000";

/**
 * Função genérica para comunicação com a API.
 * Centraliza as chamadas HTTP do sistema.
 *
 * @param {string} endpoint - rota da API, por exemplo "/departamentos"
 * @param {string} method - método HTTP: GET, POST, PUT, DELETE
 * @param {object|null} body - dados enviados no corpo da requisição
 * @returns {Promise<any>} - dados retornados pela API
 */
async function apiRequest(endpoint, method = "GET", body = null) {
  const config = {
    method,
    headers: {}
  };

  if (body !== null) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (error) {
    throw new Error("Não foi possível conectar à API. Verifique se o backend está em execução.");
  }

  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    console.error("Erro da API:", {
      status: response.status,
      data: data
    });

    const errorMessage =
      data?.message ||
      data?.erro ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      `Erro na requisição: ${response.status}`;

    throw new Error(errorMessage);
  }

  return data;
}