import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useInterstitialAd } from "react-native-google-mobile-ads";
import { AD_UNIT_IDS, shouldShowAds } from "../services/ads";

/**
 * Anúncio de tela cheia depois de salvar um lançamento.
 *
 * Por que depois de salvar, e não em outro momento: é o único ponto do app em
 * que a pessoa terminou o que vinha fazer. Anúncio no meio de digitar um
 * valor, ou ao abrir o app, atrapalha o uso — num app de finanças a pessoa
 * entra para lançar R$ 12 de pão e sair.
 *
 * Por que com intervalo mínimo: quem organiza as contas lança várias coisas
 * de uma vez. Sem o intervalo, seriam cinco telas cheias em dois minutos, o
 * caminho mais curto para desinstalar o app.
 *
 * Usado só no DashboardScreen. O Mercado também salva lançamento, mas ter o
 * mesmo anúncio pré-carregado nas duas telas (que ficam montadas juntas, por
 * serem abas) significaria pedir dois anúncios para um intervalo que só
 * permite exibir um — e pedido que não vira exibição piora o "match rate" da
 * conta no AdMob. O Mercado fica só com a faixa.
 */
const INTERVALO_MINIMO_HORAS = 4;
const CHAVE_ULTIMA_EXIBICAO = "divisa:ultimoAnuncioTelaCheia";

async function passouDoIntervalo() {
  try {
    const bruto = await AsyncStorage.getItem(CHAVE_ULTIMA_EXIBICAO);
    if (!bruto) return true;
    const ultima = Number(bruto);
    if (!Number.isFinite(ultima)) return true;
    return Date.now() - ultima >= INTERVALO_MINIMO_HORAS * 60 * 60 * 1000;
  } catch {
    // Se não é possível ler, não é possível respeitar o intervalo — e aí a
    // alternativa seria mostrar tela cheia a cada lançamento. Melhor não
    // mostrar nenhuma.
    return false;
  }
}

export function useSaveInterstitialAd(access) {
  const habilitado = shouldShowAds(access);
  const [intervaloLiberado, setIntervaloLiberado] = useState(false);

  // Consulta o intervalo ANTES de pedir o anúncio, e não depois: pedir um
  // anúncio que o intervalo vai barrar na hora de exibir é justamente o
  // pedido-sem-exibição que estraga o match rate.
  useEffect(() => {
    if (!habilitado) return undefined;
    let vivo = true;
    passouDoIntervalo().then((liberado) => {
      if (vivo) setIntervaloLiberado(liberado);
    });
    return () => {
      vivo = false;
    };
  }, [habilitado]);

  // adUnitId nulo quando não deve haver anúncio (Vitalício, iOS, plano ainda
  // não carregado, intervalo não cumprido): sem isso o hook carregaria um
  // anúncio que nunca seria exibido, gastando dados de quem pagou para não
  // ver anúncio.
  const pedirAnuncio = habilitado && intervaloLiberado;
  const { status, show } = useInterstitialAd({
    adUnitId: pedirAnuncio ? AD_UNIT_IDS.interstitial : null,
    autoLoad: pedirAnuncio,
  });

  // De propósito não recarrega depois de exibir: o próximo só poderia
  // aparecer 4 horas mais tarde, e é raro alguém ficar esse tempo com o app
  // aberto. O seguinte carrega na próxima abertura, quando o intervalo é
  // consultado de novo — mais simples e sem anúncio parado na memória.
  const mostrarSePuder = useCallback(async () => {
    if (status !== "loaded") return false;

    // Marca ANTES de exibir, de propósito. Se a exibição falhar depois disso,
    // perde-se um anúncio; na ordem inversa, duas chamadas quase simultâneas
    // exibiriam duas telas cheias seguidas. Errar para menos anúncio.
    try {
      await AsyncStorage.setItem(CHAVE_ULTIMA_EXIBICAO, String(Date.now()));
    } catch {
      // Sem conseguir gravar, não há como garantir o intervalo na próxima
      // vez. Não exibe — mesma escolha de passouDoIntervalo.
      return false;
    }
    show();
    return true;
  }, [status, show]);

  return { mostrarSePuder };
}
