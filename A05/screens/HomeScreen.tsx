import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ActivityIndicator, Surface, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { HomeHeader } from "../components/HomeHeader";
import { FormCard } from "../components/FormCard";
import { AppButton } from "../components/AppButton";
import { CategorySlider } from "../components/CategorySlider";
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

            {booksPage?.items.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => navigation.navigate("BookDetail", { bookId: b.id })}
              >
                <View
                  style={{
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                  }}
                >
                  <Text
                    variant="titleMedium"
                    style={{ fontWeight: "600", color: theme.colors.onSurface }}
                  >
                    {b.title ?? "Untitled book"}
                  </Text>
                  {b.author && (
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      {b.author}
                    </Text>
                  )}
                  {(b.final_price ?? b.selling_price) != null && (
                    <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 10 }}>
                      {b.has_discount && (b.discount_percent != null || b.discount_amount != null) && (
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
                            {b.discount_percent != null
                              ? `-${Math.round(b.discount_percent)}%`
                              : `- ${Math.round(b.discount_amount ?? 0).toLocaleString("vi-VN")}đ`}
                          </Text>
                        </View>
                      )}

                      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
                        {b.has_discount && (b.original_price ?? b.selling_price) != null && (
                          <Text
                            variant="bodySmall"
                            style={{
                              color: theme.colors.onSurfaceVariant,
                              textDecorationLine: "line-through",
                            }}
                          >
                            {(b.original_price ?? b.selling_price)?.toLocaleString("vi-VN")} đ
                          </Text>
                        )}
                        <Text
                          variant="bodyMedium"
                          style={{ color: theme.colors.primary, fontWeight: "700" }}
                        >
                          {(b.final_price ?? b.selling_price)?.toLocaleString("vi-VN")} đ
                        </Text>
                      </View>
                    </View>
                  )}
                  {b.publication_date && (
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                    >
                      Published: {formatDateVN(new Date(b.publication_date))}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}

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

