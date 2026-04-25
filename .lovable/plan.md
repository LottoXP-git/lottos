## Objetivo

Enviar automaticamente cada novo cadastro do app (formulário `RegistrationForm`) para o **HubSpot CRM**, criando ou atualizando o contato em tempo real, com todos os dados e consentimentos de marketing devidamente mapeados.

## Como vai funcionar

1. Usuário preenche o formulário de cadastro no app
2. Os dados são salvos na tabela `user_registrations` (como já acontece hoje)
3. Imediatamente depois, uma **edge function** envia esses dados ao HubSpot via API
4. O contato aparece no seu painel do HubSpot com todas as informações e tags
5. Se houver erro no HubSpot, o cadastro local **não é perdido** — fica salvo no app e logado para revisão

## Etapas da implementação

### 1. Conectar HubSpot ao projeto
- Você será solicitado a fazer login na sua conta HubSpot via OAuth (sem precisar copiar API keys manualmente)
- O token de acesso fica seguro no Lovable Cloud

### 2. Criar a edge function `sync-hubspot-contact`
- Recebe os dados do cadastro
- Faz a chamada autenticada para a API do HubSpot via gateway do Lovable
- Cria/atualiza o contato (deduplica por e-mail automaticamente)
- Retorna sucesso ou erro com detalhes nos logs

### 3. Mapeamento dos campos

| Campo do app | Campo no HubSpot |
|---|---|
| Nome completo | `firstname` + `lastname` (separados pelo primeiro espaço) |
| E-mail | `email` (chave única — atualiza se já existir) |
| Celular | `phone` |
| Data de nascimento | `date_of_birth` (propriedade customizada) |
| Loterias favoritas | `favorite_lotteries` (propriedade customizada, lista) |
| Aceita WhatsApp marketing | `whatsapp_marketing_opt_in` (booleano) |
| Aceita E-mail marketing | `email_marketing_opt_in` (booleano) + status legal de subscription |
| Origem | `lead_source` = "Lottos App" |

> As propriedades customizadas (`date_of_birth`, `favorite_lotteries`, etc.) podem ser criadas automaticamente pela edge function na primeira execução, ou você pode criá-las manualmente no HubSpot antes — vou criar via código para facilitar.

### 4. Modificar o `RegistrationForm`
- Após o `INSERT` bem-sucedido no Supabase, chamar a edge function via `supabase.functions.invoke('sync-hubspot-contact', ...)`
- Mostrar toast de sucesso normalmente (sem expor falhas do CRM ao usuário final)
- Logar erros no console e nos logs da edge function para você acompanhar

### 5. Tratamento de erros e resiliência
- Se o HubSpot estiver fora do ar ou retornar erro, o cadastro **não é revertido** — fica salvo no Supabase
- Erros ficam visíveis nos logs da edge function para diagnóstico
- Possível adicionar retry automático no futuro, se necessário

## Detalhes técnicos

- **Endpoint HubSpot usado:** `POST /crm/v3/objects/contacts` para criação e `PATCH /crm/v3/objects/contacts/{email}?idProperty=email` para upsert
- **Autenticação:** via Lovable Connector Gateway (`https://connector-gateway.lovable.dev/hubspot/...`) — sem expor tokens no frontend
- **CORS:** configurado para permitir chamadas do app
- **Validação:** Zod no input da edge function para evitar dados inválidos

## O que NÃO está no escopo deste plano

- Sincronização retroativa dos cadastros já existentes no banco (você pediu apenas tempo real para novos cadastros)
- Pipeline de vendas, deals ou tarefas no HubSpot
- Listas segmentadas automáticas (mas as propriedades enviadas permitem você criá-las manualmente no HubSpot)
- Webhook reverso (HubSpot → app)

Se quiser incluir a sincronização retroativa depois, posso adicionar um botão admin separado.

## Próximo passo após aprovação

1. Solicitarei a conexão da sua conta HubSpot
2. Implementarei a edge function e a integração no formulário
3. Você poderá testar fazendo um novo cadastro e verificando no painel do HubSpot