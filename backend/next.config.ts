import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Cabeçalhos de segurança da API.
 *
 * Mais curto que o do site de propósito: aqui não há página para embutir num
 * iframe nem script para restringir — toda resposta é JSON. Uma CSP completa
 * não teria o que proteger.
 *
 * O CORS, que é a defesa que importa nesta camada, é tratado por lib/cors.ts,
 * por rota, porque precisa devolver a origem exata que fez o pedido.
 */
const securityHeaders = [
  // Impede o navegador de reinterpretar uma resposta JSON como HTML ou script —
  // a base do ataque em que um dado gravado pelo usuário volta sendo executado.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

if (isProd) {
  // A API carrega token de sessão em cabeçalho e cookie: uma única requisição
  // que escape para HTTP entrega os dois a quem estiver ouvindo a rede.
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
