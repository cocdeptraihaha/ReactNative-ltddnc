import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  View,
} from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import * as authApi from "../lib/auth";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";

type VerifyOtpNav = NativeStackNavigationProp<RootStackParamList, "VerifyOtp">;
type VerifyOtpRoute = RouteProp<RootStackParamList, "VerifyOtp">;

export function VerifyOtpScreen() {
  const navigation = useNavigation<VerifyOtpNav>();
  const route = useRoute<VerifyOtpRoute>();
  const email = route.params?.email ?? "";
  const { setAuth } = useAuth();
  const theme = useTheme();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    if (!email || !otp.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email, otp.trim());
      await setAuth(res.access_token, res.user);
      navigation.replace("Tabs");
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      await authApi.resendOtp(email);
      Alert.alert("Thành công", "Mã OTP mới đã được gửi đến email");
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Không thể gửi lại");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <Surface
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text variant="bodyLarge" style={{ marginBottom: 16, textAlign: "center" }}>
          Thiếu thông tin email. Vui lòng đăng ký lại.
        </Text>
        <AppButton mode="contained" onPress={() => navigation.navigate("Register")}>
          Quay lại đăng ký
        </AppButton>
      </Surface>
    );
  }

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
                backgroundColor: theme.colors.primaryContainer,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={36}
                color={theme.colors.primary}
              />
            </View>
            <Text
              variant="headlineMedium"
              style={{ fontWeight: "800", marginBottom: 4 }}
            >
              Xác thực OTP
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
                maxWidth: 280,
              }}
            >
              Nhập mã 6 chữ số đã gửi đến{"\n"}
              <Text style={{ fontWeight: "700", color: theme.colors.primary }}>
                {email}
              </Text>
            </Text>
          </View>

          <View style={{ width: "100%", maxWidth: 400, alignSelf: "center", gap: 14 }}>
            <AppTextInput
              label="Mã OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              style={{ textAlign: "center", fontSize: 24, letterSpacing: 8 }}
            />

            <AppButton
              mode="contained"
              onPress={handleVerify}
              loading={loading}
              disabled={loading}
              icon="check-circle-outline"
              contentStyle={{ paddingVertical: 6 }}
              style={{ borderRadius: 14 }}
            >
              Xác thực
            </AppButton>

            <AppButton
              mode="text"
              onPress={handleResend}
              loading={resendLoading}
              disabled={resendLoading}
              contentStyle={{ paddingVertical: 0 }}
            >
              Gửi lại mã OTP
            </AppButton>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Đã có tài khoản?{" "}
              </Text>
              <AppButton
                mode="text"
                compact
                onPress={() => navigation.navigate("Login")}
                contentStyle={{ paddingVertical: 0 }}
              >
                Đăng nhập
              </AppButton>
            </View>
          </View>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}
