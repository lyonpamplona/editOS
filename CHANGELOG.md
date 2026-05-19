<p>
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>
  <strong>VCF OS Docs</strong>
</p>

# <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17v-6h6"/><path d="M17 3a9 9 0 0 0-9 9"/><path d="M7 21a9 9 0 0 0 9-9"/></svg> Changelog

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
