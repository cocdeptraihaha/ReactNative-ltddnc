import { FlatList, View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import type { Category } from "../lib/categories";

export function CategorySlider(props: {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategoryId: (id: number | null) => void;
  includeAll?: boolean;
  allLabel?: string;
}) {
  const theme = useTheme();
  const includeAll = props.includeAll ?? true;
  const allLabel = props.allLabel ?? "All";

  const data: { id: number | null; name: string }[] = [
    ...(includeAll ? [{ id: null, name: allLabel }] : []),
    ...props.categories.map((c) => ({ id: c.id, name: c.name ?? `#${c.id}` })),
  ];

  return (
    <View style={{ marginBottom: 8 }}>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => String(item.id ?? "all")}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 4,
          alignItems: "center",
        }}
        renderItem={({ item }) => {
          const selected = item.id === props.selectedCategoryId;
          return (
            <Chip
              mode={selected ? "flat" : "outlined"}
              selected={selected}
              onPress={() => props.onSelectCategoryId(item.id)}
              style={{
                marginRight: 8,
                height: 32,
                backgroundColor: selected ? theme.colors.primaryContainer : undefined,
                borderColor: selected ? theme.colors.primary : theme.colors.outline,
              }}
              textStyle={{
                color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
              }}
              compact
            >
              {item.name}
            </Chip>
          );
        }}
      />
    </View>
  );
}

