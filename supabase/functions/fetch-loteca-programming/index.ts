import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PAGE_URL = 'https://loterias.caixa.gov.br/Paginas/Programacao-Loteca.aspx';

// Diacritic map for common Brazilian Portuguese country/team names.
const ACCENT_MAP: Record<string, string> = {
  'ESCOCIA': 'Escócia',
  'BRASIL': 'Brasil',
  'NOVA ZELANDIA': 'Nova Zelândia',
  'EGITO': 'Egito',
  'ARGENTINA': 'Argentina',
  'AUSTRIA': 'Áustria',
  'FRANCA': 'França',
  'IRAQUE': 'Iraque',
  'NORUEGA': 'Noruega',
  'SENEGAL': 'Senegal',
  'PORTUGAL': 'Portugal',
  'UZBEQUISTAO': 'Uzbequistão',
  'INGLATERRA': 'Inglaterra',
  'GANA': 'Gana',
  'PANAMA': 'Panamá',
  'CROACIA': 'Croácia',
  'COLOMBIA': 'Colômbia',
  'CONGO': 'Congo',
  'SUICA': 'Suíça',
  'CANADA': 'Canadá',
  'BOSNIA HERZEGOVIN': 'Bósnia Herzegovina',
  'BOSNIA HERZEGOVINA': 'Bósnia Herzegovina',
  'CATAR': 'Catar',
  'MARROCOS': 'Marrocos',
  'HAITI': 'Haiti',
  'AFRICA DO SUL': 'África do Sul',
  'COREIA DO SUL': 'Coreia do Sul',
  'REPUBLICA TCHECA': 'República Tcheca',
  'MEXICO': 'México',
  'CURACAO': 'Curaçao',
  'COSTA DO MARFIM': 'Costa do Marfim',
  'EQUADOR': 'Equador',
  'ALEMANHA': 'Alemanha',
  'TUNISIA': 'Tunísia',
  'HOLANDA': 'Holanda',
  'JAPAO': 'Japão',
  'SUECIA': 'Suécia',
};

function normalizeTeam(raw: string): string {
  let s = raw.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').trim();
  // Strip FIFA code suffix like "ESCOCIA/SCT"
  s = s.split('/')[0].trim().toUpperCase();
  if (ACCENT_MAP[s]) return ACCENT_MAP[s];
  // Title-case fallback
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseFirstConcurso(html: string) {
  // Header e.g. "Concurso 1257 (21/06/2026, Domingo)"
  const headerMatch = html.match(/Concurso\s+(\d+)\s*\(([\d/]+),\s*([^\)]+)\)/);
  if (!headerMatch) throw new Error('Cabeçalho do concurso não encontrado');
  const concurso = Number(headerMatch[1]);
  const dataApuracao = headerMatch[2];
  const diaSemana = headerMatch[3].trim();

  // Find concurso content block
  const blockId = `conteudoConcurso${concurso}`;
  const blockRe = new RegExp(`id="${blockId}"[\\s\\S]*?</table>`);
  const blockMatch = html.match(blockRe);
  if (!blockMatch) throw new Error('Bloco de jogos não encontrado');
  const block = blockMatch[0];

  const periodoMatch = block.match(/Per[ií]odo de apostas:?\s*<\/b>\s*([^<]+)</i);
  const realizacaoMatch = block.match(/Realiza[cç][aã]o[^:]*:?\s*<\/b>\s*([^<]+)</i);
  const periodoApostas = periodoMatch ? stripTags(periodoMatch[1]).replace(/\s+do dia\s+/, ' de ') : '';
  const dataJogos = realizacaoMatch ? stripTags(realizacaoMatch[1]) : '';

  // Derive apuracao from end of periodo, e.g. "21h do dia 21/06/2026" -> "21h de 21/06/2026"
  let apuracao = '';
  const apMatch = periodoMatch
    ? periodoMatch[1].match(/at[eé]\s+as\s+([\dhH:]+)\s+(?:do\s+dia\s+)?([\d/]+)/i)
    : null;
  if (apMatch) apuracao = `${apMatch[1]} de ${apMatch[2]}`;
  else apuracao = `${dataApuracao} (${diaSemana})`;

  // Parse table rows
  const rowRe = /<tr[^>]*ng-repeat="loteca in concurso\.listaJogos"[^>]*>([\s\S]*?)<\/tr>/g;
  const jogos: { equipeUm: string; equipeDois: string; campeonato: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(block)) !== null) {
    const tds = [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((x) => stripTags(x[1]));
    // Columns: [num, blank, team1, blank, team2, blank, dia1, dia2]
    if (tds.length < 5) continue;
    const equipeUm = normalizeTeam(tds[2]);
    const equipeDois = normalizeTeam(tds[4]);
    if (!equipeUm || !equipeDois) continue;
    jogos.push({ equipeUm, equipeDois, campeonato: 'Copa do Mundo' });
  }

  if (jogos.length === 0) throw new Error('Nenhum jogo encontrado');

  return { concurso, periodoApostas, dataJogos, apuracao, jogos };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const res = await fetch(PAGE_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });
    if (!res.ok) throw new Error(`Falha ao acessar Caixa (status ${res.status})`);
    const html = await res.text();
    const data = parseFirstConcurso(html);
    return new Response(JSON.stringify({ success: true, data, fetchedAt: new Date().toISOString() }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900',
      },
    });
  } catch (err) {
    console.error('[fetch-loteca-programming]', err);
    return new Response(
      JSON.stringify({
        success: false,
        fallback: true,
        error: 'Não foi possível obter a programação no momento.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});