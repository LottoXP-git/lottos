import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { LotecaUpcomingMatches, LOTECA_1257 } from "./LotecaUpcomingMatches";
import { useLotecaProgramming, resetLotecaBreaker } from "@/hooks/useLotecaProgramming";
import { Button } from "@/components/ui/button";

export function LotecaUpcomingMatchesLive() {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } =
    useLotecaProgramming(LOTECA_1257);
  const programming = data ?? LOTECA_1257;

  const handleRefresh = () => {
    resetLotecaBreaker();
    refetch();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground px-1">
        <span className="flex items-center gap-1">
          {isLoading || isFetching ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> Sincronizando com a Caixa…
            </>
          ) : isError ? (
            <>
              <AlertCircle className="w-3 h-3 text-amber-500" /> Exibindo dados em cache
            </>
          ) : (
            <>Atualizado automaticamente</>
          )}
        </span>
        <div className="flex items-center gap-2">
          {dataUpdatedAt > 0 && !isLoading && (
            <span>
              {new Date(dataUpdatedAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Atualizar programação"
            onClick={handleRefresh}
            disabled={isFetching}
            className="h-6 w-6"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      <LotecaUpcomingMatches {...programming} />
    </div>
  );
}