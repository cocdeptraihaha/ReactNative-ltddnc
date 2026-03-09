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
import {
  CardTitleWrap,
  CardWrap,
  Centered,
  Container,
  InfoRowWrap,
  LabelWrap,
} from "./styled/HomeScreen.styled";

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
      <InfoRowWrap>
        <LabelWrap>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>
        </LabelWrap>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
          {String(value)}
        </Text>
      </InfoRowWrap>
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
        <Centered>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={{ marginTop: 12 }}>
            Loading book...
          </Text>
        </Centered>
      </Surface>
    );
  }

  if (error || !book) {
    return (
      <Surface style={{ flex: 1 }}>
        <Centered>
          <Text variant="bodyLarge" style={{ color: theme.colors.error, marginBottom: 8 }}>
            {error ?? "Book not found"}
          </Text>
        </Centered>
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

      <ScrollView style={{ flex: 1 }}>
        <Container>
          <CardWrap>
            <FormCard>
              <CardTitleWrap>
                <Text
                  variant="titleMedium"
                  style={{ fontWeight: "700", color: theme.colors.onSurface }}
                >
                  {book.title ?? "Untitled book"}
                </Text>
              </CardTitleWrap>

              {d?.image_url && (
                <View style={{ marginBottom: 16, alignItems: "center" }}>
                  <Image
                    source={{ uri: d.image_url }}
                    style={{
                      width: "100%",
                      height: 220,
                      borderRadius: 12,
                      backgroundColor: theme.colors.surface,
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
          </CardWrap>
        </Container>
      </ScrollView>
    </Surface>
  );
}

