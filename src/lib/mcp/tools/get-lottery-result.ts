import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const LOTTERY_IDS = [
  "megasena",
  "lotofacil",
  "quina",
  "lotomania",
  "duplasena",
  "diadesorte",
  "supersete",
  "maismilionaria",
  "timemania",
  "federal",
  "loteca",
] as const;

const PROJECT_REF = "hpfwrxcfncielvbjmeiv";
const FN_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/fetch-lottery-results`;

export default defineTool({
  name: "get_lottery_result",
  title: "Get lottery result",
  description:
    "Fetch the latest official result for a Caixa lottery, or a specific past draw when `concurso` is provided. Returns numbers drawn, prizes, winners, next draw date and estimated prize.",
  inputSchema: {
    lottery: z
      .enum(LOTTERY_IDS)
      .describe("Lottery id (use list_lotteries to discover valid ids)."),
    concurso: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Optional draw number. Omit to get the latest draw."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ lottery, concurso }) => {
    const url = new URL(FN_URL);
    url.searchParams.set("lottery", lottery);
    if (concurso) url.searchParams.set("concurso", String(concurso));

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch result (HTTP ${res.status}).`,
          },
        ],
        isError: true,
      };
    }
    const data = await res.json();
    if (!data?.result) {
      return {
        content: [{ type: "text", text: "No result found." }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data.result, null, 2) }],
      structuredContent: { result: data.result },
    };
  },
});