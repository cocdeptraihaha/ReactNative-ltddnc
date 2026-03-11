import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import {
  Appbar,
  Button,
  Divider,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import {
  adminCreateBook,
  uploadBookImage,
  type CreateBookPayload,
} from "../lib/books";

export function AdminAddBookScreen() {
  const theme = useTheme();
  const nav = useNavigation();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [code, setCode] = useState("");
  const [edition, setEdition] = useState("");
  const [pubDate, setPubDate] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [description, setDescription] = useState("");
  const [pages, setPages] = useState("");
  const [publisher, setPublisher] = useState("");
  const [supplier, setSupplier] = useState("");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [weight, setWeight] = useState("");

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Quyền truy cập", "Cho phép truy cập thư viện ảnh.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    if (!title.trim()) {
      Alert.alert("Lỗi", "Tên sách không được để trống");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateBookPayload = {
        title: title.trim(),
        author: author.trim() || null,
        code: code.trim() || null,
        edition: edition ? parseInt(edition, 10) || null : null,
        publication_date: pubDate.trim() || null,
        selling_price: price ? parseFloat(price) || null : null,
        stock_quantity: stock ? parseInt(stock, 10) || null : null,
        book_detail: {
          description: description.trim() || null,
          pages: pages ? parseInt(pages, 10) || null : null,
          publisher: publisher.trim() || null,
          supplier: supplier.trim() || null,
          height: height ? parseFloat(height) || null : null,
          width: width ? parseFloat(width) || null : null,
          length: length ? parseFloat(length) || null : null,
          weight: weight ? parseFloat(weight) || null : null,
        },
      };

      const book = await adminCreateBook(token, payload);

      if (imageUri && book.book_detail_id) {
        try {
          await uploadBookImage(token, book.book_detail_id, {
            uri: imageUri,
            name: "cover.jpg",
            type: "image/jpeg",
          });
        } catch {
          Alert.alert("Cảnh báo", "Sách đã tạo nhưng upload ảnh thất bại.");
        }
      }

      Alert.alert("Thành công", `Đã thêm sách "${book.title}"`);
      nav.goBack();
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Tạo sách thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => nav.goBack()} />
        <Appbar.Content title="Thêm sách mới" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 14 }}>
        {/* ── Cover image ── */}
        <Section title="Ảnh bìa" icon="image-outline" theme={theme}>
          <View style={{ alignItems: "center", gap: 10 }}>
            {imageUri ? (
              <View
                style={{
                  width: 160,
                  height: 220,
                  borderRadius: 12,
                  overflow: "hidden",
                  backgroundColor: theme.colors.surfaceVariant,
                }}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
            ) : (
              <View
                style={{
                  width: 160,
                  height: 220,
                  borderRadius: 12,
                  backgroundColor: theme.colors.surfaceVariant,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: theme.colors.outlineVariant,
                  borderStyle: "dashed",
                }}
              >
                <MaterialCommunityIcons
                  name="image-plus"
                  size={40}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 6 }}
                >
                  Chọn ảnh bìa
                </Text>
              </View>
            )}
            <Button mode="outlined" onPress={pickImage} icon="camera" compact>
              {imageUri ? "Đổi ảnh" : "Chọn ảnh"}
            </Button>
          </View>
        </Section>

        {/* ── Basic info ── */}
        <Section title="Thông tin cơ bản" icon="book-outline" theme={theme}>
          <View style={{ gap: 12 }}>
            <TextInput
              mode="outlined"
              label="Tên sách *"
              value={title}
              onChangeText={setTitle}
              dense
            />
            <TextInput
              mode="outlined"
              label="Tác giả"
              value={author}
              onChangeText={setAuthor}
              dense
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                mode="outlined"
                label="Mã sách"
                value={code}
                onChangeText={setCode}
                dense
                style={{ flex: 1 }}
              />
              <TextInput
                mode="outlined"
                label="Phiên bản"
                value={edition}
                onChangeText={setEdition}
                keyboardType="number-pad"
                dense
                style={{ flex: 1 }}
              />
            </View>
            <TextInput
              mode="outlined"
              label="Ngày xuất bản (YYYY-MM-DD)"
              value={pubDate}
              onChangeText={setPubDate}
              dense
              placeholder="2024-01-15"
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                mode="outlined"
                label="Giá bán (đ)"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                dense
                style={{ flex: 1 }}
              />
              <TextInput
                mode="outlined"
                label="Tồn kho"
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
                dense
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </Section>

        {/* ── Detail info ── */}
        <Section title="Chi tiết sách" icon="text-box-outline" theme={theme}>
          <View style={{ gap: 12 }}>
            <TextInput
              mode="outlined"
              label="Mô tả"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              dense
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                mode="outlined"
                label="Số trang"
                value={pages}
                onChangeText={setPages}
                keyboardType="number-pad"
                dense
                style={{ flex: 1 }}
              />
              <TextInput
                mode="outlined"
                label="NXB"
                value={publisher}
                onChangeText={setPublisher}
                dense
                style={{ flex: 1 }}
              />
            </View>
            <TextInput
              mode="outlined"
              label="Nhà cung cấp"
              value={supplier}
              onChangeText={setSupplier}
              dense
            />
          </View>
        </Section>

        {/* ── Dimensions ── */}
        <Section title="Kích thước & trọng lượng" icon="ruler" theme={theme}>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                mode="outlined"
                label="Dài (cm)"
                value={length}
                onChangeText={setLength}
                keyboardType="numeric"
                dense
                style={{ flex: 1 }}
              />
              <TextInput
                mode="outlined"
                label="Rộng (cm)"
                value={width}
                onChangeText={setWidth}
                keyboardType="numeric"
                dense
                style={{ flex: 1 }}
              />
              <TextInput
                mode="outlined"
                label="Cao (cm)"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                dense
                style={{ flex: 1 }}
              />
            </View>
            <TextInput
              mode="outlined"
              label="Trọng lượng (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              dense
            />
          </View>
        </Section>
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceVariant,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving || !title.trim()}
          icon="check-circle-outline"
          style={{ borderRadius: 12 }}
          contentStyle={{ paddingVertical: 6 }}
          labelStyle={{ fontWeight: "700", fontSize: 15 }}
        >
          Thêm sách
        </Button>
      </View>
    </Surface>
  );
}

function Section({
  title,
  icon,
  theme,
  children,
}: {
  title: string;
  icon: string;
  theme: any;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        padding: 14,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={18}
          color={theme.colors.primary}
        />
        <Text variant="titleSmall" style={{ fontWeight: "700" }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}
