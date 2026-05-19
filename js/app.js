/**
 * @file app.js
 * @description
 * Módulo de orquestração geral do painel.
 *
 * Responsabilidades:
 * - Navegação entre abas do painel.
 * - Controle de tema, fonte e preferências visuais.
 * - Toasts e modais globais.
 * - Registro do service worker (PWA).
 * - Exibição automática de changelog por release.
 *
 * Dependências externas deste módulo:
 * - Funções de contatos (vcf-core.js)
 * - Funções de agenda (calendar.js)
 */

/** @constant {string} Chave de tema salvo no localStorage. */
const THEME_STORAGE_KEY = "vcf_theme";

/** @constant {string} Chave da fonte salva no localStorage. */
const FONT_STORAGE_KEY = "vcf_font";

/** @constant {string} Chave da cor customizada de tema. */
const CUSTOM_THEME_COLOR_KEY = "vcf_theme_custom_color";

/** @constant {string} Chave para controlar se o changelog da release já foi exibido. */
const CHANGELOG_SEEN_KEY = "vcf_changelog_seen_release";

/**
 * Identificador único da release atual.
 * Sempre que mudar, o modal de changelog volta a aparecer para o usuário.
 *
 * @constant {string}
 */
const APP_RELEASE = "2026.05.19-2";

/**
 * Notas resumidas usadas no modal "Painel Atualizado".
 * @constant {string[]}
 */
const RELEASE_NOTES = [
  "Painel agora exibe changelog automático após nova atualização.",
  "Cards de temas foram redesenhados com prévias visuais mais ricas.",
  "Cards de tipografia foram reformulados com amostras de leitura.",
  "Ajustes de persistência para estado visual de tema e fonte."
];

/**
 * Mapa de cor principal por nome de tema.
 * @constant {Record<string, string>}
 */
const THEME_COLOR_MAP = {
  default: "#ff6600",
  cyberpunk: "#00f0ff",
  hacker: "#00ff00",
  dracula: "#ff79c6",
  synthwave: "#ff00ff",
  ocean: "#0088ff"
};

/**
 * Alterna o estado colapsado da sidebar em desktop.
 * Em mobile, o toggle não é aplicado para evitar conflito com a navegação inferior.
 */
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  if (window.innerWidth >= 768) {
    sidebar.classList.toggle("collapsed");
  }
}

/**
 * Ativa uma aba do painel e executa o render necessário para ela.
 *
 * @param {string} tabId - Nome lógico da aba (contacts, agenda, trash, settings).
 * @param {HTMLElement} navItem - Botão de navegação clicado.
 */
function switchTab(tabId, navItem) {
  document.querySelectorAll(".nav-item").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".view-section").forEach((el) => el.classList.remove("active"));

  navItem.classList.add("active");

  const target = document.getElementById(`view-${tabId}`);
  if (target) target.classList.add("active");

  if (tabId === "agenda") renderCalendar();
  if (tabId === "trash") renderTrash();
  if (tabId === "contacts") applyFilters();
}

/**
 * Atualiza o meta `theme-color` para melhorar integração com navegador mobile/PWA.
 *
 * @param {string} color - Cor em hexadecimal.
 */
function setMetaThemeColor(color) {
  const meta = document.getElementById("meta-theme-color");
  if (meta) meta.setAttribute("content", color);
}

/**
 * Aplica um tema visual e persiste a escolha.
 *
 * @param {string} themeName - Nome do tema.
 * @param {HTMLElement|null} btnElement - Botão que representa o tema.
 * @param {boolean} [silent=false] - Se true, evita toast de confirmação.
 */
function setTheme(themeName, btnElement, silent = false) {
  if (themeName !== "custom") {
    document.documentElement.style.removeProperty("--md-primary");
    document.documentElement.style.removeProperty("--md-primary-hover");
  }

  document.documentElement.setAttribute("data-theme", themeName);

  document.querySelectorAll(".theme-btn").forEach((el) => el.classList.remove("active"));
  const targetButton = btnElement || document.querySelector(`.theme-btn[data-theme="${themeName}"]`);
  if (targetButton) targetButton.classList.add("active");

  const color = THEME_COLOR_MAP[themeName]
    || getComputedStyle(document.documentElement).getPropertyValue("--md-primary").trim()
    || "#ff6600";

  setMetaThemeColor(color);
  localStorage.setItem(THEME_STORAGE_KEY, themeName);

  if (!silent) {
    showToast("Tema aplicado.", "info");
  }
}

/**
 * Aplica família tipográfica da interface e persiste escolha.
 *
 * @param {string} nerdFont - Nome da Nerd Font preferencial.
 * @param {string} fallback - Fonte fallback web-safe.
 * @param {HTMLElement} btnElement - Botão selecionado.
 */
function setFont(nerdFont, fallback, btnElement) {
  const cssFont = `'${nerdFont}', '${fallback}', monospace`;
  document.documentElement.style.setProperty("--font-main", cssFont);

  document.querySelectorAll(".font-btn").forEach((el) => el.classList.remove("active"));
  btnElement.classList.add("active");

  localStorage.setItem(FONT_STORAGE_KEY, JSON.stringify({ nerdFont, fallback, key: btnElement.dataset.fontKey || "" }));
  showToast("Fonte alterada.", "info");
}

/**
 * Exibe uma notificação rápida no canto da tela.
 *
 * @param {string} message - Texto da notificação.
 * @param {"info"|"success"|"error"} [type="info"] - Tipo visual do toast.
 */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.25s forwards";
    setTimeout(() => toast.remove(), 250);
  }, 2300);
}

/**
 * Carrega preferências de tema e fonte do usuário.
 *
 * Fluxo:
 * - Restaura tema normal ou custom.
 * - Restaura valor de cor customizada.
 * - Restaura tipografia e destaque do card de fonte.
 */
function loadPreferences() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.querySelectorAll(".theme-btn").forEach((btn) => btn.classList.remove("active"));

    if (savedTheme === "custom") {
      const customColor = localStorage.getItem(CUSTOM_THEME_COLOR_KEY) || "#ff6600";
      document.documentElement.style.setProperty("--md-primary", customColor);

      const colorInput = document.getElementById("custom-theme-color");
      if (colorInput) colorInput.value = customColor;

      const colorValue = document.getElementById("custom-color-value");
      if (colorValue) colorValue.textContent = customColor;

      setMetaThemeColor(customColor);
    } else {
      setTheme(savedTheme, document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`), true);
    }
  }

  const savedFont = localStorage.getItem(FONT_STORAGE_KEY);
  if (savedFont) {
    try {
      const parsed = JSON.parse(savedFont);
      if (parsed?.nerdFont && parsed?.fallback) {
        document.documentElement.style.setProperty("--font-main", `'${parsed.nerdFont}', '${parsed.fallback}', monospace`);
      }
      if (parsed?.key) {
        document.querySelectorAll(".font-btn").forEach((el) => el.classList.remove("active"));
        document.querySelector(`.font-btn[data-font-key="${parsed.key}"]`)?.classList.add("active");
      }
    } catch (_error) {
      localStorage.removeItem(FONT_STORAGE_KEY);
    }
  }
}

/**
 * Registra o service worker do PWA, se o navegador suportar.
 */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Falha ao registrar service worker", error);
    });
  });
}

/**
 * Configura listener do seletor de cor customizada de tema.
 *
 * A cada alteração:
 * - Ativa tema custom.
 * - Salva a cor.
 * - Atualiza variável hover para melhor contraste.
 */
function setupCustomColor() {
  const input = document.getElementById("custom-theme-color");
  if (!input) {
    return;
  }

  input.addEventListener("input", (event) => {
    const color = event.target.value;
    document.documentElement.setAttribute("data-theme", "custom");
    document.documentElement.style.setProperty("--md-primary", color);

    document.querySelectorAll(".theme-btn").forEach((el) => el.classList.remove("active"));
    localStorage.setItem(THEME_STORAGE_KEY, "custom");
    localStorage.setItem(CUSTOM_THEME_COLOR_KEY, color);

    const colorValue = document.getElementById("custom-color-value");
    if (colorValue) colorValue.textContent = color;

    setMetaThemeColor(color);

    const lighter = color.replace("#", "");
    if (lighter.length === 6) {
      const r = parseInt(lighter.slice(0, 2), 16);
      const g = parseInt(lighter.slice(2, 4), 16);
      const b = parseInt(lighter.slice(4, 6), 16);
      const hoverR = Math.min(255, r + 24).toString(16).padStart(2, "0");
      const hoverG = Math.min(255, g + 24).toString(16).padStart(2, "0");
      const hoverB = Math.min(255, b + 24).toString(16).padStart(2, "0");
      document.documentElement.style.setProperty("--md-primary-hover", `#${hoverR}${hoverG}${hoverB}`);
    }
  });
}

/**
 * Configura fechamento de modais quando o usuário clica no overlay.
 */
function setupModalClose() {
  const modal = document.getElementById("event-modal");
  if (!modal) return;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEventModal();
    }
  });

  const changelogModal = document.getElementById("changelog-modal");
  if (changelogModal) {
    changelogModal.addEventListener("click", (event) => {
      if (event.target === changelogModal) {
        closeChangelogModal(true);
      }
    });
  }
}

/**
 * Exibe modal de changelog se a release atual ainda não foi vista pelo usuário.
 */
function showChangelogModalIfNeeded() {
  const seenRelease = localStorage.getItem(CHANGELOG_SEEN_KEY);
  if (seenRelease === APP_RELEASE) {
    return;
  }

  const list = document.getElementById("changelog-list");
  const modal = document.getElementById("changelog-modal");
  if (!list || !modal) {
    return;
  }

  list.innerHTML = "";
  RELEASE_NOTES.forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note;
    list.appendChild(li);
  });

  modal.classList.add("active");
}

/**
 * Fecha modal de changelog e, opcionalmente, marca a release como lida.
 *
 * @param {boolean} [markAsSeen=false] - Se true, persiste a release atual como já visualizada.
 */
function closeChangelogModal(markAsSeen = false) {
  const modal = document.getElementById("changelog-modal");
  if (!modal) {
    return;
  }

  modal.classList.remove("active");
  if (markAsSeen) {
    localStorage.setItem(CHANGELOG_SEEN_KEY, APP_RELEASE);
  }
}

/** Expondo função para uso em onclick inline no HTML. */
window.closeChangelogModal = closeChangelogModal;

/**
 * Ajusta comportamento responsivo da sidebar durante resize.
 */
function setupResizeBehavior() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) {
    return;
  }

  const update = () => {
    if (window.innerWidth < 768) {
      sidebar.classList.remove("collapsed");
    } else if (!sidebar.classList.contains("collapsed")) {
      sidebar.classList.add("collapsed");
    }
  };

  update();
  window.addEventListener("resize", update);
}

/**
 * Bootstrap principal da aplicação.
 *
 * Ordem importante:
 * 1. Inicializa recursos estáticos (alfabeto, eventos e preferências).
 * 2. Conecta listeners globais (modais, resize, service worker).
 * 3. Renderiza estado inicial das views.
 */
document.addEventListener("DOMContentLoaded", () => {
  initAlphabet();
  loadEvents();
  loadPreferences();
  setupCustomColor();
  setupModalClose();
  setupResizeBehavior();
  registerServiceWorker();

  toggleBulkInputs();
  sortContacts();
  applyFilters();
  updateTrashCount();
  renderCalendar();
  showChangelogModalIfNeeded();
});
