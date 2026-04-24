import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { ActivityIndicator, Surface, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { listMyFavorites, removeFavorite } from "../lib/favorites";
import type { Book } from "../lib/books";
import { ProductCard, ScreenHeader, EmptyState } from "../components";

type Nav = NativeStackNavigationProp<RootStackParamList, "Favorites">;

export function FavoritesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return [] as Book[];
    return listMyFavorites(token, { limit: 100 });
  }, [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBooks(await fetchData());
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setBooks(await fetchData());
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  const onRemove = useCallback(
    async (bookId: number) => {
      if (!token) return;
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      try {
        await removeFavorite(token, bookId);
      } catch {
        load();
      }
    },
    [token, load],
  );

  if (!token) {
    return (
      <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Yêu thích" />
        <EmptyState
          icon="heart-off-outline"
          title="Đăng nhập để xem yêu thích"
          description="Lưu sách bạn quan tâm để theo dõi giảm giá và mua nhanh sau này."
        />
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title="Sách yêu thích"
        subtitle={books.length > 0 ? `${books.length} sản phẩm đã lưu` : undefined}
      />
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 32,
            gap: 10,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="Chưa có sách yêu thích"
              description="Nhấn biểu tượng tim trên trang chi tiết sách để lưu lại."
              actionLabel="Khám phá sách"
              onAction={() => navigation.navigate("Tabs" as any)}
            />
          }
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ProductCard
                book={item}
                showFavorite
                isFavorite
                onFavoriteToggle={() => onRemove(item.id)}
                onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
              />
            </View>
          )}
        />
      )}
      {books.length > 0 ? (
        <View
          style={{
            position: "absolute",
            bottom: 12,
            alignSelf: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: theme.colors.onSurface + "CC",
            borderRadius: 999,
          }}
        >
          <Text variant="labelSmall" style={{ color: theme.colors.surface }}>
            Vuốt xuống để làm mới
          </Text>
        </View>
      ) : null}
    </Surface>
  );
}
