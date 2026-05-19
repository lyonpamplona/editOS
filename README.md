# VCF OS & Agenda

Aplicação web estática para importação, edição e exportação de contatos em `.vcf`, com agenda integrada e interface mobile-first.

## Documentação

- [Apresentação](docs/APRESENTACAO.md)
- [Onboarding Rápido (5 min)](docs/ONBOARDING_RAPIDO.md)
- [Guia de Uso](docs/GUIA_DE_USO.md)
- [Arquitetura Técnica](docs/ARQUITETURA.md)
- [Guia de Ferramentas e Código](docs/FERRAMENTAS_E_CODIGO.md)
- [Changelog](CHANGELOG.md)

## Execução local

1. Abra o arquivo `index.html` direto no navegador.
2. Opcional: sirva por HTTP local para testar PWA/service worker:
   - `python3 -m http.server 8080`
   - Acesse `http://localhost:8080`

## Estrutura

- `index.html`: interface principal
- `css/themes.css`: variáveis e temas
- `css/layout.css`: layout responsivo mobile-first
- `css/components.css`: componentes visuais
- `js/vcf-core.js`: lógica de contatos/VCF/lixeira
- `js/calendar.js`: agenda/eventos
- `js/app.js`: inicialização, preferências e comportamento de UI
- `manifest.json` e `sw.js`: camada PWA
