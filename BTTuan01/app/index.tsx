import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Image, Text } from "react-native";
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
        backgroundColor: '#fff',
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require('../assets/images/logotruong.png')}
        style={{ width: 100, height: 100 }}
      />
      <Text>Tự động chuyển sang trang Homepage sau {count} giây</Text>
      <Button
        title="Tới Homepage"
        onPress={() => router.push("/homepage")}
      />
    </SafeAreaView>
  );
}
