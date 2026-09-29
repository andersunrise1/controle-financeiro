import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * O backend, que vive noutra origem (Railway) enquanto o site está na Vercel.
 *
 * Precisa entrar no `connect-src` da CSP: sem ele o navegador bloquearia toda
 * chamada de API e o site abriria bonito e completamente inerte.
 */
const apiOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    return new URL(raw).origin;
  } catch {
    return "http://localhost:3001";
  }
})();

/**
 * De onde o tesseract.js baixa o WASM, o script do worker e os dados de idioma
 * da leitura de preço pela câmera.
 *
 * Conferido no código do pacote instalado (`tesseract.js@6.0.1`), não presumido:
 * `worker-script/browser/getCore.js`, `worker-script/index.js` e
 * `worker/browser/defaultOptions.js` apontam todos para cdn.jsdelivr.net, e
 * nenhum caminho local foi configurado em lib/priceOcr.ts. Tirar este domínio
 * daqui quebra a câmera silenciosamente — o resto do app continua funcionando,
 * então é o tipo de falha que passa muito tempo sem ser notada.
 */
const OCR_CDN = "https://cdn.jsdelivr.net";

/**
 * O que esta CSP protege — e o que ela não protege.
 *
 * `script-src` carrega 'unsafe-inline' porque o Next injeta scripts inline para
 * hidratar a página, e evitar isso exigiria nonce por requisição (middleware,
 * que este projeto não tem). Ou seja: **esta CSP não é uma barreira contra XSS.**
 * A barreira contra XSS aqui é o próprio código — não existe um único
 * dangerouslySetInnerHTML, innerHTML, document.write ou eval no app.
 *
 * O que ela realmente entrega:
 * - `frame-ancestors 'none'`: ninguém embute o app num iframe para enganar o
 *   usuário a clicar no que não vê (clickjacking).
 * - `connect-src` fechado: mesmo que algo conseguisse rodar na página, não
 *   teria para onde mandar os dados financeiros — só para o nosso backend.
 * - `form-action 'self'`: um formulário injetado não consegue postar senha
 *   para fora.
 * - `object-src 'none'` e `base-uri 'self'`: fecham dois vetores antigos e
 *   ainda funcionais de injeção.
 */
const csp = [
  "default-src 'self'",
  // 'wasm-unsafe-eval' é o que permite compilar o WASM do OCR; 'unsafe-eval'
  // entra só em desenvolvimento, onde o Next precisa dele para o hot reload.
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: ${OCR_CDN}${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  // blob:/data: são a foto tirada pela câmera antes de ir para o OCR.
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' blob: data: ${apiOrigin} ${OCR_CDN}`,
  // O tesseract roda num Web Worker criado a partir de um blob.
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Impede o navegador de "adivinhar" que um arquivo é de outro tipo do que o
  // servidor declarou — como tratar um upload de texto como JavaScript.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Mesma proteção de frame-ancestors, para navegadores antigos que ignoram CSP.
  { key: "X-Frame-Options", value: "DENY" },
  // Não vaza o caminho completo da página (que pode conter identificadores) ao
  // seguir um link para fora.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // A câmera fica liberada de propósito: é a leitura de preço da aba Mercado.
  // Microfone e localização o app nunca usou e não deve poder usar.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
];

if (isProd) {
  // Diz ao navegador para nunca mais acessar este domínio por HTTP, mesmo se
  // alguém digitar ou clicar num link http://. Fica fora do desenvolvimento
  // porque ali o servidor é http://localhost de verdade.
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  });
}

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
