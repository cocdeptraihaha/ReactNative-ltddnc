import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { listMyFavorites } from "../lib/favorites";
import type { Book } from "../lib/books";
import { ProductCard } from "../components/ProductCard";

type Nav = NativeStackNavigationProp<RootStackParamList, "Favorites">;

export function FavoritesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setBooks(await listMyFavorites(token, { limit: 100 }));
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      setBooks(await listMyFavorites(token, { limit: 100 }));
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  if (!token) {
    return (
      <Surface style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Yêu thích" />
        </Appbar.Header>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Sách yêu thích" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>
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
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, gap: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text
              variant="bodyMedium"
              style={{ padding: 24, textAlign: "center", color: theme.colors.onSurfaceVariant }}
            >
              Chưa có sách yêu thích.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ProductCard
                book={item}
                onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
              />
            </View>
          )}
        />
      )}
    </Surface>
  );
}
