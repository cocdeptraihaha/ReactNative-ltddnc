import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ActivityIndicator, Surface, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { HomeHeader } from "../components/HomeHeader";
import { FormCard } from "../components/FormCard";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { getBooks, type Book, type Page } from "../lib/books";
import { formatDateVN } from "../utils/date";
import {
  CardTitleWrap,
  CardWrap,
  Centered,
  Container,
  InfoRowWrap,
  LabelWrap,
} from "./styled/HomeScreen.styled";

type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

export function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<HomeNav>();
  const { user, token, isReady, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [booksPage, setBooksPage] = useState<Page<Book> | null>(null);
  const [loadingBooks, setLoadingBooks] = useState(false);
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
    if (isReady && !token) {
      navigation.replace("Welcome");
    }
  }, [isReady, token, navigation]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingBooks(true);
        setError(null);
        const data = await getBooks({ page, size, q: searchQuery });
        setBooksPage(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load books");
      } finally {
        setLoadingBooks(false);
      }
    })();
  }, [page, size, searchQuery]);

  if (!isReady || !token) {
    return (
      <Surface style={{ flex: 1 }}>
        <Centered>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 12 }}>
          Loading...
        </Text>
        </Centered>
      </Surface>
    );
  }

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    navigation.replace("Welcome");
  };

  const handleProfile = () => {
    setMenuVisible(false);
    navigation.navigate("Profile");
  };

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput.trim());
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
        userDisplayName={user?.full_name ?? user?.email ?? undefined}
        menuVisible={menuVisible}
        onMenuDismiss={() => setMenuVisible(false)}
        onMenuOpen={() => setMenuVisible(true)}
        onProfile={handleProfile}
        onLogout={handleLogout}
      />

      <ScrollView style={{ flex: 1 }}>
        <CardWrap>
          <FormCard>
            <CardTitleWrap>
              <Text variant="titleMedium" style={{ fontWeight: "700", color: theme.colors.onSurface }}>
                Books
              </Text>
            </CardTitleWrap>
            <InfoRow label="Welcome" value={user?.full_name ?? user?.email ?? null} />

            <AppTextInput
              label="Search by title or author"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              editable={!loadingBooks}
              mb={8}
              returnKeyType="search"
            />

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
                  {b.selling_price != null && (
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.primary, marginTop: 2 }}
                    >
                      {b.selling_price.toLocaleString("vi-VN")} đ
                    </Text>
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
        </CardWrap>
      </ScrollView>
    </Surface>
  );
}

