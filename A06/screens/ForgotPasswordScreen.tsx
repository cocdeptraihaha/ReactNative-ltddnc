import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  View,
} from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import * as authApi from "../lib/auth";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";

type ForgotNav = NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotNav>();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn.");
      navigation.replace("ResetPassword", { email: email.trim() });
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 32,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                backgroundColor: theme.colors.errorContainer,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <MaterialCommunityIcons
                name="lock-reset"
                size={36}
                color={theme.colors.error}
              />
            </View>
            <Text
              variant="headlineMedium"
              style={{ fontWeight: "800", marginBottom: 4 }}
            >
              Quên mật khẩu
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
                maxWidth: 280,
              }}
            >
              Nhập email để nhận mã OTP đặt lại mật khẩu
            </Text>
          </View>

          <View style={{ width: "100%", maxWidth: 400, alignSelf: "center", gap: 14 }}>
            <AppTextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AppButton
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              icon="email-fast-outline"
              contentStyle={{ paddingVertical: 6 }}
              style={{ borderRadius: 14 }}
            >
              Gửi mã OTP
            </AppButton>

            <AppButton
              mode="text"
              compact
              onPress={() => navigation.navigate("Login")}
              contentStyle={{ paddingVertical: 0 }}
              style={{ marginTop: 16 }}
            >
              Quay lại đăng nhập
            </AppButton>
          </View>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}
