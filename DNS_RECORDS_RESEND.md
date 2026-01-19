# Configuração DNS para Resend (cosmobrasil.app)

Adicione os seguintes registros no provedor de domínio onde você comprou o **cosmobrasil.app**.

## 1. DKIM (DomainKeys Identified Mail)
*Este registro autentica seus e-mails para evitar que caiam no spam.*

| Tipo | Nome (Host) | Valor (Conteúdo) |
| :--- | :--- | :--- |
| **TXT** | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4ynubyf4/bMMtXXj2XyysK+fDvt+jsDCkK009GWkxfaRRQGfPlfvJvLK0Hwq8JNTt0EC7AadPstZtDnLO3cifyrsdpcYlWtkmZwyUz5abu9pkgvlo+U3lCgrA4HVOUIk4LXw37rnhkmFLHkCpANqZyfP6EsJPOKyAsYtnagFF1QIDAQAB` |

---

## 2. SPF (Sender Policy Framework)
*Autoriza o Resend a enviar e-mails em nome do seu domínio.*

**Registro MX:**
| Tipo | Nome (Host) | Valor (Conteúdo) | Prioridade |
| :--- | :--- | :--- | :--- |
| **MX** | `send` | `feedback-smtp.sa-east-1.amazonses.com` | **10** |

**Registro TXT:**
| Tipo | Nome (Host) | Valor (Conteúdo) |
| :--- | :--- | :--- |
| **TXT** | `send` | `v=spf1 include:amazonses.com ~all` |

---

## 3. DMARC (Opcional, mas recomendado)
*Define políticas de segurança para o domínio.*

| Tipo | Nome (Host) | Valor (Conteúdo) |
| :--- | :--- | :--- |
| **TXT** | `_dmarc` | `v=DMARC1; p=none;` |

---

### Próximos Passos
1. Adicione esses registros no painel do seu provedor de domínio.
2. Aguarde a verificação no painel do Resend ficar **"Verified"** (pode levar de alguns minutos a 24h).
3. Após verificado, faça o deploy da função atualizada no Supabase:
   ```bash
   npx supabase functions deploy send-report --project-ref uapwjnnzexamassmwxjc
   ```
