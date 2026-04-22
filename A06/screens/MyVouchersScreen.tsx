import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Share, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getMyOwnedPromotions, type OwnedPromotion } from "../lib/myPromotions";

export function MyVouchersScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();
  const [rows, setRows] = useState<OwnedPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  if (!token) {
    return (
      <Surface style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Kho voucher" />
        </Appbar.Header>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Kho voucher của tôi" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Chưa có mã cá nhân. Đổi điểm tại mục «Đổi điểm lấy voucher».
            </Text>
          }
          renderItem={({ item }) => (
            <Surface
              style={{
                padding: 14,
                borderRadius: 14,
                marginBottom: 12,
                backgroundColor: theme.colors.surface,
              }}
              elevation={1}
            >
              <Text variant="titleSmall" style={{ fontWeight: "800" }}>
                {item.name ?? "Voucher"}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ marginTop: 8, letterSpacing: 1, fontWeight: "700" }}
                selectable
              >
                {item.code ?? "—"}
              </Text>
              <Text variant="bodySmall" style={{ marginTop: 6, color: theme.colors.onSurfaceVariant }}>
                Giảm {item.discount_percent ?? 0}%
                {item.max_discount != null
                  ? ` · tối đa ${Number(item.max_discount).toLocaleString("vi-VN")}đ`
                  : ""}
              </Text>
              <Text
                variant="labelSmall"
                style={{
                  marginTop: 8,
                  color: item.used ? theme.colors.error : theme.colors.primary,
                  fontWeight: "700",
                }}
              >
                {item.used ? "Đã dùng" : "Chưa dùng"}
              </Text>
              {!item.used && item.code ? (
                <Button
                  mode="outlined"
                  style={{ marginTop: 10 }}
                  onPress={() => Share.share({ message: item.code! })}
                >
                  Chia sẻ / sao chép mã
                </Button>
              ) : null}
            </Surface>
          )}
        />
      )}
    </Surface>
  );
}
