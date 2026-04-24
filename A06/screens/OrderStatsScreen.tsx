import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  MD3Theme,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { getMyOrderStats, type OrderMoneyStats } from "../lib/orderStats";
import { ScreenHeader, SectionTitle, EmptyState } from "../components";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BUCKET_STATUS_IN: Record<string, string> = {
  pending_confirm: "PENDING,CONFIRMED",
  shipping: "INPROGRESS,SHIPPED",
  delivered: "DELIVERED,COMPLETED",
  cancelled: "CANCELLED,CANCEL_REQUESTED,RETURNED",
};

type BucketKey = keyof typeof BUCKET_STATUS_IN;

type BucketDef = {
  key: BucketKey;
  title: string;
  short: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  bg: string;
};

const BUCKETS: BucketDef[] = [
  {
    key: "pending_confirm",
    title: "Chờ xác nhận",
    short: "Chờ XN",
    icon: "clock-outline",
    color: "#B25E00",
    bg: "#FFF4E5",
  },
  {
    key: "shipping",
    title: "Đang giao",
    short: "Đang giao",
    icon: "truck-fast-outline",
    color: "#0277BD",
    bg: "#E1F5FE",
  },
  {
    key: "delivered",
    title: "Đã giao",
    short: "Đã giao",
    icon: "check-decagram-outline",
    color: "#1B7A3A",
    bg: "#E8F5E9",
  },
  {
    key: "cancelled",
    title: "Đã hủy / trả",
    short: "Hủy/Trả",
    icon: "close-circle-outline",
    color: "#B42318",
    bg: "#FDECEA",
  },
];

function fmtMoney(n: number) {
  return `₫${(n ?? 0).toLocaleString("vi-VN")}`;
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

  const goHistory = (key: BucketKey) => {
    nav.navigate("OrderHistory", { statusIn: BUCKET_STATUS_IN[key] });
  };

  const totals = useMemo(() => {
    if (!stats) return { orders: 0, processing: 0 };
    return {
      orders:
        stats.pending_confirm.count +
        stats.shipping.count +
        stats.delivered.count +
        stats.cancelled.count,
      processing: stats.pending_confirm.total + stats.shipping.total,
    };
  }, [stats]);

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title="Thống kê mua hàng"
        rightIcon="receipt-text-outline"
        rightLabel="Đơn hàng"
        onRight={() => nav.navigate("OrderHistory")}
      />

      <RangeTabs range={range} onChange={setRange} theme={theme} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : !stats ? (
        <EmptyState
          icon="chart-line-variant"
          title="Chưa có dữ liệu"
          description="Vui lòng thử lại sau."
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        >
          {/* ── Hero card: Tổng đã chi ── */}
          <View
            style={{
              borderRadius: 16,
              padding: 18,
              backgroundColor: theme.colors.primary,
              gap: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons name="wallet-outline" size={26} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="labelMedium" style={{ color: "#fff", opacity: 0.85 }}>
                  Tổng đã chi (đơn đã giao)
                </Text>
                <Text
                  variant="headlineMedium"
                  style={{ color: "#fff", fontWeight: "800", marginTop: 2 }}
                >
                  {fmtMoney(stats.total_spent)}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "rgba(255,255,255,0.18)",
              }}
            >
              <MiniMetric label="Đơn" value={String(totals.orders)} />
              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />
              <MiniMetric label="Đang xử lý" value={fmtMoney(totals.processing)} />
            </View>
          </View>

          {/* ── Buckets grid ── */}
          <View>
            <SectionTitle icon="package-variant" title="Phân loại đơn hàng" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {BUCKETS.map((b) => (
                <BucketCard
                  key={b.key}
                  def={b}
                  count={stats[b.key].count}
                  total={stats[b.key].total}
                  onPress={() => goHistory(b.key)}
                  theme={theme}
                />
              ))}
            </View>
          </View>

          {/* ── Quick actions ── */}
          <View>
            <SectionTitle icon="lightning-bolt-outline" title="Truy cập nhanh" />
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                overflow: "hidden",
              }}
            >
              <QuickRow
                icon="receipt-text-outline"
                label="Tất cả đơn hàng"
                onPress={() => nav.navigate("OrderHistory")}
                theme={theme}
              />
              <View style={{ height: 1, backgroundColor: theme.colors.outline }} />
              <QuickRow
                icon="star-circle-outline"
                label="Lịch sử điểm thưởng"
                onPress={() => nav.navigate("PointsHistory")}
                theme={theme}
              />
              <View style={{ height: 1, backgroundColor: theme.colors.outline }} />
              <QuickRow
                icon="ticket-percent-outline"
                label="Đổi điểm lấy voucher"
                onPress={() => nav.navigate("Rewards")}
                theme={theme}
              />
            </View>
          </View>
        </ScrollView>
      )}
    </Surface>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: "#fff", opacity: 0.8, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

function RangeTabs({
  range,
  onChange,
  theme,
}: {
  range: "30" | "90" | "all";
  onChange: (v: "30" | "90" | "all") => void;
  theme: MD3Theme;
}) {
  const items: { key: "30" | "90" | "all"; label: string }[] = [
    { key: "30", label: "30 ngày" },
    { key: "90", label: "90 ngày" },
    { key: "all", label: "Tất cả" },
  ];
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
      }}
    >
      <View style={{ flexDirection: "row", paddingHorizontal: 8 }}>
        {items.map((it) => {
          const active = it.key === range;
          return (
            <Pressable
              key={it.key}
              onPress={() => onChange(it.key)}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: "center",
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
                {it.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function BucketCard({
  def,
  count,
  total,
  onPress,
  theme,
}: {
  def: BucketDef;
  count: number;
  total: number;
  onPress: () => void;
  theme: MD3Theme;
}) {
  return (
    <Pressable onPress={onPress} style={{ flexBasis: "48%", flexGrow: 1 }}>
      <Surface
        elevation={0}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: def.bg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name={def.icon} size={18} color={def.color} />
          </View>
          <Text
            variant="bodySmall"
            style={{ fontWeight: "700", color: theme.colors.onSurface, flex: 1 }}
            numberOfLines={1}
          >
            {def.title}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
          <Text
            variant="headlineSmall"
            style={{ fontWeight: "800", color: theme.colors.onSurface }}
          >
            {count}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            đơn
          </Text>
        </View>
        <Text variant="bodySmall" style={{ fontWeight: "700", color: def.color }}>
          {fmtMoney(total)}
        </Text>
      </Surface>
    </Pressable>
  );
}

function QuickRow({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress: () => void;
  theme: MD3Theme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 12,
        backgroundColor: pressed ? theme.colors.surfaceVariant : "transparent",
      })}
    >
      <MaterialCommunityIcons name={icon} size={22} color={theme.colors.primary} />
      <Text variant="bodyMedium" style={{ flex: 1, color: theme.colors.onSurface, fontWeight: "600" }}>
        {label}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={theme.colors.onSurfaceVariant}
      />
    </Pressable>
  );
}
