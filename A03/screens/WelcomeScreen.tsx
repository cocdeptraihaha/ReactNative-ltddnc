import { useEffect } from "react";
import { View } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { AppButton } from "../components/AppButton";
import { ButtonsWrap, Container } from "./styled/WelcomeScreen.styled";

type WelcomeNav = NativeStackNavigationProp<RootStackParamList, "Welcome">;

export function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNav>();
  const { token, isReady } = useAuth();
  const theme = useTheme();

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
      <Container>
        <Text variant="displayMedium" style={{ marginBottom: 12, textAlign: "center" }}>
          Chào mừng!
        </Text>
        <Text
          variant="bodyLarge"
          style={{
            marginBottom: 48,
            textAlign: "center",
            paddingHorizontal: 20,
            color: theme.colors.onSurfaceVariant,
          }}
        >
          Vui lòng đăng nhập hoặc đăng ký để tiếp tục
        </Text>

        <ButtonsWrap>
          <AppButton
            mode="contained"
            style={{ marginBottom: 16 }}
            onPress={() => navigation.navigate("Login")}
          >
            Đăng Nhập
          </AppButton>

          <AppButton
            mode="outlined"
            style={{ marginBottom: 16 }}
            onPress={() => navigation.navigate("Register")}
          >
            Đăng Ký
          </AppButton>
        </ButtonsWrap>
      </Container>
    </Surface>
  );
}

