# Prompt de Atualização Manual — Gestão à Vista Comercial Zucchi

> Cole esta mensagem inteira sempre que precisar atualizar o painel. Se o Salesforce não
> conectar de primeira, peça para eu tentar de novo — já aconteceu antes nesta sessão.

---

Atualize o painel "Gestão à Vista Comercial Zucchi" com dados reais do Salesforce (conector
"Salesforce - Fernanda"), seguindo exatamente as regras e fórmulas abaixo, já validadas
comigo em sessões anteriores. Não recalcule a lógica do zero — use estas fórmulas.

## 1. Vendedores oficiais (15)

Felipe Lobato, Thalys Eccel Kill, Ignacia Acevedo, Lara Roncetti, Pedro Ribeiro,
Renzo Carletti, Arthur Lodi, Manon Fernandez, Diego Bitencourt, Livia Ventorim,
Marcelino Camata, André Zucchi, Enzo Ziviani, Eduardo Gomes, Ana Amado.

- **Douglas Mota**: excluído permanentemente — não é mais funcionário da Zucchi.
- **Stellen Torres**: só incluir se tiver `Meta__c.Valor__c > 0` no período; geralmente fica de fora.
- **Livia Ventorim e Marcelino Camata**: têm menos de 2 meses de casa. Em qualquer cálculo
  "Ano", conte meta e realizado **apenas a partir do primeiro mês em que `Meta__c` existe
  para eles** — nunca desde janeiro.
- **Ana Amado**: meta cadastrada só a partir de agosto/2026 — mesma regra acima.

**Usuários técnicos, nunca incluir em nenhuma tela por vendedor:** Alyne Lamy, Ana Amado
(quando aparecer como *Account.Owner* de contas reatribuídas antes de agosto/2026 — cuidado,
ela é vendedora real, mas só passa a contar a partir de agosto), IT Integration,
SF Integration, Leonardo Pellegrino, Leonardo Tatagiba, Fernanda Moreira de Jesus,
Gustavo Rocha, Matheus Felipe, Luiza Alvarenga, Conrado Holzbach, Douglas Butzke,
Nathalia Specemille.

## 2. Fórmulas por tela

**V1 — Meta x Realizado (Mês Atual)**
- Meta: `Meta__c.Valor__c` WHERE `Meta_Vendedor__c=true`, `MetaAntiga__c=false`,
  `MesAno__c` = primeiro dia do mês vigente
- Realizado: `SUM(Order.TotalCalculado__c)` WHERE `Account.Owner.Name` = vendedor,
  `Detentor__c='Zucchi'`, `Status='Faturado'`, `DataFaturamento__c` dentro do mês vigente

**V1 — Meta x Realizado (Ano)**
- Meta: soma de `Meta__c.Valor__c` de janeiro até o mês vigente **incluindo o mês cheio atual**
- Realizado: mesma fórmula do mês atual, mas somando **só os meses fechados** (excluindo o
  mês corrente parcial) — janeiro até o mês anterior
- Motivo: comparar meta de mês cheio com realizado parcial distorce o percentual

**V2 — Ofertas do Mês**
- `COUNT(Oferta__c WHERE Email_Enviado__c=true) + SUM(OfeWts__c)`, agrupado por
  `CreatedBy.Name`, `CreatedDate` dentro do mês vigente
- Independente de direcionamento

**V3 — Containers da Semana**
- `COUNT(Order)` WHERE `Detentor__c='Zucchi'`, `Data_de_carregamento__c` na semana atual
  (segunda a domingo)

**V4 — Reservas**
- Ano (snapshot, sem filtro de data): `COUNT_DISTINCT(Codigo__c)`,
  `SUM(QuantidadeEstoque__c)` WHERE `Situacao__c='Aceito'`, `Detentor__c='Zucchi'`
- % por vendedor sobre meta do mês: `SUM(PrecoTotal__c)` WHERE `Vendedor__c`=vendedor,
  `Situacao__c='Aceito'`, `Detentor__c='Zucchi'` ÷ `Meta__c.Valor__c` do mês vigente
  (pode passar de 100%)

**V4 — Taj Mahal (Ano e Mês Atual)**
```
SUM(TotalPriceTaj__c) / SUM(TotalPrice__c) FROM OrderItem
WHERE Order.Account.Owner.Name = [vendedor]
  AND Order.Detentor__c = 'Zucchi'
  AND ItemEstoque__r.ClassificacaoProd__c IN ('Premium','Standard','Commercial')
  AND ( (Order.Status = 'Faturado' AND DatFat__c dentro do período)
        OR Order.Status IN ('Aprovação Comercial','Aprovação Financeira','Aprovado',
                             'Sem Booking','Booking Solicitado','Com Booking') )
```
Validado exato contra relatório-fonte do Salesforce para todos os 14 vendedores.
**Atenção — dois pares de campos obrigatórios, não só um:** busque SEMPRE
`SUM(TotalPriceTaj__c)/SUM(TotalPrice__c)` (% Valor) **E** `SUM(QtdTaj__c)/SUM(Quantity)`
(% Qtde) nas mesmas consultas — já esqueci a segunda uma vez e a coluna % Qtde saiu
zerada. Confira as duas colunas preenchidas antes de entregar.

**V5 — Recebimento do Mês**
```
SUM(ValorPagto__c) FROM Fatura__c
WHERE ValorPagto__c > 0
  AND OrgVendas__c = 'OVME - Mercado Externo'
  AND (NOT DocCompensacao__c LIKE '%8800%')
  AND Cliente__c NOT IN ('10006066','10000224')
  AND Usuario_Dono_da_Conta__c = true
  AND Empresa__c NOT IN ('1080','2010')
  AND DataPagamento__c dentro do mês vigente
```
Meta: US$ 7.600.000 — **perguntar à Fernanda se mudou antes de aplicar**.
Se o mês estiver nos primeiros dias, sinalizar "parcial" na tela.

**R1 — Atividades Pendentes**
- `COUNT(Task)` WHERE `IsClosed=false`, `Owner.Name` apenas entre os vendedores oficiais
  **com meta cadastrada no mês vigente** (exclui quem não tem meta esse mês)
- Atrasadas: mesmo filtro + `ActivityDate < hoje`

**R2 — Direcionamento TAJ — Sem Confirmação**
```
ItemEstoque__c WHERE Situacao__c IN ('Aceito','Disponível')
  AND DataDir__c >= 2024-05-01
  AND DataProducao__c > 2017-01-01
  AND Familia__c = 'Taj Mahal'
  AND Tipo__c = 'Cavalete'
  AND UsuDir__c != null
  AND DirAnt__c = false
```
Agrupar por `UsuDir__c`, contar itens e média de `DiasDirAteHoj__c`.

**Metas Batidas — Mês Anterior** (com foto)
- Mesma fórmula de V1 Mês Atual, aplicada ao **mês fechado anterior** (não ao vigente)
- Só entram vendedores com `pct >= 100%` — se ninguém bater, mostrar a tela vazia com a
  mensagem honesta, não forçar um resultado
- Fotos: repositório `https://github.com/gabriellima1986/VideosZucchi.git` — atualizar
  (`git pull`) antes de gerar, e reprocessar (crop circular 240x240, JPEG q78) qualquer
  foto nova adicionada desde a última atualização

**Container Mais Caro — Mês Anterior** (pódio top 3, com foto)
- `Order.TotalCalculado__c` DESC WHERE `Detentor__c='Zucchi'`,
  `Data_de_carregamento__c` no mês anterior
- Top 3 **vendedores distintos** por `Account.Owner.Name` (não repetir o mesmo vendedor)

**Campanha Direcionamento**
- **Fonte:** não é uma consulta SOQL fixa. É o relatório Salesforce "Direcionamento -
  Faturamento" (`Report/00OU500000Df8v0MAB`), que a Fernanda seleciona e atualiza
  manualmente todo mês (lista de `Code` específicos). **Sempre pedir o arquivo exportado
  (`.xls`/`.xlsx`) desse relatório antes de atualizar esta tela** — não existe outro jeito
  de saber quais materiais estão na campanha no momento.
- Formato do export: pode vir como HTML disfarçado de `.xls` (usar `pd.read_html`) ou como
  `.xlsx` de verdade (usar `pd.read_excel`, cabeçalho na linha com "Situation/Seller/...",
  fazer *forward-fill* de `Situation`/`Seller`, excluir linhas de Subtotal). Teste os dois
  formatos.
- **Colunas da tabela = valores originais de `Situation`, sem traduzir ou renomear:**
  `Available`, `Accepted`, `Approval`, `Sold` (mais colunas se aparecerem novos valores no
  export — conferir sempre). **Não existe "Billed" nessa campanha ainda** — `Sold` é a
  etapa mais avançada, mas é anterior ao faturamento de verdade. Nunca rotular nada aqui
  como "Faturado".
- Status por vendedor (3 categorias, unificadas): `Sem resultado` (total=0 OU todos os
  materiais ainda em `Available` — nenhum saiu do lugar) / `Em andamento` (tem `Accepted`
  ou `Approval`, mas nenhum `Sold`) / `Com resultado` (`Sold`>0)
- Ranking: Sold desc → Approval desc → Accepted desc
- **Não exibir nenhum valor monetário nesta tela** — nem cards, nem colunas, nem tabela.
  Só quantidades.
- LEFT JOIN obrigatório: os 15 vendedores oficiais sempre aparecem, mesmo com tudo zerado

## 3. Depois de atualizar os dados

1. **Sempre pegue a hora real** via `date -u` no bash (não invente um horário) e converta
   para `America/Sao_Paulo` (UTC-3) antes de gravar em `meta.generatedAt`
2. Reconstrua `gestao-vista-comercial-app.html` (artifact único, fotos em base64)
3. Tire ao menos 3 screenshots de telas diferentes pra validar visualmente antes de entregar
4. Rode as verificações da Fase 11 (somas batendo, sem overflow, sem dado sensível exposto)
5. Empacote o `.zip` da versão multi-arquivo também
6. Aponte qualquer achado estranho (ex.: vendedor com número muito fora do padrão) antes
   de eu perguntar — não deixe pra eu descobrir sozinha depois

## 4. Se algo não bater

Não ajuste silenciosamente. Me avise o número exato que você calculou, a fórmula usada, e
pergunte se está certo — como fizemos com o Taj Mahal e o Meta x Realizado.
