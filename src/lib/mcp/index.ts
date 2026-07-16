import { defineMcp } from "@lovable.dev/mcp-js";
import listLotteriesTool from "./tools/list-lotteries";
import getLotteryResultTool from "./tools/get-lottery-result";
import getLotteryHistoryTool from "./tools/get-lottery-history";

export default defineMcp({
  name: "lottos-mcp",
  title: "Lottos MCP",
  version: "0.1.0",
  instructions:
    "Public read-only tools for Caixa Econômica Federal lottery results as aggregated by the Lottos app. Use `list_lotteries` to discover valid lottery ids, `get_lottery_result` for the latest or a specific draw, and `get_lottery_history` for a batch of recent draws. This app is NOT officially affiliated with Caixa Econômica Federal.",
  tools: [listLotteriesTool, getLotteryResultTool, getLotteryHistoryTool],
});