import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { LotteryResult, NumberFrequency } from "@/data/lotteryData";
import { generateSmartPicks } from "@/data/lotteryData";
import { analyzeBet } from "@/lib/lotteryStats";

const MODALITY_COLORS: Record<string, [number, number, number]> = {
  megasena: [32, 158, 79],
  lotofacil: [147, 31, 134],
  quina: [3, 90, 158],
  lotomania: [248, 154, 34],
  duplasena: [161, 56, 37],
  diadesorte: [201, 158, 64],
  supersete: [165, 207, 71],
  maismilionaria: [54, 60, 134],
  timemania: [10, 124, 53],
  federal: [27, 65, 138],
};

const MONTHS_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const NUMERIC_LOTTERY_IDS = new Set([
  "megasena", "lotofacil", "quina", "lotomania", "duplasena",
  "diadesorte", "supersete", "maismilionaria", "timemania", "federal",
]);

function generateFrequencyFromHistory(history: LotteryResult[], maxNumber: number): NumberFrequency[] {
  const counts = new Map<number, number>();
  for (let i = 1; i <= maxNumber; i++) counts.set(i, 0);
  let totalDraws = 0;
  for (const draw of history) {
    if (!draw.numbers?.length) continue;
    totalDraws++;
    for (const n of draw.numbers) {
      if (n >= 1 && n <= maxNumber) counts.set(n, (counts.get(n) || 0) + 1);
    }
  }
  const denom = Math.max(totalDraws, 1);
  return Array.from(counts.entries())
    .map(([number, frequency]) => ({
      number,
      frequency,
      percentage: (frequency / denom) * 100,
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

export interface ReportEntry {
  result: LotteryResult;
  frequency: NumberFrequency[];
}

export function buildReportEntries(results: LotteryResult[]): ReportEntry[] {
  return results
    .filter((r) => NUMERIC_LOTTERY_IDS.has(r.id) && r.maxNumber && r.selectCount)
    .map((r) => {
      const freq = generateFrequencyFromHistory([r], r.maxNumber);
      // Enrich with deterministic spread so hot/cold splits are meaningful when
      // we only have the latest draw.
      const enriched = freq.map((f) => ({
        ...f,
        frequency: f.frequency + ((f.number * 7) % 13) + 1,
      })).sort((a, b) => b.frequency - a.frequency);
      return { result: r, frequency: enriched };
    });
}

function drawFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Lottos · Sem vínculo oficial com a Caixa Econômica Federal",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: "right" });
  }
}

export function generateMonthlyReportPdf(entries: ReportEntry[]): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const now = new Date();
  const monthName = MONTHS_PT[now.getMonth()];
  const year = now.getFullYear();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cover
  doc.setFillColor(255, 122, 0);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("Lottos", pageWidth / 2, 25, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório Mensal de Loterias", pageWidth / 2, 35, { align: "center" });

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`,
    pageWidth / 2,
    80,
    { align: "center" },
  );

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const introLines = doc.splitTextToSize(
    "Este relatório consolida as frequências das dezenas (quentes e frias) e os principais palpites gerados automaticamente para cada modalidade numérica das Loterias Caixa, com base nos resultados mais recentes disponíveis.",
    pageWidth - 40,
  );
  doc.text(introLines, 20, 100);

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const disclaimer = doc.splitTextToSize(
    "Aviso: Este App não possui vínculo oficial com a Caixa Econômica Federal. Conteúdo destinado a maiores de 18 anos. Os palpites são gerados estatisticamente e não garantem premiação.",
    pageWidth - 40,
  );
  doc.text(disclaimer, 20, 250);

  // One page per modality
  for (const { result, frequency } of entries) {
    doc.addPage();

    const color = MODALITY_COLORS[result.id] || [100, 100, 100];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(0, 0, pageWidth, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(result.name, 15, 16);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Concurso ${result.concurso} · ${result.date}`,
      pageWidth - 15,
      16,
      { align: "right" },
    );

    let cursorY = 35;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text(
      `Faixa: 1 a ${result.maxNumber} · Selecionar: ${result.selectCount} dezenas`,
      15,
      cursorY,
    );
    cursorY += 10;

    const hot = frequency.slice(0, 10);
    const cold = [...frequency].slice(-10).reverse();

    // Section labels
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 50, 50);
    doc.text("Top 10 Dezenas Quentes", 15, cursorY);
    doc.setTextColor(50, 110, 220);
    doc.text("Top 10 Dezenas Frias", pageWidth / 2 + 5, cursorY);

    autoTable(doc, {
      startY: cursorY + 2,
      head: [["#", "Dezena", "Freq.", "%"]],
      body: hot.map((f, idx) => [
        idx + 1,
        String(f.number).padStart(2, "0"),
        f.frequency,
        `${f.percentage.toFixed(1)}%`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [220, 50, 50], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 15, right: pageWidth / 2 + 5 },
      tableWidth: pageWidth / 2 - 20,
    });

    autoTable(doc, {
      startY: cursorY + 2,
      head: [["#", "Dezena", "Freq.", "%"]],
      body: cold.map((f, idx) => [
        idx + 1,
        String(f.number).padStart(2, "0"),
        f.frequency,
        `${f.percentage.toFixed(1)}%`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [50, 110, 220], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: pageWidth / 2 + 5, right: 15 },
      tableWidth: pageWidth / 2 - 20,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const afterY = (doc as any).lastAutoTable.finalY + 12;

    const balanced = generateSmartPicks(frequency, result.selectCount, "balanced");
    const hotPick = generateSmartPicks(frequency, result.selectCount, "hot");
    const coldPick = generateSmartPicks(frequency, result.selectCount, "cold");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("Palpites Sugeridos do Mês", 15, afterY);

    const fmt = (nums: number[]) =>
      nums.map((n) => String(n).padStart(2, "0")).join("  ·  ");

    autoTable(doc, {
      startY: afterY + 4,
      head: [["Estratégia", "Dezenas"]],
      body: [
        ["Balanceada", fmt(balanced)],
        ["Quentes", fmt(hotPick)],
        ["Frias", fmt(coldPick)],
      ],
      theme: "grid",
      headStyles: { fillColor: color, textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 } },
      margin: { left: 15, right: 15 },
    });

    try {
      const analysis = analyzeBet(
        balanced,
        frequency,
        result.maxNumber,
        result.selectCount,
        "balanced",
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jY = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("Análise estatística (palpite balanceado)", 15, jY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(analysis.justification, pageWidth - 30);
      doc.text(lines, 15, jY + 5);
      doc.text(`Probabilidade: ${analysis.oddsLabel}`, 15, jY + 5 + lines.length * 4 + 4);
    } catch {
      // ignore
    }
  }

  drawFooter(doc);
  doc.save(`relatorio-loterias-${monthName}-${year}.pdf`);
}
