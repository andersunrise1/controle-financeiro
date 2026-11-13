import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { AD_UNIT_IDS, shouldShowAds } from "../services/ads";
import { useAuth } from "../context/AuthContext";

/**
 * A faixa de anúncio. Não mostra nada para quem tem o Vitalício, nem no iOS,
 * nem enquanto o plano da conta ainda não foi carregado — ver shouldShowAds.
 *
 * Formato INLINE_ADAPTIVE_BANNER, não o ancorado: este banner vive no meio de
 * um ScrollView, junto do conteúdo. O ancorado (LARGE_ANCHORED_ADAPTIVE) é
 * para faixa fixa grudada no topo ou no rodapé da tela, que não é o caso.
 *
 * Onde ele entra nas telas está explicado em DashboardScreen.
 */
export default function BannerAdSlot() {
  const { access } = useAuth();

  if (!shouldShowAds(access)) return null;

  return (
    <View style={styles.caixa}>
      <BannerAd unitId={AD_UNIT_IDS.banner} size={BannerAdSize.INLINE_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    alignItems: "center",
    // Respiro extra além do `gap` da tela. O item seguinte é a lista de
    // transações, que tem botões de editar e excluir: encostar o anúncio
    // nela convida ao clique errado, que é ruim para o usuário e é
    // exatamente o que o AdMob chama de clique acidental.
    marginVertical: 8,
  },
});
