import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
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

type WriteRoute = RouteProp<RootStackParamList, "WriteReview">;
type WriteNav = NativeStackNavigationProp<RootStackParamList, "WriteReview">;

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
        Alert.alert(
          "Thành công",
          "Đã gửi đánh giá. Bạn nhận điểm tích lũy (xem trong Hồ sơ → Điểm tích lũy).",
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

  if (!token) {
    return (
      <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => nav.goBack()} />
          <Appbar.Content title="Đánh giá sách" />
        </Appbar.Header>
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
      <Surface style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => nav.goBack()} />
          <Appbar.Content title="Đánh giá sách" />
        </Appbar.Header>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </Surface>
    );
  }

  const title = book?.title ?? `Sách #${bookId}`;
  const subtitle =
    orderId != null ? `Đơn hàng #${orderId}` : undefined;
  const blocked =
    !elig?.eligible &&
    !elig?.already_reviewed;

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => nav.goBack()} />
        <Appbar.Content title="Đánh giá sách" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text variant="titleMedium" style={{ fontWeight: "700" }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" style={{ opacity: 0.65, marginTop: 4 }}>
            {subtitle}
          </Text>
        ) : null}

        {blocked ? (
          <View
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 12,
              backgroundColor: theme.colors.surfaceVariant,
            }}
          >
            <Text variant="bodyMedium">
              Bạn chưa đủ điều kiện đánh giá sách này (chưa mua/giao hoặc đã quá thời hạn sau khi
              nhận hàng).
            </Text>
          </View>
        ) : (
          <>
            <Text variant="titleSmall" style={{ fontWeight: "700", marginTop: 20, marginBottom: 8 }}>
              Điểm sao (1–5)
            </Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setRate(n)}>
                  <MaterialCommunityIcons
                    name={n <= rate ? "star" : "star-outline"}
                    size={40}
                    color={n <= rate ? theme.colors.primary : theme.colors.outline}
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              label="Nội dung (không bắt buộc)"
              value={content}
              onChangeText={setContent}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={{ marginTop: 16, minHeight: 120 }}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={saving}
              disabled={saving || !canSubmit}
              style={{ marginTop: 20, borderRadius: 12 }}
            >
              {existing ? "Cập nhật đánh giá" : "Gửi đánh giá"}
            </Button>

            {existing?.id ? (
              <Button
                mode="outlined"
                textColor={theme.colors.error}
                onPress={handleDelete}
                loading={deleting}
                disabled={deleting}
                style={{ marginTop: 12, borderRadius: 12 }}
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
