import { useRouter } from "expo-router";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Homepage() {
    const router = useRouter();
  return (
    <SafeAreaView
    style={{
        backgroundColor: '#fff',  
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }}
    >
      <Text
      style={{
        color: "black",
        fontSize: 20,
        fontWeight: "bold",
      }}
      >Đây là Homepage</Text>
      <Text>Họ tên: Nguyễn Thanh Tính</Text>
      <Text>MSSV: 22110247</Text>
      <Button
        title="Về trang giới thiệu"
        onPress={() => router.push("/")}
      />
    </SafeAreaView>
  );
}