import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Text, TextInput, Button, Card, Surface } from "react-native-paper";
import { Link, router, useLocalSearchParams } from "expo-router";
import * as authApi from "../lib/auth";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email: string }>();
  const email = params.email ?? "";
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !otp.trim() || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email, otp.trim(), newPassword);
      Alert.alert("Thành công", "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      router.replace("/login");
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Không thể đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text variant="bodyLarge" style={{ marginBottom: 16, textAlign: "center" }}>
          Thiếu thông tin email. Vui lòng thực hiện quên mật khẩu trước.
        </Text>
        <Link href="/forgot-password" asChild>
          <Button mode="contained">Quên mật khẩu</Button>
        </Link>
      </Surface>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Surface style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
            <Text variant="displaySmall" style={{ marginBottom: 8, textAlign: "center" }}>
              Đặt lại mật khẩu
            </Text>
            <Text variant="bodyLarge" style={{ marginBottom: 32, textAlign: "center", color: "#666" }}>
              Nhập mã OTP và mật khẩu mới
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
                  style={{ marginBottom: 16 }}
                />

                <TextInput
                  label="Mật khẩu mới"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye" : "eye-off"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={{ marginBottom: 16 }}
                />

                <TextInput
                  label="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="outlined"
                  secureTextEntry={!showConfirm}
                  right={
                    <TextInput.Icon
                      icon={showConfirm ? "eye" : "eye-off"}
                      onPress={() => setShowConfirm(!showConfirm)}
                    />
                  }
                  style={{ marginBottom: 16 }}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={{ marginBottom: 16 }}
                  contentStyle={{ paddingVertical: 8 }}
                >
                  Đặt lại mật khẩu
                </Button>

                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 }}>
                  <Link href="/login" asChild>
                    <Button mode="text" compact>
                      Quay lại đăng nhập
                    </Button>
                  </Link>
                </View>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}
