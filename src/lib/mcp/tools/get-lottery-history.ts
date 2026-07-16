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
  name: "get_lottery_history",
  title: "Get lottery history",
  description:
    "Fetch a batch of recent official draws for a Caixa lottery (most recent first). Useful for statistics, hot/cold analysis and frequency computations.",
  inputSchema: {
    lottery: z.enum(LOTTERY_IDS).describe("Lottery id."),
    count: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("How many recent draws to return. Server caps this at 200; defaults to 100."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ lottery, count }) => {
    const url = new URL(FN_URL);
    url.searchParams.set("lottery", lottery);
    url.searchParams.set("mode", "history");
    if (count) url.searchParams.set("count", String(count));

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return {
        content: [
          { type: "text", text: `Failed to fetch history (HTTP ${res.status}).` },
        ],
        isError: true,
      };
    }
    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    return {
      content: [
        {
          type: "text",
          text: `Returned ${results.length} draws for ${lottery}.`,
        },
      ],
      structuredContent: { results },
    };
  },
});