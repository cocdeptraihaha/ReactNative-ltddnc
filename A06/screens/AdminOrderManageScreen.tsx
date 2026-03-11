import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Chip,
  Divider,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import {
  adminListOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  type Order,
  type OrderStatusHistory,
} from "../lib/orders";

const FILTERS: { label: string; value: string | null }[] = [
  { label: "Tất cả", value: null },
  { label: "Đơn mới", value: "PENDING" },
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Đang chuẩn bị", value: "INPROGRESS" },
  { label: "Đang giao", value: "SHIPPED" },
  { label: "Yêu cầu hủy", value: "CANCEL_REQUESTED" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["INPROGRESS", "CANCELLED"],
  INPROGRESS: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  CANCEL_REQUESTED: ["CANCELLED", "INPROGRESS"],
};

export function AdminOrderManageScreen() {
  const theme = useTheme();
  const nav = useNavigation();
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [desc, setDesc] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setOrders(await adminListOrders(token, filter));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openDetail = async (orderId: number) => {
    if (!token) return;
    setDetailLoading(true);
    setSelectedOrder(null);
    try {
      const o = await adminGetOrder(token, orderId);
      setSelectedOrder(o);
    } catch {
      Alert.alert("Lỗi", "Không thể tải chi tiết đơn");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!token || !selectedOrder) return;
    setUpdating(true);
    try {
      await adminUpdateOrderStatus(
        token,
        selectedOrder.id,
        newStatus,
        desc.trim() || undefined,
      );
      Alert.alert("Thành công", `Đã chuyển sang ${STATUS_LABELS[newStatus] ?? newStatus}`);
      setSelectedOrder(null);
      setDesc("");
      load();
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const fmtDate = (d?: string | null) => {
    if (!d) return "";
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, "0")}/${(dt.getMonth() + 1).toString().padStart(2, "0")}/${dt.getFullYear()} ${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`;
  };

  const fmtPrice = (p?: number | null) =>
    (p ?? 0).toLocaleString("vi-VN") + " đ";

  const statusKey = selectedOrder?.status ?? "";
  const nextStatuses = NEXT_STATUSES[statusKey] ?? [];

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => nav.goBack()} />
        <Appbar.Content title="Quản lý đơn hàng" />
      </Appbar.Header>

      {/* ── Filters ── */}
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

      {/* ── List ── */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => String(o.id)}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const sk = item.status ?? "";
            const color = STATUS_COLORS[sk] ?? theme.colors.onSurface;
            return (
              <Pressable
                onPress={() => openDetail(item.id)}
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
                    marginBottom: 4,
                  }}
                >
                  <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                    Đơn #{item.id}
                  </Text>
                  <Text variant="labelMedium" style={{ color, fontWeight: "700" }}>
                    {STATUS_LABELS[sk] ?? sk}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.full_name || `User #${item.user_id ?? "?"}`} · {fmtDate(item.order_date)}
                </Text>
                <Text
                  variant="titleSmall"
                  style={{ color: theme.colors.primary, fontWeight: "700", marginTop: 4 }}
                >
                  {fmtPrice(item.total_price)}
                </Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={{ paddingTop: 40, alignItems: "center" }}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                Không có đơn hàng nào
              </Text>
            </View>
          }
        />
      )}

      {/* ── Detail modal ── */}
      <Portal>
        <Modal
          visible={!!selectedOrder || detailLoading}
          onDismiss={() => {
            setSelectedOrder(null);
            setDesc("");
          }}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            margin: 20,
            borderRadius: 16,
            padding: 20,
            maxHeight: "80%",
          }}
        >
          {detailLoading ? (
            <ActivityIndicator />
          ) : selectedOrder ? (
            <View>
              <Text variant="titleMedium" style={{ fontWeight: "700", marginBottom: 8 }}>
                Đơn #{selectedOrder.id}
              </Text>
              <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                Khách hàng: {selectedOrder.full_name || `User #${selectedOrder.user_id ?? "?"}`}
              </Text>
              <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                Ngày: {fmtDate(selectedOrder.order_date)}
              </Text>
              <Text variant="bodySmall" style={{ marginBottom: 4 }}>
                SĐT: {selectedOrder.phone_number ?? "—"}
              </Text>
              <Text variant="bodySmall" style={{ marginBottom: 8 }}>
                Địa chỉ: {selectedOrder.shipping_address ?? "—"}
              </Text>

              <Text
                variant="labelLarge"
                style={{
                  color: STATUS_COLORS[statusKey] ?? theme.colors.onSurface,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                Trạng thái: {STATUS_LABELS[statusKey] ?? statusKey}
              </Text>

              {/* Items */}
              <Divider style={{ marginBottom: 8 }} />
              {(selectedOrder.order_items ?? []).map((oi) => (
                <View
                  key={oi.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 2,
                  }}
                >
                  <Text variant="bodySmall">{oi.book_title || `#${oi.book_id}`} x{oi.quantity}</Text>
                  <Text variant="bodySmall">{fmtPrice(oi.price * oi.quantity)}</Text>
                </View>
              ))}
              <Divider style={{ marginVertical: 8 }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="titleSmall" style={{ fontWeight: "700" }}>Tổng</Text>
                <Text variant="titleSmall" style={{ fontWeight: "700", color: theme.colors.primary }}>
                  {fmtPrice(selectedOrder.total_price)}
                </Text>
              </View>

              {/* Timeline */}
              {(selectedOrder.status_history ?? []).length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text variant="labelMedium" style={{ fontWeight: "700", marginBottom: 6 }}>
                    Timeline
                  </Text>
                  {[...(selectedOrder.status_history ?? [])]
                    .sort(
                      (a, b) =>
                        new Date(a.status_change_date ?? 0).getTime() -
                        new Date(b.status_change_date ?? 0).getTime(),
                    )
                    .map((h) => (
                      <Text key={h.id} variant="bodySmall" style={{ marginBottom: 2 }}>
                        {fmtDate(h.status_change_date)} — {STATUS_LABELS[h.status ?? ""] ?? h.status}
                        {h.description ? ` (${h.description})` : ""}
                      </Text>
                    ))}
                </View>
              )}

              {/* Status actions */}
              {nextStatuses.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <TextInput
                    label="Ghi chú (không bắt buộc)"
                    value={desc}
                    onChangeText={setDesc}
                    mode="outlined"
                    dense
                    style={{ marginBottom: 10 }}
                  />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {nextStatuses.map((ns) => (
                      <Button
                        key={ns}
                        mode="contained"
                        compact
                        onPress={() => handleStatusUpdate(ns)}
                        loading={updating}
                        disabled={updating}
                        buttonColor={
                          ns === "CANCELLED" ? theme.colors.error : undefined
                        }
                        textColor={
                          ns === "CANCELLED" ? theme.colors.onError : undefined
                        }
                      >
                        {STATUS_LABELS[ns] ?? ns}
                      </Button>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : null}
        </Modal>
      </Portal>
    </Surface>
  );
}
