<p>
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>
  <strong>VCF OS Docs</strong>
</p>

# <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg> Arquitetura Técnica

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg> Stack

- HTML5
- CSS3 (separado por responsabilidade)
- JavaScript vanilla
- PWA (`manifest.json` + `sw.js`)

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Organização de módulos

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

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></svg> Persistência local

- `localStorage`:
  - `vcf_events`
  - `vcf_theme`
  - `vcf_font`

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Responsividade

Estratégia mobile-first:

1. Navegação inferior fixa no celular
2. FABs para importar/exportar no celular
3. Grids de 1 coluna no mobile
4. Upgrade para sidebar lateral e grids maiores em `@media (min-width: 768px)`

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M12 4h9"/><path d="M4 9h16"/><path d="M4 15h16"/><path d="M8 4v16"/></svg> PWA

- `sw.js` faz cache do app shell
- Atualiza cache por versão (`CACHE_NAME`)
- Remove caches antigos no `activate`
