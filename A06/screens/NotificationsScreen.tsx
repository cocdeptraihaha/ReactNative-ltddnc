import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import {
  Appbar,
  Divider,
  List,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
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

type Nav = NativeStackNavigationProp<RootStackParamList>;

function iconForType(t: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (t) {
    case "ORDER_STATUS":
    case "ORDER_NEW":
      return "package-variant";
    case "REVIEW_NEW":
      return "star-outline";
    case "SUPPORT_NEW":
      return "lifebuoy";
    case "PROMOTION":
      return "tag-outline";
    default:
      return "bell-outline";
  }
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

  const fmtDate = (d?: string | null) => {
    if (!d) return "";
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, "0")}/${(dt.getMonth() + 1).toString().padStart(2, "0")}/${dt.getFullYear()}`;
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content title="Thông báo" titleStyle={{ fontWeight: "700" }} />
        {token ? (
          <Appbar.Action
            icon="email-open-outline"
            onPress={onMarkAll}
            accessibilityLabel="Đánh dấu tất cả đã đọc"
          />
        ) : null}
      </Appbar.Header>

      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 4 }}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {connected ? "Đang kết nối realtime" : "Đang kết nối…"}
        </Text>
        {unreadCount > 0 ? (
          <Text variant="labelSmall" style={{ marginLeft: 8, color: theme.colors.primary }}>
            {unreadCount} chưa đọc
          </Text>
        ) : null}
      </View>

      {!token ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Đăng nhập để xem thông báo.</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
          <MaterialCommunityIcons name="bell-off-outline" size={64} color={theme.colors.outlineVariant} />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Chưa có thông báo
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <List.Item
              title={item.title || "Thông báo"}
              titleNumberOfLines={2}
              description={`${fmtDate(item.send_date)} · ${item.type}`}
              descriptionNumberOfLines={2}
              onPress={() => void openItem(item)}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={iconForType(item.type)}
                  color={item.is_read ? theme.colors.onSurfaceVariant : theme.colors.primary}
                />
              )}
              style={{
                backgroundColor: item.is_read ? undefined : theme.colors.elevation.level1,
              }}
            />
          )}
        />
      )}
    </Surface>
  );
}
