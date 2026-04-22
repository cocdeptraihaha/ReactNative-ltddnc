import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  Snackbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootStack";
import { getBook, type BookWithDetail } from "../lib/books";
import {
  getBookAvgAndCount,
  getEligibility,
  listReviewsByBook,
  type BookAvgRateOut,
  type EligibilityResponse,
  type ReviewWithUser,
} from "../lib/reviews";
import { formatDateVN } from "../utils/date";
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
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });
  const [reviewAvg, setReviewAvg] = useState<BookAvgRateOut | null>(null);
  const [reviewList, setReviewList] = useState<ReviewWithUser[]>([]);
  const [reviewElig, setReviewElig] = useState<EligibilityResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setBook(await getBook(bookId));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi tải chi tiết sách");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [avg, list] = await Promise.all([
          getBookAvgAndCount(bookId),
          listReviewsByBook(bookId, { skip: 0, limit: 5 }),
        ]);
        if (cancelled) return;
        setReviewAvg(avg);
        setReviewList(list);
        if (token) {
          const el = await getEligibility(token, bookId);
          if (!cancelled) setReviewElig(el);
        } else {
          setReviewElig(null);
        }
      } catch {
        if (!cancelled) {
          setReviewAvg(null);
          setReviewList([]);
          setReviewElig(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId, token]);

  if (loading && !book) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </Surface>
    );
  }

  if (error || !book) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text variant="bodyLarge" style={{ color: theme.colors.error, marginTop: 12 }}>
          {error ?? "Không tìm thấy sách"}
        </Text>
        <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          Quay lại
        </Button>
      </Surface>
    );
  }

  const d = book.book_detail;
  const finalPrice = book.final_price ?? book.selling_price;
  const originalPrice = book.original_price ?? book.selling_price;

  const handleAddToCart = async () => {
    if (!token) {
      setSnackbar({ visible: true, message: "Vui lòng đăng nhập." });
      return;
    }
    try {
      await addToCart(token, { book_id: book.id, quantity: 1 });
      setSnackbar({ visible: true, message: "Đã thêm vào giỏ hàng!" });
    } catch {
      setSnackbar({ visible: true, message: "Thêm vào giỏ thất bại." });
    }
  };

  const handleBuyNow = () => {
    if (!token) {
      setSnackbar({ visible: true, message: "Vui lòng đăng nhập." });
      return;
    }
    navigation.navigate("Checkout", {
      mode: "single",
      items: [{ bookId: book.id, quantity: 1 }],
    });
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chi tiết sách" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ── Cover image ── */}
        {d?.image_url ? (
          <Image
            source={{ uri: d.image_url }}
            style={{
              width: "100%",
              height: 280,
              backgroundColor: theme.colors.surfaceVariant,
            }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 200,
              backgroundColor: theme.colors.surfaceVariant,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={56}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        )}

        <View style={{ padding: 16, gap: 16 }}>
          {/* ── Title + author ── */}
          <View>
            <Text
              variant="titleLarge"
              style={{ fontWeight: "800", lineHeight: 28 }}
            >
              {book.title ?? "Untitled"}
            </Text>
            {book.author && (
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 4,
                }}
              >
                {book.author}
              </Text>
            )}
          </View>

          {/* ── Price section ── */}
          {finalPrice != null && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <Text
                variant="headlineSmall"
                style={{ fontWeight: "800", color: theme.colors.primary }}
              >
                {finalPrice.toLocaleString("vi-VN")}đ
              </Text>
              {book.has_discount && originalPrice != null && originalPrice > (finalPrice ?? 0) && (
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    textDecorationLine: "line-through",
                  }}
                >
                  {originalPrice.toLocaleString("vi-VN")}đ
                </Text>
              )}
              {book.has_discount && (book.discount_percent != null || book.discount_amount != null) && (
                <View
                  style={{
                    backgroundColor: theme.colors.error,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
                    {book.discount_percent != null
                      ? `-${Math.round(book.discount_percent)}%`
                      : `-${Math.round(book.discount_amount ?? 0).toLocaleString("vi-VN")}đ`}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Stock ── */}
          {book.stock_quantity != null && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <MaterialCommunityIcons
                name="package-variant"
                size={16}
                color={
                  book.stock_quantity > 0
                    ? theme.colors.primary
                    : theme.colors.error
                }
              />
              <Text
                variant="bodySmall"
                style={{
                  color:
                    book.stock_quantity > 0
                      ? theme.colors.onSurfaceVariant
                      : theme.colors.error,
                }}
              >
                {book.stock_quantity > 0
                  ? `Còn ${book.stock_quantity} sản phẩm`
                  : "Hết hàng"}
              </Text>
            </View>
          )}

          <Divider />

          {/* ── Description ── */}
          {d?.description && (
            <View>
              <SectionLabel text="Mô tả" />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurface, lineHeight: 22 }}
              >
                {d.description}
              </Text>
            </View>
          )}

          {/* ── Reviews ── */}
          <View>
            <SectionLabel text="Đánh giá từ độc giả" />
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
              }}
            >
              {reviewAvg && (reviewAvg.avg_rate != null || reviewAvg.total_reviews > 0) ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <StarRow theme={theme} value={reviewAvg.avg_rate ?? 0} />
                  <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                    {reviewAvg.avg_rate != null
                      ? reviewAvg.avg_rate.toFixed(1)
                      : "—"}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    ({reviewAvg.total_reviews} đánh giá)
                  </Text>
                </View>
              ) : (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Chưa có đánh giá.
                </Text>
              )}
              {reviewList.length > 0 ? (
                <View style={{ marginTop: 8, gap: 12 }}>
                  {reviewList.map((rv) => (
                    <View key={rv.id}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text variant="labelLarge" style={{ fontWeight: "700" }}>
                          {rv.user?.full_name || rv.user?.username || "Độc giả"}
                        </Text>
                        <StarRow theme={theme} value={rv.rate ?? 0} max={5} size={16} />
                      </View>
                      {rv.content ? (
                        <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.85 }}>
                          {rv.content}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}
              {token && reviewElig && (reviewElig.eligible || reviewElig.already_reviewed) ? (
                <Button
                  mode="contained"
                  style={{ marginTop: 16, borderRadius: 12 }}
                  onPress={() => navigation.navigate("WriteReview", { bookId })}
                >
                  {reviewElig.already_reviewed ? "Sửa đánh giá" : "Đánh giá"}
                </Button>
              ) : null}
              {!token ? (
                <Text variant="bodySmall" style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}>
                  Đăng nhập để đánh giá sách này.
                </Text>
              ) : null}
            </View>
          </View>

          {/* ── Details grid ── */}
          <View>
            <SectionLabel text="Thông tin chi tiết" />
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
              }}
            >
              <DetailRow label="Mã sách" value={book.code} theme={theme} />
              <DetailRow label="Phiên bản" value={book.edition} theme={theme} />
              <DetailRow
                label="Ngày xuất bản"
                value={
                  book.publication_date
                    ? formatDateVN(new Date(book.publication_date))
                    : null
                }
                theme={theme}
              />
              {d && (
                <>
                  <DetailRow label="Số trang" value={d.pages} theme={theme} />
                  <DetailRow label="NXB" value={d.publisher} theme={theme} />
                  <DetailRow label="Nhà cung cấp" value={d.supplier} theme={theme} />
                  <DetailRow
                    label="Kích thước"
                    value={
                      d.height || d.width || d.length
                        ? `${d.length ?? "?"}×${d.width ?? "?"}×${d.height ?? "?"} cm`
                        : null
                    }
                    theme={theme}
                  />
                  <DetailRow
                    label="Trọng lượng"
                    value={d.weight ? `${d.weight} kg` : null}
                    theme={theme}
                    last
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceVariant,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Button
          mode="outlined"
          onPress={handleAddToCart}
          icon="cart-plus"
          style={{ flex: 1, borderRadius: 12 }}
          contentStyle={{ paddingVertical: 4 }}
        >
          Thêm vào giỏ
        </Button>
        <Button
          mode="contained"
          onPress={handleBuyNow}
          icon="lightning-bolt"
          style={{ flex: 1, borderRadius: 12 }}
          contentStyle={{ paddingVertical: 4 }}
        >
          Mua ngay
        </Button>
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

function StarRow({
  theme,
  value,
  max = 5,
  size = 22,
}: {
  theme: ReturnType<typeof useTheme>;
  value: number;
  max?: number;
  size?: number;
}) {
  const filled = Math.round(value);
  return (
    <View style={{ flexDirection: "row" }}>
      {Array.from({ length: max }, (_, i) => (
        <MaterialCommunityIcons
          key={i}
          name={i < filled ? "star" : "star-outline"}
          size={size}
          color={i < filled ? theme.colors.primary : theme.colors.outline}
        />
      ))}
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text
      variant="titleSmall"
      style={{ fontWeight: "700", marginBottom: 8 }}
    >
      {text}
    </Text>
  );
}

function DetailRow({
  label,
  value,
  theme,
  last,
}: {
  label: string;
  value?: string | number | null;
  theme: any;
  last?: boolean;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.outlineVariant,
      }}
    >
      <Text
        variant="bodySmall"
        style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}
      >
        {label}
      </Text>
      <Text
        variant="bodySmall"
        style={{
          color: theme.colors.onSurface,
          fontWeight: "600",
          flex: 1,
          textAlign: "right",
        }}
      >
        {String(value)}
      </Text>
    </View>
  );
}
