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
      to = "ti@cosmobrasil.app",
      from,
      replyTo,
      metadata = {},
    } = body || {};

    const fallbackFrom = "cosmobrasil <relatorio@cosmobrasil.app>";
    let resolvedFrom = fallbackFrom;
    if (typeof from === "string" && from.trim().length > 0) {
      const sanitized = from.trim();
      const lower = sanitized.toLowerCase();
      resolvedFrom = lower.indexOf("@cosmobrasil.app") !== -1 ? sanitized : fallbackFrom;
    }

    const recipients = Array.isArray(to) ? to : [to];
    const payload = {
      from: resolvedFrom,
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

    const raw = await res.text();
    let result: any = null;
    try {
      result = raw ? JSON.parse(raw) : null;
    } catch {
      result = raw;
    }
    if (!res.ok || (result && typeof result === "object" && result?.error)) {
      const errMsg =
        (typeof result === "object" && result?.error?.message) ||
        (typeof result === "object" && result?.message) ||
        (typeof raw === "string" && raw.trim()) ||
        `HTTP ${res.status}`;
      console.error("Resend API error:", errMsg, { status: res.status, result });
      return new Response(
        JSON.stringify({ error: errMsg, status: res.status, result }),
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