import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useLocale } from "../context/LocaleContext";
import { fill } from "../lib/i18n";
import { useAuth } from "../context/AuthContext";

/**
 * Avisa que o teste está acabando, ou que já acabou.
 *
 * **Sem preço, sem botão de compra e sem link para o site — de propósito.** O
 * Google exige o faturamento da própria Play Store para conteúdo digital
 * comprado dentro de um app da loja, e mandar o usuário pagar por fora
 * (inclusive apontando para uma página onde ele pagaria) é motivo de suspensão.
 * O equivalente no site tem o botão; aqui o app só informa o estado e diz onde
 * a ativação acontece, sem levar ninguém até lá.
 *
 * Quem cuidar disto depois: acrescentar um botão, um preço ou um link aqui é
 * justamente o que não pode ser feito.
 */
export default function TrialNotice() {
  const { access } = useAuth();
  const { colors } = useTheme();
  const { t } = useLocale();

  if (!access || access.plan === "lifetime") return null;
  if (access.active && !access.shouldWarn) return null;

  const vencido = !access.active;
  const dias = access.trialDaysLeft ?? 0;

  const mensagem = vencido
    ? t("trialNoticeEnded")
    : dias <= 1
      ? t("trialNoticeWarnLast")
      : fill(t("trialNoticeWarn"), { n: dias });

  // Vencido é vermelho porque algo deixou de funcionar; faltando dias é
  // amarelo, um lembrete.
  const cor = vencido ? colors.accentRedText : colors.warningText;
  const rgb = vencido ? "255, 7, 58" : "255, 217, 61";

  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: `rgba(${rgb}, 0.1)`,
          borderColor: `rgba(${rgb}, 0.4)`,
        },
      ]}
    >
      <Text style={[styles.message, { color: cor }]}>{mensagem}</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {t("trialNoticeWhere")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  message: {
    fontSize: 13,
    fontWeight: "600",
  },
  hint: {
    fontSize: 11,
  },
});
