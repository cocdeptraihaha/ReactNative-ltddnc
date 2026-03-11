import { useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, View } from "react-native";
import { ActivityIndicator, Surface, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { HomeHeader } from "../components/HomeHeader";
import { FormCard } from "../components/FormCard";
import { AppButton } from "../components/AppButton";
import { CategorySlider } from "../components/CategorySlider";
import { ProductCard } from "../components/ProductCard";
import { getBooks, type Book, type Page } from "../lib/books";
import { getCategories, type Category } from "../lib/categories";
import { formatDateVN } from "../utils/date";
type HomeNav = any;

export function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<HomeNav>();
  const { user, token, isReady, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [booksPage, setBooksPage] = useState<Page<Book> | null>(null);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

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
    if (isReady && !token) {
      navigation.replace("Welcome");
    }
  }, [isReady, token, navigation]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        // ignore category load errors on home
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingBooks(true);
        setError(null);
        const data = await getBooks({
          page,
          size,
          q: searchQuery,
          categoryId: selectedCategoryId,
        });
        setBooksPage(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load books");
      } finally {
        setLoadingBooks(false);
      }
    })();
  }, [page, size, searchQuery, selectedCategoryId]);

  const books = booksPage?.items ?? [];

  if (!isReady || !token) {
    return (
      <Surface style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={{ marginTop: 12 }}>
            Loading...
          </Text>
        </View>
      </Surface>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigation.replace("Welcome");
  };

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchDraft.trim());
  };

  const handlePrevPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (booksPage && page < booksPage.pages) {
      setPage((p) => p + 1);
    }
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <HomeHeader
        title="KeBook – Books"
        searchValue={searchDraft}
        onSearchValueChange={setSearchDraft}
        onSearchSubmit={handleSearch}
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
                Books
              </Text>
            </View>
            <InfoRow label="Welcome" value={user?.full_name ?? user?.email ?? null} />

            {categories.length > 0 && (
              <CategorySlider
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategoryId={(id) => {
                  setPage(1);
                  setSelectedCategoryId(id);
                }}
              />
            )}

            <View
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 18,
                backgroundColor: theme.colors.primaryContainer,
                borderWidth: 1,
                borderColor: theme.colors.primary,
              }}
            >
              <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: "800" }}>
                Discover your next favorite book
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onPrimaryContainer, marginTop: 6, opacity: 0.9 }}
              >
                Search, pick a category, then explore popular picks.
              </Text>
            </View>

            {loadingBooks && (
              <View style={{ marginVertical: 8, alignItems: "center" }}>
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

            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text variant="titleMedium" style={{ fontWeight: "800", color: theme.colors.onSurface }}>
                  Popular
                </Text>
                <Pressable onPress={() => {}}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: "700" }}>
                    See All
                  </Text>
                </Pressable>
              </View>

              <FlatList
                data={books}
                keyExtractor={(item) => String(item.id)}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={{ paddingTop: 6 }}
                renderItem={({ item }) => (
                  <ProductCard
                    book={item}
                    onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
                  />
                )}
              />
            </View>

            {booksPage && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Page {booksPage.page} / {booksPage.pages} • {booksPage.total} books
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <AppButton
                    mode="outlined"
                    onPress={handlePrevPage}
                    disabled={booksPage.page <= 1 || loadingBooks}
                    style={{ marginRight: 4 }}
                  >
                    Prev
                  </AppButton>
                  <AppButton
                    mode="outlined"
                    onPress={handleNextPage}
                    disabled={
                      loadingBooks || booksPage.page >= booksPage.pages
                    }
                  >
                    Next
                  </AppButton>
                </View>
              </View>
            )}

          </FormCard>
        </View>
      </ScrollView>
    </Surface>
  );
}

