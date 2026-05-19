# Arquitetura Técnica

## Stack

- HTML5
- CSS3 (separado por responsabilidade)
- JavaScript vanilla
- PWA (`manifest.json` + `sw.js`)

## Organização de módulos

- `js/vcf-core.js`
  - Parse de VCF
  - Renderização de contatos
  - Edição inline
  - Seleção e ações em lote
  - Lixeira
  - Exportação
- `js/calendar.js`
  - Persistência de eventos
  - Render do calendário
  - Modal de evento
  - Sincronização opcional com NOTE do contato
- `js/app.js`
  - Boot da aplicação
  - Alternância de abas
  - Tema, fonte e preferências
  - Toasts
  - Registro do service worker

## Persistência local

- `localStorage`:
  - `vcf_events`
  - `vcf_theme`
  - `vcf_font`

## Responsividade

Estratégia mobile-first:

1. Navegação inferior fixa no celular
2. FABs para importar/exportar no celular
3. Grids de 1 coluna no mobile
4. Upgrade para sidebar lateral e grids maiores em `@media (min-width: 768px)`

## PWA

- `sw.js` faz cache do app shell
- Atualiza cache por versão (`CACHE_NAME`)
- Remove caches antigos no `activate`
