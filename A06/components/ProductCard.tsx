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
  const fullTitle = (b.title ?? "Untitled").trim();
  const shortTitle = fullTitle.length > 20 ? `${fullTitle.slice(0, 20)}…` : fullTitle;

  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          width: "100%",
          borderRadius: 18,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          overflow: "hidden",
          // Cố định chiều cao để card hiển thị đồng đều trong grid
          height: 260,
        }}
      >
        <View style={{ position: "relative" }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: 140, backgroundColor: theme.colors.surfaceVariant }}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: 140,
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
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, fontSize: 10 }}
                numberOfLines={1}
              >
                {shortTitle}
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

        <View style={{ padding: 12, flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurface, fontWeight: "600", fontSize: 11 }}
                numberOfLines={1}
              >
                {shortTitle}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                <MaterialCommunityIcons name="star" size={13} color="#F2B01E" />
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>
                  4.6 
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>
                  Đã bán 120
                </Text>
              </View>
            </View>

            {b.has_discount && b.discount_percent != null && (
              <Text variant="labelSmall" style={{ color: theme.colors.error, fontSize: 10 }}>
                -{Math.round(b.discount_percent ?? 0)}%
              </Text>
            )}
            {b.has_discount && b.discount_percent == null && (
              <Text variant="labelSmall" style={{ color: theme.colors.error, fontSize: 10 }}>
                -{Math.round((b.discount_amount ?? 0) / (b.selling_price ?? 1) * 100)}%
              </Text>
            )}
          </View>

          {finalPrice != null && (
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                {b.has_discount && originalPrice != null && (
                  <Text
                    variant="bodySmall"
                    style={{
                      position: "absolute",
                      left: 0,
                      color: theme.colors.onSurfaceVariant,
                      textDecorationLine: "line-through",
                    }}
                  >
                    {originalPrice.toLocaleString("vi-VN")} đ
                  </Text>
                )}
                <Text
                  variant="titleSmall"
                  style={{ position: "absolute", right: 0, color: theme.colors.primary, fontWeight: "600" , fontSize: 12}}
                >
                  {finalPrice.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

