import { useEffect } from "react";
import { View } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { Link, router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { token, isReady } = useAuth();

  useEffect(() => {
    if (isReady && token) {
      router.replace("/home");
    }
  }, [isReady, token]);

  if (!isReady) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text variant="bodyLarge">Đang tải...</Text>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text variant="displayMedium" style={{ marginBottom: 12, textAlign: "center" }}>
          Chào mừng!
        </Text>
        <Text variant="bodyLarge" style={{ marginBottom: 48, textAlign: "center", paddingHorizontal: 20, color: "#666" }}>
          Vui lòng đăng nhập hoặc đăng ký để tiếp tục
        </Text>

        <View style={{ width: "100%", maxWidth: 400 }}>
          <Link href="/login" asChild>
            <Button mode="contained" style={{ marginBottom: 16 }} contentStyle={{ paddingVertical: 8 }}>
              Đăng Nhập
            </Button>
          </Link>

          <Link href="/register" asChild>
            <Button mode="outlined" style={{ marginBottom: 16 }} contentStyle={{ paddingVertical: 8 }}>
              Đăng Ký
            </Button>
          </Link>
        </View>
      </View>
    </Surface>
  );
}
