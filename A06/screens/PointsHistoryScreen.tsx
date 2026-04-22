import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getMyPointTransactions, type PointTransaction } from "../lib/points";

export function PointsHistoryScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();
  const [rows, setRows] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMyPointTransactions(token, { limit: 100 });
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      setRows(await getMyPointTransactions(token, { limit: 100 }));
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  if (!token) {
    return (
      <Surface style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Lịch sử điểm" />
        </Appbar.Header>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Lịch sử điểm" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Chưa có giao dịch điểm.
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.outlineVariant,
              }}
            >
              <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                {item.delta > 0 ? `+${item.delta}` : String(item.delta)} điểm
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                {item.reason}
                {item.ref_type ? ` · ${item.ref_type}` : ""}
              </Text>
              <Text variant="labelSmall" style={{ marginTop: 4, color: theme.colors.primary }}>
                Số dư sau: {item.balance_after}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.outline, marginTop: 2 }}>
                {item.created_at}
              </Text>
            </View>
          )}
        />
      )}
    </Surface>
  );
}
