import { useEffect } from "react";
import { View } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { AppButton } from "../components/AppButton";

type WelcomeNav = NativeStackNavigationProp<RootStackParamList, "Welcome">;

export function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNav>();
  const { token, isReady } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (isReady && token) navigation.replace("Tabs");
  }, [isReady, token, navigation]);

  if (!isReady) {
    return (
      <Surface
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text variant="bodyLarge">Đang tải...</Text>
      </Surface>
    );
  }

  return (
    <Surface
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        {/* Logo / branding */}
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            backgroundColor: theme.colors.primaryContainer,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <MaterialCommunityIcons
            name="book-open-page-variant"
            size={48}
            color={theme.colors.primary}
          />
        </View>

        <Text
          variant="headlineLarge"
          style={{
            fontWeight: "800",
            color: theme.colors.onSurface,
            marginBottom: 4,
          }}
        >
          KeBook
        </Text>
        <Text
          variant="bodyLarge"
          style={{
            color: theme.colors.onSurfaceVariant,
            textAlign: "center",
            marginBottom: 48,
            maxWidth: 280,
            lineHeight: 22,
          }}
        >
          Khám phá hàng ngàn cuốn sách hay{"\n"}chỉ trong vài bước
        </Text>

        <View style={{ width: "100%", maxWidth: 340, gap: 12 }}>
          <AppButton
            mode="contained"
            onPress={() => navigation.navigate("Login")}
            icon="login"
            contentStyle={{ paddingVertical: 6 }}
            style={{ borderRadius: 14 }}
          >
            Đăng nhập
          </AppButton>

          <AppButton
            mode="outlined"
            onPress={() => navigation.navigate("Register")}
            icon="account-plus-outline"
            contentStyle={{ paddingVertical: 6 }}
            style={{ borderRadius: 14 }}
          >
            Tạo tài khoản
          </AppButton>
        </View>
      </View>
    </Surface>
  );
}
