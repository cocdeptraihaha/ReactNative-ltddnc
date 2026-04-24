import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, Share, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { getMyOwnedPromotions, type OwnedPromotion } from "../lib/myPromotions";
import { ScreenHeader, EmptyState } from "../components";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FilterKey = "available" | "used";

export function MyVouchersScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const { token } = useAuth();
  const [rows, setRows] = useState<OwnedPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("available");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setRows(await getMyOwnedPromotions(token, false));
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
      setRows(await getMyOwnedPromotions(token, false));
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  const filtered = useMemo(
    () => rows.filter((r) => (filter === "used" ? r.used : !r.used)),
    [rows, filter],
  );

  const counts = useMemo(
    () => ({
      available: rows.filter((r) => !r.used).length,
      used: rows.filter((r) => r.used).length,
    }),
    [rows],
  );

  if (!token) {
    return (
      <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Kho voucher" />
        <EmptyState
          icon="ticket-confirmation-outline"
          title="Đăng nhập để xem voucher"
        />
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Kho voucher của tôi" />

      <FilterBar
        active={filter}
        onChange={setFilter}
        availableCount={counts.available}
        usedCount={counts.used}
      />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12, flexGrow: 1 }}
          ListEmptyComponent={
            <EmptyState
              icon="ticket-outline"
              title={filter === "used" ? "Chưa có mã đã dùng" : "Chưa có mã khả dụng"}
              description={
                filter === "used"
                  ? "Mã voucher đã sử dụng sẽ hiển thị tại đây."
                  : "Đổi điểm tích lũy lấy voucher trong mục «Đổi điểm lấy voucher»."
              }
              actionLabel={filter === "available" ? "Đổi điểm ngay" : undefined}
              onAction={
                filter === "available" ? () => nav.navigate("Rewards") : undefined
              }
            />
          }
          renderItem={({ item }) => <VoucherTicket item={item} theme={theme} />}
        />
      )}
    </Surface>
  );
}

function FilterBar({
  active,
  onChange,
  availableCount,
  usedCount,
}: {
  active: FilterKey;
  onChange: (k: FilterKey) => void;
  availableCount: number;
  usedCount: number;
}) {
  const theme = useTheme();
  const tabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "available", label: "Khả dụng", count: availableCount },
    { key: "used", label: "Đã dùng", count: usedCount },
  ];
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
      }}
    >
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <View
            key={t.key}
            onTouchEnd={() => onChange(t.key)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: on ? theme.colors.primary : "transparent",
            }}
          >
            <Text
              variant="bodyMedium"
              style={{
                fontWeight: on ? "700" : "500",
                color: on ? theme.colors.primary : theme.colors.onSurfaceVariant,
              }}
            >
              {t.label} ({t.count})
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function VoucherTicket({
  item,
  theme,
}: {
  item: OwnedPromotion;
  theme: ReturnType<typeof useTheme>;
}) {
  const used = !!item.used;
  const stripBg = used ? "#9AA3B2" : theme.colors.primary;
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        overflow: "hidden",
        opacity: used ? 0.75 : 1,
      }}
    >
      {/* Stub */}
      <View
        style={{
          width: 92,
          backgroundColor: stripBg,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 16,
          gap: 4,
        }}
      >
        <MaterialCommunityIcons name="ticket-percent" size={26} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
          -{item.discount_percent ?? 0}%
        </Text>
        {item.max_discount != null ? (
          <Text style={{ color: "#fff", opacity: 0.85, fontSize: 10 }}>
            tối đa {Number(item.max_discount).toLocaleString("vi-VN")}đ
          </Text>
        ) : null}
      </View>

      {/* Body */}
      <View style={{ flex: 1, padding: 12, gap: 4 }}>
        <Text variant="titleSmall" style={{ fontWeight: "800" }} numberOfLines={2}>
          {item.name ?? "Voucher KeBook"}
        </Text>
        <View
          style={{
            marginTop: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: theme.colors.outline,
            borderRadius: 8,
          }}
        >
          <MaterialCommunityIcons
            name="qrcode"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            variant="bodyMedium"
            style={{
              flex: 1,
              letterSpacing: 1.5,
              fontWeight: "800",
              color: theme.colors.onSurface,
            }}
            selectable
          >
            {item.code ?? "—"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: used ? theme.colors.error : "#1B7A3A",
            }}
          />
          <Text
            variant="labelSmall"
            style={{
              fontWeight: "700",
              color: used ? theme.colors.error : "#1B7A3A",
            }}
          >
            {used ? "Đã sử dụng" : "Sẵn sàng dùng"}
          </Text>
        </View>
        {!used && item.code ? (
          <Button
            mode="text"
            compact
            icon="share-variant-outline"
            onPress={() => Share.share({ message: item.code! })}
            style={{ alignSelf: "flex-start", marginTop: 2 }}
          >
            Sao chép / chia sẻ
          </Button>
        ) : null}
      </View>
    </View>
  );
}
