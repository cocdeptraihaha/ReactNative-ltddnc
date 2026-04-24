import { View, type ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
  style?: ViewStyle;
};

const TONE_BG: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "#F2F4F7",
  primary: "#E7EEF8",
  success: "#E6F4EA",
  warning: "#FFF4E5",
  danger: "#FDECEA",
};
const TONE_FG: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "#475467",
  primary: "#2B4366",
  success: "#1B7A3A",
  warning: "#B25E00",
  danger: "#B42318",
};

export function StatPill({ icon, label, tone = "neutral", style }: Props) {
  const bg = TONE_BG[tone];
  const fg = TONE_FG[tone];
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: bg,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={13} color={fg} />
      <Text
        variant="labelSmall"
        style={{ color: fg, fontWeight: "700", fontSize: 11 }}
      >
        {label}
      </Text>
    </View>
  );
}

// avoid unused import warn for theme in builds
void useTheme;
