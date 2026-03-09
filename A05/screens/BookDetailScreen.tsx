import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { ActivityIndicator, Surface, Text, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootStack";
import { getBook, type BookWithDetail } from "../lib/books";
import { formatDateVN } from "../utils/date";
import { FormCard } from "../components/FormCard";
import { HomeHeader } from "../components/HomeHeader";

type BookDetailNav = NativeStackNavigationProp<RootStackParamList, "BookDetail">;
type BookDetailRoute = RouteProp<RootStackParamList, "BookDetail">;

export function BookDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<BookDetailNav>();
  const route = useRoute<BookDetailRoute>();
  const { bookId } = route.params;

  const [book, setBook] = useState<BookWithDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <HomeHeader
        title={book.title ?? "Book detail"}
        userDisplayName={undefined}
        menuVisible={false}
        onMenuDismiss={() => {}}
        onMenuOpen={() => {}}
        onProfile={undefined}
        onLogout={handleBack}
      />

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
              <InfoRow
                label="Price"
                value={
                  book.selling_price != null
                    ? `${book.selling_price.toLocaleString("vi-VN")} đ`
                    : null
                }
              />
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
    </Surface>
  );
}

