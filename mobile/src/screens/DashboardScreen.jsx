import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopNavBar from "../components/TopNavBar";
import BalanceCard from "../components/BalanceCard";
import TransactionForm from "../components/TransactionForm";
import RecurringTransactionsList from "../components/RecurringTransactionsList";
import TransactionList from "../components/TransactionList";
import YearlyChart from "../components/YearlyChart";
import ClusteredChart from "../components/ClusteredChart";
import CategoryChart from "../components/CategoryChart";
import CurrencyConverter from "../components/CurrencyConverter";
import { getTransactions, getRecurringTransactions } from "../services/api";
import { useLocale } from "../context/LocaleContext";
import { colors } from "../theme";

// Mirrors app/dashboard/page.tsx's finance-core sections.
export default function DashboardScreen() {
  const { t } = useLocale();
  const [transactions, setTransactions] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [transactionsData, recurringData] = await Promise.all([
        getTransactions(),
        getRecurringTransactions(),
      ]);
      setTransactions(transactionsData.transactions);
      setSummary(transactionsData.summary);
      setRecurring(recurringData.recurring);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <TopNavBar />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.neonGreen} size="large" />
          <Text style={styles.loadingText}>{t("loadingDashboard")}</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <BalanceCard
              balance={summary.balance}
              totalIncome={summary.totalIncome}
              totalExpense={summary.totalExpense}
            />
            <TransactionForm onSuccess={loadData} />
            <RecurringTransactionsList recurring={recurring} onChange={loadData} />
            <YearlyChart transactions={transactions} />
            <CurrencyConverter />
            <ClusteredChart transactions={transactions} />
            <CategoryChart transactions={transactions} />
            <TransactionList transactions={transactions} onDelete={loadData} />
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
    gap: 10,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
