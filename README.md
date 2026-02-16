# Delivery API

API REST para gerenciar pedidos de delivery. Cadastra, lista, edita e atualiza o status dos pedidos. Inclui interface web para visualização.

---

## O que precisa ter instalado

- Node.js 18+
- npm
- Docker (só se quiser rodar em container)

---

## Como rodar

### Opção 1: direto no Node

```bash
npm install
npm start
```

Pronto. A API e a tela ficam em **http://localhost:3000**

### Opção 2: Com Docker

```bash
# Criar a imagem
docker build -t delivery-api .

# Rodar (PowerShell)
docker run -p 3000:3000 -v ${PWD}/pedidos.json:/app/pedidos.json delivery-api
```

**Caso a porta esteja sendo usada** Use outra no host: `-p 3001:3000` e acesse em http://localhost:3001



## Endpoints

| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/pedidos` | Lista todos os pedidos (pode filtrar por status e loja) |
| GET | `/api/pedidos/:id` | Pega um pedido pelo id |
| POST | `/api/pedidos` | Cria um pedido novo |
| PUT | `/api/pedidos/:id` | Atualiza os dados do pedido |
| PATCH | `/api/pedidos/:id/status` | Só muda o status (ex: `{"status":"CONFIRMED"}`) |
| DELETE | `/api/pedidos/:id` | Apaga o pedido |



## Fluxo de status

- **RECEIVED** - pode ir para CONFIRMED ou CANCELED
- **CONFIRMED** - pode ir para DISPATCHED ou CANCELED
- **DISPATCHED** - pode ir para DELIVERED ou CANCELED
- **DELIVERED** e **CANCELED** - estados finais (não mudam mais)

---

## Estrutura do projeto


- **Rotas** -> **Services** -> **Repository** -> `pedidos.json`
- Express + Repositório JSON


---

## Testes e qualidade de código

```bash
# Rodar os testes
npm test

# Rodar o lint
npm run lint

# Formatar o código
npm run format
```

- **Jest** para testes unitários (state machine, validators, service)
- **ESLint** para manter padrão no código
- **Prettier** para formatação automática

---

## Hipóteses assumidas

- Todo pedido novo começa no status `RECEIVED`, sem exceção.
- O `order_id` é o identificador único do pedido. Pode ser enviado no POST ou gerado automaticamente.
- DELETE apaga o pedido de verdade (exclusão física). Não tem soft delete.
- Os dados ficam salvos no arquivo `pedidos.json` (sem banco de dados).
- GET `/api/pedidos` aceita filtros opcionais por `status` e `store_id` via query string.
- A estrutura dos pedidos segue o mesmo formato do `pedidos.json` entregue no desafio.

---

## Backlog de Desenvolvimento

01. Setup do Projeto: Inicializar Node.js. O comando 'npm install' deve baixar as dependências e o 'npm start' deve subir a API na porta configurada sem erros.

02. Repositório JSON: Criar a camada de repositório para ler e gravar no arquivo pedidos.json. Regra: Garantir que o arquivo nunca seja sobrescrito como vazio.

03. State Machine: 
Implementação da lógica de transição dos pedidos:

RECEIVED > CONFIRMED ou CANCELED

CONFIRMED > DISPATCHED ou CANCELED

DISPATCHED > DELIVERED ou CANCELED

Estados finais: DELIVERED e CANCELED.

04. API REST (CRUD): Desenvolver os endpoints básicos (GET, POST, PUT, DELETE) com retornos em JSON e status codes adequados (200, 201, 204, 404).

05. Atualização de Status: Criar o endpoint PATCH. Deve retornar 200 com o pedido atualizado ou 400/404 em caso de transição proibida ou ID inexistente.

06. Frontend: Página simples para listagem dos pedidos com funcionalidade de filtro.

07. Dockerização: Criar o Dockerfile. A imagem deliveryapi deve rodar com volume apontando para o pedidos.json para manter a persistência.
