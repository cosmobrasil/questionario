// Supabase Edge Function: send-report
// Envia o relatório de circularidade por e-mail usando Resend (via HTTP API)
// Tipos mínimos para o editor reconhecer Deno e Request/Response
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

// CORS para permitir chamadas do cliente em produção
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing RESEND_API_KEY secret" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const {
      html,
      subject = "Relatório de Circularidade",
      to = "ti@cosmobrasil.com.br",
      from = "CosmoBrasil <noreply@cosmobrasil.com.br>",
      replyTo,
      metadata = {},
    } = body || {};

    const recipients = Array.isArray(to) ? to : [to];
    const payload = {
      from,
      to: recipients,
      subject,
      html: html || "<p>Sem conteúdo.</p>",
      reply_to: replyTo,
      headers: {
        "X-Report-Metadata": JSON.stringify(metadata),
      },
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok || result?.error) {
      const msg = result?.error?.message || `HTTP ${res.status}`;
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ id: result?.id ?? result?.data?.id ?? null, status: "sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});