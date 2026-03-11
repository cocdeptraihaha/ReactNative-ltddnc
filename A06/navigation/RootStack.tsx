import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  VerifyOtpScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  BookDetailScreen,
  CheckoutScreen,
  OrderHistoryScreen,
  OrderDetailScreen,
  AdminOrderManageScreen,
  AdminAddBookScreen,
} from "../screens";
import { BottomTabs } from "./BottomTabs";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Tabs: undefined;
  VerifyOtp: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  BookDetail: { bookId: number };
  Checkout:
    | {
        mode?: "cart" | "single";
        items?: { bookId: number; quantity: number }[];
      }
    | undefined;
  OrderHistory: undefined;
  OrderDetail: { orderId: number };
  AdminOrders: undefined;
  AdminAddBook: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrderManageScreen} />
      <Stack.Screen name="AdminAddBook" component={AdminAddBookScreen} />
    </Stack.Navigator>
  );
}
