<p>
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>
  <strong>VCF OS Docs</strong>
</p>

# <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M5 9l7-7 7 7"/><path d="M5 15h14"/></svg> Instalação do Projeto

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> 1. Visão rápida

O VCF OS & Agenda é uma aplicação web estática (HTML, CSS e JavaScript).  
Não precisa de banco de dados nem backend para funcionar.

Você pode executar de 2 formas:

1. Modo simples: abrir `index.html` direto no navegador.
2. Modo recomendado: servir via HTTP local (melhor para PWA e service worker).

## 2. Pré-requisitos

Você só precisa de:

- Navegador moderno (Chrome, Edge, Firefox ou Safari atualizado).
- Opcional: Python 3 ou Node.js para servidor local.

## 3. Obter os arquivos do projeto

Se já estiver com os arquivos na máquina, pule esta etapa.

Opções comuns:

1. Clonar via Git:
   - `git clone <url-do-repositorio>`
2. Baixar ZIP e extrair a pasta.

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg> 4. Instalação / Execução

## Opção A: Modo simples (sem servidor)

1. Entre na pasta do projeto.
2. Abra o arquivo `index.html` no navegador.

Observação:

- Funciona para uso geral.
- Recursos de PWA podem não se comportar 100% nesse modo.

## Opção B: Modo recomendado com Python 3

1. Abra o terminal na pasta do projeto.
2. Execute:

```bash
python3 -m http.server 8080
```

3. Acesse no navegador:
   - `http://localhost:8080`

## Opção C: Modo recomendado com Node.js

1. Abra o terminal na pasta do projeto.
2. Execute:

```bash
npx serve .
```

3. Abra a URL exibida no terminal (normalmente `http://localhost:3000`).

## 5. Verificação pós-instalação

Após abrir o painel:

1. Vá para a aba `Contatos`.
2. Importe um arquivo `.vcf`.
3. Edite um contato e exporte novamente.
4. Vá para `Agenda` e crie um evento.
5. Vá para `Ajustes`, altere tema/fonte e recarregue a página para validar persistência.

Se tudo isso funcionar, a instalação está concluída.

## <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> 6. Solução de problemas

## Não abriu no navegador

- Confirme que está abrindo o `index.html` correto.
- Se estiver usando servidor local, valide se a porta está livre.

## Porta em uso (8080 ou 3000)

- Troque a porta:
  - Python: `python3 -m http.server 8090`
  - Node: `npx serve . -l 3090`

## PWA não atualiza

1. Abra DevTools do navegador.
2. Limpe dados de site/cache.
3. Recarregue a página.
