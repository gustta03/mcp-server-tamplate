import { McpTool } from "../core/protocols/McpTool.js";

export class HealthTool implements McpTool {
  name = "health";

  description = "Retorna o status do servidor MCP.";

  inputSchema = {};

  async execute(): Promise<string> {
    return JSON.stringify({ status: "ok", timestamp: new Date().toISOString() });
  }
}
