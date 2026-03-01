# MCP Server Template

Template TypeScript para criacao de servidores MCP (Model Context Protocol) usando o SDK oficial `@modelcontextprotocol/sdk`.

Copie este repositorio como ponto de partida para qualquer novo servidor MCP. A estrutura ja esta pronta com contrato de tool, adaptador de registro e uma tool de exemplo.

---

## Estrutura

```text
.
├── src/
│   ├── core/
│   │   └── protocols/
│   │       └── McpTool.ts       # Interface base para todas as tools
│   ├── adapters/
│   │   └── registerMcpTools.ts  # Registra tools no McpServer
│   ├── tools/
│   │   └── HealthTool.ts        # Tool de exemplo (health check)
│   └── main.ts                  # Bootstrap do servidor (stdio)
├── claude_desktop_config.example.json
├── package.json
└── tsconfig.json
```

---

## Decisoes de arquitetura

### `core/protocols/McpTool.ts`

Contrato que toda tool deve implementar. Desacopla as tools do SDK, tornando cada uma independente e testavel.

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

### `adapters/registerMcpTools.ts`

Unico ponto que conhece o `McpServer`. Itera sobre as tools e faz o bind via `server.registerTool`, mantendo o resto do codigo desacoplado do SDK.

### `tools/`

Cada tool e uma classe que implementa `McpTool`. O `inputSchema` usa tipos Zod para que o SDK valide e documente os parametros automaticamente.

### `main.ts`

Bootstrap do processo. Instancia o servidor, registra as tools e conecta o transporte `stdio`.

> Regra importante: nunca use `console.log` — o canal `stdout` e reservado para o protocolo MCP. Use sempre `console.error` para logs.

---

## Rodando localmente

```bash
npm install
npm run dev
```

---

## Scripts

| Comando             | Descricao                                 |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Modo desenvolvimento com hot reload (tsx) |
| `npm run build`     | Compila TypeScript para `build/`          |
| `npm run start`     | Executa o servidor compilado              |
| `npm run typecheck` | Valida tipos sem emitir arquivos          |

---

## Como usar este template

### 1. Copie o repositorio

```bash
cp -r mcp-server-template ../meu-novo-mcp
cd ../meu-novo-mcp
npm install
```

### 2. Compile e execute

```bash
npm run build
node build/main.js
```

### 3. Configure o cliente MCP

Use `claude_desktop_config.example.json` como base:

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

### 1. Crie a classe da tool em `src/tools/`

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

### 2. Registre em `src/main.ts`

```ts
import { MinhaFerramenta } from "./tools/MinhaFerramenta.js";

registerMcpTools(server, [new HealthTool(), new MinhaFerramenta()]);
```

---

## Dependencias

| Pacote                      | Finalidade                                 |
| --------------------------- | ------------------------------------------ |
| `@modelcontextprotocol/sdk` | SDK oficial para criacao de servidores MCP |
| `zod`                       | Validacao e tipagem dos inputs das tools   |
| `tsx`                       | Execucao de TypeScript sem build (dev)     |
| `typescript`                | Compilador TypeScript                      |
