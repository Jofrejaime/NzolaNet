<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Palavra-Passe</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f11; color: #e5e5e5; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 16px; }
    .card { background: #1a1a1f; border: 1px solid #2a2a32; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #E8550F 0%, #c9460a 100%); padding: 32px; text-align: center; }
    .logo { display: inline-flex; align-items: center; gap: 10px; }
    .logo-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo-text { font-size: 22px; font-weight: 800; color: #fff; }
    .body { padding: 36px 32px; }
    h1 { font-size: 20px; font-weight: 700; color: #f5f5f5; margin-bottom: 12px; }
    p { font-size: 14px; color: #a0a0b0; line-height: 1.6; margin-bottom: 16px; }
    .btn { display: inline-block; background: #E8550F; color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 8px 0 24px; }
    .divider { border: none; border-top: 1px solid #2a2a32; margin: 24px 0; }
    .url-box { background: #111116; border: 1px solid #2a2a32; border-radius: 8px; padding: 12px 16px; word-break: break-all; font-family: monospace; font-size: 12px; color: #7a7a90; }
    .footer { padding: 20px 32px; text-align: center; font-size: 12px; color: #555570; border-top: 1px solid #2a2a32; }
    .warning { background: rgba(232,85,15,0.08); border: 1px solid rgba(232,85,15,0.2); border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #c97a50; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span class="logo-text">NzolaNet</span>
        </div>
      </div>

      <div class="body">
        <h1>Recuperação de Palavra-Passe</h1>
        <p>Olá, <strong style="color:#f5f5f5">{{ $userName }}</strong>!</p>
        <p>Recebemos um pedido para recuperar a palavra-passe da tua conta no NzolaNet. Clica no botão abaixo para definir uma nova palavra-passe.</p>

        <div style="text-align:center; margin: 28px 0;">
          <a href="{{ $resetUrl }}" class="btn">Redefinir Palavra-Passe</a>
        </div>

        <div class="warning">
          ⏱ Este link é válido durante <strong>60 minutos</strong>. Depois disso será necessário solicitar novamente.
        </div>

        <p>Se não solicitaste a recuperação de palavra-passe, podes ignorar este email — a tua conta continua segura.</p>

        <hr class="divider">

        <p style="font-size:12px; color:#666680; margin-bottom:8px;">Se o botão não funcionar, copia e cola este link no teu browser:</p>
        <div class="url-box">{{ $resetUrl }}</div>
      </div>

      <div class="footer">
        © {{ date('Y') }} NzolaNet · Este é um email automático, por favor não respondas.
      </div>
    </div>
  </div>
</body>
</html>
