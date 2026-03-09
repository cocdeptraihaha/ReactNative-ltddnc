import { useEffect } from "react";
import { View } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";

type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { user, token, isReady, logout } = useAuth();

  useEffect(() => {
    if (isReady && !token) {
      navigation.replace("Welcome");
    }
  }, [isReady, token, navigation]);

  if (!isReady || !token) {
    return (
      <Surface
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text variant="bodyLarge">Đang tải...</Text>
      </Surface>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigation.replace("Welcome");
  };

  return (
    <Surface style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text
          variant="displayMedium"
          style={{ marginBottom: 12, textAlign: "center" }}
        >
          Xin chào!
        </Text>
        <Text
          variant="bodyLarge"
          style={{
            marginBottom: 48,
            textAlign: "center",
            paddingHorizontal: 20,
            color: "#666",
          }}
        >
          {user?.full_name || user?.email || "Bạn đã đăng nhập thành công"}
        </Text>

        <Button
          mode="outlined"
          onPress={handleLogout}
          contentStyle={{ paddingVertical: 8 }}
        >
          Đăng xuất
        </Button>
      </View>
    </Surface>
  );
}

