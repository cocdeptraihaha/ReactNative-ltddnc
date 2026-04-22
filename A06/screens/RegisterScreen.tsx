import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Surface, Text, TextInput, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import * as authApi from "../lib/auth";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";

type RegisterNav = NativeStackNavigationProp<RootStackParamList, "Register">;

export function RegisterScreen() {
  const navigation = useNavigation<RegisterNav>();
  const theme = useTheme();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        full_name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });
      Alert.alert(
        "Thành công",
        "Đăng ký thành công! Kiểm tra email để lấy mã OTP.",
      );
      navigation.replace("VerifyOtp", { email: email.trim() });
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Surface
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 32,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: "center", marginBottom: 28 }}>
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
                name="account-plus-outline"
                size={36}
                color={theme.colors.primary}
              />
            </View>
            <Text
              variant="headlineMedium"
              style={{ fontWeight: "800", marginBottom: 4 }}
            >
              Tạo tài khoản
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Điền thông tin để bắt đầu
            </Text>
          </View>

          <View style={{ width: "100%", maxWidth: 400, alignSelf: "center", gap: 14 }}>
            <AppTextInput
              label="Họ và tên"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              left={<TextInput.Icon icon="account-outline" />}
            />

            <AppTextInput
              label="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              left={<TextInput.Icon icon="at" />}
            />

            <AppTextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email-outline" />}
            />

            <AppTextInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                </Pressable>
              }
            />

            <AppTextInput
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock-check-outline" />}
              right={
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                </Pressable>
              }
            />

            <AppButton
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              icon="check"
              contentStyle={{ paddingVertical: 6, flexDirection: "row-reverse" }}
              style={{ borderRadius: 14, marginTop: 4 }}
            >
              Đăng ký
            </AppButton>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 16,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.outlineVariant }} />
              <Text style={{ marginHorizontal: 14, color: theme.colors.onSurfaceVariant, fontSize: 13 }}>
                hoặc
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.outlineVariant }} />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
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
