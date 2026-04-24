import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Divider,
  MD3Theme,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import {
  cancelOrder,
  getMyOrders,
  STATUS_COLORS,
  STATUS_LABELS,
  type Order,
  type OrderItem,
} from "../lib/orders";
import { ScreenHeader, EmptyState } from "../components";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type TabDef = {
  key: string;
  label: string;
  statusIn: string | null;
};

const TABS: TabDef[] = [
  { key: "all", label: "Tất cả", statusIn: null },
  { key: "pending", label: "Chờ xác nhận", statusIn: "PENDING,CONFIRMED" },
  { key: "shipping", label: "Vận chuyển", statusIn: "INPROGRESS,SHIPPED" },
  { key: "delivered", label: "Đã giao", statusIn: "DELIVERED,COMPLETED" },
  { key: "cancelled", label: "Đã hủy", statusIn: "CANCELLED,CANCEL_REQUESTED,RETURNED" },
];

function tabKeyFromStatusIn(statusIn?: string | null): string {
  if (!statusIn) return "all";
  const normalized = statusIn.split(",").map((s) => s.trim()).sort().join(",");
  for (const t of TABS) {
    if (!t.statusIn) continue;
    const a = t.statusIn.split(",").map((s) => s.trim()).sort().join(",");
    if (a === normalized) return t.key;
  }
  return "all";
}

function fmtMoney(n?: number | null) {
  return `₫${(n ?? 0).toLocaleString("vi-VN")}`;
}

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (x: number) => x.toString().padStart(2, "0");
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function canCancel(status?: string | null): boolean {
  if (!status) return false;
  const s = status.replace("OrderStatus.", "");
  return s === "PENDING" || s === "CONFIRMED";
}

function isTerminalComplete(status?: string | null): boolean {
  const s = (status ?? "").replace("OrderStatus.", "");
  return s === "DELIVERED" || s === "COMPLETED";
}

function OrderItemRow({
  item,
  theme,
}: {
  item: OrderItem;
  theme: MD3Theme;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 6,
          backgroundColor: theme.colors.surfaceVariant,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name="book-open-page-variant"
          size={32}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <Text
            numberOfLines={2}
            variant="bodyMedium"
            style={{ fontWeight: "600", color: theme.colors.onSurface }}
          >
            {item.book_title || `Sách #${item.book_id ?? "?"}`}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
          >
            Phân loại: Mặc định
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            x{item.quantity}
          </Text>
          <Text variant="bodyMedium" style={{ fontWeight: "700", color: theme.colors.onSurface }}>
            {fmtMoney(item.price)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function OrderCard({
  order,
  theme,
  onPress,
  onCancel,
  onReview,
  onRebuy,
}: {
  order: Order;
  theme: MD3Theme;
  onPress: () => void;
  onCancel?: () => void;
  onReview?: () => void;
  onRebuy?: () => void;
}) {
  const statusKey = (order.status ?? "").replace("OrderStatus.", "");
  const statusColor = STATUS_COLORS[statusKey] ?? theme.colors.onSurface;
  const statusLabel = STATUS_LABELS[statusKey] ?? statusKey;
  const items = order.order_items ?? [];
  const totalQty = items.reduce((n, it) => n + (it.quantity || 0), 0);

  return (
    <Surface
      elevation={0}
      style={{
        backgroundColor: theme.colors.surface,
        marginBottom: 10,
        borderRadius: 0,
      }}
    >
      <Pressable onPress={onPress}>
        {/* ── Shop / order id row ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
            <MaterialCommunityIcons
              name="storefront-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              variant="titleSmall"
              style={{ fontWeight: "700", color: theme.colors.onSurface }}
              numberOfLines={1}
            >
              KeBook · Đơn #{order.id}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
          <Text
            variant="labelMedium"
            style={{ color: statusColor, fontWeight: "700", textTransform: "uppercase" }}
          >
            {statusLabel}
          </Text>
        </View>

        <Divider />

        {/* ── Items (tối đa 2, item thứ 3 trở đi rút gọn) ── */}
        <View style={{ paddingHorizontal: 14 }}>
          {items.slice(0, 2).map((it, idx) => (
            <View key={it.id ?? idx}>
              {idx > 0 && <Divider />}
              <OrderItemRow item={it} theme={theme} />
            </View>
          ))}
          {items.length > 2 && (
            <View style={{ paddingBottom: 10 }}>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                và {items.length - 2} sản phẩm khác…
              </Text>
            </View>
          )}
          {items.length === 0 && (
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                paddingVertical: 12,
              }}
            >
              (Không có sản phẩm hiển thị)
            </Text>
          )}
        </View>

        <Divider />

        {/* ── Footer: total + date ── */}
        <View
          style={{
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: 10,
            gap: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 6,
            }}
          >
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {totalQty > 0 ? `${totalQty} sản phẩm · ` : ""}Thành tiền:
            </Text>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "800", color: theme.colors.primary }}
            >
              {fmtMoney(order.total_price)}
            </Text>
          </View>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: "right" }}
          >
            {fmtDate(order.order_date)}
          </Text>
        </View>

        {/* ── Action buttons ── */}
        {(onRebuy || onReview || onCancel) && (
          <>
            <Divider />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              {isTerminalComplete(statusKey) && onReview && (
                <ActionButton
                  label="Đánh giá"
                  onPress={onReview}
                  primary
                  theme={theme}
                />
              )}
              {isTerminalComplete(statusKey) && onRebuy && (
                <ActionButton label="Mua lại" onPress={onRebuy} theme={theme} />
              )}
              {canCancel(statusKey) && onCancel && (
                <ActionButton label="Hủy đơn" onPress={onCancel} theme={theme} />
              )}
              <ActionButton label="Chi tiết" onPress={onPress} theme={theme} />
            </View>
          </>
        )}
      </Pressable>
    </Surface>
  );
}

function ActionButton({
  label,
  onPress,
  primary,
  theme,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  theme: MD3Theme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: primary ? theme.colors.primary : theme.colors.outline,
        backgroundColor: primary
          ? theme.colors.primary
          : pressed
            ? theme.colors.surfaceVariant
            : theme.colors.surface,
      })}
    >
      <Text
        variant="labelMedium"
        style={{
          fontWeight: "700",
          color: primary ? theme.colors.onPrimary : theme.colors.onSurface,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TopTabs({
  activeKey,
  onChange,
  theme,
}: {
  activeKey: string;
  onChange: (key: string) => void;
  theme: MD3Theme;
}) {
  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {TABS.map((t) => {
          const active = t.key === activeKey;
          return (
            <Pressable
              key={t.key}
              onPress={() => onChange(t.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderBottomWidth: 2,
                borderBottomColor: active ? theme.colors.primary : "transparent",
              }}
            >
              <Text
                variant="bodyMedium"
                style={{
                  fontWeight: active ? "700" : "500",
                  color: active ? theme.colors.primary : theme.colors.onSurfaceVariant,
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Divider />
    </View>
  );
}

export function OrderHistoryScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, "OrderHistory">>();
  const { token } = useAuth();

  const initialKey = useMemo(
    () => tabKeyFromStatusIn(route.params?.statusIn),
    [route.params?.statusIn],
  );
  const [activeKey, setActiveKey] = useState<string>(initialKey);

  useEffect(() => {
    setActiveKey(tabKeyFromStatusIn(route.params?.statusIn));
  }, [route.params?.statusIn]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const statusIn = useMemo(
    () => TABS.find((t) => t.key === activeKey)?.statusIn ?? null,
    [activeKey],
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setOrders(await getMyOrders(token, null, statusIn));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token, statusIn]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onCancel = async (orderId: number) => {
    if (!token || cancelling) return;
    setCancelling(orderId);
    try {
      await cancelOrder(token, orderId);
      await load();
    } catch {
      /* ignore */
    } finally {
      setCancelling(null);
    }
  };

  const onReview = (orderId: number, bookId: number) => {
    nav.navigate("WriteReview", { bookId, orderId });
  };

  const onRebuy = (order: Order) => {
    const items = (order.order_items ?? [])
      .filter((it) => it.book_id != null)
      .map((it) => ({ bookId: it.book_id!, quantity: it.quantity || 1 }));
    nav.navigate("Checkout", { mode: "single", items });
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title="Đơn hàng của tôi"
        rightIcon="chart-box-outline"
        rightLabel="Thống kê"
        onRight={() => nav.navigate("OrderStats")}
      />

      <TopTabs activeKey={activeKey} onChange={setActiveKey} theme={theme} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="package-variant"
          title="Chưa có đơn nào"
          description="Mua sách yêu thích và theo dõi đơn ngay tại đây."
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => String(o.id)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => {
            const firstBookId = (item.order_items ?? []).find(
              (x) => x.book_id != null,
            )?.book_id;
            return (
              <OrderCard
                order={item}
                theme={theme}
                onPress={() => nav.navigate("OrderDetail", { orderId: item.id })}
                onCancel={canCancel(item.status) ? () => onCancel(item.id) : undefined}
                onReview={
                  isTerminalComplete(item.status) && firstBookId != null
                    ? () => onReview(item.id, firstBookId)
                    : undefined
                }
                onRebuy={isTerminalComplete(item.status) ? () => onRebuy(item) : undefined}
              />
            );
          }}
        />
      )}
    </Surface>
  );
}
