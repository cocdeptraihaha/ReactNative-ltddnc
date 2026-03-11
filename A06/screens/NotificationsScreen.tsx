import { View } from "react-native";
import { Appbar, Surface, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function NotificationsScreen() {
  const theme = useTheme();

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content title="Thông báo" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        <MaterialCommunityIcons
          name="bell-off-outline"
          size={64}
          color={theme.colors.outlineVariant}
        />
        <Text
          variant="bodyLarge"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Chưa có thông báo nào
        </Text>
      </View>
    </Surface>
  );
}
