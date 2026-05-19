# Changelog

## 2026-05-19

### Corrigido

- `index.html` incompleto foi reconstruído com estrutura funcional completa.
- Arquivos vazios `css/*` e `js/*` foram preenchidos com implementação real.
- Manifest ajustado para ícones válidos (`icon-192.png` e `icon-512.png`).
- Ícones de PWA zerados (0 bytes) foram recriados.
- `sw.js` atualizado para cache do app shell e limpeza de versões antigas.

### Melhorado

- Interface convertida para mobile-first de forma consistente.
- Separação de CSS em `themes`, `layout` e `components`.
- Separação de JS por domínio (`vcf-core`, `calendar`, `app`).
- Persistência de tema/fonte e UX com toasts ajustada.

### Documentação

- `README.md` com setup e estrutura.
- `docs/APRESENTACAO.md` com visão geral e proposta.
- `docs/GUIA_DE_USO.md` com fluxo completo de uso.
- `docs/ARQUITETURA.md` com desenho técnico e módulos.

### Atualizado (Painel)

- Exibição automática de changelog ao abrir o painel após novas atualizações.
- Redesign completo dos cards de temas com previews visuais por paleta.
- Redesign dos cards de tipografia com amostras reais de leitura.
- Exibição do valor hexadecimal da cor customizada em tempo real.
