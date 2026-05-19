# CNAE Radar - Operação e ETL

Este documento descreve como operar o subsistema de inteligência de leads por CNAE do MicroCaaS.

## Arquitetura de Dados
O sistema utiliza a Base de Dados Abertos do CNPJ da Receita Federal como fonte primária.

**Tabelas (Firestore):**
- `establishments`: Dados dos estabelecimentos (CNPJ, CNAE, Data Início, UF, Município).
- `companies`: Dados básicos das empresas (Razão Social, Natureza Jurídica, Capital).
- `cnae_lookup`: Tabela de referência para descrições de CNAE.

## Como rodar a ingestão (ETL)

O job de ingestão está localizado em `src/scripts/cnae_etl.ts`. Ele realiza o download automático dos ZIPs, extração e carregamento incremental.

### Pré-requisitos
- Node.js 18+
- Variáveis de ambiente configuradas no `.env`:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`

### Execução
Para rodar a carga completa:
```bash
npx tsx src/scripts/cnae_etl.ts --full
```

Para rodar apenas atualização incremental:
```bash
npx tsx src/scripts/cnae_etl.ts --incremental
```

## Paywall e Pagamentos
- **Checkout Único:** O produto utiliza o modelo `one_time` (pagamento único de R$ 9,90).
- **Liberação:** Após o sucesso no Stripe/Mercado Pago, uma entrada é criada na coleção `purchases` vinculando o `userId` ao produto `cnae-radar`.
- **Filtros:** No frontend, o paywall bloqueia registros além dos 5 primeiros enquanto não houver confirmação de compra ativa.

## Exportação para Excel
A exportação utiliza a biblioteca `xlsx`. O endpoint `GET /api/cnae-radar/export` valida o status da compra antes de gerar o buffer do arquivo.
