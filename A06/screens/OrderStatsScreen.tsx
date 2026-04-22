import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Chip,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { getMyOrderStats, type OrderMoneyStats } from "../lib/orderStats";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BUCKET_STATUS_IN: Record<string, string> = {
  pending_confirm: "PENDING,CONFIRMED",
  shipping: "INPROGRESS,SHIPPED",
  delivered: "DELIVERED,COMPLETED",
  cancelled: "CANCELLED,CANCEL_REQUESTED,RETURNED",
};

function fmtMoney(n: number) {
  return (n ?? 0).toLocaleString("vi-VN") + " đ";
}

function StatCard({
  title,
  count,
  total,
  onPress,
}: {
  title: string;
  count: number;
  total: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress}>
      <Surface
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          marginBottom: 12,
        }}
        elevation={1}
      >
        <Text variant="titleMedium" style={{ fontWeight: "700", color: theme.colors.onSurface }}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          {count} đơn · {fmtMoney(total)}
        </Text>
      </Surface>
    </Pressable>
  );
}

export function OrderStatsScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const { token } = useAuth();
  const [range, setRange] = useState<"30" | "90" | "all">("all");
  const [stats, setStats] = useState<OrderMoneyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const rangeOpts = useMemo(() => {
    if (range === "all") return {};
    const to = new Date();
    const from = new Date();
    if (range === "30") from.setDate(from.getDate() - 30);
    if (range === "90") from.setDate(from.getDate() - 90);
    return { from, to };
  }, [range]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setStats(await getMyOrderStats(token, rangeOpts));
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [token, rangeOpts]);

  useEffect(() => {
    void load();
  }, [load]);

  const goHistory = (key: keyof typeof BUCKET_STATUS_IN) => {
    nav.navigate("OrderHistory", { statusIn: BUCKET_STATUS_IN[key] });
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => nav.goBack()} color={theme.colors.onPrimary} />
        <Appbar.Content
          title="Thống kê mua hàng"
          titleStyle={{ color: theme.colors.onPrimary, fontWeight: "700" }}
        />
      </Appbar.Header>

      <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 }}>
        <Chip selected={range === "30"} onPress={() => setRange("30")} mode="flat">
          30 ngày
        </Chip>
        <Chip selected={range === "90"} onPress={() => setRange("90")} mode="flat">
          90 ngày
        </Chip>
        <Chip selected={range === "all"} onPress={() => setRange("all")} mode="flat">
          Tất cả
        </Chip>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : !stats ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Không tải được dữ liệu.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 32 }}>
          <StatCard
            title="Chờ xác nhận"
            count={stats.pending_confirm.count}
            total={stats.pending_confirm.total}
            onPress={() => goHistory("pending_confirm")}
          />
          <StatCard
            title="Đang giao"
            count={stats.shipping.count}
            total={stats.shipping.total}
            onPress={() => goHistory("shipping")}
          />
          <StatCard
            title="Đã giao"
            count={stats.delivered.count}
            total={stats.delivered.total}
            onPress={() => goHistory("delivered")}
          />
          <Surface
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: theme.colors.primaryContainer,
              marginBottom: 12,
            }}
            elevation={0}
          >
            <Text variant="titleMedium" style={{ fontWeight: "700" }}>
              Tổng đã chi (đã giao)
            </Text>
            <Text variant="headlineSmall" style={{ marginTop: 8, fontWeight: "700" }}>
              {fmtMoney(stats.total_spent)}
            </Text>
          </Surface>
          <StatCard
            title="Đã huỷ / trả"
            count={stats.cancelled.count}
            total={stats.cancelled.total}
            onPress={() => goHistory("cancelled")}
          />
        </ScrollView>
      )}
    </Surface>
  );
}
