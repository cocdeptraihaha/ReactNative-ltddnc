import { TextInput, type TextInputProps, useTheme } from "react-native-paper";
import type { StyleProp, TextStyle } from "react-native";

export type AppTextInputProps = TextInputProps & {
  mt?: number;
  mb?: number;
};

export function AppTextInput({
  mode = "outlined",
  outlineColor,
  activeOutlineColor,
  textColor,
  style,
  mt,
  mb,
  ...props
}: AppTextInputProps) {
  const theme = useTheme();

  const spacingStyle =
    mt !== undefined || mb !== undefined
      ? ({ marginTop: mt, marginBottom: mb } as TextStyle)
      : undefined;

  return (
    <TextInput
      mode={mode}
      outlineColor={outlineColor ?? theme.colors.outline}
      activeOutlineColor={activeOutlineColor ?? theme.colors.primary}
      textColor={textColor ?? theme.colors.onSurface}
      style={[spacingStyle, style] as StyleProp<TextStyle>}
      {...props}
    />
  );
}

