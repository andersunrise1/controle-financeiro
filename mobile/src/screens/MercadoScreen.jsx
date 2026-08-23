import { useState, useCallback, useRef } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import TopNavBar from "../components/TopNavBar";
import TopTabBar from "../components/TopTabBar";
import MercadoQuickAdd from "../components/MercadoQuickAdd";
import MercadoFilter from "../components/MercadoFilter";
import MercadoMonthlyChart from "../components/MercadoMonthlyChart";
import MercadoChart from "../components/MercadoChart";
import TransactionList from "../components/TransactionList";
import { getTransactions } from "../services/api";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";
import { getMercadoTransactions, getMercadoYears, filterMercadoByScope } from "../lib/mercadoGrouping";

// Mirrors app/mercado/page.tsx.
export default function MercadoScreen() {
  const { t } = useLocale();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const scrollRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

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

  const mercadoTransactions = getMercadoTransactions(transactions);
  const years = getMercadoYears(transactions);
  // Defaults to the most recent year with actual purchases, falling back to
  // the current year for a brand new account with none yet.
  const year = selectedYear ?? years[0] ?? new Date().getFullYear();
  const scopedTransactions = filterMercadoByScope(transactions, year, selectedMonth);

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
          <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <MercadoQuickAdd
              transactions={transactions}
              onSuccess={loadData}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
            />

            {years.length > 0 && (
              <MercadoFilter
                years={years}
                year={year}
                onYearChange={setSelectedYear}
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            )}

            <MercadoMonthlyChart transactions={mercadoTransactions} year={year} />
            <MercadoChart transactions={scopedTransactions} />

            <TransactionList
              transactions={scopedTransactions}
              onDelete={loadData}
              onEdit={(item) => {
                setEditingTransaction(item);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}
              titleKey="mercadoHistoryTitle"
              emptyKey="mercadoHistoryEmpty"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
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
}
