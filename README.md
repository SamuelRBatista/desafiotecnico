# Integração de Pedidos e Documentos

API REST em NestJS para receber pedidos, documentos e eventos de chegada de
exames, relacionando os registros pelo código do pedido e pelo `AccessionNumber`.

## Executar com Docker

Docker Compose inicia a API e o PostgreSQL, aguarda o banco ficar saudável,
sincroniza o schema do Prisma e inicia o servidor:

```bash
docker compose up --build
```

- API: http://localhost:3000
- Saúde: http://localhost:3000/health
- Swagger: http://localhost:3000/api
- PostgreSQL: `localhost:5432`

Os dados do banco ficam no volume `postgres_data`. Para parar os serviços sem
apagar os dados:

```bash
docker compose down
```

As credenciais padrão são para desenvolvimento local. Podem ser alteradas com
as variáveis `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`POSTGRES_PORT` e `API_PORT` em um arquivo `.env`.

## Endpoints

Os nomes dos campos dos corpos das requisições seguem os exemplos do desafio.
Códigos numéricos são normalizados para texto na API e a data de nascimento
aceita o formato `AAAAMMDD`.

### `POST /pedidos`

```json
{
  "CodigoPedido": 616,
  "NomePaciente": "ALEFHER MONTONI DE ALMEIDA",
  "DataNascimento": "19970601",
  "Sexo": "M",
  "CodUnidade": 104,
  "Exames": [
    {
      "CodigoItemPedido": 930,
      "AccessionNumber": "930",
      "Modalidade": "CR",
      "NomeProcedimento": "RX ANTEBRACO ESQUERDO"
    }
  ]
}
```

Pedidos existentes são atualizados e apenas exames com novo
`CodigoItemPedido` são adicionados. O pedido fica integrado quando pelo menos
um de seus exames já foi recebido em `POST /exames`. `Status` do exame do pedido
é opcional e assume `NOVO` quando omitido.

### `GET /pedidos/:codigoPedido`

Consulta um pedido pelo código. `GET /pedidos` continua disponível para listar
pedidos; também aceita `?orderCode=` para manter compatibilidade.

### `POST /documentos`

```json
{
  "CodigoDocumento": 251,
  "CodigoPedido": 615,
  "NomeDocumento": "PEDIDO",
  "Documento": "base64"
}
```

O documento é único pela combinação `CodigoDocumento` e `CodigoPedido`.
Documentos de pedidos ainda não integrados ficam pendentes. Se o exame
correspondente já chegou, são vinculados aos exames recebidos daquele pedido.
Uma duplicidade retorna HTTP 409.

### `GET /documentos/:codigoPedido`

Consulta os documentos vinculados ao pedido. `GET /documentos` também lista
documentos e aceita `?orderCode=` para manter compatibilidade.

### `POST /exames`

```json
{
  "AccessionNumber": "930",
  "NomePaciente": "ALEFHER MONTONI DE ALMEIDA",
  "Modalidade": "CR",
  "Status": "NOVO"
}
```

Ao chegar um exame, o pedido correspondente é integrado e os documentos
pendentes são vinculados somente ao(s) exame(s) com o mesmo `AccessionNumber`.

### `GET /exames/:accessionNumber`

Consulta o exame recebido; se ainda não houve chegada, retorna o exame
cadastrado no pedido. Retorna HTTP 404 quando o código não existe.

## Decisões e limites

- PostgreSQL persiste pedidos, exames, documentos e chegadas; o Prisma define
  as chaves únicas e relacionamentos.
- A API persiste o conteúdo do documento como a string recebida. Não decodifica
  Base64 nem armazena anexos fora do banco, conforme o escopo do desafio.
- A chegada é associada ao pedido pelo `AccessionNumber`; não há parsing real de
  DICOM ou integração externa.
- O corpo das requisições usa os nomes do documento técnico; as respostas
  retornam os campos da API em camelCase.

## Testes

Os testes automatizados usam Jest:

```bash
npm install
npm test
npm run test:e2e
```

Os testes unitários cobrem os contratos de entrada e os cenários mínimos de
integração, incluindo chegada antes do pedido, chegada depois do documento,
adição de exames sem duplicação e rejeição de documentos duplicados. Os testes
end-to-end existentes verificam os endpoints de saúde e podem ser executados
com o ambiente Docker ativo.
