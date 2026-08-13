import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MEGA_SENA_PRICES,
  LOTOFACIL_PRICES,
  QUINA_PRICES,
  DUPLA_SENA_PRICES,
  DIA_DE_SORTE_PRICES,
  SUPER_SETE_PRICES,
  LOTECA_PRICES,
  MILIONARIA_PRICES,
  SINGLE_BETS,
  MODALITY_LABELS,
  type ModalityKey,
  type SimplePrice,
} from "@/lib/betPrices";

const SIMPLE_TABLES: Partial<Record<ModalityKey, { numbersLabel: string; data: SimplePrice[] }>> = {
  megasena: { numbersLabel: "Quant. de números", data: MEGA_SENA_PRICES },
  lotofacil: { numbersLabel: "Quant. de números", data: LOTOFACIL_PRICES },
  quina: { numbersLabel: "Quant. de números", data: QUINA_PRICES },
  duplasena: { numbersLabel: "Quant. de números", data: DUPLA_SENA_PRICES },
  diadesorte: { numbersLabel: "Quant. de números", data: DIA_DE_SORTE_PRICES },
  supersete: { numbersLabel: "Quant. de colunas", data: SUPER_SETE_PRICES },
};

const modalityColorMap: Record<
  ModalityKey,
  { border: string; iconBg: string; iconBorder: string; text: string; ring: string; badgeBorder: string }
> = {
  megasena: {
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
    text: "text-emerald-500",
    ring: "focus:ring-emerald-500/20",
    badgeBorder: "border-emerald-500/30",
  },
  lotofacil: {
    border: "border-purple-500/30",
    iconBg: "bg-purple-500/10",
    iconBorder: "border-purple-500/20",
    text: "text-purple-500",
    ring: "focus:ring-purple-500/20",
    badgeBorder: "border-purple-500/30",
  },
  quina: {
    border: "border-blue-500/30",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/20",
    text: "text-blue-500",
    ring: "focus:ring-blue-500/20",
    badgeBorder: "border-blue-500/30",
  },
  lotomania: {
    border: "border-orange-500/30",
    iconBg: "bg-orange-500/10",
    iconBorder: "border-orange-500/20",
    text: "text-orange-500",
    ring: "focus:ring-orange-500/20",
    badgeBorder: "border-orange-500/30",
  },
  timemania: {
    border: "border-green-500/30",
    iconBg: "bg-green-500/10",
    iconBorder: "border-green-500/20",
    text: "text-green-500",
    ring: "focus:ring-green-500/20",
    badgeBorder: "border-green-500/30",
  },
  duplasena: {
    border: "border-rose-500/30",
    iconBg: "bg-rose-500/10",
    iconBorder: "border-rose-500/20",
    text: "text-rose-500",
    ring: "focus:ring-rose-500/20",
    badgeBorder: "border-rose-500/30",
  },
  diadesorte: {
    border: "border-amber-500/30",
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/20",
    text: "text-amber-500",
    ring: "focus:ring-amber-500/20",
    badgeBorder: "border-amber-500/30",
  },
  supersete: {
    border: "border-lime-500/30",
    iconBg: "bg-lime-500/10",
    iconBorder: "border-lime-500/20",
    text: "text-lime-500",
    ring: "focus:ring-lime-500/20",
    badgeBorder: "border-lime-500/30",
  },
  milionaria: {
    border: "border-indigo-500/30",
    iconBg: "bg-indigo-500/10",
    iconBorder: "border-indigo-500/20",
    text: "text-indigo-500",
    ring: "focus:ring-indigo-500/20",
    badgeBorder: "border-indigo-500/30",
  },
  loteca: {
    border: "border-red-500/30",
    iconBg: "bg-red-500/10",
    iconBorder: "border-red-500/20",
    text: "text-red-500",
    ring: "focus:ring-red-500/20",
    badgeBorder: "border-red-500/30",
  },
};

export function BetPricesCard() {
  const [modality, setModality] = useState<ModalityKey>("megasena");
  const colors = modalityColorMap[modality];

  const renderTable = () => {
    if (SINGLE_BETS[modality]) {
      const bet = SINGLE_BETS[modality]!;
      return (
        <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-6 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">Aposta única</p>
          <p className="text-sm sm:text-base font-medium mb-3">{bet.description}</p>
          <p className={cn("text-2xl sm:text-3xl font-bold", colors.text)}>R$ {bet.price}</p>
        </div>
      );
    }

    if (SIMPLE_TABLES[modality]) {
      const { numbersLabel, data } = SIMPLE_TABLES[modality]!;
      return (
        <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="text-xs sm:text-sm">{numbersLabel}</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Valor (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.qty}>
                  <TableCell className="py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium">{row.qty}</TableCell>
                  <TableCell className={cn("py-2 px-3 sm:px-4 text-right text-xs sm:text-sm font-semibold", colors.text)}>
                    {row.price}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (modality === "loteca") {
      return (
        <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Duplos</TableHead>
                <TableHead className="text-xs sm:text-sm">Triplos</TableHead>
                <TableHead className="text-xs sm:text-sm">Nº apostas</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Valor (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LOTECA_PRICES.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="py-1.5 px-2 sm:px-4 text-xs sm:text-sm">{row.duplos}</TableCell>
                  <TableCell className="py-1.5 px-2 sm:px-4 text-xs sm:text-sm">{row.triplos}</TableCell>
                  <TableCell className="py-1.5 px-2 sm:px-4 text-xs sm:text-sm">{row.apostas}</TableCell>
                  <TableCell className={cn("py-1.5 px-2 sm:px-4 text-right text-xs sm:text-sm font-semibold", colors.text)}>
                    {row.price}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (modality === "milionaria") {
      return (
        <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Núm.</TableHead>
                <TableHead className="text-xs sm:text-sm">Trevos</TableHead>
                <TableHead className="text-xs sm:text-sm">Apostas</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Valor (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MILIONARIA_PRICES.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="py-1.5 px-2 sm:px-4 text-xs sm:text-sm">{row.numeros}</TableCell>
                  <TableCell className="py-1.5 px-2 sm:px-4 text-xs sm:text-sm">{row.trevos}</TableCell>
                  <TableCell className="py-1.5 px-2 sm:px-4 text-xs sm:text-sm">
                    {row.apostas.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className={cn("py-1.5 px-2 sm:px-4 text-right text-xs sm:text-sm font-semibold", colors.text)}>
                    {row.price}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={cn("animate-fade-in", colors.border)}>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0", colors.iconBg, colors.iconBorder)}>
              <DollarSign className={cn("w-4 h-4 sm:w-5 sm:h-5", colors.text)} />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Preço das Apostas</CardTitle>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                Tabela de referência por modalidade
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-[9px] sm:text-[10px] shrink-0", colors.badgeBorder)}>
            Valores Caixa
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <Select value={modality} onValueChange={(v) => setModality(v as ModalityKey)}>
          <SelectTrigger className={cn("w-full", colors.ring)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(MODALITY_LABELS) as ModalityKey[]).map((k) => (
              <SelectItem key={k} value={k}>
                {MODALITY_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {renderTable()}

        <div className="flex items-start gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5" />
          <p>
            Valores de referência (07/07/2025). Consulte{" "}
            <a
              href="https://loterias.caixa.gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              loterias.caixa.gov.br
            </a>{" "}
            para preços atualizados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
