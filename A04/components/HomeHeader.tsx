import { View } from "react-native";
import { Appbar, Divider, Menu, Text, useTheme } from "react-native-paper";

export type HomeHeaderProps = {
  title?: string;
  userDisplayName?: string | null;
  menuVisible: boolean;
  onMenuDismiss: () => void;
  onMenuOpen: () => void;
  onProfile?: () => void;
  onLogout: () => void;
};

export function HomeHeader({
  title = "KeBook",
  userDisplayName,
  menuVisible,
  onMenuDismiss,
  onMenuOpen,
  onProfile,
  onLogout,
}: HomeHeaderProps) {
  const theme = useTheme();

  return (
    <Appbar.Header
      elevated
      theme={{ colors: { primaryContainer: theme.colors.primaryContainer } }}
    >
      <Appbar.Content title={title} titleStyle={titleStyle} />

      <Menu
        visible={menuVisible}
        onDismiss={onMenuDismiss}
        anchor={<Appbar.Action icon="account-circle" onPress={onMenuOpen} />}
        anchorPosition="top"
      >
        <View style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
          <Text variant="labelLarge">{userDisplayName ?? "Account"}</Text>
        </View>
        <Divider />
        {onProfile && (
          <Menu.Item onPress={onProfile} title="Profile" leadingIcon="account" />
        )}
        <Menu.Item onPress={onLogout} title="Logout" leadingIcon="logout" />
      </Menu>
    </Appbar.Header>
  );
}

const titleStyle = { fontWeight: "700" as const, fontSize: 20 };

