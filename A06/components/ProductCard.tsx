import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";
import type { Book } from "../lib/books";

export function ProductCard(props: {
  book: Book;
  onPress?: () => void;
  /** Hiện nút yêu thích (góc ảnh) */
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}) {
  const theme = useTheme();
  const b = props.book;
  const imageUrl = b.image_url ?? undefined;
  const finalPrice = (b.final_price ?? b.selling_price) ?? null;
  const originalPrice = (b.original_price ?? b.selling_price) ?? null;
  const fullTitle = (b.title ?? "Untitled").trim();
  const shortTitle =
    fullTitle.length > 28 ? `${fullTitle.slice(0, 28)}…` : fullTitle;

  const discountPct = b.has_discount
    ? b.discount_percent ??
      (b.discount_amount && b.selling_price
        ? Math.round((b.discount_amount / b.selling_price) * 100)
        : null)
    : null;

  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View
        style={{
          width: "100%",
          borderRadius: 14,
          backgroundColor: theme.colors.surface,
          overflow: "hidden",
          height: 240,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        }}
      >
        {/* ── Image ── */}
        <View style={{ position: "relative" }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: "100%",
                height: 140,
                backgroundColor: theme.colors.surfaceVariant,
              }}
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
            </View>
          )}

          {discountPct != null && discountPct > 0 && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                backgroundColor: theme.colors.error,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderBottomRightRadius: 10,
              }}
            >
              <Text
                variant="labelSmall"
                style={{ color: "#fff", fontWeight: "800", fontSize: 11 }}
              >
                -{Math.round(discountPct)}%
              </Text>
            </View>
          )}
          {props.showFavorite && props.onFavoriteToggle ? (
            <Pressable
              onPress={(e) => {
                e?.stopPropagation?.();
                props.onFavoriteToggle?.();
              }}
              hitSlop={8}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(0,0,0,0.35)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name={props.isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={props.isFavorite ? theme.colors.error : "#fff"}
              />
            </Pressable>
          ) : null}
        </View>

        {/* ── Info ── */}
        <View style={{ padding: 10, flex: 1, justifyContent: "space-between" }}>
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.onSurface,
              fontWeight: "600",
              fontSize: 12,
              lineHeight: 16,
            }}
            numberOfLines={2}
          >
            {shortTitle}
          </Text>

          {finalPrice != null && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <Text
                variant="titleSmall"
                style={{
                  color: theme.colors.primary,
                  fontWeight: "800",
                  fontSize: 13,
                }}
              >
                {finalPrice.toLocaleString("vi-VN")}đ
              </Text>
              {b.has_discount && originalPrice != null && originalPrice > (finalPrice ?? 0) && (
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    textDecorationLine: "line-through",
                    fontSize: 10,
                  }}
                >
                  {originalPrice.toLocaleString("vi-VN")}đ
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
