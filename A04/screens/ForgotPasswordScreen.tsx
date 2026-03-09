import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import * as authApi from "../lib/auth";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { FormCard } from "../components/FormCard";
import { BottomRow, Container, Field, SubmitWrap } from "./styled/ForgotPasswordScreen.styled";

type ForgotNav = NativeStackNavigationProp<
  RootStackParamList,
  "ForgotPassword"
>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotNav>();
  const theme = useTheme();
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
      Alert.alert(
        "Thành công",
        "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra.",
      );
      navigation.replace("ResetPassword", { email: email.trim() });
    } catch (e) {
      Alert.alert(
        "Lỗi",
        e instanceof Error ? e.message : "Không thể gửi OTP",
      );
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
          <Container>
            <Text
              variant="displaySmall"
              style={{ marginBottom: 8, textAlign: "center" }}
            >
              Quên mật khẩu
            </Text>
            <Text
              variant="bodyLarge"
              style={{
                marginBottom: 32,
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Nhập email để nhận mã OTP đặt lại mật khẩu
            </Text>

            <FormCard>
              <Field>
                <AppTextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Field>

              <SubmitWrap>
                <AppButton
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                >
                  Gửi mã OTP
                </AppButton>
              </SubmitWrap>

              <BottomRow>
                <AppButton
                  mode="text"
                  compact
                  onPress={() => navigation.navigate("Login")}
                  contentStyle={{ paddingVertical: 0 }}
                >
                  Quay lại đăng nhập
                </AppButton>
              </BottomRow>
            </FormCard>
          </Container>
        </ScrollView>
      </Surface>
    </KeyboardAvoidingView>
  );
}

