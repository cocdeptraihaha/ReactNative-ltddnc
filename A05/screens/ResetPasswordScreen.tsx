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
import * as authApi from "../lib/auth";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { FormCard } from "../components/FormCard";
type ResetNav = NativeStackNavigationProp<
  RootStackParamList,
  "ResetPassword"
>;
type ResetRoute = RouteProp<RootStackParamList, "ResetPassword">;

export function ResetPasswordScreen() {
  const navigation = useNavigation<ResetNav>();
  const route = useRoute<ResetRoute>();
  const email = route.params?.email ?? "";
  const theme = useTheme();
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
      Alert.alert(
        "Thành công",
        "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
      );
      navigation.replace("Login");
    } catch (e) {
      Alert.alert(
        "Lỗi",
        e instanceof Error ? e.message : "Không thể đặt lại mật khẩu",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <Surface style={{ flex: 1 }}>
        <View
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
            Thiếu thông tin email. Vui lòng thực hiện quên mật khẩu trước.
          </Text>
          <AppButton
            mode="contained"
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            Quên mật khẩu
          </AppButton>
        </View>
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
              Đặt lại mật khẩu
            </Text>
            <Text
              variant="bodyLarge"
              style={{
                marginBottom: 32,
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Nhập mã OTP và mật khẩu mới
            </Text>

            <FormCard>
              <View style={{ marginBottom: 16 }}>
                <AppTextInput
                  label="Mã OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <AppTextInput
                  label="Mật khẩu mới"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye" : "eye-off"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <AppTextInput
                  label="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  right={
                    <TextInput.Icon
                      icon={showConfirm ? "eye" : "eye-off"}
                      onPress={() => setShowConfirm(!showConfirm)}
                    />
                  }
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <AppButton
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                >
                  Đặt lại mật khẩu
                </AppButton>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 24,
                }}
              >
                <AppButton
                  mode="text"
                  compact
                  onPress={() => navigation.navigate("Login")}
                  contentStyle={{ paddingVertical: 0 }}
                >
                  Quay lại đăng nhập
                </AppButton>
              </View>
            </FormCard>
          </View>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}

