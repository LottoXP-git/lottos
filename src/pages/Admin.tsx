import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, MousePointerClick, Target, RefreshCw, LogOut, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "lottos_admin_pwd";
const FOCUS_SLOT = "8331815579";

type SlotMetric = {
  slot: string;
  impressions: number;
  clicks: number;
  ctr: number;
  pages: { page: string; impressions: number; clicks: number; ctr: number }[];
};

type MetricsResponse = {
  totals: { impressions: number; clicks: number; ctr: number };
  slots: SlotMetric[];
  focus: SlotMetric & { daily: { date: string; impressions: number; clicks: number; ctr: number }[] };
  windowDays: number;
  sampleSize: number;
};

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <Icon className="w-8 h-8 text-primary/60" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authedPwd, setAuthedPwd] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY));
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async (pwd: string) => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke<MetricsResponse>("admin-ad-metrics", {
        body: { password: pwd },
      });
      if (error || !res) throw error ?? new Error("No data");
      if ((res as unknown as { error?: string }).error) throw new Error((res as unknown as { error: string }).error);
      setData(res);
      sessionStorage.setItem(STORAGE_KEY, pwd);
      setAuthedPwd(pwd);
    } catch (err) {
      toast.error("Falha ao carregar métricas. Verifique a senha.");
      sessionStorage.removeItem(STORAGE_KEY);
      setAuthedPwd(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authedPwd) fetchMetrics(authedPwd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    fetchMetrics(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthedPwd(null);
    setData(null);
    setPassword("");
  };

  if (!authedPwd) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Admin — Métricas de Anúncios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="pwd">Senha de acesso</Label>
                  <Input
                    id="pwd"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Verificando..." : "Entrar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-primary" /> Painel de Anúncios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Janela: últimos {data?.windowDays ?? 90} dias · Amostra: {data?.sampleSize ?? 0} eventos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchMetrics(authedPwd)} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>

        {!data ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-8">
            {/* Totals */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={Eye} label="Impressões totais" value={data.totals.impressions.toLocaleString("pt-BR")} />
              <StatCard icon={MousePointerClick} label="Cliques totais" value={data.totals.clicks.toLocaleString("pt-BR")} />
              <StatCard icon={TrendingUp} label="CTR geral" value={`${data.totals.ctr.toFixed(2)}%`} />
            </section>

            {/* Focus slot report */}
            <section>
              <Card className="border-primary/40 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Relatório do Slot{" "}
                    <Badge variant="default" className="font-mono">{FOCUS_SLOT}</Badge>
                    <span className="text-sm font-normal text-muted-foreground">("teste 01")</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={Eye} label="Impressões" value={data.focus.impressions.toLocaleString("pt-BR")} />
                    <StatCard icon={MousePointerClick} label="Cliques" value={data.focus.clicks.toLocaleString("pt-BR")} />
                    <StatCard icon={TrendingUp} label="CTR" value={`${data.focus.ctr.toFixed(2)}%`} />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Por página</h3>
                    {data.focus.pages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem dados ainda para este slot.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Página</TableHead>
                            <TableHead className="text-right">Impressões</TableHead>
                            <TableHead className="text-right">Cliques</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.focus.pages.map((p) => (
                            <TableRow key={p.page}>
                              <TableCell className="font-mono text-xs">{p.page}</TableCell>
                              <TableCell className="text-right">{p.impressions.toLocaleString("pt-BR")}</TableCell>
                              <TableCell className="text-right">{p.clicks.toLocaleString("pt-BR")}</TableCell>
                              <TableCell className="text-right">{p.ctr.toFixed(2)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  {data.focus.daily.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Últimos dias</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Impressões</TableHead>
                            <TableHead className="text-right">Cliques</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.focus.daily.slice(-14).reverse().map((d) => (
                            <TableRow key={d.date}>
                              <TableCell className="font-mono text-xs">{d.date}</TableCell>
                              <TableCell className="text-right">{d.impressions.toLocaleString("pt-BR")}</TableCell>
                              <TableCell className="text-right">{d.clicks.toLocaleString("pt-BR")}</TableCell>
                              <TableCell className="text-right">{d.ctr.toFixed(2)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* All slots */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Todos os slots</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Slot</TableHead>
                          <TableHead className="text-right">Impressões</TableHead>
                          <TableHead className="text-right">Cliques</TableHead>
                          <TableHead className="text-right">CTR</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.slots.map((s) => (
                          <TableRow key={s.slot} className={s.slot === FOCUS_SLOT ? "bg-primary/5" : ""}>
                            <TableCell className="font-mono text-xs">
                              {s.slot}
                              {s.slot === FOCUS_SLOT && <Badge variant="outline" className="ml-2">foco</Badge>}
                            </TableCell>
                            <TableCell className="text-right">{s.impressions.toLocaleString("pt-BR")}</TableCell>
                            <TableCell className="text-right">{s.clicks.toLocaleString("pt-BR")}</TableCell>
                            <TableCell className="text-right">{s.ctr.toFixed(2)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">
                    Observação: cliques são detectados via interação com a área do anúncio (pointerdown), pois o iframe do AdSense
                    não permite leitura direta. Dados oficiais de receita e cliques validados ficam no painel do Google AdSense.
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
