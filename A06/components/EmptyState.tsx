import { View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

export function EmptyState({
  icon = "tray-remove",
  title,
  description,
  actionLabel,
  onAction,
  compact,
}: Props) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: compact ? undefined : 1,
        paddingVertical: compact ? 24 : 48,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: theme.colors.surfaceVariant,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={44}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
      <Text
        variant="titleMedium"
        style={{ fontWeight: "700", color: theme.colors.onSurface, textAlign: "center" }}
      >
        {title}
      </Text>
      {description ? (
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", maxWidth: 280 }}
        >
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          mode="contained"
          onPress={onAction}
          style={{ marginTop: 8, borderRadius: 10 }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
