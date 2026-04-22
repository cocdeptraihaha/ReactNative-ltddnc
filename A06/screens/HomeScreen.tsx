import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { CategorySlider } from "../components/CategorySlider";
import { ProductCard } from "../components/ProductCard";
import {
  getBooks,
  getTopDiscountedBooks,
  getTopSellingBooks,
  type Book,
  type Page,
} from "../lib/books";
import { getCategories, type Category } from "../lib/categories";
import { getRecentlyViewedBooks } from "../lib/bookViews";
import { addFavorite, checkFavorites, removeFavorite } from "../lib/favorites";

type HomeNav = any;

export function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<HomeNav>();
  const { user, token, isReady } = useAuth();
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [booksPage, setBooksPage] = useState<Page<Book> | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [topSelling, setTopSelling] = useState<Book[]>([]);
  const [loadingTopSelling, setLoadingTopSelling] = useState(false);
  const [topDiscounted, setTopDiscounted] = useState<Book[]>([]);
  const [loadingTopDiscounted, setLoadingTopDiscounted] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Book[]>([]);
  const [favoriteById, setFavoriteById] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isReady && !token) navigation.replace("Welcome");
  }, [isReady, token, navigation]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
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
        setBooks((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi tải sách");
      } finally {
        setLoadingBooks(false);
      }
    })();
  }, [page, size, searchQuery, selectedCategoryId]);

  useEffect(() => {
    setLoadingTopSelling(true);
    getTopSellingBooks(10)
      .then(setTopSelling)
      .catch(() => {})
      .finally(() => setLoadingTopSelling(false));
  }, []);

  useEffect(() => {
    setLoadingTopDiscounted(true);
    getTopDiscountedBooks(20)
      .then(setTopDiscounted)
      .catch(() => {})
      .finally(() => setLoadingTopDiscounted(false));
  }, []);

  useEffect(() => {
    const next = searchDraft.trim();
    if (next === searchQuery) return;
    const id = setTimeout(() => {
      setPage(1);
      setSearchQuery(next);
    }, 500);
    return () => clearTimeout(id);
  }, [searchDraft, searchQuery]);

  const searching =
    searchDraft.trim().length > 0 || (searchQuery && searchQuery.length > 0);

  useEffect(() => {
    if (!token || searching) {
      setRecentlyViewed([]);
      return;
    }
    getRecentlyViewedBooks(token, 15)
      .then(setRecentlyViewed)
      .catch(() => setRecentlyViewed([]));
  }, [token, searching]);

  useEffect(() => {
    if (!token || !books.length) {
      setFavoriteById({});
      return;
    }
    const ids = [...new Set(books.map((b) => b.id))];
    checkFavorites(token, ids)
      .then(setFavoriteById)
      .catch(() => setFavoriteById({}));
  }, [token, books]);

  if (!isReady || !token) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </Surface>
    );
  }

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchDraft.trim());
  };

  const handleNextPage = () => {
    if (!booksPage || loadingBooks || page >= booksPage.pages) return;
    setPage((p) => p + 1);
  };

  const isSearching = searching;

  const onToggleFavorite = useCallback(
    async (bookId: number) => {
      if (!token) return;
      try {
        if (favoriteById[bookId]) {
          await removeFavorite(token, bookId);
          setFavoriteById((m) => ({ ...m, [bookId]: false }));
        } else {
          await addFavorite(token, bookId);
          setFavoriteById((m) => ({ ...m, [bookId]: true }));
        }
      } catch {
        /* ignore */
      }
    },
    [token, favoriteById],
  );

  const renderHeader = () => (
    <View style={{ paddingBottom: 8 }}>
      {/* ── Categories ── */}
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

      {/* ── Hero banner: ẩn khi đang search ── */}
      {!isSearching && (
        <View
          style={{
            marginTop: 6,
            marginBottom: 18,
            padding: 18,
            borderRadius: 16,
            backgroundColor: theme.colors.primaryContainer,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <MaterialCommunityIcons
            name="book-open-variant"
            size={36}
            color={theme.colors.primary}
          />
          <View style={{ flex: 1 }}>
            <Text
              variant="titleSmall"
              style={{
                color: theme.colors.onPrimaryContainer,
                fontWeight: "800",
              }}
            >
              Khám phá cuốn sách tiếp theo
            </Text>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onPrimaryContainer,
                opacity: 0.75,
                marginTop: 2,
              }}
            >
              Chọn thể loại và khám phá những cuốn sách hay nhất
            </Text>
          </View>
        </View>
      )}

      {/* ── Top Selling & Top Discounted: ẩn khi đang search ── */}
      {!isSearching && (
        <>
          <SectionHeader icon="fire" title="Bán chạy" theme={theme} />
          {loadingTopSelling ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              data={topSelling}
              keyExtractor={(item) => `top-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 6 }}
              renderItem={({ item }) => (
                <View style={{ width: 160, marginRight: 10 }}>
                  <ProductCard
                    book={item}
                    showFavorite
                    isFavorite={favoriteById[item.id]}
                    onFavoriteToggle={() => onToggleFavorite(item.id)}
                    onPress={() =>
                      navigation.navigate("BookDetail", { bookId: item.id })
                    }
                  />
                </View>
              )}
            />
          )}

          <SectionHeader
            icon="tag-outline"
            title="Giảm giá nhiều"
            theme={theme}
            style={{ marginTop: 20 }}
          />
          {loadingTopDiscounted ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              data={topDiscounted}
              keyExtractor={(item) => `disc-${item.id}`}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ gap: 10 }}
              contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
              renderItem={({ item }) => (
                <View style={{ flex: 1 }}>
                  <ProductCard
                    book={item}
                    showFavorite
                    isFavorite={favoriteById[item.id]}
                    onFavoriteToggle={() => onToggleFavorite(item.id)}
                    onPress={() =>
                      navigation.navigate("BookDetail", { bookId: item.id })
                    }
                  />
                </View>
              )}
            />
          )}
        </>
      )}

      {/* ── Recently viewed ── */}
      {!isSearching && recentlyViewed.length > 0 && (
        <>
          <SectionHeader
            icon="history"
            title="Đã xem gần đây"
            theme={theme}
            style={{ marginTop: 20 }}
          />
          <FlatList
            data={recentlyViewed}
            keyExtractor={(item) => `rv-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 6 }}
            renderItem={({ item }) => (
              <View style={{ width: 160, marginRight: 10 }}>
                <ProductCard
                  book={item}
                  showFavorite
                  isFavorite={favoriteById[item.id]}
                  onFavoriteToggle={() => onToggleFavorite(item.id)}
                  onPress={() =>
                    navigation.navigate("BookDetail", { bookId: item.id })
                  }
                />
              </View>
            )}
          />
        </>
      )}

      {/* ── All books / Kết quả tìm kiếm ── */}
      <SectionHeader
        icon="bookshelf"
        title={searchQuery ? `Kết quả cho "${searchQuery}"` : "Tất cả sách"}
        theme={theme}
        style={{ marginTop: isSearching ? 6 : 20 }}
      />

      {error && (
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.error, marginBottom: 8 }}
        >
          {error}
        </Text>
      )}
    </View>
  );

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* ── Fixed: Greeting + Search (đặt NGOÀI FlatList để không mất focus khi gõ) ── */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: theme.colors.primaryContainer,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20 }}>
              {(user?.full_name || user?.email || "U")[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Xin chào,
            </Text>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "700", color: theme.colors.onSurface }}
            >
              {user?.full_name || user?.username || "Bạn"}
            </Text>
          </View>
        </View>

        <Searchbar
          value={searchDraft}
          onChangeText={setSearchDraft}
          placeholder="Tìm sách, tác giả…"
          onSubmitEditing={handleSearch}
          onIconPress={handleSearch}
          icon="magnify"
          clearIcon="close"
          style={{
            borderRadius: 14,
            backgroundColor: theme.colors.surfaceVariant,
            elevation: 0,
            height: 44,
            marginBottom: 6,
          }}
          inputStyle={{ minHeight: 0 }}
          mode="bar"
        />
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 32,
          gap: 10,
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={renderHeader}
        onEndReached={handleNextPage}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              book={item}
              showFavorite
              isFavorite={favoriteById[item.id]}
              onFavoriteToggle={() => onToggleFavorite(item.id)}
              onPress={() =>
                navigation.navigate("BookDetail", { bookId: item.id })
              }
            />
          </View>
        )}
        ListFooterComponent={
          loadingBooks && books.length > 0 ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </Surface>
  );
}

function SectionHeader({
  icon,
  title,
  theme,
  style,
}: {
  icon: string;
  title: string;
  theme: any;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={20}
        color={theme.colors.primary}
      />
      <Text
        variant="titleMedium"
        style={{ fontWeight: "800", color: theme.colors.onSurface }}
      >
        {title}
      </Text>
    </View>
  );
}
