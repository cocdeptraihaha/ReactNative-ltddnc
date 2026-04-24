import { Pressable, View } from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  onChange?: (n: number) => void;
};

export function StarRating({ value, max = 5, size = 18, color, onChange }: Props) {
  const theme = useTheme();
  const filledColor = color ?? "#F5A623";
  const emptyColor = theme.colors.outline;
  const editable = !!onChange;
  const filled = Math.round(value);
  return (
    <View style={{ flexDirection: "row", gap: editable ? 4 : 1 }}>
      {Array.from({ length: max }, (_, i) => {
        const idx = i + 1;
        const isOn = idx <= filled;
        const Icon = (
          <MaterialCommunityIcons
            name={isOn ? "star" : "star-outline"}
            size={size}
            color={isOn ? filledColor : emptyColor}
          />
        );
        return editable ? (
          <Pressable key={i} onPress={() => onChange?.(idx)} hitSlop={6}>
            {Icon}
          </Pressable>
        ) : (
          <View key={i}>{Icon}</View>
        );
      })}
    </View>
  );
}
