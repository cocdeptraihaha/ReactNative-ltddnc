import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Checkbox,
  Divider,
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getMyCart,
  removeCartItem,
  updateCartQuantity,
  type CartItemWithBook,
} from "../lib/cart";
import type { RootStackParamList } from "../navigation/RootStack";
import { Swipeable } from "react-native-gesture-handler";

type Nav = NativeStackNavigationProp<RootStackParamList, "Checkout">;

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
      setItems(await getMyCart(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [isReady, token]);

  useEffect(() => void loadCart(), [loadCart]);
  useFocusEffect(useCallback(() => void loadCart(), [loadCart]));

  useEffect(() => {
    setSelectedIds(new Set(items.map((it) => it.id)));
  }, [items]);

  if (!isReady || !token) {
    return (
      <Surface
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator />
      </Surface>
    );
  }

  const hasItems = items.length > 0;
  const selectedItems = items.filter((it) => selectedIds.has(it.id));
  const hasSelected = selectedItems.length > 0;

  let itemAmount = 0;
  let discountTotal = 0;
  const shippingFee = 30000;
  for (const it of selectedItems) {
    const price = it.price ?? 0;
    const original = it.original_price ?? it.price ?? 0;
    const qty = it.quantity ?? 0;
    itemAmount += original * qty;
    if (original > price) discountTotal += (original - price) * qty;
  }
  const grandTotal =
    itemAmount - discountTotal + (hasSelected ? shippingFee : 0);

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = hasItems && selectedItems.length === items.length;
  const toggleSelectAll = () => {
    setSelectedIds(
      allSelected ? new Set() : new Set(items.map((it) => it.id)),
    );
  };

  const handleChangeQty = async (item: CartItemWithBook, delta: number) => {
    if (!token) return;
    const nextQty = (item.quantity ?? 0) + delta;
    if (nextQty < 1) return;
    if (item.stock_quantity != null && nextQty > item.stock_quantity) return;
    try {
      setUpdatingId(item.id);
      const updated = await updateCartQuantity(token, item.id, nextQty);
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, quantity: updated.quantity } : it,
        ),
      );
    } catch {
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetQty = async (item: CartItemWithBook, text: string) => {
    if (!token) return;
    const parsed = parseInt(text.replace(/\D/g, ""), 10);
    if (Number.isNaN(parsed)) return;
    let nextQty = Math.max(1, parsed);
    if (item.stock_quantity != null) nextQty = Math.min(nextQty, item.stock_quantity);
    if (nextQty === (item.quantity ?? 0)) return;
    try {
      setUpdatingId(item.id);
      const updated = await updateCartQuantity(token, item.id, nextQty);
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, quantity: updated.quantity } : it,
        ),
      );
    } catch {
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
    } catch {
    } finally {
      setUpdatingId(null);
    }
  };

  const fmtPrice = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* ── Header ── */}
      <Appbar.Header elevated>
        <Appbar.Content
          title="Giỏ hàng"
          titleStyle={{ fontWeight: "700" }}
        />
        {hasItems && (
          <Appbar.Action
            icon="delete-sweep-outline"
            onPress={() => {}}
          />
        )}
      </Appbar.Header>

      {loading && !hasItems ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      ) : !hasItems && !error ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <MaterialCommunityIcons
            name="cart-off"
            size={64}
            color={theme.colors.outlineVariant}
          />
          <Text
            variant="bodyLarge"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Giỏ hàng trống
          </Text>
        </View>
      ) : (
        <>
          {/* ── Select All bar ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.surfaceVariant,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Checkbox
                status={
                  allSelected
                    ? "checked"
                    : hasSelected
                      ? "indeterminate"
                      : "unchecked"
                }
                onPress={toggleSelectAll}
              />
              <Text variant="bodySmall">Chọn tất cả</Text>
            </View>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {selectedItems.length}/{items.length}
            </Text>
          </View>

          {error && (
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.error,
                paddingHorizontal: 16,
                paddingTop: 8,
              }}
            >
              {error}
            </Text>
          )}

          {/* ── Items ── */}
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 12, gap: 10 }}
            renderItem={({ item }) => {
              const price = item.price ?? 0;
              const original = item.original_price ?? item.price ?? 0;
              const qty = item.quantity ?? 0;
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
                        width: 68,
                        backgroundColor: theme.colors.error,
                        borderRadius: 14,
                        marginLeft: 8,
                      }}
                    >
                      <IconButton
                        icon="trash-can-outline"
                        size={22}
                        iconColor="#fff"
                        disabled={updatingId === item.id}
                        onPress={() => handleRemove(item)}
                      />
                    </View>
                  )}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: theme.colors.surface,
                      borderRadius: 14,
                      padding: 10,
                      gap: 10,
                      elevation: 1,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.06,
                      shadowRadius: 3,
                    }}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      status={checked ? "checked" : "unchecked"}
                      onPress={() => toggleSelectOne(item.id)}
                    />

                    {/* Image */}
                    <View
                      style={{
                        width: 64,
                        height: 76,
                        borderRadius: 10,
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
                          <MaterialCommunityIcons
                            name="book-outline"
                            size={24}
                            color={theme.colors.onSurfaceVariant}
                          />
                        </View>
                      )}
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                      <Text
                        variant="bodyMedium"
                        numberOfLines={2}
                        style={{
                          color: theme.colors.onSurface,
                          fontWeight: "600",
                          lineHeight: 18,
                        }}
                      >
                        {title}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 4,
                        }}
                      >
                        <Text
                          variant="bodySmall"
                          style={{
                            color: theme.colors.primary,
                            fontWeight: "700",
                          }}
                        >
                          {fmtPrice(price)}
                        </Text>
                        {hasDiscount && (
                          <Text
                            variant="bodySmall"
                            style={{
                              color: theme.colors.onSurfaceVariant,
                              textDecorationLine: "line-through",
                              fontSize: 10,
                            }}
                          >
                            {fmtPrice(original)}
                          </Text>
                        )}
                      </View>

                      {/* Qty controls */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 6,
                          gap: 2,
                        }}
                      >
                        <IconButton
                          icon="minus"
                          size={16}
                          mode="outlined"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            margin: 0,
                          }}
                          disabled={updatingId === item.id || qty <= 1}
                          onPress={() => handleChangeQty(item, -1)}
                        />
                        <TextInput
                          mode="outlined"
                          dense
                          value={String(qty)}
                          keyboardType="number-pad"
                          onChangeText={(t) => handleSetQty(item, t)}
                          style={{
                            width: 40,
                            height: 28,
                            textAlign: "center",
                            paddingHorizontal: 0,
                          }}
                          outlineStyle={{ borderRadius: 8 }}
                        />
                        <IconButton
                          icon="plus"
                          size={16}
                          mode="outlined"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            margin: 0,
                          }}
                          disabled={
                            updatingId === item.id ||
                            (item.stock_quantity != null &&
                              qty >= item.stock_quantity)
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

          {/* ── Bottom summary bar ── */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.colors.surfaceVariant,
              backgroundColor: theme.colors.surface,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 16,
              gap: 6,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Tạm tính
              </Text>
              <Text variant="bodySmall">{fmtPrice(itemAmount)}</Text>
            </View>
            {discountTotal > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.error }}
                >
                  Giảm giá
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.error }}
                >
                  -{fmtPrice(discountTotal)}
                </Text>
              </View>
            )}
            {hasSelected && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Vận chuyển
                </Text>
                <Text variant="bodySmall">{fmtPrice(shippingFee)}</Text>
              </View>
            )}
            <Divider style={{ marginVertical: 4 }} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                variant="titleMedium"
                style={{ fontWeight: "800", color: theme.colors.onSurface }}
              >
                Tổng cộng
              </Text>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "800", color: theme.colors.primary }}
              >
                {fmtPrice(grandTotal)}
              </Text>
            </View>
            <Button
              mode="contained"
              style={{ borderRadius: 12, marginTop: 6 }}
              contentStyle={{ paddingVertical: 6 }}
              labelStyle={{ fontWeight: "700", fontSize: 15 }}
              disabled={!hasSelected}
              icon="cart-check"
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
              Thanh toán ({selectedItems.length})
            </Button>
          </View>
        </>
      )}
    </Surface>
  );
}
