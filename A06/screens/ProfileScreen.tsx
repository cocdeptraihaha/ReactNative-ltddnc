import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Appbar,
  Divider,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { AppButton } from "../components/AppButton";
import { AppDateInput } from "../components/AppDateInput";
import { AppSelect } from "../components/AppSelect";
import { AppTextInput } from "../components/AppTextInput";
import { getMe, updateMe } from "../lib/users";
import { uploadAvatar } from "../lib/api";
import {
  getProvinces,
  getWards,
  type ProvinceItem,
  type WardItem,
} from "../lib/addresses";
import { resizeToSquare500 } from "../utils/image";
import { md5OfLocalFile, md5OfRemoteFile } from "../utils/hash";
import { parseYmdToDate, toYmd } from "../utils/date";

type ProfileNav = any;

export function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<ProfileNav>();
  const { token, user, setAuth, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    user?.date_of_birth instanceof Date
      ? user.date_of_birth
      : parseYmdToDate(user?.date_of_birth ?? null),
  );
  const [address, setAddress] = useState(user?.address ?? "");
  const [province, setProvince] = useState(user?.province ?? "");
  const [ward, setWard] = useState(user?.ward ?? "");

  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [wards, setWards] = useState<WardItem[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);

  const avatarUrl = user?.avatar_url;
  const displayAvatarUri = localAvatar ?? avatarUrl ?? undefined;
  const initials = useMemo(() => {
    const src = (user?.full_name || user?.email || "U").trim();
    const parts = src.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "U";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (a + b).toUpperCase();
  }, [user?.full_name, user?.email]);

  useEffect(() => {
    getProvinces().then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (!province.trim()) { setWards([]); return; }
    const p = provinces.find((x) => x.name === province);
    if (!p) { setWards([]); return; }
    setLoadingWards(true);
    getWards(p.code).then(setWards).catch(() => setWards([])).finally(() => setLoadingWards(false));
  }, [province, provinces]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const me = await getMe(token);
        await setAuth(token, me);
        setFullName(me.full_name ?? "");
        setUsername(me.username ?? "");
        setEmail(me.email ?? "");
        setPhoneNumber(me.phone_number ?? "");
        setGender(me.gender ?? "");
        setDateOfBirth(
          me.date_of_birth instanceof Date
            ? me.date_of_birth
            : parseYmdToDate(me.date_of_birth ?? null),
        );
        setAddress(me.address ?? "");
        setProvince(me.province ?? "");
        setWard(me.ward ?? "");
        setLocalAvatar(null);
      } catch {}
    })();
  }, [token, setAuth]);

  if (!token || !user) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </Surface>
    );
  }

  const onToggleEdit = async () => {
    if (!isEditing) { setIsEditing(true); return; }
    setSaving(true);
    try {
      const payload = {
        full_name: fullName.trim() || undefined,
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        gender: gender.trim() || undefined,
        date_of_birth: toYmd(dateOfBirth) ?? undefined,
        address: address.trim() || undefined,
        province: province.trim() || undefined,
        ward: ward.trim() || undefined,
      };
      const updated = await updateMe(token, user.id, payload);
      const me = await getMe(token).catch(() => updated);
      await setAuth(token, me);
      setIsEditing(false);
      Alert.alert("Thành công", "Đã cập nhật hồ sơ.");
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Cập nhật thất bại");
    } finally { setSaving(false); }
  };

  const onPickAvatar = async () => {
    if (!token || !user) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Quyền truy cập", "Cho phép truy cập thư viện ảnh.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: false,
    });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    setUploading(true);
    try {
      const manipulated = await resizeToSquare500(asset.uri, asset.width, asset.height);
      setLocalAvatar(manipulated.uri);
      const [nextHash, currentHash] = await Promise.all([
        md5OfLocalFile(manipulated.uri),
        avatarUrl ? md5OfRemoteFile(avatarUrl) : Promise.resolve(null),
      ]);
      if (currentHash && nextHash && nextHash === currentHash) {
        Alert.alert("Thông báo", "Ảnh đại diện đã được đặt.");
        return;
      }
      const file = { uri: manipulated.uri, name: "avatar.jpg", type: "image/jpeg" };
      const uploaded = await uploadAvatar(token, file);
      const baseUrl = uploaded.avatar_url || uploaded.url;
      const nextAvatarUrl = baseUrl ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}t=${Date.now()}` : undefined;
      await setAuth(token, { ...user, avatar_url: nextAvatarUrl });
      Alert.alert("Thành công", "Đã cập nhật ảnh đại diện.");
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Tải ảnh thất bại");
    } finally { setUploading(false); }
  };

  const onLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" as any }] });
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content title="Hồ sơ" titleStyle={{ fontWeight: "700" }} />
        <Appbar.Action
          icon={isEditing ? "check" : "pencil-outline"}
          onPress={onToggleEdit}
          disabled={saving}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* ── Avatar + name ── */}
        <View
          style={{
            alignItems: "center",
            paddingVertical: 20,
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            marginBottom: 14,
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
          }}
        >
          <Pressable onPress={isEditing ? onPickAvatar : undefined}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                overflow: "hidden",
                backgroundColor: theme.colors.primaryContainer,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: theme.colors.primary,
              }}
            >
              {displayAvatarUri ? (
                <Image source={{ uri: displayAvatarUri }} style={{ width: 88, height: 88 }} contentFit="cover" />
              ) : (
                <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: "700" }}>
                  {initials}
                </Text>
              )}
            </View>
            {isEditing && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: theme.colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              </View>
            )}
          </Pressable>
          <Text variant="titleMedium" style={{ fontWeight: "700", marginTop: 12 }}>
            {user.full_name || user.username || user.email}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {user.email}
          </Text>
        </View>

        {/* ── Form fields ── */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 16,
            gap: 14,
            marginBottom: 14,
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
          }}
        >
          <AppTextInput label="Họ tên" value={fullName} onChangeText={setFullName} editable={isEditing && !saving} />
          <AppTextInput label="Tên đăng nhập" value={username} onChangeText={setUsername} autoCapitalize="none" editable={isEditing && !saving} />
          <AppTextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={isEditing && !saving} />
          <AppTextInput label="Số điện thoại" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" editable={isEditing && !saving} />
          <AppSelect
            label="Giới tính"
            value={gender}
            onChange={setGender}
            disabled={!isEditing || saving}
            options={[
              { label: "Nam", value: "Nam" },
              { label: "Nữ", value: "Nữ" },
              { label: "Không tiết lộ", value: "Không tiết lộ" },
            ]}
          />
          <AppDateInput label="Ngày sinh" value={dateOfBirth} onChange={setDateOfBirth} disabled={!isEditing || saving} />
          <AppTextInput label="Địa chỉ" value={address} onChangeText={setAddress} editable={isEditing && !saving} />
          <AppSelect
            label="Tỉnh/Thành phố"
            value={province}
            onChange={(v) => { setProvince(v); setWard(""); }}
            disabled={!isEditing || saving}
            options={provinces.map((p) => ({ label: p.name, value: p.name }))}
            placeholder="Chọn tỉnh/thành"
          />
          <AppSelect
            label="Phường/Xã"
            value={ward}
            onChange={setWard}
            disabled={!isEditing || saving || loadingWards}
            options={wards.map((w) => ({ label: w.name, value: w.name }))}
            placeholder={loadingWards ? "Đang tải..." : "Chọn phường/xã"}
          />
        </View>

        {/* ── Menu items ── */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 14,
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
          }}
        >
          <MenuItem
            icon="receipt"
            label="Lịch sử đơn hàng"
            onPress={() => navigation.navigate("OrderHistory")}
            theme={theme}
          />
          <Divider />
          {user.is_superuser && (
            <>
              <MenuItem
                icon="clipboard-list-outline"
                label="Quản lý đơn hàng (Admin)"
                onPress={() => navigation.navigate("AdminOrders")}
                theme={theme}
              />
              <Divider />
            </>
          )}
        </View>

        {/* ── Logout ── */}
        <AppButton
          mode="contained"
          onPress={onLogout}
          buttonColor={theme.colors.error}
          textColor="#fff"
          icon="logout"
          contentStyle={{ paddingVertical: 4 }}
          style={{ borderRadius: 14 }}
        >
          Đăng xuất
        </AppButton>
      </ScrollView>
    </Surface>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        backgroundColor: pressed ? theme.colors.surfaceVariant : "transparent",
      })}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={22}
        color={theme.colors.primary}
      />
      <Text variant="bodyMedium" style={{ flex: 1, fontWeight: "600" }}>
        {label}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={theme.colors.onSurfaceVariant}
      />
    </Pressable>
  );
}
