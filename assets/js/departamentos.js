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

  if (!lista) return;

  lista.innerHTML = "";

  if (!departamentos || departamentos.length === 0) {
    lista.innerHTML = `<p class="empty-state">Nenhum departamento cadastrado.</p>`;
    return;
  }

  departamentos.forEach((departamento) => {
    const card = document.createElement("div");
    card.className = "list-card";

    card.innerHTML = `
      <h4>${departamento.nome ?? "-"}</h4>
      <p><strong>Sigla:</strong> ${departamento.sigla ?? "-"}</p>
      <p><strong>Telefone:</strong> ${departamento.telefone ?? "-"}</p>
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

  if (!total) return;

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

  if (!select) return;

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
  const buscaInput = document.getElementById("busca-departamentos");

  if (!buscaInput) return;

  const busca = buscaInput.value.toLowerCase().trim();

  const departamentosFiltrados = appState.departamentos.filter((departamento) => {
    return (
      (departamento.nome || "").toLowerCase().includes(busca) ||
      (departamento.sigla || "").toLowerCase().includes(busca) ||
      (departamento.telefone || "").toLowerCase().includes(busca)
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

    appState.departamentos = departamentos;

    renderDepartamentos(appState.departamentos);
    updateDashboardDepartamentos(appState.departamentos);
    populateDepartamentoSelect(appState.departamentos);
    toggleUsuarioFormByDepartments(appState.departamentos);
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

  const nome = document.getElementById("dep-nome")?.value.trim() || "";
  const sigla = document.getElementById("dep-sigla")?.value.trim() || "";
  const telefone = document.getElementById("dep-telefone")?.value.trim() || "";

  const novoDepartamento = {
    nome,
    sigla,
    telefone
  };

  try {
    await apiRequest("/departamentos", "POST", novoDepartamento);

    showFeedback("Departamento cadastrado com sucesso!", "success");

    const form = document.getElementById("form-departamento");
    if (form) form.reset();

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

  renderDepartamentos(appState.departamentos);
}

/**
 * Configura eventos da seção de departamentos.
 */
function setupDepartamentoEvents() {
  const formDepartamento = document.getElementById("form-departamento");
  const btnAtualizar = document.getElementById("btn-carregar-departamentos");
  const buscaDepartamentos = document.getElementById("busca-departamentos");

  if (formDepartamento) {
    formDepartamento.addEventListener("submit", handleDepartamentoSubmit);
  }

  if (btnAtualizar) {
    btnAtualizar.addEventListener("click", async () => {
      await loadDepartamentos();
      resetDepartamentoFilters();
    });
  }

  if (buscaDepartamentos) {
    buscaDepartamentos.addEventListener("input", filterDepartamentos);
  }
}