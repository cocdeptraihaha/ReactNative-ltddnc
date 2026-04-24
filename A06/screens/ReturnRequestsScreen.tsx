import { useCallback, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Button,
  Divider,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import type { RootStackParamList } from "../navigation/RootStack";
import { ScreenHeader, EmptyState } from "../components";
import { useAuth } from "../context/AuthContext";
import {
  createReturnRequest,
  getMyReturnRequests,
  type ReturnRequest,
} from "../lib/returnRequests";

type Nav = NativeStackNavigationProp<RootStackParamList, "ReturnRequests">;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#FB8C00",
  APPROVED: "#2E7D32",
  REJECTED: "#E53935",
};

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (x: number) => x.toString().padStart(2, "0");
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export function ReturnRequestsScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, "ReturnRequests">>();
  const { token } = useAuth();
  const [rows, setRows] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");

  const preset = route.params;

  const canCreateFromPreset = !!preset?.orderId && !!preset?.orderItemId;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMyReturnRequests(token);
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onSubmit = async () => {
    if (!token || !preset?.orderId || !preset?.orderItemId) return;
    const q = Number.parseInt(quantity.trim(), 10);
    if (!Number.isFinite(q) || q <= 0) return;
    setSubmitting(true);
    try {
      await createReturnRequest(token, {
        order_id: preset.orderId,
        order_item_id: preset.orderItemId,
        quantity: q,
        reason: reason.trim() || null,
      });
      setQuantity("1");
      setReason("");
      await load();
    } catch (e) {
      // keep concise; API message is shown as text
      const message = e instanceof Error ? e.message : "Không thể tạo yêu cầu";
      setReason((prev) => (prev.length ? prev : message));
    } finally {
      setSubmitting(false);
    }
  };

  const title = useMemo(
    () => (canCreateFromPreset ? "Yêu cầu trả hàng" : "Lịch sử trả hàng"),
    [canCreateFromPreset],
  );

  if (!token) {
    return (
      <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title={title} onBack={() => nav.goBack()} />
        <EmptyState
          icon="account-lock-outline"
          title="Cần đăng nhập"
          description="Vui lòng đăng nhập để gửi và theo dõi yêu cầu trả hàng."
        />
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title={title} onBack={() => nav.goBack()} />

      {canCreateFromPreset && (
        <View
          style={{
            margin: 14,
            borderRadius: 12,
            padding: 12,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            gap: 10,
          }}
        >
          <Text variant="titleSmall" style={{ fontWeight: "700" }}>
            Tạo yêu cầu mới
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Đơn #{preset.orderId} · Item #{preset.orderItemId}
          </Text>
          <TextInput
            mode="outlined"
            label="Số lượng trả"
            value={quantity}
            keyboardType="number-pad"
            onChangeText={setQuantity}
          />
          <TextInput
            mode="outlined"
            label="Lý do (tuỳ chọn)"
            value={reason}
            onChangeText={setReason}
            multiline
          />
          <Button
            mode="contained"
            onPress={onSubmit}
            loading={submitting}
            disabled={submitting}
            icon="package-variant-closed-remove"
          >
            Gửi yêu cầu trả hàng
          </Button>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : rows.length === 0 ? (
        <EmptyState
          icon="package-variant-closed-remove"
          title="Chưa có yêu cầu trả hàng"
          description="Khi gửi yêu cầu, trạng thái xử lý sẽ hiển thị tại đây."
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 14, paddingBottom: 36 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const c = STATUS_COLORS[item.status] ?? theme.colors.onSurfaceVariant;
            return (
              <View
                style={{
                  borderRadius: 12,
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  padding: 12,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                    Yêu cầu #{item.id}
                  </Text>
                  <Text variant="labelMedium" style={{ fontWeight: "700", color: c }}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Text>
                </View>
                <Divider style={{ marginVertical: 8 }} />
                <Text variant="bodySmall">Đơn #{item.order_id} · Item #{item.order_item_id}</Text>
                <Text variant="bodySmall">Số lượng: {item.quantity}</Text>
                <Text variant="bodySmall" style={{ marginTop: 2 }}>
                  Lý do: {item.reason?.trim() ? item.reason : "—"}
                </Text>
                <Text variant="labelSmall" style={{ marginTop: 6, color: theme.colors.onSurfaceVariant }}>
                  Gửi lúc: {fmtDate(item.request_date)}
                </Text>
                {item.processed_date ? (
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Xử lý lúc: {fmtDate(item.processed_date)}
                  </Text>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </Surface>
  );
}

