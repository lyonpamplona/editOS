<p>
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>
  <strong>VCF OS Docs</strong>
</p>

# <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> VCF OS & Agenda

Aplicação web estática para importação, edição e exportação de contatos em `.vcf`, com agenda integrada e interface mobile-first.

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Documentação

- [Apresentação](docs/APRESENTACAO.md)
- [Instalação](docs/INSTALACAO.md)
- [Onboarding Rápido (5 min)](docs/ONBOARDING_RAPIDO.md)
- [Guia de Uso](docs/GUIA_DE_USO.md)
- [Arquitetura Técnica](docs/ARQUITETURA.md)
- [Guia de Ferramentas e Código](docs/FERRAMENTAS_E_CODIGO.md)
- [Changelog](CHANGELOG.md)

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg> Execução local

1. Abra o arquivo `index.html` direto no navegador.
2. Opcional: sirva por HTTP local para testar PWA/service worker:
   - `python3 -m http.server 8080`
   - Acesse `http://localhost:8080`

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Estrutura

- `index.html`: interface principal
- `css/themes.css`: variáveis e temas
- `css/layout.css`: layout responsivo mobile-first
- `css/components.css`: componentes visuais
- `js/vcf-core.js`: lógica de contatos/VCF/lixeira
- `js/calendar.js`: agenda/eventos
- `js/app.js`: inicialização, preferências e comportamento de UI
- `manifest.json` e `sw.js`: camada PWA
