# Repositorio de Templates MCP

Repositorio centralizado de templates reutilizaveis para criacao de servidores compatíveis com o protocolo MCP (Model Context Protocol), utilizando TypeScript e o SDK oficial `@modelcontextprotocol/sdk`.

O objetivo do repositório e fornecer uma base estruturada, tipada e pronta para extensao que qualquer projeto possa copiar e adaptar sem precisar configurar o servidor do zero.

---

## Estrutura do repositório

```text
mesh/
├── templates/
│   └── mcp-server-template/     # Template principal do servidor MCP
│       ├── src/
│       │   ├── core/
│       │   │   └── protocols/
│       │   │       └── McpTool.ts       # Interface base para todas as tools
│       │   ├── adapters/
│       │   │   └── registerMcpTools.ts  # Adaptador que registra tools no McpServer
│       │   ├── tools/
│       │   │   └── HealthTool.ts        # Tool de exemplo (health check)
│       │   └── main.ts                  # Bootstrap do servidor (stdio)
│       ├── claude_desktop_config.example.json
│       ├── package.json
│       └── tsconfig.json
├── package.json
└── tsconfig.json
```

---

## Decisoes de arquitetura

### Camada `core/protocols`

Define o contrato `McpTool`, a interface que toda tool concreta deve implementar. Isso desacopla o registro das tools do SDK e permite que novas tools sejam adicionadas sem tocar em infraestrutura.

```ts
export interface McpTool<
  TInput extends Record<string, unknown> = Record<string, unknown>,
> {
  name: string;
  description: string;
  inputSchema: McpInputSchema; // Record<string, z.ZodTypeAny>
  execute(input: TInput): Promise<string>;
}
```

### Camada `adapters`

O `registerMcpTools` e o unico ponto que conhece o `McpServer` do SDK. Ele itera sobre a lista de tools e faz o bind de cada uma via `server.registerTool`, mantendo o resto do código desacoplado do SDK.

### Camada `tools`

Cada tool e uma classe que implementa `McpTool`. O `inputSchema` e definido com tipos Zod para que o SDK possa validar e documentar os parametros automaticamente.

### `main.ts`

Ponto de entrada do processo. Instancia o servidor, registra as tools e conecta o transporte `stdio`. Usa `console.error` para todos os logs — nunca `console.log` — pois o canal `stdout` e reservado para a comunicacao MCP.

---

## Rodando localmente

```bash
npm install
npm run dev
```

O comando executa o projeto em modo watch a partir de `templates/mcp-server-template`.

---

## Scripts disponíveis

| Comando               | Descricao                                                |
| --------------------- | -------------------------------------------------------- |
| `npm run dev`       | Inicia o template em modo desenvolvimento com hot reload |
| `npm run build`     | Compila o TypeScript para `build/`                     |
| `npm run start`     | Executa o servidor compilado via `node build/main.js`  |
| `npm run typecheck` | Valida os tipos sem emitir arquivos                      |

---

## Como criar um novo servidor MCP a partir do template

### 1. Copie o template

```bash
cp -r templates/mcp-server-template ../meu-novo-mcp
cd ../meu-novo-mcp
npm install
```

### 2. Compile e execute

```bash
npm run build
node build/main.js
```

### 3. Configure o cliente MCP

Use o arquivo `claude_desktop_config.example.json` como base. Abra o arquivo de configuracao do Claude Desktop e adicione a entrada correspondente ao seu servidor:

```json
{
  "mcpServers": {
    "meu-novo-mcp": {
      "command": "node",
      "args": ["/caminho/absoluto/para/meu-novo-mcp/build/main.js"]
    }
  }
}
```

---

## Como adicionar uma nova tool

### 1. Crie a classe da tool

Crie um arquivo em `src/tools/` implementando a interface `McpTool`:

```ts
// src/tools/MinhaFerramenta.ts
import { z } from "zod";
import { McpTool } from "../core/protocols/McpTool.js";

export class MinhaFerramenta implements McpTool<{ mensagem: string }> {
  name = "minha_ferramenta";
  description = "Descricao do que esta tool faz.";

  inputSchema = {
    mensagem: z.string().describe("Texto de entrada"),
  };

  async execute(input: { mensagem: string }): Promise<string> {
    return JSON.stringify({ resultado: input.mensagem.toUpperCase() });
  }
}
```

### 2. Registre a tool no bootstrap

Em `src/main.ts`, adicione a instancia à lista passada para `registerMcpTools`:

```ts
import { MinhaFerramenta } from "./tools/MinhaFerramenta.js";

registerMcpTools(server, [new HealthTool(), new MinhaFerramenta()]);
```

---

## Regra importante sobre logs

Em servidores MCP que usam transporte `stdio`, o canal `stdout` e utilizado exclusivamente para a troca de mensagens do protocolo. Por isso, **nunca use `console.log`** dentro do servidor. Use apenas `console.error` para emitir logs de depuracao ou informacoes de status.

---

## Dependencias

| Pacote                        | Finalidade                                      |
| ----------------------------- | ----------------------------------------------- |
| `@modelcontextprotocol/sdk` | SDK oficial para criacao de servidores MCP      |
| `zod`                       | Validacao e tipagem dos inputs das tools        |
| `tsx`                       | Execucao de TypeScript sem etapa de build (dev) |
| `typescript`                | Compilador TypeScript                           |
