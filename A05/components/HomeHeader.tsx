import { View } from "react-native";
import { Appbar, Searchbar, useTheme } from "react-native-paper";

export type HomeHeaderProps = {
  title?: string;
  searchValue?: string;
  onSearchValueChange?: (text: string) => void;
  onSearchSubmit?: () => void;
};

export function HomeHeader({
  title = "KeBook",
  searchValue,
  onSearchValueChange,
  onSearchSubmit,
}: HomeHeaderProps) {
  const theme = useTheme();

  return (
    <Appbar.Header
      elevated
      theme={{ colors: { primaryContainer: theme.colors.primaryContainer } }}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
      }}
    >
      <Appbar.Content title={title} titleStyle={titleStyle} />

      {onSearchValueChange && (
        <View style={{ flex: 1, maxWidth: 520, marginRight: 12 }}>
          <Searchbar
            value={searchValue ?? ""}
            onChangeText={onSearchValueChange}
            placeholder="Search…"
            onSubmitEditing={onSearchSubmit}
            icon="magnify"
            clearIcon="close"
            style={{
              borderRadius: 14,
              backgroundColor: theme.colors.surface,
              height: 40,
            }}
            inputStyle={{ minHeight: 0 }}
            elevation={0}
            mode="bar"
          />
        </View>
      )}
    </Appbar.Header>
  );
}

const titleStyle = { fontWeight: "700" as const, fontSize: 20 };

