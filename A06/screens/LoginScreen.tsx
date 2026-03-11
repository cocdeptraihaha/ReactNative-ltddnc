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
      navigation.replace("Tabs");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Đăng nhập thất bại";
      Alert.alert(
        "Đăng nhập thất bại",
        `${msg}\n\nGợi ý:\n- Kiểm tra API_BASE (http://IP:8000)\n- Android cần bật cleartext HTTP\n- iOS có thể bị ATS chặn HTTP`,
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Surface style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 24,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1 }}>
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

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 24,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: theme.colors.outline,
                  }}
                />
                <Text style={{ marginHorizontal: 16, color: theme.colors.onSurfaceVariant }}>
                  hoặc
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: theme.colors.outline,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
              </View>
            </FormCard>
          </View>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}

