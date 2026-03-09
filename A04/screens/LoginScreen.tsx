import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Text, Surface, useTheme, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { FormCard } from "../components/FormCard";
import { BottomRow, Container, DividerLine, DividerRow } from "./styled/LoginScreen.styled";

type LoginNav = NativeStackNavigationProp<RootStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const { login, isLoading } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await login(email.trim(), password);
      navigation.replace("Home");
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Đăng nhập thất bại");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Surface style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Container>
            <Text
              variant="displaySmall"
              style={{ marginBottom: 8, textAlign: "center" }}
            >
              Đăng Nhập
            </Text>
            <Text
              variant="bodyLarge"
              style={{
                marginBottom: 32,
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Chào mừng bạn trở lại!
            </Text>

            <FormCard>
              <AppTextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{ marginBottom: 16 }}
              />

              <AppTextInput
                  label="Mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye" : "eye-off"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={{ marginBottom: 16 }}
              />

              <AppButton
                  mode="text"
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={{ alignSelf: "flex-end", marginBottom: 24 }}
                  contentStyle={{ paddingVertical: 0 }}
                >
                  Quên mật khẩu?
              </AppButton>

              <AppButton
                  mode="contained"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={{ marginBottom: 16 }}
                >
                  Đăng Nhập
              </AppButton>

              <DividerRow>
                <DividerLine $color={theme.colors.outline} />
                <Text style={{ marginHorizontal: 16, color: theme.colors.onSurfaceVariant }}>
                  hoặc
                </Text>
                <DividerLine $color={theme.colors.outline} />
              </DividerRow>

              <BottomRow>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Chưa có tài khoản?{" "}
                </Text>
                <AppButton
                  mode="text"
                  compact
                  onPress={() => navigation.navigate("Register")}
                  contentStyle={{ paddingVertical: 0 }}
                >
                  Đăng ký ngay
                </AppButton>
              </BottomRow>
            </FormCard>
          </Container>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}

