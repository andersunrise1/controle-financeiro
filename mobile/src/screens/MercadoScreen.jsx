import { useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import TopNavBar from "../components/TopNavBar";
import TopTabBar from "../components/TopTabBar";
import MercadoQuickAdd from "../components/MercadoQuickAdd";
import MercadoChart from "../components/MercadoChart";
import TransactionList from "../components/TransactionList";
import { getTransactions } from "../services/api";
import { useLocale } from "../context/LocaleContext";
import { colors } from "../theme";

const MERCADO_CATEGORY = "Mercado";

// Mirrors app/mercado/page.tsx.
export default function MercadoScreen() {
  const { t } = useLocale();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions(data.transactions);
    } finally {
      setLoading(false);
    }
  }, []);

  // useFocusEffect, same reasoning as DashboardScreen — bottom-tab screens
  // stay mounted on tab switch, so this needs to refetch on every focus
  // (not just first mount) to reflect a transaction added on Dashboard.
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const mercadoTransactions = transactions.filter((t) => t.category === MERCADO_CATEGORY);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <TopNavBar />
      <TopTabBar active="Mercado" />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.neonGreen} size="large" />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <MercadoQuickAdd transactions={transactions} onSuccess={loadData} />
            <MercadoChart transactions={mercadoTransactions} />
            <TransactionList
              transactions={mercadoTransactions}
              onDelete={loadData}
              titleKey="mercadoHistoryTitle"
              emptyKey="mercadoHistoryEmpty"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
