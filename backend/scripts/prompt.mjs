import readline from "readline";

/**
 * Perguntas no terminal, funcionando tanto para alguém digitando quanto para
 * entrada redirecionada.
 *
 * As duas armadilhas que isto resolve, ambas encontradas na prática:
 *
 * 1. Uma interface de leitura por pergunta não funciona: a primeira consome
 *    todo o buffer de stdin e a segunda espera para sempre.
 *
 * 2. Mesmo com uma interface só, `rl.question` perde linhas quando a entrada
 *    não é um terminal — o readline emite tudo de uma vez, e o que chega entre
 *    uma pergunta e a seguinte é descartado. Por isso, quando stdin não é um
 *    terminal, lemos a entrada inteira de uma vez e respondemos as perguntas a
 *    partir dessa fila.
 *
 * Sem o item 2 os scripts até funcionam para quem digita, mas são impossíveis
 * de testar sem uma pessoa na frente do teclado.
 */
export function criarPerguntador() {
  const interativo = Boolean(process.stdin.isTTY);

  if (!interativo) {
    const fila = lerTudoDaEntrada();
    return {
      async perguntar(texto) {
        const resposta = fila.shift() ?? "";
        // Ecoa a pergunta para o registro ficar legível; a resposta não é
        // ecoada, então uma senha redirecionada também não aparece.
        process.stdout.write(texto + "\n");
        return resposta.trim();
      },
      fechar() {},
    };
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Intercepta a escrita no terminal para conseguir esconder a senha.
  const escreverOriginal = rl._writeToOutput.bind(rl);
  let ocultando = null;
  rl._writeToOutput = (str) => {
    if (ocultando && !str.includes(ocultando)) return;
    escreverOriginal(str);
  };

  return {
    perguntar(texto, oculto = false) {
      return new Promise((resolve) => {
        // A máscara liga ANTES da pergunta. Ligando depois, a ordem se inverte
        // em alguns casos e ela fica presa ligada — o script segue rodando sem
        // imprimir mais nada, parecendo travado.
        if (oculto) ocultando = texto;

        rl.question(texto, (resposta) => {
          if (oculto) {
            ocultando = null;
            process.stdout.write("\n");
          }
          resolve(resposta.trim());
        });
      });
    },
    fechar() {
      rl._writeToOutput = escreverOriginal;
      rl.close();
    },
  };
}

function lerTudoDaEntrada() {
  const fs = require("fs");
  let bruto = "";
  try {
    bruto = fs.readFileSync(0, "utf8");
  } catch {
    bruto = "";
  }
  return bruto.split(/\r?\n/);
}

// `require` não existe num módulo ESM; isto cria um equivalente local só para
// a leitura síncrona de stdin acima, que não tem versão assíncrona conveniente.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
