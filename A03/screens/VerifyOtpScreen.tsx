import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Surface, Text, TextInput, useTheme } from "react-native-paper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import * as authApi from "../lib/auth";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { FormCard } from "../components/FormCard";
import {
  BottomRow,
  Centered,
  Container,
  Field,
  SubmitWrap,
} from "./styled/VerifyOtpScreen.styled";

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
      navigation.replace("Home");
    } catch (e) {
      Alert.alert(
        "Lỗi",
        e instanceof Error ? e.message : "Mã OTP không hợp lệ",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      await authApi.resendOtp(email);
      Alert.alert(
        "Thành công",
        "Mã OTP mới đã được gửi đến email của bạn",
      );
    } catch (e) {
      Alert.alert(
        "Lỗi",
        e instanceof Error ? e.message : "Không thể gửi lại OTP",
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <Surface style={{ flex: 1 }}>
        <Centered>
        <Text
          variant="bodyLarge"
          style={{ marginBottom: 16, textAlign: "center" }}
        >
          Thiếu thông tin email. Vui lòng đăng ký lại.
        </Text>
        <AppButton mode="contained" onPress={() => navigation.navigate("Register")}>
          Quay lại đăng ký
        </AppButton>
        </Centered>
      </Surface>
    );
  }

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
              Xác thực tài khoản
            </Text>
            <Text
              variant="bodyLarge"
              style={{
                marginBottom: 32,
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Nhập mã OTP đã gửi đến {email}
            </Text>

            <FormCard>
              <Field>
                <AppTextInput
                  label="Mã OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="123456"
                />
              </Field>

              <SubmitWrap>
                <AppButton
                  mode="contained"
                  onPress={handleVerify}
                  loading={loading}
                  disabled={loading}
                >
                  Xác thực
                </AppButton>
              </SubmitWrap>

              <AppButton
                  mode="text"
                  onPress={handleResend}
                  loading={resendLoading}
                  disabled={resendLoading}
                  style={{ marginBottom: 24 }}
                  contentStyle={{ paddingVertical: 0 }}
                >
                  Gửi lại mã OTP
              </AppButton>

              <BottomRow>
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
              </BottomRow>
            </FormCard>
          </Container>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}

