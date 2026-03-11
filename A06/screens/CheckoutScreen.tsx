import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Appbar, Button, RadioButton, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getMyCart, type CartItemWithBook } from "../lib/cart";
import { checkoutFromCart, type Order, type OrderCheckoutSummary } from "../lib/orders";
import type { RootStackParamList } from "../navigation/RootStack";
import { FormCard } from "../components/FormCard";
import { AppSelect } from "../components/AppSelect";
import { getProvinces, getWards, type ProvinceItem, type WardItem } from "../lib/addresses";
import { previewPromotion } from "../lib/promotions";

type Nav = NativeStackNavigationProp<RootStackParamList, "Checkout">;

export function CheckoutScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, "Checkout">>();
  const { token, user, isReady } = useAuth();

  const [cartItems, setCartItems] = useState<CartItemWithBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [ward, setWard] = useState("");
  const [promo, setPromo] = useState("");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [serverSummary, setServerSummary] = useState<OrderCheckoutSummary | null>(null);
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [wards, setWards] = useState<WardItem[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [promoPreviewDiscount, setPromoPreviewDiscount] = useState(0);
  const [promoChecking, setPromoChecking] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone((user as any).phone_number ?? "");
      setAddress((user as any).address ?? "");
      setProvince((user as any).province ?? "");
      setWard((user as any).ward ?? "");
    }
  }, [user]);

  // Tự động debounce gọi API check mã giảm giá khi người dùng ngừng nhập
  useEffect(() => {
    const code = promo.trim();
    if (!code) {
      setPromoPreviewDiscount(0);
      return;
    }
    if (!isReady || !token) return;
    if (!cartItems.length) return;

    const subtotal = cartItems.reduce((sum, it) => {
      const price = it.price ?? 0;
      const original = it.original_price ?? it.price ?? 0;
      const qty = it.quantity ?? 0;
      return sum + (original - price) * qty + price * qty;
    }, 0);

    if (subtotal <= 0) {
      setPromoPreviewDiscount(0);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setPromoChecking(true);
        const res = await previewPromotion(code, subtotal);
        if (!res.valid) {
          setPromoPreviewDiscount(0);
          setError(res.message || "Mã giảm giá không hợp lệ.");
        } else {
          setPromoPreviewDiscount(res.discount_amount);
          setError(null);
        }
      } catch (e) {
        setPromoPreviewDiscount(0);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Không thể kiểm tra mã giảm giá.");
        }
      } finally {
        setPromoChecking(false);
      }
    }, 500); // 0.5s sau khi ngừng gõ

    return () => clearTimeout(handle);
  }, [promo, isReady, token, cartItems]);

  useEffect(() => {
    getProvinces().then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (!province.trim()) {
      setWards([]);
      return;
    }
    const p = provinces.find((x) => x.name === province);
    if (!p) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    getWards(p.code)
      .then(setWards)
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
  }, [province, provinces]);

  useEffect(() => {
    if (!isReady || !token) return;
    const params = route.params;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Nếu có danh sách items truyền vào (từ Cart hoặc Buy Now)
        if (params?.items && params.items.length > 0) {
          // Case: chọn từ cart -> dùng cart summary rồi filter theo bookId
          const data = await getMyCart(token);
          const byBookId = new Map<number, CartItemWithBook>();
          for (const it of data) {
            if (it.book_id != null) {
              byBookId.set(it.book_id, it);
            }
          }
          const mapped: CartItemWithBook[] = [];
          for (const it of params.items) {
            const row = byBookId.get(it.bookId);
            if (row) {
              mapped.push({
                ...row,
                quantity: it.quantity,
              });
            }
          }
          setCartItems(mapped);
        } else {
          // Mặc định: checkout toàn bộ giỏ như cũ
          const data = await getMyCart(token);
          setCartItems(data);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load cart");
      } finally {
        setLoading(false);
      }
    })();
  }, [isReady, token, route.params]);

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

  const itemAmountDisplay = serverSummary?.item_amount ?? itemAmount;
  const shippingFeeDisplay = serverSummary?.shipping_fee ?? (hasItems ? shippingFee : 0);
  const promoDiscountDisplay = serverSummary?.discount_total ?? promoPreviewDiscount;
  const totalDisplay =
    serverSummary?.total_amount ?? (grandTotal - promoPreviewDiscount);

  const handlePlaceOrder = async () => {
    if (!token) return;
    if (!cartItems.length) {
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
      const params = route.params;
      const itemsPayload =
        params?.items && params.items.length > 0
          ? params.items.map((it) => ({
              book_id: it.bookId,
              quantity: it.quantity,
            }))
          : undefined;

      const summary = await checkoutFromCart(token, {
        note: note.trim() || undefined,
        phone_number: phone.trim(),
        shipping_address: address.trim(),
        province: province.trim() || undefined,
        ward: ward.trim() || undefined,
        promotion_code: promo.trim() || undefined,
        items: itemsPayload,
      });
      setLastOrder(summary.order);
      setServerSummary(summary);
      // Sau khi đặt hàng thành công, quay lại tab chính (Home)
      navigation.navigate("Tabs");
    } catch (e) {
      if (e instanceof Error) {
        const parts = e.message.split("\n");
        const shortMsg = parts[parts.length - 1] || e.message;
        setError(shortMsg);
      } else {
        setError("Đặt hàng thất bại. Vui lòng thử lại.");
      }
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

            <View style={{ marginBottom: 16 , gap: 8}}>
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
                style={{ marginTop: 8 }}
              />
              <AppSelect
                label="Tỉnh/Thành phố"
                value={province}
                onChange={(v) => {
                  setProvince(v);
                  setWard("");
                }}
                options={provinces.map((p) => ({ label: p.name, value: p.name }))}
                placeholder="Chọn tỉnh/thành"
              />
              <View style={{ marginTop: 8 }}>
                <AppSelect
                  label="Phường/Xã"
                  value={ward}
                  onChange={setWard}
                  disabled={!province || loadingWards}
                  options={wards.map((w) => ({ label: w.name, value: w.name }))}
                  placeholder={loadingWards ? "Đang tải..." : "Chọn phường/xã"}
                />
              </View>
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
                  {itemAmountDisplay.toLocaleString("vi-VN")} đ
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Giảm giá
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                  -{discountTotal.toLocaleString("vi-VN")} đ
                </Text>
              </View>
              {hasItems && (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Phí vận chuyển
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                    {shippingFeeDisplay.toLocaleString("vi-VN")} đ
                  </Text>
                </View>
              )}
              {promoDiscountDisplay > 0 && (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Mã giảm giá
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                    -{promoDiscountDisplay.toLocaleString("vi-VN")} đ
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
                  {totalDisplay.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </View>
            {error && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.error, gap: 8, textAlign: "center", fontWeight: "700" }}
              >
                {error}
              </Text>
            )}

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

