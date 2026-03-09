import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { Surface, Text, TextInput, useTheme } from "react-native-paper";
import * as authApi from "../lib/auth";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { FormCard } from "../components/FormCard";
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
        "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP xác thực.",
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
              Đăng Ký
            </Text>
            <Text
              variant="bodyLarge"
              style={{
                marginBottom: 32,
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Tạo tài khoản mới để bắt đầu
            </Text>

            <FormCard>
              <View style={{ marginBottom: 16 }}>
                <AppTextInput
                  label="Họ và tên"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <AppTextInput
                  label="Tên đăng nhập"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <AppTextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
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
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <AppTextInput
                  label="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? "eye" : "eye-off"}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  }
                />
              </View>

              <View style={{ marginTop: 8, marginBottom: 16 }}>
                <AppButton
                  mode="contained"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                >
                  Đăng Ký
                </AppButton>
              </View>

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
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
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
            </FormCard>
          </View>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}

