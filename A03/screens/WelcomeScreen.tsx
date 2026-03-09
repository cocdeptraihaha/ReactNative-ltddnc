import { useEffect } from "react";
import { View } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";

type WelcomeNav = NativeStackNavigationProp<RootStackParamList, "Welcome">;

export function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNav>();
  const { token, isReady } = useAuth();

  useEffect(() => {
    if (isReady && token) {
      navigation.replace("Home");
    }
  }, [isReady, token, navigation]);

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
        <Text
          variant="bodyLarge"
          style={{
            marginBottom: 48,
            textAlign: "center",
            paddingHorizontal: 20,
            color: "#666",
          }}
        >
          Vui lòng đăng nhập hoặc đăng ký để tiếp tục
        </Text>

        <View style={{ width: "100%", maxWidth: 400 }}>
          <Button
            mode="contained"
            style={{ marginBottom: 16 }}
            contentStyle={{ paddingVertical: 8 }}
            onPress={() => navigation.navigate("Login")}
          >
            Đăng Nhập
          </Button>

          <Button
            mode="outlined"
            style={{ marginBottom: 16 }}
            contentStyle={{ paddingVertical: 8 }}
            onPress={() => navigation.navigate("Register")}
          >
            Đăng Ký
          </Button>
        </View>
      </View>
    </Surface>
  );
}

