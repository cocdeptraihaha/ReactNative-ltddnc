import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Checkbox, IconButton, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { Image } from "expo-image";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getMyCart, removeCartItem, updateCartQuantity, type CartItemWithBook } from "../lib/cart";
import { FormCard } from "../components/FormCard";
import type { RootStackParamList } from "../navigation/RootStack";

type Nav = NativeStackNavigationProp<RootStackParamList, "Checkout">;
import { Swipeable } from "react-native-gesture-handler";

export function CartScreen() {
  const theme = useTheme();
  const { token, isReady } = useAuth();
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<CartItemWithBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const loadCart = useCallback(async () => {
    if (!isReady || !token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getMyCart(token);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [isReady, token]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  useFocusEffect(
    useCallback(() => {
      void loadCart();
    }, [loadCart]),
  );

  // Khi danh sách items thay đổi, mặc định chọn tất cả
  useEffect(() => {
    setSelectedIds(new Set(items.map((it) => it.id)));
  }, [items]);

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

  const hasItems = items.length > 0;
  const selectedItems = items.filter((it) => selectedIds.has(it.id));
  const hasSelected = selectedItems.length > 0;

  let itemAmount = 0;
  let discountTotal = 0;
  let shippingFee = 30000;
  for (const it of selectedItems) {
    const price = it.price ?? 0; // giá đang hiển thị (đã discount nếu có)
    const original = it.original_price ?? it.price ?? 0; // giá gốc
    const qty = it.quantity ?? 0;
    itemAmount += original * qty;
    if (original > price) {
      discountTotal += (original - price) * qty;
    }
  }
  const grandTotal = itemAmount - discountTotal + (hasSelected ? shippingFee : 0); // tổng tiền phải trả (đã áp dụng discount)

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allSelected = hasItems && selectedItems.length === items.length;
  const toggleSelectAll = () => {
    if (!hasItems) {
      setSelectedIds(new Set());
      return;
    }
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((it) => it.id)));
    }
  };

  const handleChangeQty = async (item: CartItemWithBook, delta: number) => {
    if (!token) return;
    const currentQty = item.quantity ?? 0;
    const stock = item.stock_quantity ?? null;
    const nextQty = currentQty + delta;
    if (nextQty < 1) {
      // Không cho xuống dưới 1, chỉ xóa bằng thao tác swipe
      return;
    }
    if (stock != null && nextQty > stock) {
      // Không cho vượt quá số lượng tồn kho
      return;
    }
    try {
      setUpdatingId(item.id);
      const updated = await updateCartQuantity(token, item.id, nextQty);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, quantity: updated.quantity } : it)),
      );
    } catch (e) {
      console.warn("Failed to update cart quantity", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetQty = async (item: CartItemWithBook, text: string) => {
    if (!token) return;
    const parsed = parseInt(text.replace(/\D/g, ""), 10);
    if (Number.isNaN(parsed)) {
      return;
    }
    const currentQty = item.quantity ?? 0;
    const stock = item.stock_quantity ?? null;
    let nextQty = parsed;
    if (nextQty < 1) nextQty = 1;
    if (stock != null && nextQty > stock) nextQty = stock;
    if (nextQty === currentQty) return;
    try {
      setUpdatingId(item.id);
      const updated = await updateCartQuantity(token, item.id, nextQty);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, quantity: updated.quantity } : it)),
      );
    } catch (e) {
      console.warn("Failed to set cart quantity", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item: CartItemWithBook) => {
    if (!token) return;
    try {
      setUpdatingId(item.id);
      await removeCartItem(token, item.id);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
    } catch (e) {
      console.warn("Failed to remove cart item", e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header
        elevated
        theme={{ colors: { primaryContainer: theme.colors.primaryContainer } }}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
        }}
      >
        <Appbar.Content title="Cart" />
      </Appbar.Header>
      <View style={{ flex: 1, padding: 16, alignItems: "center" }}>
        <View style={{ width: "100%", maxWidth: 720 }}>
          <FormCard>
            <View style={{ marginBottom: 12 }}>
              {hasItems && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Checkbox
                      status={allSelected ? "checked" : hasSelected ? "indeterminate" : "unchecked"}
                      onPress={toggleSelectAll}
                    />
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurface }}
                    >
                      Chọn tất cả
                    </Text>
                  </View>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {selectedItems.length}/{items.length} sản phẩm
                  </Text>
                </View>
              )}
            </View>

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

            {!loading && !hasItems && !error && (
              <View style={{ paddingVertical: 32, alignItems: "center" }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Giỏ hàng trống.
                </Text>
              </View>
            )}

            {hasItems && (
              <>
                <FlatList
                  data={items}
                  keyExtractor={(item) => String(item.id)}
                  ItemSeparatorComponent={() => (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: theme.colors.outlineVariant,
                        marginVertical: 8,
                      }}
                    />
                  )}
                  renderItem={({ item }) => {
                    const price = item.price ?? 0;
                    const original = item.original_price ?? item.price ?? 0;
                    const qty = item.quantity ?? 0;
                    const lineTotal = price * qty;
                    const imageUrl = item.image_url ?? null;
                    const title = item.title ?? `Sách #${item.book_id}`;
                    const hasDiscount = original > price;

                    const checked = selectedIds.has(item.id);
                    return (
                      <Swipeable
                        renderRightActions={() => (
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                              width: 72,
                              backgroundColor: theme.colors.error,
                              borderRadius: 12,
                              marginLeft: 8,
                            }}
                          >
                            <IconButton
                              icon="trash-can-outline"
                              size={22}
                              iconColor={theme.colors.onError}
                              disabled={updatingId === item.id}
                              onPress={() => handleRemove(item)}
                            />
                          </View>
                        )}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Checkbox
                            status={checked ? "checked" : "unchecked"}
                            onPress={() => toggleSelectOne(item.id)}
                          />
                          <View
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 12,
                              overflow: "hidden",
                              backgroundColor: theme.colors.surfaceVariant,
                            }}
                          >
                            {imageUrl ? (
                              <Image
                                source={{ uri: imageUrl }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                              />
                            ) : (
                              <View
                                style={{
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text
                                  variant="labelSmall"
                                  style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
                                  numberOfLines={2}
                                >
                                  {title}
                                </Text>
                              </View>
                            )}
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text
                              variant="bodyMedium"
                              numberOfLines={2}
                              style={{ color: theme.colors.onSurface, fontWeight: "600" }}
                            >
                              {title}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
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
                            <Text
                              variant="bodySmall"
                              style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                            >
                              Tổng: {lineTotal.toLocaleString("vi-VN")} đ
                            </Text>
                          </View>

                          <View style={{ alignItems: "flex-end", justifyContent: "center", height: 32 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                              <IconButton
                                icon="minus-circle-outline"
                                size={20}
                                disabled={updatingId === item.id || qty <= 1}
                                onPress={() => handleChangeQty(item, -1)}
                              />
                              <TextInput
                                mode="outlined"
                                dense
                                value={String(qty)}
                                keyboardType="number-pad"
                                onChangeText={(text) => handleSetQty(item, text)}
                                style={{
                                  width: 40,
                                  height: 32,
                                  textAlign: "center",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  paddingHorizontal: 0,
                                }}
                              />
                              <IconButton
                                icon="plus-circle-outline"
                                size={20}
                                disabled={
                                  updatingId === item.id ||
                                  (item.stock_quantity != null && qty >= item.stock_quantity)
                                }
                                onPress={() => handleChangeQty(item, 1)}
                              />
                            </View>
                          </View>
                        </View>
                      </Swipeable>
                    );
                  }}
                />

                <View
                  style={{
                    marginTop: 16,
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
                      -{discountTotal.toLocaleString("vi-VN")} đ
                    </Text>
                  </View>
                  {hasSelected && (
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
                    <Text variant="bodyMedium" style={{ fontWeight: "700", color: theme.colors.onSurface }}>
                      Tổng tiền
                    </Text>
                    <Text variant="bodyMedium" style={{ fontWeight: "700", color: theme.colors.onSurface }}>
                      {grandTotal.toLocaleString("vi-VN")} đ
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Button
                    mode="contained"
                    style={{ borderRadius: 999 }}
                    contentStyle={{ paddingVertical: 8 }}
                    disabled={!hasSelected}
                    onPress={() =>
                      navigation.navigate("Checkout", {
                        mode: "cart",
                        items: selectedItems.map((it) => ({
                          bookId: it.book_id,
                          quantity: it.quantity ?? 0,
                        })),
                      })
                    }
                  >
                    Thanh toán
                  </Button>
                </View>
              </>
            )}
          </FormCard>
        </View>
      </View>
    </Surface>
  );
}
