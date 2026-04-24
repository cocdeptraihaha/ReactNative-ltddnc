import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { Appbar, MD3Theme, Surface, Text, useTheme } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { useNotifications, type NotificationRow } from "../context/NotificationsContext";
import {
  markAllNotificationsRead,
  markNotificationRead,
  parseNotificationMeta,
} from "../lib/notifications";
import { EmptyState } from "../components";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type NotifMeta = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  bg: string;
  fg: string;
  label: string;
};

function metaForType(t: string): NotifMeta {
  switch (t) {
    case "ORDER_STATUS":
      return { icon: "truck-fast-outline", bg: "#E1F5FE", fg: "#0277BD", label: "Đơn hàng" };
    case "ORDER_NEW":
      return { icon: "package-variant", bg: "#FFF3E0", fg: "#E65100", label: "Đơn mới" };
    case "REVIEW_NEW":
      return { icon: "star-outline", bg: "#FFFDE7", fg: "#B25E00", label: "Đánh giá" };
    case "SUPPORT_NEW":
      return { icon: "lifebuoy", bg: "#F3E5F5", fg: "#7B1FA2", label: "Hỗ trợ" };
    case "PROMOTION":
      return { icon: "tag-outline", bg: "#E8F5E9", fg: "#1B7A3A", label: "Khuyến mãi" };
    case "CHAT":
      return { icon: "chat-outline", bg: "#E0F2F1", fg: "#00796B", label: "Tin nhắn" };
    default:
      return { icon: "bell-outline", bg: "#F2F4F7", fg: "#475467", label: "Thông báo" };
  }
}

function timeAgo(d?: string | null): string {
  if (!d) return "";
  const t = new Date(d).getTime();
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day} ngày trước`;
  const dt = new Date(d);
  return `${dt.getDate().toString().padStart(2, "0")}/${(dt.getMonth() + 1).toString().padStart(2, "0")}/${dt.getFullYear()}`;
}

export function NotificationsScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const { token, user } = useAuth();
  const { items, unreadCount, connected, refresh } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const onMarkAll = async () => {
    if (!token) return;
    try {
      await markAllNotificationsRead(token);
      await refresh();
    } catch {
      /* ignore */
    }
  };

  const openItem = async (row: NotificationRow) => {
    if (!token) return;
    try {
      await markNotificationRead(token, row.id);
      await refresh();
    } catch {
      /* still try navigate */
    }
    const meta = parseNotificationMeta(row.message);
    const orderId = meta.order_id ? Number(meta.order_id) : undefined;
    const bookId = meta.book_id ? Number(meta.book_id) : undefined;
    const parent = nav.getParent();
    const go = (name: keyof RootStackParamList, params?: object) => {
      if (parent) (parent as any).navigate(name, params);
      else (nav as any).navigate(name, params);
    };

    switch (row.type) {
      case "ORDER_STATUS":
        if (orderId) go("OrderDetail", { orderId });
        break;
      case "ORDER_NEW":
        if (user?.is_superuser) go("AdminOrders");
        else if (orderId) go("OrderDetail", { orderId });
        break;
      case "REVIEW_NEW":
        if (bookId) go("BookDetail", { bookId });
        break;
      case "SUPPORT_NEW":
        go("Tabs");
        break;
      default:
        if (orderId) go("OrderDetail", { orderId });
        break;
    }
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header
        elevated
        style={{
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        }}
      >
        <Appbar.Content
          title="Thông báo"
          titleStyle={{ fontWeight: "700", color: theme.colors.onSurface }}
        />
        {token ? (
          <Appbar.Action
            icon="email-open-outline"
            onPress={onMarkAll}
            accessibilityLabel="Đánh dấu tất cả đã đọc"
          />
        ) : null}
      </Appbar.Header>

      {/* Realtime status bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: connected ? "#1B7A3A" : "#F5A623",
          }}
        />
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {connected ? "Realtime đang hoạt động" : "Đang kết nối lại…"}
        </Text>
        {unreadCount > 0 ? (
          <View
            style={{
              marginLeft: "auto",
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: theme.colors.primary,
            }}
          >
            <Text variant="labelSmall" style={{ color: "#fff", fontWeight: "700" }}>
              {unreadCount} chưa đọc
            </Text>
          </View>
        ) : null}
      </View>

      {!token ? (
        <EmptyState
          icon="bell-off-outline"
          title="Đăng nhập để nhận thông báo"
          description="Cập nhật đơn hàng, đánh giá, khuyến mãi & tin nhắn theo thời gian thực."
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon="bell-outline"
          title="Chưa có thông báo"
          description="Hoạt động mới của bạn sẽ xuất hiện ở đây."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <NotificationItem
              row={item}
              onPress={() => void openItem(item)}
              theme={theme}
            />
          )}
        />
      )}
    </Surface>
  );
}

function NotificationItem({
  row,
  onPress,
  theme,
}: {
  row: NotificationRow;
  onPress: () => void;
  theme: MD3Theme;
}) {
  const meta = metaForType(row.type);
  const unread = !row.is_read;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: pressed
          ? theme.colors.surfaceVariant
          : unread
            ? "#F0F6FF"
            : theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: meta.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name={meta.icon} size={20} color={meta.fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            variant="labelSmall"
            style={{ color: meta.fg, fontWeight: "800", textTransform: "uppercase" }}
          >
            {meta.label}
          </Text>
          {unread ? (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.colors.primary,
              }}
            />
          ) : null}
        </View>
        <Text
          variant="bodyMedium"
          style={{
            fontWeight: unread ? "700" : "500",
            color: theme.colors.onSurface,
          }}
          numberOfLines={2}
        >
          {row.title || "Thông báo"}
        </Text>
        {row.message ? (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
            numberOfLines={2}
          >
            {row.message
              .split("\n")
              .filter((l) => !/^[a-zA-Z_]+:\s*\d+\s*$/.test(l.trim()))
              .join(" ")
              .trim()}
          </Text>
        ) : null}
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
        >
          {timeAgo(row.send_date)}
        </Text>
      </View>
    </Pressable>
  );
}
