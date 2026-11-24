import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Serviço — Divisa",
  description:
    "As regras de uso do Divisa: conta, pagamento único, anúncios, cancelamento e responsabilidades.",
};

const LAST_UPDATED = "24 de novembro de 2026";
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

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-bg-dark px-6 py-14">
      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
          Termos de Serviço
        </h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">
          Divisa · Última atualização: {LAST_UPDATED}
        </p>

        <p className="mt-6 text-[color:var(--text-secondary)] leading-relaxed">
          Estas são as regras de uso do Divisa, escritas em português claro. Ao
          criar uma conta, você concorda com elas. Se discordar de alguma parte,
          basta não usar o serviço — e, se já tiver conta, você pode apagá-la a
          qualquer momento.
        </p>

        <Section title="O que o Divisa é">
          <p>
            O Divisa é um aplicativo de anotação financeira pessoal. Ele registra
            o que você digita: entradas, saídas, compras de mercado e contas que
            se repetem. A partir disso, mostra saldo, histórico e gráficos.
          </p>
          <p>
            <strong>O Divisa não é uma instituição financeira.</strong> Ele não
            empresta dinheiro, não investe, não processa pagamentos entre pessoas
            e não se conecta ao seu banco. Nada do que aparece no aplicativo vem
            de outro lugar que não seja você.
          </p>
          <p>
            Os números e gráficos são uma organização do que você anotou, não
            aconselhamento financeiro. As decisões sobre o seu dinheiro são suas.
          </p>
        </Section>

        <Section title="Sua conta">
          <p>
            É necessário criar uma conta com e-mail e senha. Você é responsável
            por manter sua senha em segurança e por tudo que for feito na sua
            conta.
          </p>
          <p>
            Use o serviço apenas para o seu próprio controle financeiro, sem
            tentar burlar, sobrecarregar ou acessar dados de outras pessoas.
            Contas usadas para isso podem ser encerradas.
          </p>
          <p>
            Você pode apagar sua conta e todos os seus dados quando quiser, pelo
            próprio aplicativo ou pela página{" "}
            <Link href="/conta" className="text-blue-400 underline">
              Conta
            </Link>
            . A exclusão é definitiva.
          </p>
        </Section>

        <Section title="Preço, anúncios e pagamento">
          <p>
            <strong>O Divisa é gratuito e se mantém com anúncios.</strong> Nada é
            bloqueado depois de um período: você usa todos os recursos, sempre.
          </p>
          <p>
            Existe uma compra opcional, de <strong>R$ 19,90, paga uma única
            vez</strong>, que remove os anúncios para sempre. Não é assinatura:
            não há cobrança recorrente, renovação automática nem mensalidade.
          </p>
          <p>
            O pagamento é processado pelo Mercado Pago. Os dados do seu cartão
            são informados no ambiente deles e <strong>nunca passam pelos nossos
            servidores</strong>.
          </p>
          <p>
            A compra vale para a sua conta, não para o aparelho: ela funciona no
            site e no aplicativo, em quantos dispositivos você usar.
          </p>
        </Section>

        <Section title="Arrependimento e reembolso">
          <p>
            Pelo Código de Defesa do Consumidor (artigo 49), você pode desistir
            da compra em até <strong>7 dias corridos</strong> a partir do
            pagamento e receber o valor de volta, sem precisar justificar.
          </p>
          <p>
            Para pedir, escreva para {CONTACT_EMAIL} a partir do e-mail da conta.
            O reembolso é feito pelo mesmo meio do pagamento, e os anúncios
            voltam a aparecer.
          </p>
        </Section>

        <Section title="Disponibilidade do serviço">
          <p>
            Fazemos o possível para manter o Divisa no ar, mas ele é oferecido
            &quot;como está&quot;. Pode haver interrupções para manutenção, falhas
            de terceiros dos quais dependemos (hospedagem, provedor de pagamento)
            ou problemas imprevistos.
          </p>
          <p>
            Os dados que você registra ficam no nosso servidor e são copiados
            periodicamente, mas nenhum sistema é infalível. Se seus registros
            forem importantes, vale manter sua própria cópia.
          </p>
          <p>
            Recursos podem ser alterados ou descontinuados. Se algo relevante
            mudar, avisaremos pelo aplicativo ou por e-mail. Se o serviço for
            encerrado por completo, avisaremos com antecedência razoável e daremos
            tempo para você exportar o que precisar.
          </p>
        </Section>

        <Section title="Limites de responsabilidade">
          <p>
            O Divisa organiza o que você digitou. Não nos responsabilizamos por
            decisões financeiras tomadas a partir dessas anotações, nem por
            prejuízos decorrentes de erros de digitação, de indisponibilidade
            temporária do serviço ou de uso indevido da sua conta por terceiros
            que tenham obtido sua senha.
          </p>
          <p>
            Nada aqui afasta os direitos que a lei brasileira garante a você como
            consumidor.
          </p>
        </Section>

        <Section title="Seus dados">
          <p>
            O que coletamos, para que serve e como pedir exclusão está detalhado
            na{" "}
            <Link href="/privacidade" className="text-blue-400 underline">
              Política de Privacidade
            </Link>
            , que faz parte destes termos.
          </p>
        </Section>

        <Section title="Mudanças nestes termos">
          <p>
            Estes termos podem ser atualizados. A data no topo da página sempre
            mostra a última versão. Mudanças que afetem seus direitos de forma
            relevante serão avisadas com antecedência.
          </p>
        </Section>

        <Section title="Lei aplicável e contato">
          <p>
            Estes termos seguem a lei brasileira, e fica eleito o foro da comarca
            de domicílio do consumidor para resolver qualquer questão.
          </p>
          <p>
            Dúvidas, pedidos de reembolso ou problemas: {CONTACT_EMAIL}.
          </p>
        </Section>

        <div className="mt-12">
          <Link href="/" className="text-blue-400 underline">
            Voltar para o início
          </Link>
        </div>
      </article>
    </main>
  );
}
