/**
 * @file calendar.js
 * @description
 * Módulo de agenda do VCF OS.
 *
 * Responsabilidades:
 * - Persistir eventos no localStorage.
 * - Renderizar grade de calendário mensal.
 * - Criar e remover eventos.
 * - Vincular eventos a contatos (gravando resumo no NOTE do contato).
 *
 * Dependências externas deste módulo:
 * - allContacts (definido em vcf-core.js)
 * - updateVCFBlock (definido em vcf-core.js)
 * - showToast e helpers de UI (definidos em app.js)
 */

/**
 * Armazena a lista de eventos em memória durante a sessão.
 * Cada item segue o formato:
 * { id, title, date, time, contactId, tag }
 *
 * @type {Array<{id: string, title: string, date: string, time: string, contactId: string, tag: string}>}
 */
let events = [];

/**
 * Data de referência usada na navegação entre meses do calendário.
 * @type {Date}
 */
let currentDate = new Date();

/**
 * Carrega os eventos salvos no localStorage.
 *
 * Comportamento:
 * - Lê a chave `vcf_events`.
 * - Tenta fazer parse do JSON.
 * - Se houver erro, inicia com array vazio.
 */
function loadEvents() {
  try {
    const raw = localStorage.getItem("vcf_events");
    events = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(events)) {
      events = [];
    }
  } catch (_error) {
    events = [];
  }
}

/**
 * Salva o estado atual de `events` no localStorage.
 */
function saveEvents() {
  localStorage.setItem("vcf_events", JSON.stringify(events));
}

/**
 * Atualiza o select de contatos dentro do modal de evento.
 *
 * Objetivo:
 * Permitir que o usuário associe um evento a um contato já carregado no VCF.
 */
function updateContactDropdown() {
  const select = document.getElementById("ev-contact");
  if (!select) {
    return;
  }

  select.innerHTML = '<option value="">Nenhum</option>';
  allContacts.forEach((contact) => {
    const option = document.createElement("option");
    option.value = contact.id;
    option.textContent = contact.fn;
    select.appendChild(option);
  });
}

/**
 * Navega entre meses do calendário.
 *
 * @param {number} direction - -1 para mês anterior, +1 para próximo mês.
 */
function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
}

/**
 * Renderiza a visualização mensal da agenda.
 *
 * Passos:
 * 1. Calcula ano, mês, primeiro dia e quantidade de dias.
 * 2. Preenche células vazias antes do dia 1.
 * 3. Monta cada dia com seus eventos.
 * 4. Marca visualmente o dia atual.
 */
function renderCalendar() {
  const monthLabel = document.getElementById("calendar-month-year");
  const grid = document.getElementById("calendar-body");
  if (!monthLabel || !grid) {
    return;
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  monthLabel.textContent = `${monthNames[month]} ${year}`;
  grid.innerHTML = "";

  for (let i = 0; i < firstDay; i += 1) {
    const blank = document.createElement("div");
    blank.className = "day-cell";
    blank.style.opacity = "0.15";
    blank.style.pointerEvents = "none";
    grid.appendChild(blank);
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = events.filter((event) => event.date === dateStr);

    const cell = document.createElement("div");
    cell.className = `day-cell ${isCurrentMonth && day === today.getDate() ? "today" : ""}`;
    cell.onclick = () => openEventModal(dateStr);

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = String(day);
    cell.appendChild(number);

    dayEvents.forEach((event) => {
      const pill = document.createElement("div");
      pill.className = `event-pill ${event.tag || "tag-default"}`;
      pill.textContent = `${event.time || ""} ${event.title || ""}`.trim();
      pill.onclick = (e) => {
        e.stopPropagation();
        deleteEvent(event.id);
      };
      cell.appendChild(pill);
    });

    grid.appendChild(cell);
  }
}

/**
 * Abre o modal de criação de evento.
 *
 * @param {string} [dateStr=""] - Data pré-selecionada no formato YYYY-MM-DD.
 */
function openEventModal(dateStr = "") {
  const titleInput = document.getElementById("ev-title");
  const dateInput = document.getElementById("ev-date");
  const timeInput = document.getElementById("ev-time");
  const contactInput = document.getElementById("ev-contact");
  const tagInput = document.getElementById("ev-tag");
  const modal = document.getElementById("event-modal");

  if (!titleInput || !dateInput || !timeInput || !contactInput || !tagInput || !modal) {
    return;
  }

  titleInput.value = "";
  dateInput.value = dateStr || new Date().toISOString().split("T")[0];
  timeInput.value = "12:00";
  contactInput.value = "";
  tagInput.value = "tag-default";
  modal.classList.add("active");
}

/**
 * Fecha o modal de criação de evento.
 */
function closeEventModal() {
  document.getElementById("event-modal")?.classList.remove("active");
}

/**
 * Salva um novo evento a partir dos campos do modal.
 *
 * Regras:
 * - Título e data são obrigatórios.
 * - Se houver contato vinculado, adiciona um resumo ao campo NOTE do contato.
 * - Atualiza localStorage e re-renderiza o calendário.
 */
function saveEvent() {
  const title = (document.getElementById("ev-title")?.value || "").trim();
  const date = document.getElementById("ev-date")?.value || "";
  const time = document.getElementById("ev-time")?.value || "";
  const contactId = document.getElementById("ev-contact")?.value || "";
  const tag = document.getElementById("ev-tag")?.value || "tag-default";

  if (!title || !date) {
    showToast("Título e data são obrigatórios.", "error");
    return;
  }

  const event = {
    id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    date,
    time,
    contactId,
    tag
  };

  if (contactId) {
    const targetIdx = allContacts.findIndex((contact) => contact.id === contactId);
    if (targetIdx !== -1) {
      const target = allContacts[targetIdx];
      const note = `[Agendado: ${date} ${time} - ${title}]`;
      target.note = target.note ? `${target.note} | ${note}` : note;
      target.originalBlock = updateVCFBlock(target.originalBlock, "NOTE", target.note);
    }
  }

  events.push(event);
  saveEvents();
  closeEventModal();
  renderCalendar();
  showToast("Evento salvo com sucesso.", "success");

  if (document.getElementById("view-contacts")?.classList.contains("active")) {
    applyFilters();
  }
}

/**
 * Remove um evento da agenda, com confirmação do usuário.
 *
 * @param {string} id - ID do evento.
 */
function deleteEvent(id) {
  if (!confirm("Deseja apagar este evento da agenda?")) {
    return;
  }

  events = events.filter((event) => event.id !== id);
  saveEvents();
  renderCalendar();
  showToast("Evento removido.", "info");
}
