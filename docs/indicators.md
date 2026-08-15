# Documento Funcional Definitivo — BI Projeção TV → Site Externo
Data: 30/07/2026
Status geral: FASE 6 concluída, indicadores pendentes de homologação com dados reais (FASE 9)

(Conteúdo completo conforme registrado na conversa: V1, V2, V3, V4, V5, R1, R2/TAJ, FUNIL)
Decisões formalizadas nesta sessão:
- SingleBundle__c é o campo oficial (não Single_Bundle__c)
- V5 usa Fatura__c.ValorPagto__c + DataPagamento__c (mês atual) + filtros: OrgVendas__c = 'OVME - Mercado Externo', Cliente__c not in ('10006066','10000224'), DocCompensacao__c not like '%8800%', Usuario_Dono_da_Conta__c = true, Empresa__c not in ('1080'/'Zucchi CA CSG', '2010'/'Zucchi Land') — validado exato contra US$ 7.693.080,50 em jul/2026
- Containers exibe apenas quantidade (sem conta, pedido, valor)
- Funil exibe quantidade de cards por vendedor×etapa + percentuais de valor (sem valor absoluto)
- REGRA DE EXCLUSÃO (Owner/CreatedBy não-vendedor) — validada por Fernanda em 31/07/2026:
  excluir sempre destes indicadores por vendedor: Alyne Lamy, IT Integration, SF Integration,
  Leonardo Pellegrino, Leonardo Tatagiba, Fernanda Moreira de Jesus. Não são vendedores reais.
  Aplica-se a: Funil (Playbook__c.OwnerId), e por padrão a qualquer outro indicador que agrupe
  por Owner/CreatedBy de um objeto operado por vendedores.
- DOUGLAS MOTA: removido de todas as telas em 05/08/2026 — não é mais funcionário da Zucchi.
  Se reaparecer em consultas futuras (ex.: registros históricos com meta antiga), excluir.
- ANA AMADO: adicionada como vendedora oficial em 05/08/2026 — meta cadastrada a partir de
  agosto/2026. Deixou de ser tratada como usuária técnica.
