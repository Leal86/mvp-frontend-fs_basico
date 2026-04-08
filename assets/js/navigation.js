const navButtons = document.querySelectorAll(".nav-link-custom");
const appSections = document.querySelectorAll(".app-section");
const pageTitle = document.getElementById("page-title");

const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const sidebarClose = document.getElementById("sidebar-close");

const sectionTitles = {
  dashboard: "Dashboard",
  departamentos: "Cadastro de Departamento",
  usuarios: "Cadastro de Usuário",
  chamados: "Chamados",
  sistema: "Informações do Sistema"
};

function isMobileView() {
  return window.innerWidth <= 900;
}

function lockBodyScroll() {
  document.body.classList.add("body-no-scroll");
  document.documentElement.classList.add("body-no-scroll");
}

function unlockBodyScroll() {
  document.body.classList.remove("body-no-scroll");
  document.documentElement.classList.remove("body-no-scroll");
}

function openSidebar() {
  if (!sidebar || !sidebarOverlay || !menuToggle) return;

  sidebar.classList.add("sidebar-open");
  sidebarOverlay.classList.add("sidebar-overlay-visible");
  menuToggle.classList.add("menu-toggle-active");
  menuToggle.setAttribute("aria-expanded", "true");
  lockBodyScroll();
}

function closeSidebar() {
  if (!sidebar || !sidebarOverlay || !menuToggle) return;

  sidebar.classList.remove("sidebar-open");
  sidebarOverlay.classList.remove("sidebar-overlay-visible");
  menuToggle.classList.remove("menu-toggle-active");
  menuToggle.setAttribute("aria-expanded", "false");
  unlockBodyScroll();
}

function toggleSidebar() {
  if (!sidebar) return;

  const isOpen = sidebar.classList.contains("sidebar-open");

  if (isOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function updatePageTitle(sectionId) {
  if (!pageTitle) return;
  pageTitle.textContent = sectionTitles[sectionId] || "Easy Help";
}

function updateActiveNavButton(sectionId) {
  navButtons.forEach((button) => {
    if (button.dataset.section === sectionId) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function showSection(sectionId) {
  appSections.forEach((section) => {
    if (section.id === sectionId) {
      section.classList.remove("d-none");
    } else {
      section.classList.add("d-none");
    }
  });

  updateActiveNavButton(sectionId);
  updatePageTitle(sectionId);

  if (isMobileView()) {
    closeSidebar();
  }

  window.scrollTo({
    top: 0,
    behavior: "auto"
  });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetSection = button.dataset.section;
    showSection(targetSection);
  });
});

if (menuToggle) {
  menuToggle.addEventListener("click", toggleSidebar);
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", closeSidebar);
}

if (sidebarClose) {
  sidebarClose.addEventListener("click", closeSidebar);
}

window.addEventListener("resize", () => {
  if (!isMobileView()) {
    closeSidebar();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar?.classList.contains("sidebar-open")) {
    closeSidebar();
  }
});