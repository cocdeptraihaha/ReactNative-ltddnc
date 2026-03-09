import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Text, TextInput, Button, Card, Surface } from "react-native-paper";
import { Link, router } from "expo-router";
import * as authApi from "../lib/auth";

export default function ForgotPasswordScreen() {
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
      Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra.");
      router.replace({ pathname: "/reset-password", params: { email: email.trim() } });
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
      <Surface style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
            <Text variant="displaySmall" style={{ marginBottom: 8, textAlign: "center" }}>
              Quên mật khẩu
            </Text>
            <Text variant="bodyLarge" style={{ marginBottom: 32, textAlign: "center", color: "#666" }}>
              Nhập email để nhận mã OTP đặt lại mật khẩu
            </Text>

            <Card style={{ padding: 16 }}>
              <Card.Content>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
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
                  Gửi mã OTP
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
