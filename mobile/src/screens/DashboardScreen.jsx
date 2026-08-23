import { useState, useCallback, useRef } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import TopNavBar from "../components/TopNavBar";
import TopTabBar from "../components/TopTabBar";
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
  const scrollRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);

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

  // useFocusEffect (not a plain useEffect) — bottom-tab screens stay
  // mounted when you switch tabs, so a plain mount-only effect would leave
  // this screen showing a stale balance after adding a Mercado purchase on
  // the other tab. Refetching on every focus keeps the two in sync.
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <TopNavBar />
      <TopTabBar active="Dashboard" />
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
          <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <BalanceCard
              balance={summary.balance}
              totalIncome={summary.totalIncome}
              totalExpense={summary.totalExpense}
            />
            <TransactionForm
              onSuccess={loadData}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
            />
            <RecurringTransactionsList recurring={recurring} onChange={loadData} />
            <YearlyChart transactions={transactions} />
            <CurrencyConverter />
            <ClusteredChart transactions={transactions} />
            <CategoryChart transactions={transactions} />
            <TransactionList
              transactions={transactions}
              onDelete={loadData}
              onEdit={(item) => {
                setEditingTransaction(item);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}
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
