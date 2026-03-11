import { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Text, Surface, useTheme, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";

type LoginNav = NativeStackNavigationProp<RootStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const { login, isLoading } = useAuth();
  const theme = useTheme();
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
      navigation.replace("Tabs");
    } catch (e) {
      Alert.alert(
        "Đăng nhập thất bại",
        e instanceof Error ? e.message : "Đăng nhập thất bại",
      );
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
                name="login-variant"
                size={36}
                color={theme.colors.primary}
              />
            </View>
            <Text
              variant="headlineMedium"
              style={{ fontWeight: "800", marginBottom: 4 }}
            >
              Đăng nhập
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Chào mừng bạn trở lại!
            </Text>
          </View>

          <View style={{ width: "100%", maxWidth: 400, alignSelf: "center", gap: 14 }}>
            <AppTextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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
                <TextInput.Icon
                  icon={showPassword ? "eye" : "eye-off"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <AppButton
              mode="text"
              onPress={() => navigation.navigate("ForgotPassword")}
              style={{ alignSelf: "flex-end" }}
              contentStyle={{ paddingVertical: 0 }}
              compact
            >
              Quên mật khẩu?
            </AppButton>

            <AppButton
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              icon="arrow-right"
              contentStyle={{ paddingVertical: 6, flexDirection: "row-reverse" }}
              style={{ borderRadius: 14 }}
            >
              Đăng nhập
            </AppButton>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 20,
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
                Chưa có tài khoản?{" "}
              </Text>
              <AppButton
                mode="text"
                compact
                onPress={() => navigation.navigate("Register")}
                contentStyle={{ paddingVertical: 0 }}
              >
                Đăng ký ngay
              </AppButton>
            </View>
          </View>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}
