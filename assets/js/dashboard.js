/* ==================================================
   DASHBOARD
================================================== */

/**
 * Formata o status para exibição amigável.
 *
 * @param {string} status
 * @returns {string}
 */
function formatStatusLabel(status) {
  if (!status) return "-";

  const normalized = status.toLowerCase();

  if (normalized === "aberto") return "Aberto";
  if (normalized === "em andamento") return "Em andamento";
  if (normalized === "em espera") return "Em espera";
  if (normalized === "resolvido") return "Resolvido";
  if (normalized === "concluido") return "Concluído";
  if (normalized === "fechado") return "Fechado";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Formata a prioridade para exibição amigável.
 *
 * @param {string} prioridade
 * @returns {string}
 */
function formatPrioridadeLabel(prioridade) {
  if (!prioridade) return "-";

  const normalized = prioridade.toLowerCase();

  if (normalized === "alta") return "Alta";
  if (normalized === "media" || normalized === "média") return "Média";
  if (normalized === "baixa") return "Baixa";

  return prioridade.charAt(0).toUpperCase() + prioridade.slice(1);
}

/**
 * Atualiza os contadores de status dos chamados no dashboard.
 *
 * @param {Array} chamados
 */
function updateDashboardChamadoStatus(chamados) {
  const totalAbertos = document.getElementById("total-chamados-abertos");
  const totalAndamento = document.getElementById("total-chamados-andamento");
  const totalEspera = document.getElementById("total-chamados-espera");
  const totalResolvidos = document.getElementById("total-chamados-resolvidos");

  if (!totalAbertos || !totalAndamento || !totalEspera || !totalResolvidos) {
    return;
  }

  let abertos = 0;
  let andamento = 0;
  let espera = 0;
  let resolvidos = 0;

  chamados.forEach((chamado) => {
    const status = (chamado.status || "").toLowerCase();

    if (status === "aberto") abertos++;
    if (status === "em andamento") andamento++;
    if (status === "em espera") espera++;
    if (status === "resolvido" || status === "concluido") resolvidos++;
  });

  totalAbertos.textContent = abertos;
  totalAndamento.textContent = andamento;
  totalEspera.textContent = espera;
  totalResolvidos.textContent = resolvidos;
}

/**
 * Renderiza a tabela de chamados recentes no dashboard.
 *
 * Mostra os 5 chamados mais recentes com base na ordem recebida da API.
 *
 * @param {Array} chamados
 */
function renderDashboardChamadosRecentes(chamados) {
  const tbody = document.getElementById("dashboard-chamados-recentes");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!chamados || chamados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table">Nenhum chamado encontrado.</td>
      </tr>
    `;
    return;
  }

  const chamadosRecentes = [...chamados].slice(-5).reverse();

  chamadosRecentes.forEach((chamado) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${chamado.id ?? "-"}</td>
      <td>${chamado.titulo ?? "-"}</td>
      <td>${chamado.usuario ?? "-"}</td>
      <td>
        <span class="badge-custom ${getStatusBadgeClass(chamado.status || "")}">
          ${formatStatusLabel(chamado.status)}
        </span>
      </td>
      <td>
        <span class="badge-custom ${getPrioridadeBadgeClass(chamado.prioridade || "")}">
          ${formatPrioridadeLabel(chamado.prioridade)}
        </span>
      </td>
    `;

    tbody.appendChild(row);
  });
}