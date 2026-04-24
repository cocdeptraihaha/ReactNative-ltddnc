import { Pressable, View, type ViewStyle } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export function SectionTitle({ icon, title, actionLabel, onAction, style }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.colors.primary + "14",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name={icon} size={16} color={theme.colors.primary} />
        </View>
      ) : null}
      <Text
        variant="titleSmall"
        style={{ flex: 1, fontWeight: "800", color: theme.colors.onSurface }}
      >
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: "700" }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
