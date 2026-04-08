/* ==================================================
   CHAMADOS
================================================== */

/**
 * Retorna a classe CSS de badge para o status.
 *
 * @param {string} status
 * @returns {string}
 */
function getStatusBadgeClass(status) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "aberto") return "badge-status-aberto";
  if (normalized === "em andamento") return "badge-status-andamento";
  if (normalized === "em espera") return "badge-status-espera";
  if (normalized === "concluido" || normalized === "resolvido") return "badge-status-concluido";
  if (normalized === "fechado") return "badge-status-fechado";

  return "";
}

/**
 * Retorna a classe CSS de badge para a prioridade.
 *
 * @param {string} prioridade
 * @returns {string}
 */
function getPrioridadeBadgeClass(prioridade) {
  const normalized = (prioridade || "").toLowerCase();

  if (normalized === "alta") return "badge-prioridade-alta";
  if (normalized === "media" || normalized === "média") return "badge-prioridade-media";
  if (normalized === "baixa") return "badge-prioridade-baixa";

  return "";
}

/**
 * Renderiza a lista de chamados na tela.
 *
 * @param {Array} chamados - lista recebida da API
 */
function renderChamados(chamados) {
  const lista = document.getElementById("lista-chamados");

  if (!lista) return;

  lista.innerHTML = "";

  if (!chamados || chamados.length === 0) {
    lista.innerHTML = `<p class="empty-state">Nenhum chamado cadastrado.</p>`;
    return;
  }

  chamados.forEach((chamado) => {
    const status = (chamado.status || "").toLowerCase();

    const isResolvido = status === "resolvido";
    const isFechado = status === "fechado";
    const isAberto = status === "aberto";
    const isEmAndamento = status === "em andamento";
    const isEmEspera = status === "em espera";

    const botoes = [];

    if (isAberto) {
      botoes.push(`
        <button class="btn btn-save btn-sm" onclick="updateChamadoStatus(${chamado.id}, 'em andamento')">
          Iniciar atendimento
        </button>
      `);
    }

    if (isEmAndamento) {
      botoes.push(`
        <button class="btn btn-save btn-sm" onclick="updateChamadoStatus(${chamado.id}, 'em espera')">
          Colocar em espera
        </button>
      `);

      botoes.push(`
        <button class="btn btn-save btn-sm" onclick="updateChamadoStatus(${chamado.id}, 'resolvido')">
          Resolver
        </button>
      `);
    }

    if (isEmEspera) {
      botoes.push(`
        <button class="btn btn-save btn-sm" onclick="updateChamadoStatus(${chamado.id}, 'em andamento')">
          Retomar
        </button>
      `);
    }

    if (isResolvido) {
      botoes.push(`
        <button class="btn btn-save btn-sm" disabled>
          Resolvido
        </button>
      `);

      botoes.push(`
        <button class="btn btn-outline-secondary btn-sm" onclick="updateChamadoStatus(${chamado.id}, 'aberto')">
          Reabrir
        </button>
      `);

      botoes.push(`
        <button class="btn btn-outline-secondary btn-sm" onclick="updateChamadoStatus(${chamado.id}, 'fechado')">
          Fechar
        </button>
      `);
    }

    if (isFechado) {
      botoes.push(`
        <button class="btn btn-outline-secondary btn-sm" disabled>
          Fechado
        </button>
      `);
    }

    const card = document.createElement("div");
    card.className = "list-card";

    card.innerHTML = `
      <h4>${chamado.titulo ?? "-"}</h4>
      <p><strong>ID:</strong> ${chamado.id ?? "-"}</p>
      <p><strong>Descrição:</strong> ${chamado.descricao ?? "-"}</p>
      <p><strong>Usuário:</strong> ${chamado.usuario ?? "-"}</p>
      <p><strong>Departamento:</strong> ${chamado.departamento ?? "-"}</p>
      <p>
        <strong>Status:</strong>
        <span class="badge-custom ${getStatusBadgeClass(chamado.status)}">
          ${formatStatusLabel(chamado.status)}
        </span>
      </p>
      <p>
        <strong>Prioridade:</strong>
        <span class="badge-custom ${getPrioridadeBadgeClass(chamado.prioridade)}">
          ${formatPrioridadeLabel(chamado.prioridade)}
        </span>
      </p>

      <div class="form-actions">
        ${botoes.join("")}
        <button class="btn btn-cancel btn-sm" onclick="deleteChamado(${chamado.id})">
          Excluir
        </button>
      </div>
    `;

    lista.appendChild(card);
  });
}

/**
 * Atualiza o total de chamados no dashboard.
 *
 * @param {Array} chamados
 */
function updateDashboardChamados(chamados) {
  const total = document.getElementById("total-chamados");

  if (!total) return;

  total.textContent = chamados.length;
}

/**
 * Busca chamados na API e atualiza a interface.
 */
async function loadChamados() {
  try {
    const chamados = await apiRequest("/chamados", "GET");

    appState.chamados = chamados;

    renderChamados(appState.chamados);
    updateDashboardChamados(appState.chamados);
    updateDashboardChamadoStatus(appState.chamados);
    renderDashboardChamadosRecentes(appState.chamados);
  } catch (error) {
    showFeedback(`Erro ao carregar chamados: ${error.message}`, "error");
  }
}

/**
 * Filtra os chamados carregados em memória com base
 * no texto digitado e nos filtros selecionados.
 */
function filterChamados() {
  const buscaInput = document.getElementById("busca-chamados");
  const statusInput = document.getElementById("filtro-status");
  const prioridadeInput = document.getElementById("filtro-prioridade");

  if (!buscaInput || !statusInput || !prioridadeInput) return;

  const busca = buscaInput.value.toLowerCase().trim();
  const status = statusInput.value.toLowerCase();
  const prioridade = prioridadeInput.value.toLowerCase();

  const chamadosFiltrados = appState.chamados.filter((chamado) => {
    const matchesBusca =
      (chamado.titulo || "").toLowerCase().includes(busca) ||
      (chamado.descricao || "").toLowerCase().includes(busca) ||
      (chamado.usuario || "").toLowerCase().includes(busca) ||
      (chamado.departamento || "").toLowerCase().includes(busca);

    const matchesStatus = !status || (chamado.status || "").toLowerCase() === status;
    const matchesPrioridade = !prioridade || (chamado.prioridade || "").toLowerCase() === prioridade;

    return matchesBusca && matchesStatus && matchesPrioridade;
  });

  renderChamados(chamadosFiltrados);
}

/**
 * Trata o envio do formulário de chamado.
 *
 * O backend espera:
 * {
 *   titulo,
 *   descricao,
 *   prioridade,
 *   id_usuario
 * }
 *
 * @param {Event} event
 */
async function handleChamadoSubmit(event) {
  event.preventDefault();

  const titulo = document.getElementById("cha-titulo")?.value.trim() || "";
  const descricao = document.getElementById("cha-descricao")?.value.trim() || "";
  const prioridade = document.getElementById("cha-prioridade")?.value || "";
  const idUsuario = Number(document.getElementById("cha-usuario")?.value || 0);

  const novoChamado = {
    titulo,
    descricao,
    prioridade,
    id_usuario: idUsuario
  };

  try {
    await apiRequest("/chamados", "POST", novoChamado);

    showFeedback("Chamado cadastrado com sucesso!", "success");

    const form = document.getElementById("form-chamado");
    if (form) form.reset();

    const statusField = document.getElementById("cha-status");
    if (statusField) {
      statusField.value = "Aberto";
    }

    await loadChamados();
    resetChamadoFilters();
    showSection("dashboard");
  } catch (error) {
    showFeedback(`Erro ao cadastrar chamado: ${error.message}`, "error");
  }
}

/**
 * Atualiza o status de um chamado.
 *
 * @param {number} chamadoId
 * @param {string} novoStatus
 */
async function updateChamadoStatus(chamadoId, novoStatus) {
  try {
    await apiRequest(`/chamados/${chamadoId}`, "PUT", {
      status: novoStatus
    });

    showFeedback("Status do chamado atualizado com sucesso!", "success");
    await loadChamados();
    resetChamadoFilters();
  } catch (error) {
    showFeedback(`Erro ao atualizar chamado: ${error.message}`, "error");
  }
}

/**
 * Exclui um chamado.
 *
 * @param {number} chamadoId
 */
async function deleteChamado(chamadoId) {
  const confirmDelete = confirm("Deseja realmente excluir este chamado?");

  if (!confirmDelete) {
    return;
  }

  try {
    await apiRequest(`/chamados/${chamadoId}`, "DELETE");

    showFeedback("Chamado excluído com sucesso!", "success");
    await loadChamados();
    resetChamadoFilters();
  } catch (error) {
    showFeedback(`Erro ao excluir chamado: ${error.message}`, "error");
  }
}

/**
 * Limpa os filtros da seção de chamados e renderiza novamente
 * a lista completa já carregada em memória.
 */
function resetChamadoFilters() {
  const buscaChamados = document.getElementById("busca-chamados");
  const filtroStatus = document.getElementById("filtro-status");
  const filtroPrioridade = document.getElementById("filtro-prioridade");

  if (buscaChamados) {
    buscaChamados.value = "";
  }

  if (filtroStatus) {
    filtroStatus.value = "";
  }

  if (filtroPrioridade) {
    filtroPrioridade.value = "";
  }

  renderChamados(appState.chamados);
}

/**
 * Configura eventos da seção de chamados.
 */
function setupChamadoEvents() {
  const formChamado = document.getElementById("form-chamado");
  const btnAtualizar = document.getElementById("btn-carregar-chamados");
  const buscaChamados = document.getElementById("busca-chamados");
  const filtroStatus = document.getElementById("filtro-status");
  const filtroPrioridade = document.getElementById("filtro-prioridade");

  if (formChamado) {
    formChamado.addEventListener("submit", handleChamadoSubmit);
  }

  if (btnAtualizar) {
    btnAtualizar.addEventListener("click", async () => {
      await loadChamados();
      resetChamadoFilters();
    });
  }

  if (buscaChamados) {
    buscaChamados.addEventListener("input", filterChamados);
  }

  if (filtroStatus) {
    filtroStatus.addEventListener("change", filterChamados);
  }

  if (filtroPrioridade) {
    filtroPrioridade.addEventListener("change", filterChamados);
  }
}

/**
 * Preenche o select de usuários da seção de chamados.
 *
 * Como o backend de chamados espera "id_usuario",
 * o value da option deve ser o id do usuário.
 *
 * @param {Array} usuarios
 */
function populateUsuarioSelect(usuarios) {
  const select = document.getElementById("cha-usuario");

  if (!select) return;

  select.innerHTML = `<option value="">Selecione um usuário</option>`;

  usuarios.forEach((usuario) => {
    const option = document.createElement("option");
    option.value = usuario.id;
    option.textContent = `${usuario.nome} - ${usuario.departamento}`;
    select.appendChild(option);
  });
}

/**
 * Controla se o formulário de chamados pode ser usado
 * com base na existência de usuários.
 *
 * @param {Array} usuarios
 */
function toggleChamadoFormByUsuarios(usuarios) {
  const form = document.getElementById("form-chamado");
  const select = document.getElementById("cha-usuario");

  if (!form || !select) return;

  const hasUsers = usuarios && usuarios.length > 0;

  if (!hasUsers) {
    form.querySelectorAll("input, select, textarea, button").forEach((element) => {
      element.disabled = true;
    });

    select.innerHTML = `<option value="">Cadastre um usuário primeiro</option>`;
  } else {
    form.querySelectorAll("input, select, textarea, button").forEach((element) => {
      element.disabled = false;
    });
  }
}