import { useEffect, useState } from "react";
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

  const renderHeader = () => (
    <View style={{ paddingBottom: 8 }}>
      {/* ── Greeting ── */}
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

      {/* ── Search ── */}
      <Searchbar
        value={searchDraft}
        onChangeText={setSearchDraft}
        placeholder="Tìm sách, tác giả…"
        onSubmitEditing={handleSearch}
        icon="magnify"
        clearIcon="close"
        style={{
          borderRadius: 14,
          backgroundColor: theme.colors.surfaceVariant,
          elevation: 0,
          height: 44,
          marginBottom: 14,
        }}
        inputStyle={{ minHeight: 0 }}
        mode="bar"
      />

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

      {/* ── Hero banner ── */}
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

      {/* ── Top Selling ── */}
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
                onPress={() =>
                  navigation.navigate("BookDetail", { bookId: item.id })
                }
              />
            </View>
          )}
        />
      )}

      {/* ── Top Discounted ── */}
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
                onPress={() =>
                  navigation.navigate("BookDetail", { bookId: item.id })
                }
              />
            </View>
          )}
        />
      )}

      {/* ── All books ── */}
      <SectionHeader
        icon="bookshelf"
        title="Tất cả sách"
        theme={theme}
        style={{ marginTop: 20 }}
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
      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
          gap: 10,
        }}
        ListHeaderComponent={renderHeader}
        onEndReached={handleNextPage}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              book={item}
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
