/**
 * Estado global simples da aplicação.
 *
 * Armazena os dados carregados da API para reaproveitamento
 * em filtros, renderizações e preenchimento de selects.
 */
const appState = {
  departamentos: [],
  usuarios: [],
  chamados: []
};

/**
 * Exibe uma mensagem visual para o usuário.
 *
 * @param {string} message - mensagem a ser exibida
 * @param {"success"|"error"} type - tipo da mensagem
 */
function showFeedback(message, type = "success") {
  const feedback = document.getElementById("feedback");

  if (!feedback) return;

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