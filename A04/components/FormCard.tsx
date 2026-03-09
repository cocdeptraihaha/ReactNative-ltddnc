import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Card, useTheme } from "react-native-paper";

export type FormCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function FormCard({ children, style }: FormCardProps) {
  const theme = useTheme();

  return (
    <Card
      mode="elevated"
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}
