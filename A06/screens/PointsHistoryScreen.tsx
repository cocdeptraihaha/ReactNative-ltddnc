import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
  ActivityIndicator,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getMyPoints, getMyPointTransactions, type PointTransaction } from "../lib/points";
import { ScreenHeader, EmptyState } from "../components";

const REASON_LABELS: Record<string, string> = {
  REVIEW_REWARD: "Thưởng đánh giá",
  ORDER_REWARD: "Thưởng đơn hàng",
  REDEEM: "Đổi voucher",
  REDEEM_VOUCHER: "Đổi voucher",
  ORDER_CHECKOUT_REDEEM: "Dùng điểm khi mua hàng",
  ADMIN_ADJUST: "Điều chỉnh admin",
  ADJUSTMENT: "Điều chỉnh",
};

function formatDate(s: string) {
  try {
    const d = new Date(s);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return s;
  }
}

export function PointsHistoryScreen() {
  const theme = useTheme();
  const nav = useNavigation();
  const { token } = useAuth();
  const [rows, setRows] = useState<PointTransaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [list, bal] = await Promise.all([
        getMyPointTransactions(token, { limit: 100 }),
        getMyPoints(token).catch(() => ({ balance: 0 })),
      ]);
      setRows(list);
      setBalance(bal.balance);
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
      const [list, bal] = await Promise.all([
        getMyPointTransactions(token, { limit: 100 }),
        getMyPoints(token).catch(() => ({ balance })),
      ]);
      setRows(list);
      setBalance(bal.balance);
    } finally {
      setRefreshing(false);
    }
  }, [token, balance]);

  if (!token) {
    return (
      <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Lịch sử điểm" />
        <EmptyState icon="star-outline" title="Đăng nhập để xem lịch sử điểm" />
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Lịch sử điểm tích lũy" />

      {/* Banner */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 14,
          padding: 14,
          borderRadius: 12,
          backgroundColor: theme.colors.primary,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="star-circle" size={26} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="labelSmall" style={{ color: "#fff", opacity: 0.85 }}>
            Số dư hiện tại
          </Text>
          <Text variant="headlineSmall" style={{ color: "#fff", fontWeight: "800" }}>
            {balance.toLocaleString("vi-VN")} điểm
          </Text>
        </View>
        <Text
          variant="labelSmall"
          style={{
            color: "#fff",
            opacity: 0.85,
            textAlign: "right",
            paddingHorizontal: 4,
          }}
          onPress={() => (nav as any).navigate("Rewards")}
        >
          Đổi voucher →
        </Text>
      </View>

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
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32,
            gap: 8,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <EmptyState
              icon="history"
              title="Chưa có giao dịch"
              description="Mua sách hoặc đánh giá để bắt đầu tích lũy điểm."
            />
          }
          renderItem={({ item }) => <TxRow tx={item} theme={theme} />}
        />
      )}
    </Surface>
  );
}

function TxRow({
  tx,
  theme,
}: {
  tx: PointTransaction;
  theme: ReturnType<typeof useTheme>;
}) {
  const positive = tx.delta > 0;
  const color = positive ? "#1B7A3A" : theme.colors.error;
  const bg = positive ? "#E6F4EA" : "#FDECEA";
  const label = REASON_LABELS[tx.reason] ?? tx.reason ?? "Giao dịch điểm";
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        padding: 12,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name={positive ? "arrow-up-bold" : "arrow-down-bold"}
          size={20}
          color={color}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ fontWeight: "700" }} numberOfLines={1}>
          {label}
        </Text>
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
        >
          {formatDate(tx.created_at)}
          {tx.ref_type ? ` · ${tx.ref_type}` : ""}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text variant="titleSmall" style={{ color, fontWeight: "800" }}>
          {positive ? `+${tx.delta}` : tx.delta}
        </Text>
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
        >
          Số dư: {tx.balance_after}
        </Text>
      </View>
    </View>
  );
}
