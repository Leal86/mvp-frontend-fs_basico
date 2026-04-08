/**
 * Exibe uma mensagem visual para o usuário.
 *
 * @param {string} message - mensagem a ser exibida
 * @param {string} type - tipo da mensagem: "success" ou "error"
 */
function showFeedback(message, type = "success") {
  const feedback = document.getElementById("feedback");

  feedback.textContent = message;
  feedback.classList.remove("d-none", "feedback-success", "feedback-error");

  if (type === "success") {
    feedback.classList.add("feedback-success");
  } else {
    feedback.classList.add("feedback-error");
  }

  setTimeout(() => {
    feedback.classList.add("d-none");
  }, 4000);
}

/* ==================================================
   DADOS EM MEMÓRIA
================================================== */

/**
 * Estas variáveis armazenam os dados carregados da API.
 * Isso permite filtrar localmente sem precisar chamar a API
 * a cada digitação no campo de busca.
 */
let departamentosData = [];
let usuariosData = [];
let chamadosData = [];

/* ==================================================
   DEPARTAMENTOS
================================================== */

/**
 * Renderiza a lista de departamentos na tela.
 *
 * @param {Array} departamentos - lista recebida da API
 */
function renderDepartamentos(departamentos) {
  const lista = document.getElementById("lista-departamentos");
  lista.innerHTML = "";

  if (!departamentos || departamentos.length === 0) {
    lista.innerHTML = `<p class="empty-state">Nenhum departamento cadastrado.</p>`;
    return;
  }

  departamentos.forEach((departamento) => {
    const card = document.createElement("div");
    card.className = "list-card";

    card.innerHTML = `
      <h4>${departamento.nome}</h4>
      <p><strong>Sigla:</strong> ${departamento.sigla}</p>
      <p><strong>Telefone:</strong> ${departamento.telefone}</p>
    `;

    lista.appendChild(card);
  });
}

/**
 * Atualiza o total de departamentos no dashboard.
 *
 * @param {Array} departamentos
 */
function updateDashboardDepartamentos(departamentos) {
  const total = document.getElementById("total-departamentos");
  total.textContent = departamentos.length;
}

/**
 * Preenche o select de departamentos da seção de usuários.
 *
 * O backend de usuários espera "id_depto",
 * então o value deve ser o id do departamento.
 *
 * @param {Array} departamentos
 */
function populateDepartamentoSelect(departamentos) {
  const select = document.getElementById("usr-departamento");

  select.innerHTML = `<option value="">Selecione um departamento</option>`;

  departamentos.forEach((departamento) => {
    const option = document.createElement("option");
    option.value = departamento.id;
    option.textContent = `${departamento.nome} (${departamento.sigla})`;
    select.appendChild(option);
  });
}

/**
 * Filtra os departamentos carregados em memória com base
 * no texto digitado.
 */
function filterDepartamentos() {
  const busca = document.getElementById("busca-departamentos").value.toLowerCase().trim();

  const departamentosFiltrados = departamentosData.filter((departamento) => {
    return (
      departamento.nome.toLowerCase().includes(busca) ||
      departamento.sigla.toLowerCase().includes(busca) ||
      departamento.telefone.toLowerCase().includes(busca)
    );
  });

  renderDepartamentos(departamentosFiltrados);
}

/**
 * Busca departamentos na API e atualiza a interface.
 */
async function loadDepartamentos() {
  try {
    const departamentos = await apiRequest("/departamentos", "GET");

    departamentosData = departamentos;

    renderDepartamentos(departamentosData);
    updateDashboardDepartamentos(departamentosData);
    populateDepartamentoSelect(departamentosData);
    toggleUsuarioFormByDepartments(departamentosData);
  } catch (error) {
    showFeedback(`Erro ao carregar departamentos: ${error.message}`, "error");
  }
}

/**
 * Trata o envio do formulário de departamento.
 *
 * @param {Event} event
 */
async function handleDepartamentoSubmit(event) {
  event.preventDefault();

  const nome = document.getElementById("dep-nome").value.trim();
  const sigla = document.getElementById("dep-sigla").value.trim();
  const telefone = document.getElementById("dep-telefone").value.trim();

  const novoDepartamento = {
    nome,
    sigla,
    telefone
  };

  try {
    await apiRequest("/departamentos", "POST", novoDepartamento);

    showFeedback("Departamento cadastrado com sucesso!", "success");
    document.getElementById("form-departamento").reset();

    await loadDepartamentos();
    resetDepartamentoFilters();
  } catch (error) {
    showFeedback(`Erro ao cadastrar departamento: ${error.message}`, "error");
  }
}

/**
 * Limpa a busca de departamentos e renderiza novamente
 * a lista completa já carregada em memória.
 */
function resetDepartamentoFilters() {
  const buscaDepartamentos = document.getElementById("busca-departamentos");

  if (buscaDepartamentos) {
    buscaDepartamentos.value = "";
  }

  renderDepartamentos(departamentosData);
}

/**
 * Configura eventos da seção de departamentos.
 */
function setupDepartamentoEvents() {
  const formDepartamento = document.getElementById("form-departamento");
  const btnAtualizar = document.getElementById("btn-carregar-departamentos");
  const buscaDepartamentos = document.getElementById("busca-departamentos");

  formDepartamento.addEventListener("submit", handleDepartamentoSubmit);

  btnAtualizar.addEventListener("click", async () => {
    await loadDepartamentos();
    resetDepartamentoFilters();
  });

  if (buscaDepartamentos) {
    buscaDepartamentos.addEventListener("input", filterDepartamentos);
  }
}

/* ==================================================
   USUÁRIOS
================================================== */

/**
 * Renderiza a lista de usuários na tela.
 *
 * @param {Array} usuarios - lista recebida da API
 */
function renderUsuarios(usuarios) {
  const lista = document.getElementById("lista-usuarios");
  lista.innerHTML = "";

  if (!usuarios || usuarios.length === 0) {
    lista.innerHTML = `<p class="empty-state">Nenhum usuário cadastrado.</p>`;
    return;
  }

  usuarios.forEach((usuario) => {
    const card = document.createElement("div");
    card.className = "list-card";

    card.innerHTML = `
      <h4>${usuario.nome}</h4>
      <p><strong>Matrícula:</strong> ${usuario.matricula}</p>
      <p><strong>Função:</strong> ${usuario.funcao}</p>
      <p><strong>Departamento:</strong> ${usuario.departamento}</p>
    `;

    lista.appendChild(card);
  });
}

/**
 * Atualiza o total de usuários no dashboard.
 *
 * @param {Array} usuarios
 */
function updateDashboardUsuarios(usuarios) {
  const total = document.getElementById("total-usuarios");
  total.textContent = usuarios.length;
}

/**
 * Filtra os usuários carregados em memória com base
 * no texto digitado.
 */
function filterUsuarios() {
  const busca = document.getElementById("busca-usuarios").value.toLowerCase().trim();

  const usuariosFiltrados = usuariosData.filter((usuario) => {
    return (
      usuario.nome.toLowerCase().includes(busca) ||
      usuario.matricula.toLowerCase().includes(busca) ||
      usuario.funcao.toLowerCase().includes(busca) ||
      usuario.departamento.toLowerCase().includes(busca)
    );
  });

  renderUsuarios(usuariosFiltrados);
}

/**
 * Busca usuários na API e atualiza a interface.
 */
async function loadUsuarios() {
  try {
    const usuarios = await apiRequest("/usuarios", "GET");

    usuariosData = usuarios;

    renderUsuarios(usuariosData);
    updateDashboardUsuarios(usuariosData);
    populateUsuarioSelect(usuariosData);
    toggleChamadoFormByUsuarios(usuariosData);
  } catch (error) {
    showFeedback(`Erro ao carregar usuários: ${error.message}`, "error");
  }
}

/**
 * Controla se o formulário de usuário pode ser usado
 * com base na existência de departamentos.
 *
 * @param {Array} departamentos
 */
function toggleUsuarioFormByDepartments(departamentos) {
  const form = document.getElementById("form-usuario");
  const select = document.getElementById("usr-departamento");

  const hasDepartments = departamentos && departamentos.length > 0;

  if (!hasDepartments) {
    form.querySelectorAll("input, select, button").forEach((element) => {
      element.disabled = true;
    });

    select.innerHTML = `<option value="">Cadastre um departamento primeiro</option>`;
  } else {
    form.querySelectorAll("input, select, button").forEach((element) => {
      element.disabled = false;
    });
  }
}

/**
 * Trata o envio do formulário de usuário.
 *
 * O backend espera:
 * {
 *   nome,
 *   matricula,
 *   funcao,
 *   id_depto
 * }
 *
 * @param {Event} event
 */
async function handleUsuarioSubmit(event) {
  event.preventDefault();

  const nome = document.getElementById("usr-nome").value.trim();
  const matricula = document.getElementById("usr-matricula").value.trim();
  const funcao = document.getElementById("usr-funcao").value.trim();
  const idDepto = Number(document.getElementById("usr-departamento").value);

  const novoUsuario = {
    nome,
    matricula,
    funcao,
    id_depto: idDepto
  };

  try {
    await apiRequest("/usuarios", "POST", novoUsuario);

    showFeedback("Usuário cadastrado com sucesso!", "success");
    document.getElementById("form-usuario").reset();

    await loadUsuarios();
    resetUsuarioFilters();
  } catch (error) {
    showFeedback(`Erro ao cadastrar usuário: ${error.message}`, "error");
  }
}

/**
 * Limpa a busca de usuários e renderiza novamente
 * a lista completa já carregada em memória.
 */
function resetUsuarioFilters() {
  const buscaUsuarios = document.getElementById("busca-usuarios");

  if (buscaUsuarios) {
    buscaUsuarios.value = "";
  }

  renderUsuarios(usuariosData);
}

/**
 * Configura eventos da seção de usuários.
 */
function setupUsuarioEvents() {
  const formUsuario = document.getElementById("form-usuario");
  const btnAtualizar = document.getElementById("btn-carregar-usuarios");
  const buscaUsuarios = document.getElementById("busca-usuarios");

  formUsuario.addEventListener("submit", handleUsuarioSubmit);

  btnAtualizar.addEventListener("click", async () => {
    await loadUsuarios();
    resetUsuarioFilters();
  });

  if (buscaUsuarios) {
    buscaUsuarios.addEventListener("input", filterUsuarios);
  }
}

/* ==================================================
   CHAMADOS
================================================== */

/**
 * Renderiza a lista de chamados na tela.
 *
 * @param {Array} chamados - lista recebida da API
 */
function renderChamados(chamados) {
  const lista = document.getElementById("lista-chamados");
  lista.innerHTML = "";

  if (!chamados || chamados.length === 0) {
    lista.innerHTML = `<p class="empty-state">Nenhum chamado cadastrado.</p>`;
    return;
  }

  chamados.forEach((chamado) => {
    const card = document.createElement("div");
    card.className = "list-card";

    card.innerHTML = `
      <h4>${chamado.titulo}</h4>
      <p><strong>Descrição:</strong> ${chamado.descricao}</p>
      <p><strong>Usuário:</strong> ${chamado.usuario}</p>
      <p><strong>Departamento:</strong> ${chamado.departamento}</p>
      <p>
        <strong>Status:</strong>
        <span class="badge-custom ${getStatusBadgeClass(chamado.status)}">
          ${chamado.status}
        </span>
      </p>
      <p>
        <strong>Prioridade:</strong>
        <span class="badge-custom ${getPrioridadeBadgeClass(chamado.prioridade)}">
          ${chamado.prioridade}
        </span>
      </p>

      <div class="form-actions">
        <button class="btn btn-save btn-sm" onclick="updateChamadoStatus(${chamado.id}, 'resolvido')">
          Marcar como resolvido
        </button>

        <button class="btn btn-cancel btn-sm" onclick="deleteChamado(${chamado.id})">
          Excluir
        </button>
      </div>
    `;

    lista.appendChild(card);
  });
}

/**
 * Retorna a classe CSS de badge para o status.
 *
 * @param {string} status
 * @returns {string}
 */
function getStatusBadgeClass(status) {
  const normalized = status.toLowerCase();

  if (normalized === "aberto") return "badge-status-aberto";
  if (normalized === "em andamento") return "badge-status-andamento";
  if (normalized === "concluido" || normalized === "resolvido") return "badge-status-concluido";

  return "";
}

/**
 * Retorna a classe CSS de badge para a prioridade.
 *
 * @param {string} prioridade
 * @returns {string}
 */
function getPrioridadeBadgeClass(prioridade) {
  const normalized = prioridade.toLowerCase();

  if (normalized === "alta") return "badge-prioridade-alta";
  if (normalized === "media" || normalized === "média") return "badge-prioridade-media";
  if (normalized === "baixa") return "badge-prioridade-baixa";

  return "";
}

/**
 * Atualiza o total de chamados no dashboard.
 *
 * @param {Array} chamados
 */
function updateDashboardChamados(chamados) {
  const total = document.getElementById("total-chamados");
  total.textContent = chamados.length;
}

/**
 * Busca chamados na API e atualiza a interface.
 */
async function loadChamados() {
  try {
    const chamados = await apiRequest("/chamados", "GET");

    chamadosData = chamados;

    renderChamados(chamadosData);
    updateDashboardChamados(chamadosData);
  } catch (error) {
    showFeedback(`Erro ao carregar chamados: ${error.message}`, "error");
  }
}

/**
 * Filtra os chamados carregados em memória com base
 * no texto digitado e nos filtros selecionados.
 */
function filterChamados() {
  const busca = document.getElementById("busca-chamados").value.toLowerCase().trim();
  const status = document.getElementById("filtro-status").value.toLowerCase();
  const prioridade = document.getElementById("filtro-prioridade").value.toLowerCase();

  const chamadosFiltrados = chamadosData.filter((chamado) => {
    const matchesBusca =
      chamado.titulo.toLowerCase().includes(busca) ||
      chamado.descricao.toLowerCase().includes(busca) ||
      chamado.usuario.toLowerCase().includes(busca) ||
      chamado.departamento.toLowerCase().includes(busca);

    const matchesStatus = !status || chamado.status.toLowerCase() === status;
    const matchesPrioridade = !prioridade || chamado.prioridade.toLowerCase() === prioridade;

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

  const titulo = document.getElementById("cha-titulo").value.trim();
  const descricao = document.getElementById("cha-descricao").value.trim();
  const prioridade = document.getElementById("cha-prioridade").value;
  const idUsuario = Number(document.getElementById("cha-usuario").value);

  const novoChamado = {
    titulo,
    descricao,
    prioridade,
    id_usuario: idUsuario
  };

  console.log("Payload enviado para /chamados:", novoChamado);

  try {
    await apiRequest("/chamados", "POST", novoChamado);

    showFeedback("Chamado cadastrado com sucesso!", "success");
    document.getElementById("form-chamado").reset();

    document.getElementById("cha-status").value = "Aberto";

    await loadChamados();
    resetChamadoFilters();
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

  renderChamados(chamadosData);
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

  formChamado.addEventListener("submit", handleChamadoSubmit);

  btnAtualizar.addEventListener("click", async () => {
    await loadChamados();
    resetChamadoFilters();
  });

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

/* ==================================================
   INICIALIZAÇÃO
================================================== */

/**
 * Inicializa a aplicação.
 */
function initApp() {
  showSection("dashboard");

  setupDepartamentoEvents();
  setupUsuarioEvents();
  setupChamadoEvents();

  loadDepartamentos();
  loadUsuarios();
  loadChamados();
}

document.addEventListener("DOMContentLoaded", initApp);