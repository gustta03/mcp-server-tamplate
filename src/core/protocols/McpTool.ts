import { z } from "zod";

export type McpInputSchema = Record<string, z.ZodTypeAny>;

export interface McpTool<TInput extends Record<string, unknown> = Record<string, unknown>> {
  name: string;
  description: string;
  inputSchema: McpInputSchema;
  execute(input: TInput): Promise<string>;
}
