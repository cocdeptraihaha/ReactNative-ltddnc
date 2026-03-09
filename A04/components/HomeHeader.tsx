import { View } from "react-native";
import { Appbar, Divider, Menu, Text, useTheme } from "react-native-paper";
import styled from "styled-components/native";

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
        <MenuUser>
          <Text variant="labelLarge">{userDisplayName ?? "Account"}</Text>
        </MenuUser>
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

const MenuUser = styled(View)`
  padding: 12px 16px;
`;

