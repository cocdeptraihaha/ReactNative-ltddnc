import { useEffect } from "react";
import "react-native-gesture-handler";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RootStack } from "./navigation/RootStack";
import { theme } from "./theme";
import { setOnUnauthorized } from "./lib/api";

function AppContent() {
  const navigationRef = useNavigationContainerRef();
  const { logout } = useAuth();

  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
      navigationRef.reset({
        index: 0,
        routes: [{ name: "Welcome" as never }],
      });
    });
    return () => setOnUnauthorized(() => {});
  }, [logout]);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

