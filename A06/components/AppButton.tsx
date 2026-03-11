import { Button, type ButtonProps, useTheme } from "react-native-paper";
import type { StyleProp, ViewStyle } from "react-native";

export type AppButtonProps = ButtonProps & {
  style?: StyleProp<ViewStyle>;
  mt?: number;
  mb?: number;
};

export function AppButton({
  mode = "contained",
  style,
  contentStyle,
  buttonColor,
  textColor,
  mt,
  mb,
  ...props
}: AppButtonProps) {
  const theme = useTheme();

  const resolvedButtonColor =
    buttonColor ??
    (mode === "contained" ? theme.colors.primary : undefined);

  const resolvedTextColor =
    textColor ??
    (mode === "contained" ? "#FFFFFF" : theme.colors.primary);

  const resolvedStyle: StyleProp<ViewStyle> =
    mode === "outlined" ? [{ borderColor: theme.colors.outline }, style] : style;

  const spacingStyle: ViewStyle =
    mt !== undefined || mb !== undefined
      ? { marginTop: mt, marginBottom: mb }
      : {};

  return (
    <Button
      mode={mode}
      style={[spacingStyle, resolvedStyle]}
      contentStyle={[{ paddingVertical: 8 }, contentStyle]}
      buttonColor={resolvedButtonColor}
      textColor={resolvedTextColor}
      {...props}
    />
  );
}
