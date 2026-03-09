import { View, StyleSheet } from "react-native";
import { Appbar, Divider, Menu, Text, useTheme } from "react-native-paper";

export type HomeHeaderProps = {
  title?: string;
  userDisplayName?: string | null;
  menuVisible: boolean;
  onMenuDismiss: () => void;
  onMenuOpen: () => void;
  onLogout: () => void;
};

export function HomeHeader({
  title = "KeBook",
  userDisplayName,
  menuVisible,
  onMenuDismiss,
  onMenuOpen,
  onLogout,
}: HomeHeaderProps) {
  const theme = useTheme();

  return (
    <Appbar.Header
      elevated
      theme={{ colors: { primaryContainer: theme.colors.primaryContainer } }}
    >
      <Appbar.Content title={title} titleStyle={styles.title} />

      <Menu
        visible={menuVisible}
        onDismiss={onMenuDismiss}
        anchor={<Appbar.Action icon="account-circle" onPress={onMenuOpen} />}
        anchorPosition="top"
      >
        <View style={styles.menuUser}>
          <Text variant="labelLarge">{userDisplayName ?? "Account"}</Text>
        </View>
        <Divider />
        <Menu.Item onPress={onLogout} title="Logout" leadingIcon="logout" />
      </Menu>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    fontSize: 20,
  },
  menuUser: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

