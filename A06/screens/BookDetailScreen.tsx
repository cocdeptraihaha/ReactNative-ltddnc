import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { ActivityIndicator, Appbar, Button, Snackbar, Surface, Text, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootStack";
import { getBook, type BookWithDetail } from "../lib/books";
import { formatDateVN } from "../utils/date";
import { FormCard } from "../components/FormCard";
import { useAuth } from "../context/AuthContext";
import { addToCart } from "../lib/cart";

type BookDetailNav = NativeStackNavigationProp<RootStackParamList, "BookDetail">;
type BookDetailRoute = RouteProp<RootStackParamList, "BookDetail">;

export function BookDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<BookDetailNav>();
  const route = useRoute<BookDetailRoute>();
  const { bookId } = route.params;
  const { token } = useAuth();

  const [book, setBook] = useState<BookWithDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });

  function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
    if (value === undefined || value === null || value === "") return null;
    return (
      <View style={{ marginBottom: 12 }}>
        <View style={{ marginBottom: 2 }}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>
        </View>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
          {String(value)}
        </Text>
      </View>
    );
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBook(bookId);
        setBook(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load book detail");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId]);

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading && !book) {
    return (
      <Surface style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={{ marginTop: 12 }}>
            Loading book...
          </Text>
        </View>
      </Surface>
    );
  }

  if (error || !book) {
    return (
      <Surface style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text variant="bodyLarge" style={{ color: theme.colors.error, marginBottom: 8 }}>
            {error ?? "Book not found"}
          </Text>
        </View>
      </Surface>
    );
  }

  const d = book.book_detail;

  const handleAddToCart = async () => {
    if (!token) {
      setSnackbar({ visible: true, message: "Vui lòng đăng nhập để thêm vào giỏ." });
      return;
    }
    try {
      await addToCart(token, { book_id: book.id, quantity: 1 });
      setSnackbar({ visible: true, message: "Đã thêm vào giỏ hàng." });
    } catch (e) {
      setSnackbar({
        visible: true,
        message: "Thêm vào giỏ thất bại. Vui lòng thử lại.",
      });
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      setSnackbar({ visible: true, message: "Vui lòng đăng nhập để mua hàng." });
      return;
    }
    try {
      navigation.navigate("Checkout", {
        mode: "single",
        items: [{ bookId: book.id, quantity: 1 }],
      });
    } catch (e) {
      setSnackbar({
        visible: true,
        message: "Không thể mua ngay. Vui lòng thử lại.",
      });
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
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title={book.title ?? "Book detail"} />
      </Appbar.Header>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          alignItems: "center",
          paddingBottom: 80,
        }}
      >
        <View style={{ width: "100%", maxWidth: 720 }}>
          <FormCard>
            <View style={{ marginBottom: 16 }}>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "700", color: theme.colors.onSurface }}
              >
                {book.title ?? "Untitled book"}
              </Text>
            </View>

            {d?.image_url && (
              <View
                style={{
                  marginBottom: 16,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: theme.colors.surfaceVariant,
                }}
              >
                <Image
                  source={{ uri: d.image_url }}
                  style={{
                    width: "100%",
                    height: 240,
                  }}
                  contentFit="cover"
                />
              </View>
            )}

            <InfoRow label="Author" value={book.author} />

            {(book.final_price ?? book.selling_price) != null && (
              <View style={{ marginBottom: 12 }}>
                <View style={{ marginBottom: 2 }}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Price
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  {book.has_discount && (book.discount_percent != null || book.discount_amount != null) && (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 999,
                        backgroundColor: theme.colors.errorContainer,
                        borderWidth: 1,
                        borderColor: theme.colors.error,
                      }}
                    >
                      <Text variant="labelSmall" style={{ color: theme.colors.onErrorContainer }}>
                        {book.discount_percent != null
                          ? `-${Math.round(book.discount_percent)}%`
                          : `- ${Math.round(book.discount_amount ?? 0).toLocaleString("vi-VN")}đ`}
                      </Text>
                    </View>
                  )}

                  {book.has_discount && (book.original_price ?? book.selling_price) != null && (
                    <Text
                      variant="bodySmall"
                      style={{
                        color: theme.colors.onSurfaceVariant,
                        textDecorationLine: "line-through",
                      }}
                    >
                      {(book.original_price ?? book.selling_price)?.toLocaleString("vi-VN")} đ
                    </Text>
                  )}

                  <Text variant="bodyLarge" style={{ color: theme.colors.primary, fontWeight: "800" }}>
                    {(book.final_price ?? book.selling_price)?.toLocaleString("vi-VN")} đ
                  </Text>
                </View>
              </View>
            )}

            <InfoRow label="Code" value={book.code} />
            <InfoRow label="Edition" value={book.edition} />
            <InfoRow
              label="Publication date"
              value={
                book.publication_date
                  ? formatDateVN(new Date(book.publication_date))
                  : null
              }
            />
            <InfoRow label="Stock quantity" value={book.stock_quantity} />

            {d && (
              <>
                <InfoRow label="Description" value={d.description} />
                <InfoRow label="Pages" value={d.pages} />
                <InfoRow label="Publisher" value={d.publisher} />
                <InfoRow label="Supplier" value={d.supplier} />
                <InfoRow label="Height (cm)" value={d.height} />
                <InfoRow label="Width (cm)" value={d.width} />
                <InfoRow label="Length (cm)" value={d.length} />
                <InfoRow label="Weight (kg)" value={d.weight} />
              </>
            )}
          </FormCard>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        }}
      >
        <View style={{ width: "100%", maxWidth: 720, alignSelf: "center", flexDirection: "row", gap: 12 }}>
          <Button
            mode="outlined"
            onPress={handleAddToCart}
            style={{ flex: 1, borderRadius: 999 }}
            contentStyle={{ paddingVertical: 6 }}
          >
            Thêm vào giỏ
          </Button>
          <Button
            mode="contained"
            onPress={handleBuyNow}
            style={{ flex: 1, borderRadius: 999 }}
            contentStyle={{ paddingVertical: 6 }}
          >
            Mua ngay
          </Button>
        </View>
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
        duration={2000}
        style={{ marginBottom: 80 }}
      >
        {snackbar.message}
      </Snackbar>
    </Surface>
  );
}

