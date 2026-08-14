import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { JsonLd } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Bot, Terminal, MessageSquare, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildBreadcrumb, SITE_URL } from "@/lib/breadcrumb";

const APP_NAME = "Lottos";
const APP_SLUG = "lottos";

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast({ title: "Copiado!", description: "Texto copiado para a área de transferência." });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  return { copiedKey, copy };
}

export default function AgentConnection() {
  const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";
  const mcpUrl = `https://${projectRef}.supabase.co/functions/v1/mcp`;
  const claudeCodeCommand = `claude mcp add --scope user --transport http ${APP_SLUG} '${mcpUrl.replace(/'/g, "'\\''")}'`;
  const { copiedKey, copy } = useCopy();

  const isCopied = (key: string) => copiedKey === key;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Conectar agente de IA ao Lottos</title>
        <meta
          name="description"
          content="Conecte ChatGPT, Claude ou outro assistente de IA ao Lottos via MCP para consultar resultados e histórico das loterias da Caixa."
        />
        <link rel="canonical" href={`${SITE_URL}/conectar-agente`} />
        <meta property="og:title" content="Conectar agente de IA ao Lottos" />
        <meta
          property="og:description"
          content="Use seu assistente de IA favorito para consultar resultados e estatísticas das loterias pelo Lottos."
        />
        <meta property="og:url" content={`${SITE_URL}/conectar-agente`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <JsonLd
        data={[
          buildBreadcrumb([
            { name: "Início", url: `${SITE_URL}/` },
            { name: "Conectar agente de IA", url: `${SITE_URL}/conectar-agente` },
          ]),
        ]}
      />
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            Conectar agente de IA
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Use o assistente de IA que você já utiliza para consultar resultados e
            histórico das loterias da Caixa diretamente pelo Lottos.
          </p>
        </div>

        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-card to-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              URL do servidor MCP
            </CardTitle>
            <CardDescription>
              Copie esta URL e cole no seu assistente de IA para conectar ao Lottos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <code className="flex-1 p-3 rounded-lg bg-secondary/50 text-sm font-mono break-all border border-border">
                {mcpUrl}
              </code>
              <Button
                onClick={() => copy(mcpUrl, "url")}
                className="shrink-0"
              >
                {isCopied("url") ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {isCopied("url") ? "Copiado" : "Copiar URL"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="chatgpt" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6">
            <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
            <TabsTrigger value="claude">Claude</TabsTrigger>
            <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
            <TabsTrigger value="outros">Outros</TabsTrigger>
          </TabsList>

          <TabsContent value="chatgpt">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  ChatGPT
                </CardTitle>
                <CardDescription>
                  Conecte o Lottos como um conector personalizado do ChatGPT.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                  <li>
                    Abra as{" "}
                    <a
                      href="https://chatgpt.com/#settings/Connectors/Advanced"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      configurações avançadas de Conectores do ChatGPT
                    </a>{" "}
                    e ative o modo Desenvolvedor (se solicitado, confirme o aviso de segurança).
                  </li>
                  <li>
                    Acesse a página de{" "}
                    <a
                      href="https://chatgpt.com/plugins#settings/Connectors?create-connector=true&redirectAfter=%2Fplugins"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      criar novo conector
                    </a>
                    .
                  </li>
                  <li>
                    No campo <strong className="text-foreground">Nome</strong>, digite{" "}
                    <strong className="text-foreground">{APP_NAME}</strong>. No campo{" "}
                    <strong className="text-foreground">URL</strong>, cole a URL do servidor MCP
                    copiada acima.
                  </li>
                  <li>
                    Revise os detalhes, marque a caixa de confirmação e clique em{" "}
                    <strong className="text-foreground">Criar</strong>.
                  </li>
                  <li>
                    No compositor de bate-papo, ative o conector do Lottos e peça ao ChatGPT
                    para consultar um resultado ou histórico.
                  </li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claude">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Claude
                </CardTitle>
                <CardDescription>
                  Adicione o Lottos como um conector personalizado no Claude.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                  <li>
                    Abra a página de{" "}
                    <a
                      href={`https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(
                        APP_NAME,
                      )}&connectorUrl=${encodeURIComponent(mcpUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      conectores personalizados do Claude
                    </a>{" "}
                    com o nome e a URL já preenchidos.
                  </li>
                  <li>
                    Confira as informações e clique em{" "}
                    <strong className="text-foreground">Adicionar</strong>.
                  </li>
                  <li>
                    Se o formulário não abrir preenchido, vá em "Conectores → Adicionar
                    conector personalizado" e cole a URL do servidor MCP manualmente.
                  </li>
                  <li>
                    Ative o conector no compositor de conversa e peça ao Claude para usar o
                    Lottos.
                  </li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claude-code">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  Claude Code
                </CardTitle>
                <CardDescription>
                  Instale o Lottos no Claude Code com um único comando no terminal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Copie o comando abaixo, cole no terminal e execute. Ele registra o Lottos
                  como um servidor MCP remoto no seu usuário.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <code className="flex-1 p-3 rounded-lg bg-secondary/50 text-sm font-mono break-all border border-border">
                    {claudeCodeCommand}
                  </code>
                  <Button
                    variant="outline"
                    onClick={() => copy(claudeCodeCommand, "claude-code")}
                    className="shrink-0"
                  >
                    {isCopied("claude-code") ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {isCopied("claude-code") ? "Copiado" : "Copiar comando"}
                  </Button>
                </div>
                <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                  <li>
                    Execute o comando no terminal e aguarde a confirmação.
                  </li>
                  <li>
                    Inicie o Claude Code e rode <code className="px-1.5 py-0.5 rounded bg-secondary text-sm font-mono">/mcp</code>{" "}
                    para confirmar que o Lottos aparece na lista.
                  </li>
                  <li>
                    Se o app exigir login, o Claude Code pedirá para você autenticar nesse
                    momento.
                  </li>
                  <li>
                    Peça ao Claude Code para consultar resultados ou histórico das loterias.
                  </li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outros">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Outros clientes MCP
                </CardTitle>
                <CardDescription>
                  Qualquer assistente compatível com servidores MCP remotos pode se conectar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                  <li>
                    Abra as configurações de MCP ou conectores personalizados do assistente.
                  </li>
                  <li>
                    Crie uma nova conexão de servidor MCP remoto.
                  </li>
                  <li>
                    Dê o nome <strong className="text-foreground">{APP_NAME}</strong> e cole
                    a URL do servidor MCP copiada acima.
                  </li>
                  <li>
                    Complete qualquer etapa de autorização ou login solicitada.
                  </li>
                  <li>
                    Ative a conexão e peça ao assistente para usar o Lottos.
                  </li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Atualizar a conexão</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            O assistente armazena em cache a lista de ferramentas disponíveis. Sempre que o
            Lottos for atualizado, atualize o conector para receber as novas funções.
          </p>

          <Tabs defaultValue="chatgpt" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6">
              <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
              <TabsTrigger value="claude">Claude</TabsTrigger>
              <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
              <TabsTrigger value="outros">Outros</TabsTrigger>
            </TabsList>

            <TabsContent value="chatgpt">
              <Card>
                <CardContent className="pt-6">
                  <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                    <li>
                      Abra a página de Plugins no ChatGPT e selecione o conector do Lottos.
                    </li>
                    <li>
                      Role até a seção "Informações" e clique em{" "}
                      <strong className="text-foreground">Atualizar</strong>.
                    </li>
                    <li>
                      Se a URL do servidor mudou, remova o conector e crie novamente seguindo
                      os passos de conexão acima.
                    </li>
                    <li>
                      Inicie um novo bate-papo e peça ao ChatGPT para usar o Lottos.
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="claude">
              <Card>
                <CardContent className="pt-6">
                  <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                    <li>
                      Abra a página de Conectores do Claude e selecione o conector do Lottos.
                    </li>
                    <li>
                      Clique em <strong className="text-foreground">Atualizar</strong> ou{" "}
                      <strong className="text-foreground">Atualizar ferramentas</strong>.
                    </li>
                    <li>
                      Se a URL do servidor mudou, remova o conector e adicione novamente com a
                      URL atual.
                    </li>
                    <li>
                      Peça ao Claude para usar o Lottos.
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="claude-code">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                    <li>
                      Inicie uma nova sessão do Claude Code — ela carrega as ferramentas mais
                      recentes automaticamente.
                    </li>
                    <li>
                      Se a URL do servidor mudou, remova a conexão antiga com:
                      <code className="block mt-2 p-2 rounded-lg bg-secondary/50 text-sm font-mono break-all border border-border">
                        claude mcp remove {APP_SLUG}
                      </code>
                    </li>
                    <li>
                      Execute novamente o comando de instalação com a URL atual (copie da
                      seção Claude Code acima).
                    </li>
                    <li>
                      Rode <code className="px-1.5 py-0.5 rounded bg-secondary text-sm font-mono">/mcp</code>{" "}
                      e peça ao Claude Code para usar o Lottos.
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outros">
              <Card>
                <CardContent className="pt-6">
                  <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                    <li>
                      Abra as configurações de MCP ou conectores do assistente.
                    </li>
                    <li>
                      Selecione a conexão criada para o Lottos.
                    </li>
                    <li>
                      Clique em <strong className="text-foreground">Atualizar</strong>,{" "}
                      <strong className="text-foreground">Recarregar</strong> ou{" "}
                      <strong className="text-foreground">Reconectar</strong>.
                    </li>
                    <li>
                      Se a URL mudou, cole a nova URL do servidor MCP e salve.
                    </li>
                    <li>
                      Inicie um novo bate-papo e peça ao assistente para usar o Lottos.
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
