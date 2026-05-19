# Guia Técnico de Ferramentas e Funções do Código

## 1. Objetivo deste guia

Este documento é um mapa completo para quem vai manter o projeto. Ele explica:

- O que cada módulo resolve.
- Como cada ferramenta/função funciona.
- Em que ordem o sistema executa.
- Como alterar o comportamento sem se perder.

## 2. Mapa rápido da arquitetura

### Front-end principal

- `index.html`: estrutura visual, abas, modais e pontos de integração (`onclick`, `onchange`, `oninput`).
- `css/themes.css`: variáveis de tema e paletas.
- `css/layout.css`: layout mobile-first e responsividade.
- `css/components.css`: aparência dos componentes.

### Lógica JavaScript

- `js/vcf-core.js`: motor de contatos VCF.
- `js/calendar.js`: motor da agenda/eventos.
- `js/app.js`: orquestração geral da interface e preferências.

### Camada PWA

- `manifest.json`: metadados de instalação do app.
- `sw.js`: cache offline e estratégia de atualização.

## 3. Fluxo de inicialização (ordem real)

Ao abrir o painel, o `DOMContentLoaded` em `js/app.js` executa nesta ordem:

1. `initAlphabet()` cria a barra A-Z.
2. `loadEvents()` carrega eventos salvos da agenda.
3. `loadPreferences()` restaura tema/fonte.
4. `setupCustomColor()` conecta seletor de cor.
5. `setupModalClose()` ativa fechamento por clique no overlay.
6. `setupResizeBehavior()` ajusta sidebar conforme viewport.
7. `registerServiceWorker()` registra PWA.
8. `toggleBulkInputs()`, `sortContacts()`, `applyFilters()`, `updateTrashCount()`, `renderCalendar()` preparam a UI.
9. `showChangelogModalIfNeeded()` exibe changelog se houver release nova.

## 4. Agenda detalhada (js/calendar.js)

## 4.1 Estado da agenda

- `events`: array em memória com os eventos.
- `currentDate`: mês/ano atualmente exibido no calendário.

Estrutura de um evento:

```json
{
  "id": "ev_...",
  "title": "Nome do evento",
  "date": "2026-05-19",
  "time": "12:00",
  "contactId": "c_...",
  "tag": "tag-default"
}
```

## 4.2 Funções da agenda

### `loadEvents()`

O que resolve:

- Recupera os eventos salvos no navegador.
- Evita quebrar se o JSON estiver inválido.

Como funciona:

1. Lê `localStorage.getItem('vcf_events')`.
2. Faz parse com `JSON.parse`.
3. Garante que o valor final seja array.
4. Em erro, zera para `[]`.

### `saveEvents()`

O que resolve:

- Persistência local dos eventos criados/alterados.

Como funciona:

1. Converte `events` para JSON.
2. Salva em `localStorage` na chave `vcf_events`.

### `updateContactDropdown()`

O que resolve:

- Preenche o select de contatos no modal de evento.

Como funciona:

1. Limpa select.
2. Adiciona opção `Nenhum`.
3. Percorre `allContacts` e inclui cada `fn` como opção.

### `changeMonth(direction)`

O que resolve:

- Navegação mensal (seta esquerda/direita).

Como funciona:

1. Atualiza `currentDate` com `setMonth`.
2. Chama `renderCalendar()`.

### `renderCalendar()`

O que resolve:

- Desenha toda a grade da agenda para o mês atual.

Como funciona:

1. Calcula `year`, `month`, `firstDay`, `daysInMonth`.
2. Atualiza título do mês (`calendar-month-year`).
3. Preenche células vazias antes do dia 1.
4. Para cada dia:
   - monta `dateStr` no formato `YYYY-MM-DD`.
   - filtra `events` daquele dia.
   - cria célula clicável para abrir modal.
   - renderiza pills dos eventos.
5. Marca classe `today` no dia atual.

### `openEventModal(dateStr)`

O que resolve:

- Abre modal pronto para criação de evento.

Como funciona:

1. Limpa título.
2. Preenche data com `dateStr` (ou hoje).
3. Define hora padrão `12:00`.
4. Reseta contato e tag.
5. Mostra modal.

### `closeEventModal()`

O que resolve:

- Fecha modal de evento.

Como funciona:

1. Remove classe `active` do overlay.

### `saveEvent()`

O que resolve:

- Cria evento novo e sincroniza com contato quando vinculado.

Como funciona:

1. Lê título/data/hora/contato/tag.
2. Valida obrigatórios (título e data).
3. Gera objeto com `id` único.
4. Se `contactId` existir:
   - encontra contato em `allContacts`.
   - escreve resumo no campo `NOTE`.
   - atualiza `originalBlock` via `updateVCFBlock`.
5. Adiciona evento em `events`.
6. Salva em localStorage (`saveEvents`).
7. Fecha modal, renderiza calendário e mostra toast.
8. Se aba de contatos estiver ativa, re-renderiza filtros.

### `deleteEvent(id)`

O que resolve:

- Exclui um evento específico com confirmação.

Como funciona:

1. Exibe `confirm`.
2. Filtra o evento do array.
3. Persiste com `saveEvents()`.
4. Re-renderiza calendário e toast.

## 4.3 O que a agenda entrega na prática

- Agenda visual mensal.
- Eventos com hora e categoria (`tag-default`, `tag-work`, `tag-personal`).
- Integração opcional com contatos.
- Persistência local sem backend.

## 4.4 Limitações atuais da agenda

- Não há edição de evento existente (apenas criar/remover).
- Não há recorrência automática.
- Persistência é local por navegador/dispositivo.

## 5. Ferramentas do módulo de contatos (js/vcf-core.js)

## 5.1 Importação e parse VCF

Funções:

- `handleFileUpload(event)`
- `parseVCF(vcfText)`
- `generateUID()`

O que resolvem:

- Leitura de arquivo `.vcf`.
- Conversão para objetos JS editáveis.
- Identidade única dos cards.

## 5.2 Edição segura de propriedades VCF

Funções:

- `updateVCFBlock(block, prefix, newValue)`
- `updateInline(id, fieldObjKey, val, vcfPrefix)`

O que resolvem:

- Mantêm sincronia entre UI e texto VCF original.
- Preservam parâmetros da linha (`TEL;TYPE=...`).

## 5.3 Filtros e visualização

Funções:

- `initAlphabet()`
- `filterByLetter(letter, btnElement)`
- `applyFilters()`
- `renderGrid()`
- `loadMore()`

O que resolvem:

- Busca por nome/telefone.
- Filtro por inicial A-Z e `#`.
- Paginação incremental de cards.

## 5.4 Seleção e ações em lote

Funções:

- `toggleSelect(id, checkbox)`
- `toggleSelectAll(checkbox)`
- `clearSelection()`
- `updateBulkToolbar()`
- `toggleBulkInputs()`
- `applyBulkAction()`

Ações disponíveis:

- Prefixo de nome.
- Substituição de palavras no nome.
- Sanitização WAHA/Evolution (`@s.whatsapp.net` e `@lid`).

## 5.5 Lixeira

Funções:

- `moveToTrash(id)`
- `deleteSelected()`
- `renderTrash()`
- `restoreContact(idx)`
- `destroyContact(idx)`
- `emptyTrash()`
- `updateTrashCount()`

O que resolve:

- Soft delete com reversão.
- Exclusão definitiva só na lixeira.

## 5.6 Exportação

Função:

- `downloadUpdatedVCF()`

O que resolve:

- Gera arquivo `.vcf` final com todas as alterações aplicadas.

## 6. Ferramentas globais de interface (js/app.js)

### Navegação e layout

- `toggleSidebar()`
- `switchTab(tabId, navItem)`
- `setupResizeBehavior()`

### Temas e tipografia

- `setTheme(themeName, btnElement, silent)`
- `setFont(nerdFont, fallback, btnElement)`
- `setupCustomColor()`
- `setMetaThemeColor(color)`
- `loadPreferences()`

### Feedback e modais

- `showToast(message, type)`
- `setupModalClose()`

### Changelog no painel

- `showChangelogModalIfNeeded()`
- `closeChangelogModal(markAsSeen)`
- Chaves: `CHANGELOG_SEEN_KEY`, `APP_RELEASE`, `RELEASE_NOTES`

### PWA

- `registerServiceWorker()`

## 7. Passo a passo para fazer ajustes sem se perder

## 7.1 Quero mudar comportamento da agenda

1. Abra `js/calendar.js`.
2. Identifique a função-alvo (`saveEvent`, `renderCalendar`, etc).
3. Se a alteração impactar contatos, revise `updateVCFBlock` em `js/vcf-core.js`.
4. Valide criação/remoção de evento e persistência em `localStorage`.

## 7.2 Quero mudar importação ou exportação VCF

1. Abra `js/vcf-core.js`.
2. Para parse, ajuste `parseVCF`.
3. Para escrita de campos, ajuste `updateVCFBlock`.
4. Para download, ajuste `downloadUpdatedVCF`.

## 7.3 Quero alterar layout responsivo

1. Estrutura: `css/layout.css`.
2. Aparência de componentes: `css/components.css`.
3. Paletas/temas: `css/themes.css`.

## 7.4 Quero incluir um novo tema

1. Adicione bloco `[data-theme="novoTema"]` em `css/themes.css`.
2. Inclua botão em `index.html` na seção de temas.
3. Atualize `THEME_COLOR_MAP` em `js/app.js`.

## 7.5 Quero publicar nova atualização com changelog no painel

1. Atualize `CHANGELOG.md`.
2. Em `js/app.js`, altere `APP_RELEASE` para novo identificador.
3. Atualize os itens de `RELEASE_NOTES`.
4. No próximo acesso, o modal aparecerá automaticamente.

## 8. Checklist rápido de QA após qualquer ajuste

1. Importar VCF e validar quantidade de contatos.
2. Editar nome/telefone e exportar VCF.
3. Testar ações em lote (prefix, replace, clean_wa).
4. Mover/restaurar/excluir na lixeira.
5. Criar/remover eventos na agenda.
6. Mudar tema/fonte e recarregar página.
7. Validar no mobile e desktop.
8. Validar abertura offline básica (PWA, quando servido por HTTP).
