import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { getEligibility, type EligibilityResponse } from "../lib/reviews";
import {
  getOrderDetail,
  cancelOrder,
  STATUS_LABELS,
  STATUS_COLORS,
  type Order,
  type OrderStatusHistory,
} from "../lib/orders";

type Params = { orderId: number };
type OrderDetailNav = NativeStackNavigationProp<RootStackParamList, "OrderDetail">;

const TIMELINE_ORDER = [
  "PENDING",
  "CONFIRMED",
  "INPROGRESS",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

export function OrderDetailScreen() {
  const theme = useTheme();
  const nav = useNavigation<OrderDetailNav>();
  const route = useRoute<RouteProp<{ OrderDetail: Params }, "OrderDetail">>();
  const { token } = useAuth();

  const orderId = route.params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [eligByBook, setEligByBook] = useState<Record<number, EligibilityResponse>>({});

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setOrder(await getOrderDetail(token, orderId));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token, orderId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const statusKey = order?.status ?? "";
  const reviewableOrder = statusKey === "DELIVERED" || statusKey === "COMPLETED";

  const reviewBookIds = useMemo(() => {
    if (!order || !reviewableOrder) return [];
    const s = new Set<number>();
    for (const oi of order.order_items ?? []) {
      if (oi.book_id != null) s.add(oi.book_id);
    }
    return [...s];
  }, [order, reviewableOrder]);

  const reviewBookIdsKey = reviewBookIds.join(",");

  useEffect(() => {
    if (!token || reviewBookIds.length === 0) {
      setEligByBook({});
      return;
    }
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        reviewBookIds.map(async (bid) => {
          try {
            const e = await getEligibility(token, bid);
            return [bid, e] as const;
          } catch {
            return [bid, null] as const;
          }
        }),
      );
      if (cancelled) return;
      const next: Record<number, EligibilityResponse> = {};
      for (const [bid, e] of results) {
        if (e) next[bid] = e;
      }
      setEligByBook(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, reviewBookIdsKey]);

  const fmtDate = (d?: string | null) => {
    if (!d) return "";
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, "0")}/${(dt.getMonth() + 1).toString().padStart(2, "0")}/${dt.getFullYear()} ${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`;
  };

  const fmtPrice = (p?: number | null) =>
    (p ?? 0).toLocaleString("vi-VN") + " đ";

  const handleCancel = async () => {
    if (!token || !order) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(token, order.id, cancelReason.trim() || undefined);
      setOrder(updated);
      setShowCancelInput(false);
      setCancelReason("");
      const action =
        updated.status === "CANCELLED" ? "Đã hủy đơn hàng" : "Đã gửi yêu cầu hủy";
      Alert.alert("Thành công", action);
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Không thể hủy");
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !order) {
    return (
      <Surface style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => nav.goBack()} />
          <Appbar.Content title="Chi tiết đơn hàng" />
        </Appbar.Header>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </Surface>
    );
  }

  const canCancel = !["CANCELLED", "COMPLETED", "DELIVERED", "RETURNED", "CANCEL_REQUESTED"].includes(statusKey);

  const history = [...(order.status_history ?? [])].sort(
    (a, b) =>
      new Date(a.status_change_date ?? 0).getTime() -
      new Date(b.status_change_date ?? 0).getTime(),
  );

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => nav.goBack()} />
        <Appbar.Content title={`Đơn #${order.id}`} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* ── Status badge ── */}
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: (STATUS_COLORS[statusKey] ?? "#666") + "1A",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 16,
            marginBottom: 16,
          }}
        >
          <Text
            variant="labelLarge"
            style={{
              color: STATUS_COLORS[statusKey] ?? theme.colors.onSurface,
              fontWeight: "700",
            }}
          >
            {STATUS_LABELS[statusKey] ?? statusKey}
          </Text>
        </View>

        {/* ── Order info ── */}
        <Card theme={theme} title="Thông tin đơn">
          <InfoRow label="Ngày đặt" value={fmtDate(order.order_date)} />
          <InfoRow label="SĐT" value={order.phone_number ?? "—"} />
          <InfoRow label="Địa chỉ" value={order.shipping_address ?? "—"} />
        </Card>

        {/* ── Timeline ── */}
        {history.length > 0 && (
          <Card theme={theme} title="Lịch sử trạng thái">
            {history.map((h, i) => (
              <TimelineItem
                key={h.id}
                entry={h}
                isLast={i === history.length - 1}
                theme={theme}
              />
            ))}
          </Card>
        )}

        {/* ── Items ── */}
        <Card theme={theme} title="Sản phẩm">
          {(order.order_items ?? []).map((oi) => {
            const e = oi.book_id != null ? eligByBook[oi.book_id] : undefined;
            const showReview =
              !!token &&
              reviewableOrder &&
              oi.book_id != null &&
              e &&
              (e.eligible || e.already_reviewed);
            return (
              <View key={oi.id} style={{ paddingVertical: 6 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text variant="bodyMedium">
                    {oi.book_title || `#${oi.book_id}`} x{oi.quantity}
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                    {fmtPrice(oi.price * oi.quantity)}
                  </Text>
                </View>
                {showReview ? (
                  <Button
                    mode="contained-tonal"
                    compact
                    style={{ alignSelf: "flex-start", marginTop: 8 }}
                    onPress={() =>
                      nav.navigate("WriteReview", {
                        bookId: oi.book_id!,
                        orderId: order.id,
                      })
                    }
                  >
                    {e!.already_reviewed ? "Sửa đánh giá" : "Đánh giá"}
                  </Button>
                ) : null}
              </View>
            );
          })}
          <Divider style={{ marginVertical: 8 }} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text variant="titleSmall" style={{ fontWeight: "700" }}>
              Tổng
            </Text>
            <Text
              variant="titleSmall"
              style={{ fontWeight: "700", color: theme.colors.primary }}
            >
              {fmtPrice(order.total_price)}
            </Text>
          </View>
        </Card>

        {/* ── Cancel ── */}
        {canCancel && (
          <View style={{ marginTop: 16 }}>
            {showCancelInput ? (
              <View>
                <TextInput
                  label="Lý do hủy (không bắt buộc)"
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  mode="outlined"
                  style={{ marginBottom: 10 }}
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setShowCancelInput(false);
                      setCancelReason("");
                    }}
                    style={{ flex: 1 }}
                  >
                    Quay lại
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor={theme.colors.error}
                    textColor={theme.colors.onError}
                    onPress={handleCancel}
                    loading={cancelling}
                    disabled={cancelling}
                    style={{ flex: 1 }}
                  >
                    Xác nhận hủy
                  </Button>
                </View>
              </View>
            ) : (
              <Button
                mode="outlined"
                textColor={theme.colors.error}
                onPress={() => setShowCancelInput(true)}
                icon="close-circle-outline"
              >
                {["PENDING", "CONFIRMED"].includes(statusKey)
                  ? "Hủy đơn hàng"
                  : "Gửi yêu cầu hủy"}
              </Button>
            )}
          </View>
        )}
      </ScrollView>
    </Surface>
  );
}

// ── small sub-components ───────────────────────────────────

function Card({
  theme,
  title,
  children,
}: {
  theme: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
      }}
    >
      <Text
        variant="titleSmall"
        style={{ fontWeight: "700", marginBottom: 8 }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 3,
      }}
    >
      <Text variant="bodyMedium" style={{ opacity: 0.65 }}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={{ fontWeight: "600", flexShrink: 1, textAlign: "right" }}>
        {value}
      </Text>
    </View>
  );
}

function TimelineItem({
  entry,
  isLast,
  theme,
}: {
  entry: OrderStatusHistory;
  isLast: boolean;
  theme: any;
}) {
  const color = STATUS_COLORS[entry.status ?? ""] ?? theme.colors.outline;
  const fmtDate = (d?: string | null) => {
    if (!d) return "";
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, "0")}/${(dt.getMonth() + 1).toString().padStart(2, "0")} ${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <View style={{ flexDirection: "row", minHeight: 40 }}>
      <View style={{ width: 28, alignItems: "center" }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: color,
            marginTop: 4,
          }}
        />
        {!isLast && (
          <View
            style={{
              width: 2,
              flex: 1,
              backgroundColor: theme.colors.outlineVariant,
              marginTop: 2,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1, paddingBottom: 10 }}>
        <Text variant="labelMedium" style={{ fontWeight: "700", color }}>
          {STATUS_LABELS[entry.status ?? ""] ?? entry.status}
        </Text>
        {entry.description ? (
          <Text variant="bodySmall" style={{ opacity: 0.7 }}>
            {entry.description}
          </Text>
        ) : null}
        <Text variant="bodySmall" style={{ opacity: 0.5, marginTop: 2 }}>
          {fmtDate(entry.status_change_date)}
        </Text>
      </View>
    </View>
  );
}
