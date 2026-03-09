import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Text, TextInput, Button, Card, Surface } from "react-native-paper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import * as authApi from "../lib/auth";

type VerifyOtpNav = NativeStackNavigationProp<RootStackParamList, "VerifyOtp">;
type VerifyOtpRoute = RouteProp<RootStackParamList, "VerifyOtp">;

export function VerifyOtpScreen() {
  const navigation = useNavigation<VerifyOtpNav>();
  const route = useRoute<VerifyOtpRoute>();
  const email = route.params?.email ?? "";
  const { setAuth } = useAuth();
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
      <Surface
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text
          variant="bodyLarge"
          style={{ marginBottom: 16, textAlign: "center" }}
        >
          Thiếu thông tin email. Vui lòng đăng ký lại.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate("Register")}>
          Quay lại đăng ký
        </Button>
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
          <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
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
                color: "#666",
              }}
            >
              Nhập mã OTP đã gửi đến {email}
            </Text>

            <Card style={{ padding: 16 }}>
              <Card.Content>
                <TextInput
                  label="Mã OTP"
                  value={otp}
                  onChangeText={setOtp}
                  mode="outlined"
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="123456"
                  style={{ marginBottom: 16 }}
                />

                <Button
                  mode="contained"
                  onPress={handleVerify}
                  loading={loading}
                  disabled={loading}
                  style={{ marginBottom: 16 }}
                  contentStyle={{ paddingVertical: 8 }}
                >
                  Xác thực
                </Button>

                <Button
                  mode="text"
                  onPress={handleResend}
                  loading={resendLoading}
                  disabled={resendLoading}
                  style={{ marginBottom: 24 }}
                >
                  Gửi lại mã OTP
                </Button>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text variant="bodyMedium" style={{ color: "#666" }}>
                    Đã có tài khoản?{" "}
                  </Text>
                  <Button
                    mode="text"
                    compact
                    onPress={() => navigation.navigate("Login")}
                  >
                    Đăng nhập
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}

