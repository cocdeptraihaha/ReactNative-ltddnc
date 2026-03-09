import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Text, TextInput, Button, Card, Surface } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";

type LoginNav = NativeStackNavigationProp<RootStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await login(email.trim(), password);
      navigation.replace("Home");
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Đăng nhập thất bại");
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
              Đăng Nhập
            </Text>
            <Text
              variant="bodyLarge"
              style={{
                marginBottom: 32,
                textAlign: "center",
                color: "#666",
              }}
            >
              Chào mừng bạn trở lại!
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

                <Button
                  mode="text"
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={{ alignSelf: "flex-end", marginBottom: 24 }}
                >
                  Quên mật khẩu?
                </Button>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={{ marginBottom: 16 }}
                  contentStyle={{ paddingVertical: 8 }}
                >
                  Đăng Nhập
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
                    Chưa có tài khoản?{" "}
                  </Text>
                  <Button
                    mode="text"
                    compact
                    onPress={() => navigation.navigate("Register")}
                  >
                    Đăng ký ngay
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

