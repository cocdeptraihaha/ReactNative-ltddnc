import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";
import type { Book } from "../lib/books";

export function ProductCard(props: {
  book: Book;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const b = props.book;
  const imageUrl = b.image_url ?? undefined;
  const finalPrice = (b.final_price ?? b.selling_price) ?? null;
  const originalPrice = (b.original_price ?? b.selling_price) ?? null;

  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => ({
        flex: 1,
        margin: 8,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          borderRadius: 18,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          overflow: "hidden",
        }}
      >
        <View style={{ position: "relative" }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: 170, backgroundColor: theme.colors.surfaceVariant }}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: 170,
                backgroundColor: theme.colors.surfaceVariant,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={34}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
                numberOfLines={1}
              >
                {b.title ?? "Book"}
              </Text>
            </View>
          )}

          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "rgba(255,255,255,0.92)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: theme.colors.outline,
            }}
          >
            <MaterialCommunityIcons name="heart-outline" size={18} color={theme.colors.onSurface} />
          </View>
        </View>

        <View style={{ padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <MaterialCommunityIcons name="star" size={14} color="#F2B01E" />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              4.6
            </Text>
          </View>

          <Text
            variant="titleSmall"
            style={{ color: theme.colors.onSurface, fontWeight: "700" }}
            numberOfLines={2}
          >
            {b.title ?? "Untitled"}
          </Text>

          {finalPrice != null && (
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "baseline", gap: 10 }}>
              {b.has_discount && originalPrice != null && (
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    textDecorationLine: "line-through",
                  }}
                >
                  {originalPrice.toLocaleString("vi-VN")} đ
                </Text>
              )}
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface, fontWeight: "800" }}
              >
                {finalPrice.toLocaleString("vi-VN")} đ
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

