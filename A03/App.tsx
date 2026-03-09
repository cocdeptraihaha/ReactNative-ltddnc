import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./context/AuthContext";
import { RootStack } from "./navigation/RootStack";
import { theme } from "./theme";

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}

