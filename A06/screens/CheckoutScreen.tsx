import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Appbar, Button, RadioButton, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { getMyCart, type CartItemWithBook } from "../lib/cart";
import { checkoutFromCart, type Order } from "../lib/orders";
import type { RootStackParamList } from "../navigation/RootStack";
import { FormCard } from "../components/FormCard";

type Nav = NativeStackNavigationProp<RootStackParamList, "Checkout">;

export function CheckoutScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { token, user, isReady } = useAuth();

  const [cartItems, setCartItems] = useState<CartItemWithBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [promo, setPromo] = useState("");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      setPhone((user as any).phone_number ?? "");
      setAddress((user as any).address ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (!isReady || !token) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyCart(token);
        setCartItems(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load cart");
      } finally {
        setLoading(false);
      }
    })();
  }, [isReady, token]);

  if (!isReady || !token) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text variant="bodyLarge" style={{ marginTop: 8 }}>
          Loading...
        </Text>
      </Surface>
    );
  }

  const hasItems = cartItems.length > 0;
  let itemAmount = 0;
  let discountTotal = 0;
  const shippingFee = 30000;
  for (const it of cartItems) {
    const price = it.price ?? 0;
    const original = it.original_price ?? it.price ?? 0;
    const qty = it.quantity ?? 0;
    itemAmount += original * qty;
    if (original > price) {
      discountTotal += (original - price) * qty;
    }
  }
  const grandTotal = itemAmount - discountTotal + (hasItems ? shippingFee : 0);

  const handlePlaceOrder = async () => {
    if (!token) return;
    if (!hasItems) {
      setError("Giỏ hàng trống.");
      return;
    }
    if (!phone.trim() || !address.trim()) {
      setError("Vui lòng nhập đầy đủ SĐT và địa chỉ giao hàng.");
      return;
    }
    try {
      setPlacing(true);
      setError(null);
      const order = await checkoutFromCart(token, {
        note: note.trim() || undefined,
        phone_number: phone.trim(),
        shipping_address: address.trim(),
        promotion_code: promo.trim() || undefined,
      });
      setLastOrder(order);
      // Sau khi đặt hàng thành công, quay lại tab chính (Home)
      navigation.navigate("Tabs");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header
        elevated
        theme={{ colors: { primaryContainer: theme.colors.primaryContainer } }}
        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}
      >
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Thanh toán" />
      </Appbar.Header>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 720 }}>
          <FormCard>
            {loading && (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator />
              </View>
            )}

            {error && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.error, marginBottom: 8 }}
              >
                {error}
              </Text>
            )}

            {hasItems && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  variant="titleMedium"
                  style={{ fontWeight: "700", color: theme.colors.onSurface }}
                >
                  Sản phẩm
                </Text>
                {cartItems.map((it) => {
                  const price = it.price ?? 0;
                  const original = it.original_price ?? it.price ?? 0;
                  const qty = it.quantity ?? 0;
                  const title = it.title ?? `Sách #${it.book_id}`;
                  const hasDiscount = original > price;
                  return (
                    <View
                      key={it.id}
                      style={{
                        marginTop: 8,
                        paddingVertical: 6,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.outlineVariant,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          variant="bodyMedium"
                          numberOfLines={2}
                          style={{ color: theme.colors.onSurface, fontWeight: "600" }}
                        >
                          {title}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                        >
                          SL: {qty}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        {hasDiscount && (
                          <Text
                            variant="bodySmall"
                            style={{
                              color: theme.colors.onSurfaceVariant,
                              textDecorationLine: "line-through",
                            }}
                          >
                            {original.toLocaleString("vi-VN")} đ
                          </Text>
                        )}
                        <Text
                          variant="bodySmall"
                          style={{ color: theme.colors.primary, fontWeight: "700" }}
                        >
                          {price.toLocaleString("vi-VN")} đ
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={{ marginBottom: 16 }}>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "700", color: theme.colors.onSurface }}
              >
                Thông tin giao hàng
              </Text>
              <TextInput
                mode="outlined"
                label="Ghi chú (tuỳ chọn)"
                value={note}
                onChangeText={setNote}
                style={{ marginTop: 8 }}
              />
              <TextInput
                mode="outlined"
                label="Số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={{ marginTop: 8 }}
              />
              <TextInput
                mode="outlined"
                label="Địa chỉ giao hàng"
                value={address}
                onChangeText={setAddress}
                multiline
                style={{ marginTop: 8 }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "700", color: theme.colors.onSurface }}
              >
                Phương thức thanh toán
              </Text>
              <RadioButton.Item
                label="Thanh toán khi nhận hàng (COD)"
                value="cod"
                status="checked"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "700", color: theme.colors.onSurface }}
              >
                Mã giảm giá
              </Text>
              <TextInput
                mode="outlined"
                label="Nhập mã giảm giá (nếu có)"
                value={promo}
                onChangeText={setPromo}
                style={{ marginTop: 8 }}
              />
            </View>

            <View
              style={{
                marginTop: 4,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
                backgroundColor: theme.colors.surfaceVariant,
                padding: 12,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Tổng tiền sản phẩm
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                  {itemAmount.toLocaleString("vi-VN")} đ
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Giảm giá
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                  {discountTotal.toLocaleString("vi-VN")} đ
                </Text>
              </View>
              {hasItems && (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Phí vận chuyển
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                    {shippingFee.toLocaleString("vi-VN")} đ
                  </Text>
                </View>
              )}
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.colors.outlineVariant,
                  marginVertical: 4,
                }}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text
                  variant="bodyMedium"
                  style={{ fontWeight: "700", color: theme.colors.onSurface }}
                >
                  Tổng tiền
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ fontWeight: "700", color: theme.colors.onSurface }}
                >
                  {grandTotal.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <Button
                mode="contained"
                disabled={!hasItems || placing}
                loading={placing}
                style={{ borderRadius: 999 }}
                contentStyle={{ paddingVertical: 8 }}
                onPress={handlePlaceOrder}
              >
                Xác nhận đặt hàng
              </Button>
            </View>
          </FormCard>
        </View>
      </ScrollView>
    </Surface>
  );
}

