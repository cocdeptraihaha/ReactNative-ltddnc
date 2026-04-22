import { useEffect, useState } from "react";
import { Modal, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  RadioButton,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getMyCart, type CartItemWithBook } from "../lib/cart";
import { getBook } from "../lib/books";
import { checkoutFromCart, type Order, type OrderCheckoutSummary } from "../lib/orders";
import type { RootStackParamList } from "../navigation/RootStack";
import { AppSelect } from "../components/AppSelect";
import {
  getProvinces,
  getWards,
  type ProvinceItem,
  type WardItem,
} from "../lib/addresses";
import { previewPromotion } from "../lib/promotions";
import { getMyOwnedPromotions, type OwnedPromotion } from "../lib/myPromotions";

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
  const [fullName, setFullName] = useState("");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [ward, setWard] = useState("");
  const [promo, setPromo] = useState("");
  const [serverSummary, setServerSummary] = useState<OrderCheckoutSummary | null>(null);
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [wards, setWards] = useState<WardItem[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [promoPreviewDiscount, setPromoPreviewDiscount] = useState(0);
  const [promoChecking, setPromoChecking] = useState(false);
  const [voucherModal, setVoucherModal] = useState(false);
  const [ownedVouchers, setOwnedVouchers] = useState<OwnedPromotion[]>([]);

  useEffect(() => {
    if (user) {
      setFullName((user as any).full_name ?? "");
      setPhone((user as any).phone_number ?? "");
      setAddress((user as any).address ?? "");
      setProvince((user as any).province ?? "");
      setWard((user as any).ward ?? "");
    }
  }, [user]);

  useEffect(() => {
    const code = promo.trim();
    if (!code) { setPromoPreviewDiscount(0); return; }
    if (!isReady || !token || !cartItems.length) return;
    const subtotal = cartItems.reduce((s, it) => s + (it.original_price ?? it.price ?? 0) * (it.quantity ?? 0), 0);
    if (subtotal <= 0) { setPromoPreviewDiscount(0); return; }
    const h = setTimeout(async () => {
      try {
        setPromoChecking(true);
        const res = await previewPromotion(code, subtotal, token);
        if (!res.valid) { setPromoPreviewDiscount(0); setError(res.message || "Mã không hợp lệ"); }
        else { setPromoPreviewDiscount(res.discount_amount); setError(null); }
      } catch (e) {
        setPromoPreviewDiscount(0);
        setError(e instanceof Error ? e.message : "Lỗi kiểm tra mã");
      } finally { setPromoChecking(false); }
    }, 500);
    return () => clearTimeout(h);
  }, [promo, isReady, token, cartItems]);

  const openVoucherPicker = async () => {
    if (!token) return;
    try {
      const list = await getMyOwnedPromotions(token, true);
      setOwnedVouchers(list);
      setVoucherModal(true);
    } catch {
      setOwnedVouchers([]);
      setVoucherModal(true);
    }
  };

  useEffect(() => { getProvinces().then(setProvinces).catch(() => {}); }, []);

  useEffect(() => {
    if (!province.trim()) { setWards([]); return; }
    const p = provinces.find((x) => x.name === province);
    if (!p) { setWards([]); return; }
    setLoadingWards(true);
    getWards(p.code).then(setWards).catch(() => setWards([])).finally(() => setLoadingWards(false));
  }, [province, provinces]);

  useEffect(() => {
    if (!isReady || !token) return;
    const params = route.params;
    (async () => {
      try {
        setLoading(true); setError(null);
        if (params?.items && params.items.length > 0) {
          const requestedItems = params.items as { bookId: number; quantity: number }[];
          const data = await getMyCart(token);
          const byBookId = new Map(data.filter((it) => it.book_id != null).map((it) => [it.book_id, it]));
          const resolved: CartItemWithBook[] = [];
          for (const it of requestedItems) {
            const row = byBookId.get(it.bookId);
            if (row) {
              resolved.push({ ...row, quantity: it.quantity });
            } else {
              const book = await getBook(it.bookId);
              resolved.push({
                id: -it.bookId,
                book_id: book.id,
                quantity: it.quantity,
                title: book.title ?? `Sách #${book.id}`,
                price: book.final_price ?? book.selling_price ?? 0,
                original_price: book.original_price ?? book.selling_price ?? 0,
                image_url: book.image_url ?? null,
                stock_quantity: book.stock_quantity ?? 0,
              });
            }
          }
          setCartItems(resolved);
        } else {
          setCartItems(await getMyCart(token));
        }
      } catch (e) { setError(e instanceof Error ? e.message : "Lỗi tải giỏ"); }
      finally { setLoading(false); }
    })();
  }, [isReady, token, route.params]);

  if (!isReady || !token) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
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
    if (original > price) discountTotal += (original - price) * qty;
  }
  const grandTotal = itemAmount - discountTotal + (hasItems ? shippingFee : 0);
  const itemAmountDisplay = serverSummary?.item_amount ?? itemAmount;
  const shippingFeeDisplay = serverSummary?.shipping_fee ?? (hasItems ? shippingFee : 0);
  const promoDiscountDisplay = serverSummary?.discount_total ?? promoPreviewDiscount;
  const totalDisplay = serverSummary?.total_amount ?? (grandTotal - promoPreviewDiscount);

  const fmtPrice = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const handlePlaceOrder = async () => {
    if (!token || !cartItems.length) { setError("Giỏ hàng trống."); return; }
    if (!phone.trim() || !address.trim()) { setError("Nhập SĐT và địa chỉ."); return; }
    try {
      setPlacing(true); setError(null);
      const params = route.params;
      const itemsPayload = params?.items?.length
        ? (params.items as { bookId: number; quantity: number }[]).map((it) => ({ book_id: it.bookId, quantity: it.quantity }))
        : undefined;
      await checkoutFromCart(token, {
        full_name: fullName.trim() || undefined,
        note: note.trim() || undefined,
        phone_number: phone.trim(),
        shipping_address: address.trim(),
        province: province.trim() || undefined,
        ward: ward.trim() || undefined,
        promotion_code: promo.trim() || undefined,
        items: itemsPayload,
      });
      navigation.navigate("Tabs");
    } catch (e) {
      const msg = e instanceof Error ? e.message.split("\n").pop() || e.message : "Đặt hàng thất bại.";
      setError(msg);
    } finally { setPlacing(false); }
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Thanh toán" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 14 }}>
        {loading && (
          <View style={{ paddingVertical: 24, alignItems: "center" }}><ActivityIndicator /></View>
        )}

        {/* ── Products ── */}
        {hasItems && (
          <Section title="Sản phẩm" icon="package-variant" theme={theme}>
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
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" numberOfLines={2} style={{ fontWeight: "600" }}>
                      {title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                      SL: {qty}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    {hasDiscount && (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textDecorationLine: "line-through" }}>
                        {fmtPrice(original)}
                      </Text>
                    )}
                    <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: "700" }}>
                      {fmtPrice(price * qty)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Section>
        )}

        {/* ── Shipping info ── */}
        <Section title="Thông tin giao hàng" icon="truck-outline" theme={theme}>
          <View style={{ gap: 10 }}>
            <TextInput mode="outlined" label="Họ tên người nhận" value={fullName} onChangeText={setFullName} dense />
            <TextInput mode="outlined" label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" dense />
            <TextInput mode="outlined" label="Địa chỉ" value={address} onChangeText={setAddress} dense />
            <AppSelect
              label="Tỉnh/Thành phố"
              value={province}
              onChange={(v) => { setProvince(v); setWard(""); }}
              options={provinces.map((p) => ({ label: p.name, value: p.name }))}
              placeholder="Chọn tỉnh/thành"
            />
            <AppSelect
              label="Phường/Xã"
              value={ward}
              onChange={setWard}
              disabled={!province || loadingWards}
              options={wards.map((w) => ({ label: w.name, value: w.name }))}
              placeholder={loadingWards ? "Đang tải..." : "Chọn phường/xã"}
            />
            <TextInput mode="outlined" label="Ghi chú (tuỳ chọn)" value={note} onChangeText={setNote} dense />
          </View>
        </Section>

        {/* ── Payment ── */}
        <Section title="Thanh toán" icon="credit-card-outline" theme={theme}>
          <RadioButton.Item label="Thanh toán khi nhận hàng (COD)" value="cod" status="checked" />
        </Section>

        {/* ── Promo ── */}
        <Section title="Mã giảm giá" icon="ticket-percent-outline" theme={theme}>
          <TextInput
            mode="outlined"
            label="Nhập mã (nếu có)"
            value={promo}
            onChangeText={setPromo}
            dense
            right={promoChecking ? <TextInput.Icon icon="loading" /> : undefined}
          />
          <Button
            mode="outlined"
            style={{ marginTop: 10, borderRadius: 10 }}
            icon="ticket-confirmation-outline"
            onPress={openVoucherPicker}
          >
            Chọn từ voucher của tôi
          </Button>
        </Section>

        {/* ── Summary ── */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 14,
            padding: 14,
            gap: 6,
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
          }}
        >
          <SummaryRow label="Tạm tính" value={fmtPrice(itemAmountDisplay)} theme={theme} />
          {discountTotal > 0 && (
            <SummaryRow label="Giảm giá sách" value={`-${fmtPrice(discountTotal)}`} theme={theme} color={theme.colors.error} />
          )}
          {hasItems && <SummaryRow label="Vận chuyển" value={fmtPrice(shippingFeeDisplay)} theme={theme} />}
          {promoDiscountDisplay > 0 && (
            <SummaryRow label="Mã giảm giá" value={`-${fmtPrice(promoDiscountDisplay)}`} theme={theme} color={theme.colors.error} />
          )}
          <Divider style={{ marginVertical: 4 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text variant="titleMedium" style={{ fontWeight: "800" }}>Tổng cộng</Text>
            <Text variant="titleMedium" style={{ fontWeight: "800", color: theme.colors.primary }}>{fmtPrice(totalDisplay)}</Text>
          </View>
        </View>

        {error && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, textAlign: "center", fontWeight: "700" }}>
            {error}
          </Text>
        )}
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceVariant,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Button
          mode="contained"
          disabled={!hasItems || placing}
          loading={placing}
          style={{ borderRadius: 12 }}
          contentStyle={{ paddingVertical: 6 }}
          labelStyle={{ fontWeight: "700", fontSize: 15 }}
          icon="check-circle-outline"
          onPress={handlePlaceOrder}
        >
          Xác nhận đặt hàng
        </Button>
      </View>

      <Modal visible={voucherModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Surface
            style={{
              borderRadius: 16,
              padding: 16,
              maxHeight: "70%",
            }}
          >
            <Text variant="titleMedium" style={{ fontWeight: "700", marginBottom: 12 }}>
              Voucher chưa dùng
            </Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {ownedVouchers.length === 0 ? (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Không có voucher khả dụng. Đổi điểm tại Hồ sơ → Đổi điểm lấy voucher.
                </Text>
              ) : (
                ownedVouchers.map((v) => (
                  <Button
                    key={v.id}
                    mode="contained-tonal"
                    style={{ marginBottom: 8, alignItems: "flex-start" }}
                    onPress={() => {
                      if (v.code) setPromo(v.code);
                      setVoucherModal(false);
                    }}
                  >
                    {v.code ?? "—"} · {v.name ?? "Voucher"}
                  </Button>
                ))
              )}
            </ScrollView>
            <Button mode="text" onPress={() => setVoucherModal(false)} style={{ marginTop: 8 }}>
              Đóng
            </Button>
          </Surface>
        </View>
      </Modal>
    </Surface>
  );
}

function Section({
  title,
  icon,
  theme,
  children,
}: {
  title: string;
  icon: string;
  theme: any;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        padding: 14,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <MaterialCommunityIcons name={icon as any} size={18} color={theme.colors.primary} />
        <Text variant="titleSmall" style={{ fontWeight: "700" }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function SummaryRow({
  label,
  value,
  theme,
  color,
}: {
  label: string;
  value: string;
  theme: any;
  color?: string;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text variant="bodySmall" style={{ color: color ?? theme.colors.onSurfaceVariant }}>{label}</Text>
      <Text variant="bodySmall" style={{ color: color ?? theme.colors.onSurface }}>{value}</Text>
    </View>
  );
}
