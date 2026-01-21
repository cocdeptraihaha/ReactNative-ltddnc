import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Index() {
  const router = useRouter();
  const [count, setCount] = useState(10);
  useEffect(() => {
    if (count > 0) {
      setTimeout(() => {
        setCount(count - 1);
      }, 1000);
    } else {
      router.push("/homepage")
    }
  }, [count]);

  return (
    <SafeAreaView
      style={{
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
      >Giới thiệu bản thân</Text>
      <Text>Họ tên: Nguyễn Thanh Tính</Text>
      <Text>MSSV: 22110247</Text>
      <Text>Tự động chuyển sang trang Homepage sau {count} giây</Text>
      <Button
        title="Tới Homepage"
        onPress={() => router.push("/homepage")}
      />

    </SafeAreaView>
  );
}
