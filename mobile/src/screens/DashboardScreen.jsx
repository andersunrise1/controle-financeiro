import { useState, useEffect, useCallback } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopNavBar from "../components/TopNavBar";
import BalanceCard from "../components/BalanceCard";
import TransactionForm from "../components/TransactionForm";
import RecurringTransactionsList from "../components/RecurringTransactionsList";
import TransactionList from "../components/TransactionList";
import { getTransactions, getRecurringTransactions } from "../services/api";
import { colors } from "../theme";

// Mirrors app/dashboard/page.tsx's finance-core sections. The 4 charts and
// the currency converter are Etapa 3/4 of the mobile roadmap — deliberately
// not here yet, not an oversight.
export default function DashboardScreen() {
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
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <BalanceCard
            balance={summary.balance}
            totalIncome={summary.totalIncome}
            totalExpense={summary.totalExpense}
          />
          <TransactionForm onSuccess={loadData} />
          <RecurringTransactionsList recurring={recurring} onChange={loadData} />
          <TransactionList transactions={transactions} onDelete={loadData} />
        </ScrollView>
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
