import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — Divisa",
  description:
    "Quais dados o Divisa coleta, para que servem e como pedir a exclusão da sua conta.",
};

const LAST_UPDATED = "22 de setembro de 2026";
const CONTACT_EMAIL = "andersunrise1@gmail.com";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-[color:var(--text-primary)]">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-[color:var(--text-secondary)] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-bg-dark px-6 py-14">
      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">
          Divisa · Última atualização: {LAST_UPDATED}
        </p>

        <p className="mt-6 text-[color:var(--text-secondary)] leading-relaxed">
          O Divisa é um aplicativo de controle financeiro pessoal. Esta página
          explica, em português claro, exatamente quais dados o aplicativo
          guarda, por que os guarda e como você pode removê-los.
        </p>

        <Section title="Quais dados coletamos">
          <p>
            Só coletamos o que você digita no aplicativo. Não há nenhuma coleta
            automática ou em segundo plano.
          </p>
          <ul className="ml-5 list-disc flex flex-col gap-2">
            <li>
              <strong className="text-[color:var(--text-primary)]">
                Dados da conta:
              </strong>{" "}
              seu nome, seu e-mail e sua senha. A senha nunca é guardada como
              texto — apenas um resumo criptográfico (bcrypt) dela, que não
              pode ser revertido.
            </li>
            <li>
              <strong className="text-[color:var(--text-primary)]">
                Seus lançamentos financeiros:
              </strong>{" "}
              tipo (entrada ou saída), valor, descrição, categoria, data e, nas
              compras de mercado, a quantidade e a unidade do produto.
            </li>
            <li>
              <strong className="text-[color:var(--text-primary)]">
                Suas recorrências:
              </strong>{" "}
              as regras de lançamentos que se repetem (semanal, mensal ou
              anual).
            </li>
            <li>
              <strong className="text-[color:var(--text-primary)]">
                Mensagens de feedback:
              </strong>{" "}
              apenas se você escolher enviar uma pela tela de feedback.
            </li>
          </ul>
        </Section>

        <Section title="O que NÃO coletamos">
          <ul className="ml-5 list-disc flex flex-col gap-2">
            <li>
              Não pedimos nenhuma permissão do seu aparelho: sem localização,
              sem contatos, sem câmera, sem microfone, sem fotos.
            </li>
            <li>
              Não usamos ferramentas de análise, rastreamento ou publicidade.
              Não há SDK de terceiros de nenhum tipo no aplicativo.
            </li>
            <li>
              Não há identificador de publicidade, nem perfil de comportamento.
            </li>
            <li>
              Não nos conectamos ao seu banco. O Divisa não importa extratos nem
              acessa nenhuma conta bancária — tudo que aparece no aplicativo foi
              digitado por você.
            </li>
          </ul>
        </Section>

        <Section title="Para que usamos esses dados">
          <p>
            Exclusivamente para mostrar a você os seus próprios dados: saldo,
            gráficos, histórico e recorrências. Nada mais.
          </p>
          <p className="font-semibold text-[color:var(--text-primary)]">
            Não vendemos, não alugamos e não compartilhamos seus dados
            financeiros com ninguém.
          </p>
        </Section>

        <Section title="Onde os dados ficam guardados">
          <p>
            Seus dados ficam em um banco de dados hospedado na Railway, que
            fornece a infraestrutura de servidor e armazenamento. A versão web
            é hospedada na Vercel. Ambas são prestadoras de serviço de
            infraestrutura e não usam seus dados para outra finalidade.
          </p>
          <p>
            No seu aparelho, guardamos apenas o token da sua sessão (para você
            não precisar digitar a senha toda vez) e o seu nome e e-mail, para
            que o aplicativo abra corretamente mesmo sem internet.
          </p>
        </Section>

        <Section title="Serviços de terceiros">
          <p>
            O aplicativo consulta cotações de moedas no serviço público{" "}
            <span className="text-[color:var(--text-primary)]">
              open.er-api.com
            </span>
            . Essa consulta é feita pelo nosso servidor, não pelo seu aparelho,
            e envia apenas o pedido de cotação —{" "}
            <strong className="text-[color:var(--text-primary)]">
              nenhum dado seu é enviado a esse serviço
            </strong>
            .
          </p>
        </Section>

        <Section title="Exclusão da sua conta e dos seus dados">
          <p>
            Você pode pedir a exclusão completa da sua conta a qualquer momento,
            escrevendo para{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Excluir%20minha%20conta%20Divisa`}
              className="font-semibold text-neon-green underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            a partir do e-mail cadastrado na conta.
          </p>
          <p>
            A exclusão remove definitivamente seu cadastro, todos os seus
            lançamentos, suas recorrências e seus feedbacks. Não fica cópia. O
            pedido é atendido em até 30 dias.
          </p>
        </Section>

        <Section title="Segurança">
          <p>
            Toda a comunicação entre o aplicativo e o servidor é criptografada
            (HTTPS). As senhas são guardadas com bcrypt e o acesso à sua conta é
            feito por um token que expira em 7 dias.
          </p>
        </Section>

        <Section title="Crianças">
          <p>
            O Divisa não se destina a menores de 13 anos e não coleta
            intencionalmente dados de crianças.
          </p>
        </Section>

        <Section title="Mudanças nesta política">
          <p>
            Se esta política mudar, a data de &quot;última atualização&quot; no
            topo desta página será alterada. Mudanças relevantes serão avisadas
            dentro do aplicativo.
          </p>
        </Section>

        <Section title="Contato">
          <p>
            Dúvidas sobre privacidade ou sobre seus dados:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-neon-green underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>

        <div className="mt-12 border-t border-[color:var(--card-border,#555)] pt-6">
          <Link
            href="/login"
            className="text-sm text-[color:var(--text-muted)] underline"
          >
            ← Voltar para o Divisa
          </Link>
        </div>
      </article>
    </main>
  );
}
