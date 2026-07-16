import { defineTool } from "@lovable.dev/mcp-js";

const LOTTERIES = [
  { id: "megasena", name: "Mega-Sena" },
  { id: "lotofacil", name: "Lotofácil" },
  { id: "quina", name: "Quina" },
  { id: "lotomania", name: "Lotomania" },
  { id: "duplasena", name: "Dupla Sena" },
  { id: "diadesorte", name: "Dia de Sorte" },
  { id: "supersete", name: "Super Sete" },
  { id: "maismilionaria", name: "+Milionária" },
  { id: "timemania", name: "Timemania" },
  { id: "federal", name: "Federal" },
  { id: "loteca", name: "Loteca" },
];

export default defineTool({
  name: "list_lotteries",
  title: "List lotteries",
  description:
    "List all Caixa lottery modalities supported by this app, with their machine id and display name.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(LOTTERIES, null, 2) }],
    structuredContent: { lotteries: LOTTERIES },
  }),
});