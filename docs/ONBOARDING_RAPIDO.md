# Onboarding Rápido (5 Minutos)

## 1. O que é este projeto

VCF OS & Agenda é um painel web para:

- importar contatos `.vcf`
- editar contatos individualmente e em lote
- organizar lixeira
- gerenciar agenda integrada
- exportar base VCF atualizada

## 2. Arquivos que você precisa conhecer primeiro

- `index.html`: estrutura das abas, modais e botões.
- `js/vcf-core.js`: lógica de contatos (importar, editar, filtrar, lixeira, exportar).
- `js/calendar.js`: lógica da agenda (criar/remover eventos, render do calendário).
- `js/app.js`: orquestração geral (tema, navegação, toasts, changelog, bootstrap).
- `css/layout.css`: responsividade mobile-first.
- `css/components.css`: aparência dos componentes.
- `css/themes.css`: variáveis e temas.

## 3. Fluxo de execução real

Quando a tela abre:

1. `app.js` dispara `DOMContentLoaded`.
2. Inicializa filtros, eventos e preferências.
3. Renderiza contatos/agenda e registra service worker.
4. Exibe changelog se houver release nova.

## 4. Onde mexer para cada tipo de ajuste

- Ajuste de agenda: `js/calendar.js`
- Ajuste de contatos/VCF: `js/vcf-core.js`
- Ajuste de UI global: `js/app.js`
- Ajuste visual/responsivo: `css/layout.css` + `css/components.css`
- Ajuste de tema: `css/themes.css` + `THEME_COLOR_MAP` em `js/app.js`

## 5. Funções-chave que vale decorar

- `parseVCF(...)`: lê o arquivo VCF e cria o estado dos contatos.
- `updateVCFBlock(...)`: garante escrita correta das propriedades VCF.
- `applyFilters()` / `renderGrid()`: filtro e render dos cards.
- `renderCalendar()` / `saveEvent()`: render e gravação de eventos.
- `switchTab(...)`: troca de abas e render contextual.

## 6. Checklist rápido antes de subir ajustes

1. Importar um `.vcf` real.
2. Editar contato e exportar VCF.
3. Testar ação em lote.
4. Testar lixeira (restaurar/apagar).
5. Criar/remover evento na agenda.
6. Testar mobile e desktop.

## 7. Documentos de apoio

- `docs/GUIA_DE_USO.md` (visão de uso)
- `docs/ARQUITETURA.md` (visão técnica)
- `docs/FERRAMENTAS_E_CODIGO.md` (detalhado função a função)
- `CHANGELOG.md` (histórico de mudanças)
