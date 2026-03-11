import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  View,
} from "react-native";
import { Surface, Text, TextInput, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootStack";
import * as authApi from "../lib/auth";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";

type ResetNav = NativeStackNavigationProp<RootStackParamList, "ResetPassword">;
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
      Alert.alert("Thành công", "Đổi mật khẩu thành công. Đăng nhập lại.");
      navigation.replace("Login");
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Không thể đặt lại mật khẩu");
    } finally {
      setLoading(false);
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
          Thiếu thông tin email. Vui lòng thực hiện quên mật khẩu trước.
        </Text>
        <AppButton mode="contained" onPress={() => navigation.navigate("ForgotPassword")}>
          Quên mật khẩu
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
                name="form-textbox-password"
                size={36}
                color={theme.colors.primary}
              />
            </View>
            <Text
              variant="headlineMedium"
              style={{ fontWeight: "800", marginBottom: 4 }}
            >
              Đặt lại mật khẩu
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
            >
              Nhập mã OTP và mật khẩu mới
            </Text>
          </View>

          <View style={{ width: "100%", maxWidth: 400, alignSelf: "center", gap: 14 }}>
            <AppTextInput
              label="Mã OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <AppTextInput
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye" : "eye-off"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <AppTextInput
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              left={<TextInput.Icon icon="lock-check-outline" />}
              right={
                <TextInput.Icon
                  icon={showConfirm ? "eye" : "eye-off"}
                  onPress={() => setShowConfirm(!showConfirm)}
                />
              }
            />

            <AppButton
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              icon="check"
              contentStyle={{ paddingVertical: 6, flexDirection: "row-reverse" }}
              style={{ borderRadius: 14, marginTop: 4 }}
            >
              Đặt lại mật khẩu
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
