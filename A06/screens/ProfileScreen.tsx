import { useCallback, useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Appbar,
  Divider,
  MD3Theme,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { AppButton } from "../components/AppButton";
import { getMe } from "../lib/users";
import type { RootStackParamList } from "../navigation/RootStack";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { token, user, setAuth, logout } = useAuth();

  const loadMe = useCallback(async () => {
    if (!token) return;
    try {
      const me = await getMe(token);
      await setAuth(token, me);
    } catch {
      /* ignore */
    }
  }, [token, setAuth]);

  useFocusEffect(
    useCallback(() => {
      void loadMe();
    }, [loadMe]),
  );

  const initials = useMemo(() => {
    const src = (user?.full_name || user?.email || "U").trim();
    const parts = src.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "U";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (a + b).toUpperCase();
  }, [user?.full_name, user?.email]);

  if (!token || !user) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </Surface>
    );
  }

  const avatarUri = user.avatar_url ?? undefined;

  const onLogout = async () => {
    await logout();
    const rootNav = navigation.getParent();
    if (rootNav) {
      rootNav.reset({ index: 0, routes: [{ name: "Login" as never }] });
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: "Login" as never }] });
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content title="Hồ sơ" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Surface
          style={{
            borderRadius: 16,
            backgroundColor: theme.colors.surface,
            marginBottom: 14,
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
            overflow: "hidden",
          }}
        >
          <Pressable
            onPress={() => navigation.navigate("PersonalInfo")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              gap: 14,
              backgroundColor: pressed ? theme.colors.surfaceVariant : "transparent",
            })}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                overflow: "hidden",
                backgroundColor: theme.colors.primaryContainer,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: theme.colors.primary,
              }}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: 56, height: 56 }} contentFit="cover" />
              ) : (
                <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: "700" }}>
                  {initials}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                {user.full_name || user.username || user.email}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                {user.email}
              </Text>
              <Text variant="labelMedium" style={{ color: theme.colors.primary, marginTop: 4, fontWeight: "600" }}>
                Thông tin cá nhân
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
          </Pressable>

          <Divider />

          <Pressable
            onPress={() => navigation.navigate("PointsHistory")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 14,
              gap: 12,
              backgroundColor: pressed ? theme.colors.surfaceVariant : "transparent",
            })}
          >
            <MaterialCommunityIcons name="star-circle-outline" size={22} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={{ fontWeight: "800", color: theme.colors.primary }}>
                Điểm tích lũy: {(user as any).loyalty_points ?? 0}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Xem lịch sử điểm
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        </Surface>

        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 14,
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
          }}
        >
          <MenuItem
            icon="receipt"
            label="Lịch sử đơn hàng"
            onPress={() => navigation.navigate("OrderHistory")}
            theme={theme}
          />
          <Divider />
          <MenuItem
            icon="chart-line"
            label="Thống kê mua hàng"
            onPress={() => navigation.navigate("OrderStats" as any)}
            theme={theme}
          />
          <Divider />
          <MenuItem
            icon="heart-outline"
            label="Sách yêu thích"
            onPress={() => navigation.navigate("Favorites" as any)}
            theme={theme}
          />
          <Divider />
          <MenuItem
            icon="gift-outline"
            label="Đổi điểm lấy voucher"
            onPress={() => navigation.navigate("Rewards" as any)}
            theme={theme}
          />
          <Divider />
          <MenuItem
            icon="ticket-confirmation-outline"
            label="Kho voucher của tôi"
            onPress={() => navigation.navigate("MyVouchers" as any)}
            theme={theme}
          />
          <Divider />
          <MenuItem
            icon="package-variant-closed-remove"
            label="Yêu cầu trả hàng"
            onPress={() => navigation.navigate("ReturnRequests")}
            theme={theme}
          />
          <Divider />
          {user.is_superuser && (
            <>
              <MenuItem
                icon="clipboard-list-outline"
                label="Quản lý đơn hàng (Admin)"
                onPress={() => navigation.navigate("AdminOrders")}
                theme={theme}
              />
              <Divider />
              <MenuItem
                icon="book-plus-outline"
                label="Thêm sách mới (Admin)"
                onPress={() => navigation.navigate("AdminAddBook")}
                theme={theme}
              />
              <Divider />
            </>
          )}
        </View>

        <AppButton
          mode="contained"
          onPress={onLogout}
          buttonColor={theme.colors.error}
          textColor="#fff"
          icon="logout"
          contentStyle={{ paddingVertical: 4 }}
          style={{ borderRadius: 14 }}
        >
          Đăng xuất
        </AppButton>
      </ScrollView>
    </Surface>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: string;
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
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        backgroundColor: pressed ? theme.colors.surfaceVariant : "transparent",
      })}
    >
      <MaterialCommunityIcons name={icon as any} size={22} color={theme.colors.primary} />
      <Text variant="bodyMedium" style={{ flex: 1, fontWeight: "600" }}>
        {label}
      </Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}
