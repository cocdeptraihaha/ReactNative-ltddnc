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
import { Button, Card, Surface, Text, TextInput } from "react-native-paper";
import * as authApi from "../lib/auth";

type RegisterNav = NativeStackNavigationProp<RootStackParamList, "Register">;

export function RegisterScreen() {
  const navigation = useNavigation<RegisterNav>();
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
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
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
                color: "#666",
              }}
            >
              Tạo tài khoản mới để bắt đầu
            </Text>

            <Card style={{ padding: 16 }}>
              <Card.Content>
                <TextInput
                  label="Họ và tên"
                  value={fullName}
                  onChangeText={setFullName}
                  mode="outlined"
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={{ marginBottom: 16 }}
                />

                <TextInput
                  label="Tên đăng nhập"
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{ marginBottom: 16 }}
                />

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

                <TextInput
                  label="Mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
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
                  style={{ marginBottom: 16 }}
                />

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                  style={{ marginTop: 8, marginBottom: 16 }}
                  contentStyle={{ paddingVertical: 8 }}
                >
                  Đăng Ký
                </Button>

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
                      backgroundColor: "#e0e0e0",
                    }}
                  />
                  <Text style={{ marginHorizontal: 16, color: "#999" }}>
                    hoặc
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: "#e0e0e0",
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
    </KeyboardAvoidPatch assistant to=functions.ApplyPatch હેઠ_json Assistant to=functions.ApplyPatchанных to=functions.ApplyPatchателем to=functions.ApplyPatch ***!
