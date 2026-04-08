/**
 * Inicializa a aplicação.
 */
function initApp() {
  // Navegação inicial
  if (typeof showSection === "function") {
    showSection("dashboard");
  }

  // Setup de eventos
  if (typeof setupDepartamentoEvents === "function") {
    setupDepartamentoEvents();
  }

  if (typeof setupUsuarioEvents === "function") {
    setupUsuarioEvents();
  }

  if (typeof setupChamadoEvents === "function") {
    setupChamadoEvents();
  }

  // Carregamento de dados
  if (typeof loadDepartamentos === "function") {
    loadDepartamentos();
  }

  if (typeof loadUsuarios === "function") {
    loadUsuarios();
  }

  if (typeof loadChamados === "function") {
    loadChamados();
  }
}

// Garante que tudo só roda depois do HTML carregado
document.addEventListener("DOMContentLoaded", initApp);