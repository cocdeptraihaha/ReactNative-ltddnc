import { Surface, Text, useTheme } from "react-native-paper";
import { View } from "react-native";
import { useAuth } from "../context/AuthContext";

export function NotificationsScreen() {
  const theme = useTheme();
  const { token, isReady } = useAuth();

  if (!isReady || !token) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text variant="bodyLarge">Loading...</Text>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text variant="titleLarge" style={{ fontWeight: "700", marginBottom: 8 }}>
          Notifications
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Chưa có thông báo. (Bạn có thể nối API `/notifications/me` sau.)
        </Text>
      </View>
    </Surface>
  );
}

