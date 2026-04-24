import { Appbar, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: string;
  rightLabel?: string;
  onRight?: () => void;
};

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightIcon,
  rightLabel,
  onRight,
}: Props) {
  const theme = useTheme();
  const nav = useNavigation();
  const handleBack = onBack ?? (() => nav.goBack());

  return (
    <Appbar.Header
      elevated
      style={{
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
      }}
    >
      {showBack ? <Appbar.BackAction onPress={handleBack} /> : null}
      <Appbar.Content
        title={title}
        subtitle={subtitle}
        titleStyle={{ fontWeight: "700", fontSize: 17, color: theme.colors.onSurface }}
        subtitleStyle={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}
      />
      {rightIcon ? (
        <Appbar.Action
          icon={rightIcon}
          onPress={onRight}
          accessibilityLabel={rightLabel}
        />
      ) : null}
    </Appbar.Header>
  );
}
