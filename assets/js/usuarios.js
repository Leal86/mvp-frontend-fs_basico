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

  if (!lista) return;

  lista.innerHTML = "";

  if (!usuarios || usuarios.length === 0) {
    lista.innerHTML = `<p class="empty-state">Nenhum usuário cadastrado.</p>`;
    return;
  }

  usuarios.forEach((usuario) => {
    const card = document.createElement("div");
    card.className = "list-card";

    card.innerHTML = `
      <h4>${usuario.nome ?? "-"}</h4>
      <p><strong>Matrícula:</strong> ${usuario.matricula ?? "-"}</p>
      <p><strong>Função:</strong> ${usuario.funcao ?? "-"}</p>
      <p><strong>Departamento:</strong> ${usuario.departamento ?? "-"}</p>
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

  if (!total) return;

  total.textContent = usuarios.length;
}

/**
 * Filtra os usuários carregados em memória com base
 * no texto digitado.
 */
function filterUsuarios() {
  const buscaInput = document.getElementById("busca-usuarios");

  if (!buscaInput) return;

  const busca = buscaInput.value.toLowerCase().trim();

  const usuariosFiltrados = appState.usuarios.filter((usuario) => {
    return (
      (usuario.nome || "").toLowerCase().includes(busca) ||
      (usuario.matricula || "").toLowerCase().includes(busca) ||
      (usuario.funcao || "").toLowerCase().includes(busca) ||
      (usuario.departamento || "").toLowerCase().includes(busca)
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

    appState.usuarios = usuarios;

    renderUsuarios(appState.usuarios);
    updateDashboardUsuarios(appState.usuarios);
    populateUsuarioSelect(appState.usuarios);
    toggleChamadoFormByUsuarios(appState.usuarios);
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

  if (!form || !select) return;

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

  const nome = document.getElementById("usr-nome")?.value.trim() || "";
  const matricula = document.getElementById("usr-matricula")?.value.trim() || "";
  const funcao = document.getElementById("usr-funcao")?.value.trim() || "";
  const idDepto = Number(document.getElementById("usr-departamento")?.value || 0);

  const novoUsuario = {
    nome,
    matricula,
    funcao,
    id_depto: idDepto
  };

  try {
    await apiRequest("/usuarios", "POST", novoUsuario);

    showFeedback("Usuário cadastrado com sucesso!", "success");

    const form = document.getElementById("form-usuario");
    if (form) form.reset();

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

  renderUsuarios(appState.usuarios);
}

/**
 * Configura eventos da seção de usuários.
 */
function setupUsuarioEvents() {
  const formUsuario = document.getElementById("form-usuario");
  const btnAtualizar = document.getElementById("btn-carregar-usuarios");
  const buscaUsuarios = document.getElementById("busca-usuarios");

  if (formUsuario) {
    formUsuario.addEventListener("submit", handleUsuarioSubmit);
  }

  if (btnAtualizar) {
    btnAtualizar.addEventListener("click", async () => {
      await loadUsuarios();
      resetUsuarioFilters();
    });
  }

  if (buscaUsuarios) {
    buscaUsuarios.addEventListener("input", filterUsuarios);
  }
}