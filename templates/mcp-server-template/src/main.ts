import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerMcpTools } from "./adapters/registerMcpTools.js";
import { HealthTool } from "./tools/HealthTool.js";

async function bootstrap(): Promise<void> {
  const server = new McpServer({
    name: "mcp-server-template",
    version: "1.0.0",
  });

  registerMcpTools(server, [new HealthTool()]);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("MCP template rodando em stdio.");
}

bootstrap().catch((error) => {
  console.error("Falha ao iniciar template MCP:", error);
  process.exit(1);
});
