import { Appbar, useTheme } from "react-native-paper";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type ProfileHeaderProps = {
  navigation: NativeStackNavigationProp<any>;
  isEditing: boolean;
  onToggleEdit: () => void;
};

export function ProfileHeader({ navigation, isEditing, onToggleEdit }: ProfileHeaderProps) {
  const theme = useTheme();

  return (
    <Appbar.Header elevated theme={{ colors: { primaryContainer: theme.colors.primaryContainer } }}>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content title="Profile" />
      <Appbar.Action icon={isEditing ? "content-save" : "pencil"} onPress={onToggleEdit} />
    </Appbar.Header>
  );
}

