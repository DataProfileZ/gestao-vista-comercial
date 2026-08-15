# Gestão à Vista Comercial — Zucchi

Protótipo da página externa que substituirá o painel Power BI "BI Projeção TV" nas TVs da sala comercial.

**Status: FASE 7 — protótipo com dados simulados.** Não conectado ao Salesforce, não publicado.

## Estrutura

```
gestao-vista-comercial/
├── index.html              → estrutura das 8 telas
├── styles.css               → identidade visual (teal + dourado Zucchi)
├── app.js                   → renderização, rotação automática, leitura de dados
├── data/
│   └── dashboard-data.json  → dados exibidos (hoje: simulados)
├── config/
│   └── dashboard-config.json→ ordem, duração e ativação de cada tela
├── docs/
│   └── indicators.md        → documento funcional (Fase 6)
└── README.md
```

## Como visualizar agora

Abra `index.html` diretamente no navegador (duplo clique). Como não há servidor HTTP nesta fase,
o app tenta `fetch()` dos arquivos JSON e usa um fallback embutido em `app.js` caso o navegador
bloqueie `fetch` em `file://` (comportamento normal do Chrome/Edge por segurança).
Quando hospedado (GitHub Pages, Netlify, Vercel, servidor interno), o `fetch` real passa a funcionar
sem qualquer alteração de código.

## O que ainda falta (fases seguintes)

- FASE 9: substituir `dashboard-data.json` simulado por dados reais consultados via MCP Salesforce
- FASE 10: reconciliar cada indicador com o Power BI atual (tolerância zero, exceto V5 — diferença intencional documentada)
- FASE 11: validações obrigatórias de estrutura, dados, visual e segurança
- FASE 12: publicação em hospedagem externa (a definir)
- FASE 13: tarefa recorrente de atualização automática via Claude Cowork

## Decisões já homologadas nesta etapa

- Campo oficial: `OrderItem.SingleBundle__c` (não `Single_Bundle__c`)
- V5 (Recebimento) usa `Fatura__c.ValorUSD__c` em vez de `ValorPagto__c` — diferença **intencional** frente ao Power BI
- Tela de Containers exibe **apenas quantidade** (sem conta, pedido ou valor)
- Tela de Funil exibe **quantidade de cards por vendedor × etapa + percentual de valor** (sem valor absoluto em USD)
