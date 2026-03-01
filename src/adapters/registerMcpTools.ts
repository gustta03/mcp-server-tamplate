import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { McpTool } from "../core/protocols/McpTool.js";

export function registerMcpTools(server: McpServer, tools: McpTool[]): void {
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (input) => ({
        content: [
          {
            type: "text",
            text: await tool.execute(input as Record<string, unknown>),
          },
        ],
      }),
    );
  }
}
