/**
 * @file vcf-core.js
 * @description
 * Módulo núcleo de contatos VCF.
 *
 * Responsabilidades:
 * - Parse de arquivo .vcf para estrutura manipulável.
 * - Renderização dos cards de contatos.
 * - Filtros por texto e por letra.
 * - Edição inline com sincronização do bloco VCF.
 * - Ações em lote (prefixo, replace, sanitização WAHA/Evolution).
 * - Lixeira (soft delete / restore / destroy).
 * - Exportação da base em VCF.
 *
 * Dependências externas deste módulo:
 * - showToast / switchTab (app.js)
 * - updateContactDropdown (calendar.js)
 */

/**
 * Lista principal de contatos carregados no sistema.
 *
 * @type {Array<{id:string, originalBlock:string, fn:string, tel:string, email:string, org:string, note:string}>}
 */
let allContacts = [];

/**
 * Subconjunto resultante dos filtros ativos.
 * @type {Array<{id:string, originalBlock:string, fn:string, tel:string, email:string, org:string, note:string}>}
 */
let filteredContacts = [];

/**
 * Contatos removidos logicamente (lixeira).
 * @type {Array<{id:string, originalBlock:string, fn:string, tel:string, email:string, org:string, note:string}>}
 */
let trashContacts = [];

/**
 * IDs de contatos selecionados para ação em lote.
 * @type {Set<string>}
 */
let selectedIDs = new Set();

/**
 * Quantidade de cards renderizados por página incremental.
 * @type {number}
 */
let displayLimit = 100;

/**
 * Letra atual do filtro alfabético (A-Z ou #).
 * @type {string|null}
 */
let currentLetter = null;

/**
 * Gera um ID curto para identificar cada contato no front.
 *
 * @returns {string}
 */
function generateUID() {
  return "c_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Escapa caracteres especiais para evitar injeção ao renderizar HTML dinâmico.
 *
 * @param {string} str - Texto bruto.
 * @returns {string}
 */
function escapeHTML(str) {
  return (str || "").replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag]));
}

/**
 * Atualiza (ou cria) uma propriedade VCF dentro de um bloco VCARD.
 *
 * Exemplo:
 * - Prefixo `FN` altera `FN:Nome`.
 * - Prefixo `TEL` altera linha TEL mesmo com parâmetros (TEL;TYPE=CELL).
 *
 * @param {string} block - Bloco completo BEGIN:VCARD ... END:VCARD.
 * @param {string} prefix - Prefixo da propriedade (FN, TEL, NOTE...).
 * @param {string} newValue - Novo valor.
 * @returns {string}
 */
function updateVCFBlock(block, prefix, newValue) {
  const regex = new RegExp(`^(${prefix}(?:[^:]*)?):.*$`, "mi");
  if (regex.test(block)) {
    return block.replace(regex, `$1:${newValue}`);
  }

  if (!newValue) {
    return block;
  }

  return block.replace(/END:VCARD\s*$/i, `${prefix}:${newValue}\nEND:VCARD\n`);
}

/**
 * Cria a barra alfabética de filtros na UI (A-Z + #).
 */
function initAlphabet() {
  const container = document.getElementById("alphabet-container");
  if (!container || container.children.length) {
    return;
  }

  const letters = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
  letters.forEach((letter) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "alphabet-btn";
    btn.textContent = letter;
    btn.onclick = () => filterByLetter(letter, btn);
    container.appendChild(btn);
  });
}

/**
 * Recebe upload do arquivo VCF e inicia leitura.
 *
 * @param {Event} event - Evento do input file.
 */
function handleFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => parseVCF(e.target.result || "");
  reader.readAsText(file);
}

/**
 * Faz parse do conteúdo VCF e popula o estado interno.
 *
 * Passos:
 * 1. Normaliza quebras de linha e remove "line folding".
 * 2. Separa blocos VCARD.
 * 3. Extrai campos principais (FN, TEL, EMAIL, ORG, NOTE).
 * 4. Atualiza interface e contadores.
 *
 * @param {string} vcfText - Texto bruto do arquivo VCF.
 */
function parseVCF(vcfText) {
  const normalized = (vcfText || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n[ \t]/g, "");

  const blocks = normalized.match(/BEGIN:VCARD[\s\S]*?END:VCARD/gi) || [];

  allContacts = [];
  filteredContacts = [];
  trashContacts = [];
  selectedIDs.clear();
  displayLimit = 100;
  currentLetter = null;

  blocks.forEach((block) => {
    const fnMatch = block.match(/^FN(?:[^:]*):(.*)$/im);
    const telMatch = block.match(/^TEL(?:[^:]*):(.*)$/im);
    const emailMatch = block.match(/^EMAIL(?:[^:]*):(.*)$/im);
    const orgMatch = block.match(/^ORG(?:[^:]*):(.*)$/im);
    const noteMatch = block.match(/^NOTE(?:[^:]*):(.*)$/im);

    allContacts.push({
      id: generateUID(),
      originalBlock: block.endsWith("\n") ? block : `${block}\n`,
      fn: fnMatch ? fnMatch[1].trim() : "Sem Nome",
      tel: telMatch ? telMatch[1].trim() : "",
      email: emailMatch ? emailMatch[1].trim() : "",
      org: orgMatch ? orgMatch[1].trim() : "",
      note: noteMatch ? noteMatch[1].trim() : ""
    });
  });

  sortContacts();
  updateTrashCount();
  updateContactDropdown();
  clearSelection();

  const search = document.getElementById("search-box");
  if (search) search.value = "";
  document.querySelectorAll(".alphabet-btn").forEach((b) => b.classList.remove("active"));

  applyFilters();
  showToast(`${allContacts.length} contatos carregados!`, "success");

  const firstTab = document.querySelector(".nav-item[title='Contatos VCF']") || document.querySelector(".nav-item");
  if (firstTab) switchTab("contacts", firstTab);
}

/**
 * Ordena contatos por nome e atualiza contador total.
 */
function sortContacts() {
  allContacts.sort((a, b) => a.fn.localeCompare(b.fn, "pt-BR", { sensitivity: "base" }));
  const total = document.getElementById("stat-total");
  if (total) total.textContent = allContacts.length;
}

/**
 * Alterna filtro alfabético e dispara nova filtragem.
 *
 * @param {string} letter - Letra escolhida.
 * @param {HTMLElement} btnElement - Botão clicado.
 */
function filterByLetter(letter, btnElement) {
  if (currentLetter === letter) {
    currentLetter = null;
    btnElement.classList.remove("active");
  } else {
    currentLetter = letter;
    document.querySelectorAll(".alphabet-btn").forEach((b) => b.classList.remove("active"));
    btnElement.classList.add("active");
  }
  applyFilters();
}

/**
 * Aplica filtros por texto e por letra no estado `allContacts`.
 */
function applyFilters() {
  const term = (document.getElementById("search-box")?.value || "").trim().toLowerCase();
  displayLimit = 100;

  filteredContacts = allContacts.filter((contact) => {
    const fn = contact.fn.toLowerCase();
    const tel = contact.tel.toLowerCase();
    const matchesText = !term || fn.includes(term) || tel.includes(term);

    if (!currentLetter) {
      return matchesText;
    }

    const firstChar = contact.fn.charAt(0).toUpperCase();
    const matchesLetter = currentLetter === "#" ? !/[A-Z]/.test(firstChar) : firstChar === currentLetter;
    return matchesText && matchesLetter;
  });

  const filtered = document.getElementById("stat-filtered");
  if (filtered) filtered.textContent = filteredContacts.length;

  const selectAll = document.getElementById("select-all-checkbox");
  if (selectAll) selectAll.checked = false;

  renderGrid();
}

/**
 * Renderiza a grade de contatos com paginação incremental (displayLimit).
 */
function renderGrid() {
  const container = document.getElementById("contact-list");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (filteredContacts.length === 0) {
    container.innerHTML = "<div class='empty-state'>Nenhum contato encontrado. Importe um arquivo VCF para começar.</div>";
    updateBulkToolbar();
    return;
  }

  const visible = filteredContacts.slice(0, displayLimit);

  visible.forEach((contact) => {
    const isChecked = selectedIDs.has(contact.id);
    const card = document.createElement("div");
    card.className = `card ${isChecked ? "selected" : ""}`;
    card.id = `card-${contact.id}`;

    card.innerHTML = `
      <div class="card-header">
        <label class="checkbox-container">
          <input type="checkbox" onchange="toggleSelect('${contact.id}', this)" ${isChecked ? "checked" : ""}>
          <span style="font-size:0.8rem; color:var(--md-primary); font-weight:700;">#VCF</span>
        </label>
        <button class="btn-icon" style="color:var(--danger-red);" onclick="moveToTrash('${contact.id}')" title="Mover para lixeira">
          <svg><use href="#icon-trash"/></svg>
        </button>
      </div>
      <div class="form-group">
        <label>Nome (FN)</label>
        <input type="text" class="input-glass" value="${escapeHTML(contact.fn)}" onchange="updateInline('${contact.id}', 'fn', this.value, 'FN')">
      </div>
      <div class="form-group">
        <label>Telefone (TEL)</label>
        <input type="text" class="input-glass" value="${escapeHTML(contact.tel)}" onchange="updateInline('${contact.id}', 'tel', this.value, 'TEL')">
      </div>
      <button class="expand-btn" onclick="toggleExtra('${contact.id}')">
        <svg><use href="#icon-chevron-down"/></svg> Mais informações
      </button>
      <div class="extra-fields" id="extra-${contact.id}">
        <div class="form-group">
          <label>Empresa (ORG)</label>
          <input type="text" class="input-glass" value="${escapeHTML(contact.org)}" onchange="updateInline('${contact.id}', 'org', this.value, 'ORG')">
        </div>
        <div class="form-group">
          <label>Email (EMAIL)</label>
          <input type="text" class="input-glass" value="${escapeHTML(contact.email)}" onchange="updateInline('${contact.id}', 'email', this.value, 'EMAIL')">
        </div>
        <div class="form-group">
          <label>Notas (NOTE)</label>
          <input type="text" class="input-glass" value="${escapeHTML(contact.note)}" onchange="updateInline('${contact.id}', 'note', this.value, 'NOTE')">
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  const loadMoreBtn = document.getElementById("btn-load-more");
  if (loadMoreBtn) {
    loadMoreBtn.style.display = filteredContacts.length > displayLimit ? "flex" : "none";
  }

  updateBulkToolbar();
}

/**
 * Incrementa a janela de renderização em +100 contatos.
 */
function loadMore() {
  displayLimit += 100;
  renderGrid();
}

/**
 * Expande/fecha detalhes extras do card de contato.
 *
 * @param {string} id - ID do contato.
 */
function toggleExtra(id) {
  document.getElementById(`extra-${id}`)?.classList.toggle("open");
}

/**
 * Atualiza um campo inline do contato e sincroniza o bloco VCF.
 *
 * @param {string} id - ID do contato.
 * @param {"fn"|"tel"|"org"|"email"|"note"} fieldObjKey - Chave do objeto de contato.
 * @param {string} val - Novo valor.
 * @param {string} vcfPrefix - Prefixo da propriedade no VCF (FN, TEL, ORG...).
 */
function updateInline(id, fieldObjKey, val, vcfPrefix) {
  const contactIndex = allContacts.findIndex((c) => c.id === id);
  if (contactIndex === -1) {
    showToast("Erro: contato não encontrado.", "error");
    return;
  }

  allContacts[contactIndex][fieldObjKey] = val;
  allContacts[contactIndex].originalBlock = updateVCFBlock(allContacts[contactIndex].originalBlock, vcfPrefix, val);

  if (fieldObjKey === "fn") {
    sortContacts();
    applyFilters();
    updateContactDropdown();
  }
}

/**
 * Marca/desmarca um contato para operações em lote.
 *
 * @param {string} id - ID do contato.
 * @param {HTMLInputElement} checkbox - Checkbox do card.
 */
function toggleSelect(id, checkbox) {
  const card = document.getElementById(`card-${id}`);
  if (checkbox.checked) {
    selectedIDs.add(id);
    card?.classList.add("selected");
  } else {
    selectedIDs.delete(id);
    card?.classList.remove("selected");
  }

  updateBulkToolbar();
}

/**
 * Marca/desmarca todos os contatos visíveis na página atual.
 *
 * @param {HTMLInputElement} checkbox - Checkbox mestre.
 */
function toggleSelectAll(checkbox) {
  filteredContacts.slice(0, displayLimit).forEach((contact) => {
    if (checkbox.checked) selectedIDs.add(contact.id);
    else selectedIDs.delete(contact.id);
  });
  renderGrid();
}

/**
 * Limpa seleção atual de contatos.
 */
function clearSelection() {
  selectedIDs.clear();
  const selectAll = document.getElementById("select-all-checkbox");
  if (selectAll) selectAll.checked = false;
  updateBulkToolbar();
}

/**
 * Atualiza barra de ações em lote (exibir/ocultar e contador).
 */
function updateBulkToolbar() {
  const toolbar = document.getElementById("bulk-toolbar");
  const selectedCounter = document.getElementById("selected-count");
  if (!toolbar || !selectedCounter) {
    return;
  }

  if (selectedIDs.size > 0) {
    toolbar.classList.add("active");
    selectedCounter.textContent = `${selectedIDs.size} selecionados`;
  } else {
    toolbar.classList.remove("active");
    selectedCounter.textContent = "0 selecionados";
  }
}

/**
 * Ajusta visibilidade dos inputs conforme tipo de ação em lote selecionada.
 */
function toggleBulkInputs() {
  const action = document.getElementById("bulk-action-type")?.value;
  const replaceInput = document.getElementById("bulk-input-replace");
  const valueInput = document.getElementById("bulk-input-val");
  if (!replaceInput || !valueInput) {
    return;
  }

  if (action === "replace") {
    replaceInput.style.display = "block";
    valueInput.style.display = "block";
    valueInput.placeholder = "Palavra a procurar...";
  } else if (action === "clean_wa") {
    replaceInput.style.display = "none";
    valueInput.style.display = "none";
  } else {
    replaceInput.style.display = "none";
    valueInput.style.display = "block";
    valueInput.placeholder = "Texto alvo...";
  }
}

/**
 * Executa ação em lote para os contatos selecionados.
 *
 * Ações disponíveis:
 * - prefix: adiciona prefixo ao nome.
 * - replace: substitui substring no nome.
 * - clean_wa: remove sufixos `@s.whatsapp.net` e `@lid` do telefone.
 */
function applyBulkAction() {
  const action = document.getElementById("bulk-action-type")?.value;
  const val = (document.getElementById("bulk-input-val")?.value || "").trim();
  const replaceVal = document.getElementById("bulk-input-replace")?.value || "";

  if (action !== "clean_wa" && !val) {
    showToast("Digite o texto da ação.", "error");
    return;
  }

  selectedIDs.forEach((id) => {
    const idx = allContacts.findIndex((c) => c.id === id);
    if (idx === -1) {
      return;
    }

    const contact = allContacts[idx];

    if (action === "prefix") {
      contact.fn = `${val} ${contact.fn}`.trim();
      contact.originalBlock = updateVCFBlock(contact.originalBlock, "FN", contact.fn);
      return;
    }

    if (action === "replace") {
      contact.fn = contact.fn.split(val).join(replaceVal).trim();
      contact.originalBlock = updateVCFBlock(contact.originalBlock, "FN", contact.fn);
      return;
    }

    if (action === "clean_wa") {
      contact.tel = contact.tel.replace(/@(s\.whatsapp\.net|lid)/gi, "").trim();
      contact.originalBlock = updateVCFBlock(contact.originalBlock, "TEL", contact.tel);
    }
  });

  const inputVal = document.getElementById("bulk-input-val");
  const inputReplace = document.getElementById("bulk-input-replace");
  if (inputVal) inputVal.value = "";
  if (inputReplace) inputReplace.value = "";

  sortContacts();
  clearSelection();
  applyFilters();
  updateContactDropdown();
  showToast("Ação em lote aplicada.", "success");
}

/**
 * Atualiza contador visual da lixeira na navegação.
 */
function updateTrashCount() {
  const trashCount = document.getElementById("trash-count");
  if (trashCount) trashCount.textContent = trashContacts.length;
}

/**
 * Move um contato da base principal para a lixeira.
 *
 * @param {string} id - ID do contato.
 */
function moveToTrash(id) {
  const idx = allContacts.findIndex((c) => c.id === id);
  if (idx === -1) {
    return;
  }

  trashContacts.push(allContacts[idx]);
  allContacts.splice(idx, 1);
  selectedIDs.delete(id);

  sortContacts();
  applyFilters();
  updateTrashCount();
  updateContactDropdown();
  showToast("Movido para lixeira.", "error");
}

/**
 * Move todos os contatos selecionados para a lixeira.
 */
function deleteSelected() {
  selectedIDs.forEach((id) => {
    const idx = allContacts.findIndex((c) => c.id === id);
    if (idx !== -1) {
      trashContacts.push(allContacts[idx]);
      allContacts.splice(idx, 1);
    }
  });

  clearSelection();
  sortContacts();
  applyFilters();
  updateTrashCount();
  updateContactDropdown();
  showToast("Contatos movidos para lixeira.", "error");
}

/**
 * Renderiza lista de contatos removidos (lixeira).
 */
function renderTrash() {
  const container = document.getElementById("trash-list");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (trashContacts.length === 0) {
    container.innerHTML = "<div class='empty-state'>A lixeira está vazia.</div>";
    return;
  }

  trashContacts.forEach((contact, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div style="color:var(--text-muted); text-decoration:line-through; font-weight:700;">${escapeHTML(contact.fn)}</div>
      <div style="font-size:0.85rem; color:var(--text-muted);">${escapeHTML(contact.tel)}</div>
      <div style="display:flex; gap:8px; margin-top:6px;">
        <button class="btn btn-glass" style="flex:1; color:var(--wa-green); border-color:var(--wa-green);" onclick="restoreContact(${idx})">
          <svg><use href="#icon-refresh-cw"/></svg> Restaurar
        </button>
        <button class="btn btn-danger" onclick="destroyContact(${idx})" title="Apagar permanentemente">
          <svg><use href="#icon-trash"/></svg>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * Restaura um contato da lixeira para a base principal.
 *
 * @param {number} idx - Índice do item na lixeira.
 */
function restoreContact(idx) {
  if (!trashContacts[idx]) {
    return;
  }

  allContacts.push(trashContacts[idx]);
  trashContacts.splice(idx, 1);

  sortContacts();
  applyFilters();
  updateTrashCount();
  updateContactDropdown();
  renderTrash();

  showToast("Contato restaurado.", "success");
}

/**
 * Remove definitivamente um contato da lixeira.
 *
 * @param {number} idx - Índice do item na lixeira.
 */
function destroyContact(idx) {
  if (!trashContacts[idx]) {
    return;
  }

  trashContacts.splice(idx, 1);
  updateTrashCount();
  renderTrash();
  showToast("Contato removido permanentemente.", "error");
}

/**
 * Esvazia toda a lixeira após confirmação.
 */
function emptyTrash() {
  if (!confirm("Esvaziar lixeira? Esta ação é irreversível.")) {
    return;
  }

  trashContacts = [];
  updateTrashCount();
  renderTrash();
  showToast("Lixeira esvaziada.", "info");
}

/**
 * Exporta a base atual de contatos para um arquivo .vcf.
 */
function downloadUpdatedVCF() {
  if (allContacts.length === 0) {
    showToast("A base de contatos está vazia.", "error");
    return;
  }

  const content = allContacts.map((contact) => contact.originalBlock.trimEnd()).join("\n") + "\n";
  const blob = new Blob([content], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "Base_VCF_OS_Exportada.vcf";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  showToast("Download da base iniciado.", "success");
}
