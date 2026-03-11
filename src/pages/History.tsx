import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { LotteryBall } from "@/components/LotteryBall";
import { LotteryDetailModal } from "@/components/LotteryDetailModal";
import { getLotteryHistory } from "@/data/historicalData";
import { LotteryResult } from "@/data/lotteryData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse, isValid, isAfter, isBefore, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, CalendarIcon, Filter, X, History as HistoryIcon, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 15;

const lotteryOptions = [
  { value: "all", label: "Todas as Loterias" },
  { value: "megasena", label: "Mega-Sena" },
  { value: "lotofacil", label: "Lotofácil" },
  { value: "quina", label: "Quina" },
  { value: "lotomania", label: "Lotomania" },
  { value: "duplasena", label: "Dupla Sena" },
];

const variantMap: Record<string, "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena"> = {
  "lottery-megasena": "megasena",
  "lottery-lotofacil": "lotofacil",
  "lottery-quina": "quina",
  "lottery-lotomania": "lotomania",
  "lottery-duplasena": "duplasena",
};

const History = () => {
  const [selectedLottery, setSelectedLottery] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState<LotteryResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const allResults = useMemo(() => getLotteryHistory(selectedLottery), [selectedLottery]);

  const filteredResults = useMemo(() => {
    let results = allResults;

    // Filter by search query (concurso number)
    if (searchQuery.trim()) {
      results = results.filter(
        (r) =>
          r.concurso.toString().includes(searchQuery) ||
          r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate || endDate) {
      results = results.filter((r) => {
        const resultDate = parse(r.date, "dd/MM/yyyy", new Date());
        if (!isValid(resultDate)) return true;

        if (startDate && endDate) {
          return (
            (isAfter(resultDate, startDate) || isEqual(resultDate, startDate)) &&
            (isBefore(resultDate, endDate) || isEqual(resultDate, endDate))
          );
        }
        if (startDate) {
          return isAfter(resultDate, startDate) || isEqual(resultDate, startDate);
        }
        if (endDate) {
          return isBefore(resultDate, endDate) || isEqual(resultDate, endDate);
        }
        return true;
      });
    }

    return results;
  }, [allResults, searchQuery, startDate, endDate]);

  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || startDate || endDate;

  const handleRowClick = (result: LotteryResult) => {
    setSelectedResult(result);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <section className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <HistoryIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">
              <span className="text-foreground">Histórico de </span>
              <span className="text-gradient">Resultados</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Consulte todos os resultados anteriores com filtros avançados
          </p>
        </section>

        {/* Filters */}
        <section className="mb-6 p-4 rounded-xl bg-card border border-border animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Filtros</h2>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Lottery Select */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Loteria</label>
              <Select value={selectedLottery} onValueChange={(v) => { setSelectedLottery(v); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a loteria" />
                </SelectTrigger>
                <SelectContent>
                  {lotteryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nº do concurso ou nome"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Data inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => { setStartDate(d); setCurrentPage(1); }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Data final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(d) => { setEndDate(d); setCurrentPage(1); }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </section>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Exibindo <span className="font-semibold text-foreground">{paginatedResults.length}</span> de{" "}
            <span className="font-semibold text-foreground">{filteredResults.length}</span> resultados
          </p>
        </div>

        {/* Results - Cards on mobile, Table on desktop */}
        {paginatedResults.length === 0 ? (
          <section className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground animate-fade-in">
            Nenhum resultado encontrado para os filtros selecionados.
          </section>
        ) : (
          <>
            {/* Mobile Cards */}
            <section className="md:hidden space-y-3 animate-fade-in">
              {paginatedResults.map((result, idx) => (
                <div
                  key={`${result.id}-${result.concurso}`}
                  className="p-3 rounded-xl bg-card border border-border cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => handleRowClick(result)}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[11px] font-medium",
                        result.id === "megasena" && "bg-lottery-megasena/20 text-lottery-megasena",
                        result.id === "lotofacil" && "bg-lottery-lotofacil/20 text-lottery-lotofacil",
                        result.id === "quina" && "bg-lottery-quina/20 text-lottery-quina",
                        result.id === "lotomania" && "bg-lottery-lotomania/20 text-lottery-lotomania",
                        result.id === "duplasena" && "bg-lottery-duplasena/20 text-lottery-duplasena"
                      )}
                    >
                      {result.name}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground">#{result.concurso}</span>
                      <span>•</span>
                      <span>{result.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {result.numbers.slice(0, result.numbers.length > 10 ? 8 : 6).map((num) => (
                      <LotteryBall
                        key={num}
                        number={num}
                        size="xs"
                        variant={variantMap[result.color]}
                      />
                    ))}
                    {result.numbers.length > (result.numbers.length > 10 ? 8 : 6) && (
                      <span className="text-[10px] text-muted-foreground flex items-center">
                        +{result.numbers.length - (result.numbers.length > 10 ? 8 : 6)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary truncate mr-2">{result.prize}</span>
                    <span className="text-[11px]">
                      {result.winners > 0 ? (
                        <span className="text-primary font-semibold flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> {result.winners}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Acumulou</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </section>

            {/* Desktop Table */}
            <section className="hidden md:block rounded-xl border border-border overflow-hidden bg-card animate-fade-in">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="font-semibold">Loteria</TableHead>
                    <TableHead className="font-semibold">Concurso</TableHead>
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Números Sorteados</TableHead>
                    <TableHead className="font-semibold text-right">Prêmio</TableHead>
                    <TableHead className="font-semibold text-center">
                      <Trophy className="w-4 h-4 inline" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResults.map((result, idx) => (
                    <TableRow
                      key={`${result.id}-${result.concurso}`}
                      className="cursor-pointer transition-colors hover:bg-secondary/30"
                      onClick={() => handleRowClick(result)}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium",
                            result.id === "megasena" && "bg-lottery-megasena/20 text-lottery-megasena",
                            result.id === "lotofacil" && "bg-lottery-lotofacil/20 text-lottery-lotofacil",
                            result.id === "quina" && "bg-lottery-quina/20 text-lottery-quina",
                            result.id === "lotomania" && "bg-lottery-lotomania/20 text-lottery-lotomania",
                            result.id === "duplasena" && "bg-lottery-duplasena/20 text-lottery-duplasena"
                          )}
                        >
                          {result.name}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        #{result.concurso}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{result.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {result.numbers.slice(0, result.numbers.length > 10 ? 8 : 6).map((num) => (
                            <LotteryBall
                              key={num}
                              number={num}
                              size="xs"
                              variant={variantMap[result.color]}
                            />
                          ))}
                          {result.numbers.length > (result.numbers.length > 10 ? 8 : 6) && (
                            <span className="text-xs text-muted-foreground flex items-center">
                              +{result.numbers.length - (result.numbers.length > 10 ? 8 : 6)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {result.prize}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.winners > 0 ? (
                          <span className="text-primary font-semibold">{result.winners}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </section>
        )}
      </main>

      <LotteryDetailModal
        lottery={selectedResult}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default History;
