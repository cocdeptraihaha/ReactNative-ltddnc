import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "../context/AuthContext";
import "../global.css";

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack />
      </AuthProvider>
    </PaperProvider>
  );
}
