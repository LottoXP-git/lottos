import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, subYears, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, User, Phone, Mail, Cake, Heart, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const lotteryOptions = [
{ id: "megasena", label: "Mega-Sena", color: "bg-[#209869]" },
{ id: "lotofacil", label: "Lotofácil", color: "bg-[#930089]" },
{ id: "quina", label: "Quina", color: "bg-[#260085]" },
{ id: "lotomania", label: "Lotomania", color: "bg-[#F78100]" },
{ id: "timemania", label: "Timemania", color: "bg-[#00FF48]" },
{ id: "duplasena", label: "Dupla Sena", color: "bg-[#A61324]" },
{ id: "diadesorte", label: "Dia de Sorte", color: "bg-[#CB852B]" },
{ id: "supersete", label: "Super Sete", color: "bg-[#A8CF45]" }];


const minAge18Date = subYears(new Date(), 18);

const registrationSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  phone: z.string().
  min(10, "Celular deve ter pelo menos 10 dígitos").
  max(15, "Celular muito longo").
  regex(/^[\d\s()+-]+$/, "Formato de celular inválido"),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória"
  }).refine((date) => !isAfter(date, minAge18Date), {
    message: "Você deve ter pelo menos 18 anos para se cadastrar"
  }),
  favoriteLotteries: z.array(z.string()).min(1, "Selecione pelo menos uma loteria favorita"),
  acceptWhatsapp: z.boolean().default(false),
  acceptEmail: z.boolean().default(false)
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      favoriteLotteries: [],
      acceptWhatsapp: false,
      acceptEmail: false
    }
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("user_registrations").insert({
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        birth_date: format(data.birthDate, "yyyy-MM-dd"),
        favorite_lotteries: data.favoriteLotteries,
        accept_whatsapp_marketing: data.acceptWhatsapp,
        accept_email_marketing: data.acceptEmail
      });

      if (error) {
        if (error.message.includes("duplicate key") || error.message.includes("unique constraint")) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está registrado em nossa base.",
            variant: "destructive"
          });
        } else if (error.message.includes("18 years")) {
          toast({
            title: "Idade inválida",
            description: "Você deve ter pelo menos 18 anos para se cadastrar.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      setIsSuccess(true);
      toast({
        title: "Cadastro realizado! 🎉",
        description: "Você foi cadastrado com sucesso em nossa base."
      });

      form.reset();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="card-glass border-primary/20">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Cadastro Realizado!</h3>
          <p className="text-muted-foreground mb-6">
            Obrigado por se cadastrar. Você receberá novidades sobre suas loterias favoritas.
          </p>
          <Button
            onClick={() => setIsSuccess(false)}
            variant="outline"
            className="border-primary/50 hover:bg-primary/10">

            Fazer novo cadastro
          </Button>
        </CardContent>
      </Card>);

  }

  return (
    <Card className="card-glass border-primary/20">
      <CardHeader className="text-center pb-2">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <User className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-xl text-gradient">Cadastre-se</CardTitle>
        <CardDescription>
          Receba resultados e dicas das suas loterias favoritas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome Completo */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) =>
              <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Nome Completo
                  </FormLabel>
                  <FormControl>
                    <Input
                    placeholder="Digite seu nome completo"
                    className="bg-background/50 border-border/50 focus:border-primary"
                    {...field} />

                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />


            {/* Celular */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) =>
              <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Celular
                  </FormLabel>
                  <FormControl>
                    <Input
                    placeholder="(00) 00000-0000"
                    className="bg-background/50 border-border/50 focus:border-primary"
                    {...field} />

                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />


            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) =>
              <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="bg-background/50 border-border/50 focus:border-primary"
                    {...field} />

                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />


            {/* Data de Nascimento */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) =>
              <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Cake className="w-4 h-4 text-primary" />
                    Data de Nascimento
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background/50 border-border/50 hover:bg-background/70",
                          !field.value && "text-muted-foreground"
                        )}>

                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ?
                        format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) :

                        <span>Selecione sua data de nascimento</span>
                        }
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => isAfter(date, minAge18Date)}
                      defaultMonth={subYears(new Date(), 25)}
                      captionLayout="dropdown-buttons"
                      fromYear={1920}
                      toYear={new Date().getFullYear() - 18}
                      locale={ptBR}
                      initialFocus />

                    </PopoverContent>
                  </Popover>
                  <FormDescription className="text-xs">
                    Apenas maiores de 18 anos podem se cadastrar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              } />


            {/* Loterias Favoritas */}
            <FormField
              control={form.control}
              name="favoriteLotteries"
              render={() =>
              <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    Loterias Favoritas
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {lotteryOptions.map((lottery) =>
                  <FormField
                    key={lottery.id}
                    control={form.control}
                    name="favoriteLotteries"
                    render={({ field }) =>
                    <FormItem
                      key={lottery.id}
                      className="flex items-center space-x-2 space-y-0">

                            <FormControl>
                              <Checkbox
                          checked={field.value?.includes(lottery.id)}
                          onCheckedChange={(checked) => {
                            return checked ?
                            field.onChange([...field.value, lottery.id]) :
                            field.onChange(
                              field.value?.filter((value) => value !== lottery.id)
                            );
                          }} />

                            </FormControl>
                            <FormLabel className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                              <span className={cn("w-3 h-3 rounded-full text-[#fddf49]/0", lottery.color)} />
                              {lottery.label}
                            </FormLabel>
                          </FormItem>
                    } />

                  )}
                  </div>
                  <FormMessage />
                </FormItem>
              } />


            {/* Marketing Permissions */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <p className="text-sm font-medium text-foreground">Permissões de Comunicação</p>
              
              <FormField
                control={form.control}
                name="acceptWhatsapp"
                render={({ field }) =>
                <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange} />

                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Aceito receber informações, dicas e ofertas via <strong>WhatsApp</strong>
                      </FormLabel>
                    </div>
                  </FormItem>
                } />


              <FormField
                control={form.control}
                name="acceptEmail"
                render={({ field }) =>
                <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange} />

                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Aceito receber informações, dicas e ofertas via <strong>Email</strong>
                      </FormLabel>
                    </div>
                  </FormItem>
                } />

            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              disabled={isSubmitting}>

              {isSubmitting ?
              <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Cadastrando...
                </> :

              <>
                  <Send className="w-4 h-4" />
                  Cadastrar
                </>
              }
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>);

}