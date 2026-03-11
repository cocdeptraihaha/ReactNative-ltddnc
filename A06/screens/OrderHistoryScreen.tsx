import { useCallback, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Chip,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import {
  getMyOrders,
  STATUS_LABELS,
  STATUS_COLORS,
  type Order,
} from "../lib/orders";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FILTERS: { label: string; value: string | null }[] = [
  { label: "Tất cả", value: null },
  { label: "Đơn mới", value: "PENDING" },
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Đang giao", value: "SHIPPED" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export function OrderHistoryScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setOrders(await getMyOrders(token, filter));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const fmtDate = (d?: string | null) => {
    if (!d) return "";
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, "0")}/${(dt.getMonth() + 1).toString().padStart(2, "0")}/${dt.getFullYear()} ${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`;
  };

  const fmtPrice = (p?: number | null) =>
    (p ?? 0).toLocaleString("vi-VN") + " đ";

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => nav.goBack()} />
        <Appbar.Content title="Lịch sử đơn hàng" />
      </Appbar.Header>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 6,
        }}
      >
        {FILTERS.map((f) => (
          <Chip
            key={f.value ?? "all"}
            selected={filter === f.value}
            onPress={() => setFilter(f.value)}
            mode={filter === f.value ? "flat" : "outlined"}
            compact
          >
            {f.label}
          </Chip>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Không có đơn hàng nào
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => String(o.id)}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const statusKey = item.status ?? "";
            const color = STATUS_COLORS[statusKey] ?? theme.colors.onSurface;
            return (
              <Pressable
                onPress={() =>
                  nav.navigate("OrderDetail" as any, { orderId: item.id })
                }
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.outlineVariant,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                    Đơn #{item.id}
                  </Text>
                  <Text
                    variant="labelMedium"
                    style={{ color, fontWeight: "700" }}
                  >
                    {STATUS_LABELS[statusKey] ?? statusKey}
                  </Text>
                </View>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {fmtDate(item.order_date)}
                </Text>
                <Text
                  variant="titleSmall"
                  style={{
                    color: theme.colors.primary,
                    fontWeight: "700",
                    marginTop: 4,
                  }}
                >
                  {fmtPrice(item.total_price)}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </Surface>
  );
}
