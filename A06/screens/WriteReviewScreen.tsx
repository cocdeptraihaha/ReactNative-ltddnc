import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Button,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { getBook, type BookWithDetail } from "../lib/books";
import {
  createReview,
  deleteReview,
  getEligibility,
  getMyReviewByBookOrNull,
  updateReview,
  type EligibilityResponse,
  type Review,
} from "../lib/reviews";
import { ScreenHeader, StarRating } from "../components";

type WriteRoute = RouteProp<RootStackParamList, "WriteReview">;
type WriteNav = NativeStackNavigationProp<RootStackParamList, "WriteReview">;

const RATE_LABELS = ["Chọn sao", "Tệ", "Không tốt", "Bình thường", "Tốt", "Tuyệt vời"];

export function WriteReviewScreen() {
  const theme = useTheme();
  const nav = useNavigation<WriteNav>();
  const route = useRoute<WriteRoute>();
  const { bookId, orderId } = route.params;
  const { token } = useAuth();

  const [book, setBook] = useState<BookWithDetail | null>(null);
  const [elig, setElig] = useState<EligibilityResponse | null>(null);
  const [existing, setExisting] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rate, setRate] = useState(0);
  const [content, setContent] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [b, e, mine] = await Promise.all([
        getBook(bookId),
        getEligibility(token, bookId),
        getMyReviewByBookOrNull(token, bookId),
      ]);
      setBook(b);
      setElig(e);
      setExisting(mine);
      if (mine) {
        setRate(mine.rate ?? 0);
        setContent(mine.content ?? "");
      } else {
        setRate(0);
        setContent("");
      }
    } catch {
      Alert.alert("Lỗi", "Không tải được dữ liệu đánh giá.");
    } finally {
      setLoading(false);
    }
  }, [token, bookId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const canSubmit =
    !!token &&
    rate >= 1 &&
    rate <= 5 &&
    (elig?.eligible === true || elig?.already_reviewed === true);

  const handleSubmit = async () => {
    if (!token || !canSubmit) return;
    setSaving(true);
    try {
      if (existing?.id) {
        await updateReview(token, existing.id, { rate, content: content.trim() || null });
        Alert.alert("Thành công", "Đã cập nhật đánh giá.");
      } else {
        await createReview(token, {
          book_id: bookId,
          rate,
          content: content.trim() || null,
        });
        const pts = elig?.reward_points_on_submit ?? 0;
        Alert.alert(
          "Cảm ơn bạn!",
          pts > 0
            ? `Đánh giá đã được ghi nhận. Bạn nhận +${pts} điểm — xem tại «Hồ sơ → Điểm tích lũy».`
            : "Đánh giá đã được ghi nhận.",
        );
      }
      nav.goBack();
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Không lưu được.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!token || !existing?.id) return;
    Alert.alert("Xóa đánh giá", "Bạn có chắc muốn xóa đánh giá này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteReview(token, existing.id);
            Alert.alert("Đã xóa", "Đánh giá đã được gỡ.");
            nav.goBack();
          } catch (e) {
            Alert.alert("Lỗi", e instanceof Error ? e.message : "Không xóa được.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const cover = book?.book_detail?.image_url;
  const blocked = !!elig && !elig.eligible && !elig.already_reviewed;
  const remaining = useMemo(() => 500 - content.length, [content]);

  if (!token) {
    return (
      <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Đánh giá sách" />
        <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
          <Text variant="bodyLarge" style={{ textAlign: "center" }}>
            Vui lòng đăng nhập để đánh giá.
          </Text>
        </View>
      </Surface>
    );
  }

  if (loading && !book) {
    return (
      <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Đánh giá sách" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title="Đánh giá sách"
        subtitle={orderId != null ? `Đơn #${orderId}` : undefined}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
        {/* ── Sản phẩm đang đánh giá ── */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            padding: 12,
          }}
        >
          <View
            style={{
              width: 60,
              height: 84,
              borderRadius: 8,
              backgroundColor: theme.colors.surfaceVariant,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {cover ? (
              <Image source={{ uri: cover }} style={{ width: 60, height: 84 }} contentFit="cover" />
            ) : (
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={28}
                color={theme.colors.onSurfaceVariant}
              />
            )}
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text variant="titleSmall" style={{ fontWeight: "700" }} numberOfLines={2}>
              {book?.title ?? `Sách #${bookId}`}
            </Text>
            {book?.author ? (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                numberOfLines={1}
              >
                {book.author}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Reward callout ── */}
        {!blocked && !existing ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#FFF8E1",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#F5D580",
              padding: 12,
            }}
          >
            <MaterialCommunityIcons name="gift-outline" size={22} color="#B25E00" />
            <Text variant="bodySmall" style={{ flex: 1, color: "#7A4F00", lineHeight: 18 }}>
              <Text style={{ fontWeight: "800" }}>
                +{elig?.reward_points_on_submit ?? 0} điểm
              </Text>
              {" "}khi gửi đánh giá hợp lệ lần đầu. Dùng điểm để đổi voucher ở «Đổi điểm».
            </Text>
          </View>
        ) : null}

        {blocked ? (
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: 12,
              padding: 14,
            }}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodySmall" style={{ flex: 1, color: theme.colors.onSurfaceVariant }}>
              Bạn chưa đủ điều kiện đánh giá sách này (chưa mua/giao thành công hoặc đã quá thời hạn).
            </Text>
          </View>
        ) : (
          <>
            {/* ── Rating ── */}
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                padding: 16,
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Chất lượng sản phẩm
              </Text>
              <StarRating value={rate} onChange={setRate} size={36} />
              <Text
                variant="titleSmall"
                style={{
                  color: rate > 0 ? theme.colors.primary : theme.colors.onSurfaceVariant,
                  fontWeight: "700",
                }}
              >
                {RATE_LABELS[rate] ?? "Chọn sao"}
              </Text>
            </View>

            {/* ── Content ── */}
            <View>
              <TextInput
                label="Chia sẻ cảm nhận của bạn (không bắt buộc)"
                value={content}
                onChangeText={(t) => t.length <= 500 && setContent(t)}
                mode="outlined"
                multiline
                numberOfLines={5}
                style={{ minHeight: 130, backgroundColor: theme.colors.surface }}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              <Text
                variant="labelSmall"
                style={{
                  textAlign: "right",
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 4,
                }}
              >
                {remaining} ký tự còn lại
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={saving}
              disabled={saving || !canSubmit}
              style={{ borderRadius: 12 }}
              contentStyle={{ paddingVertical: 6 }}
              icon={existing ? "pencil" : "send"}
            >
              {existing ? "Cập nhật đánh giá" : "Gửi đánh giá & nhận điểm"}
            </Button>

            {existing?.id ? (
              <Button
                mode="outlined"
                textColor={theme.colors.error}
                onPress={handleDelete}
                loading={deleting}
                disabled={deleting}
                style={{ borderRadius: 12, borderColor: theme.colors.error }}
                icon="trash-can-outline"
              >
                Xóa đánh giá
              </Button>
            ) : null}
          </>
        )}
      </ScrollView>
    </Surface>
  );
}
