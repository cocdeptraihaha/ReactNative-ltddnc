import { useEffect } from "react";
import { View } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user, token, isReady, logout } = useAuth();

  useEffect(() => {
    if (isReady && !token) router.replace("/");
  }, [isReady, token]);

  if (!isReady || !token) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text variant="bodyLarge">Đang tải...</Text>
      </Surface>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <Surface style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text variant="displayMedium" style={{ marginBottom: 12, textAlign: "center" }}>
          Xin chào!
        </Text>
        <Text variant="bodyLarge" style={{ marginBottom: 48, textAlign: "center", paddingHorizontal: 20, color: "#666" }}>
          {user?.full_name || user?.email || "Bạn đã đăng nhập thành công"}
        </Text>

        <Button mode="outlined" onPress={handleLogout} contentStyle={{ paddingVertical: 8 }}>
          Đăng xuất
        </Button>
      </View>
    </Surface>
  );
}
