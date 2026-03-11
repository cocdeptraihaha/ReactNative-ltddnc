import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator, Surface, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { AppButton } from "../components/AppButton";
import { AppDateInput } from "../components/AppDateInput";
import { AppSelect } from "../components/AppSelect";
import { AppTextInput } from "../components/AppTextInput";
import { FormCard } from "../components/FormCard";
import { ProfileHeader } from "../components/ProfileHeader";
import { getMe, updateMe } from "../lib/users";
import { uploadAvatar } from "../lib/api";
import { getProvinces, getWards, type ProvinceItem, type WardItem } from "../lib/addresses";
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
    if (!province.trim()) {
      setWards([]);
      return;
    }
    const p = provinces.find((x) => x.name === province);
    if (!p) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    getWards(p.code)
      .then(setWards)
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
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
      } catch {
        // ignore
      }
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
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // Save
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
      // refresh me to ensure avatar_url etc is up to date
      const me = await getMe(token).catch(() => updated);
      await setAuth(token, me);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onPickAvatar = async () => {
    if (!token || !user) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission", "Please allow photo library access.");
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
      // Hiển thị ngay ảnh local đã resize
      setLocalAvatar(manipulated.uri);

      // Prevent uploading the same avatar repeatedly:
      // Compare hash of resized image with current avatar_url (download+hash).
      const [nextHash, currentHash] = await Promise.all([
        md5OfLocalFile(manipulated.uri),
        avatarUrl ? md5OfRemoteFile(avatarUrl) : Promise.resolve(null),
      ]);
      if (currentHash && nextHash && nextHash === currentHash) {
        Alert.alert("Info", "This avatar is already set.");
        return;
      }

      const file = {
        uri: manipulated.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      };
      const uploaded = await uploadAvatar(token, file);

      // Cập nhật avatar ngay trên frontend không đợi refetch,
      // ưu tiên avatar_url, fallback sang url, thêm cache-buster
      const baseUrl = uploaded.avatar_url || uploaded.url;
      const nextAvatarUrl = baseUrl ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}t=${Date.now()}` : undefined;
      await setAuth(token, { ...user, avatar_url: nextAvatarUrl });

      Alert.alert("Success", "Avatar updated.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" as any }] });
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ProfileHeader
        navigation={navigation as any}
        isEditing={isEditing}
        onToggleEdit={onToggleEdit}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 720 }}>
          <FormCard>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Pressable onPress={isEditing ? onPickAvatar : undefined}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    overflow: "hidden",
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.outline,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {displayAvatarUri ? (
                    <Image
                      source={{ uri: displayAvatarUri }}
                      style={{ width: 80, height: 80 }}
                      contentFit="cover"
                    />
                  ) : (
                    <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                      {initials}
                    </Text>
                  )}
                </View>
              </Pressable>

              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text
                  variant="titleMedium"
                  style={{ color: theme.colors.onSurface, fontWeight: "700" }}
                >
                  {user.full_name || user.username || user.email}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                >
                  {user.email}
                </Text>

                {isEditing && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      marginTop: 8,
                    }}
                  >
                    <AppButton
                      mode="outlined"
                      onPress={onPickAvatar}
                      disabled={uploading}
                      loading={uploading}
                    >
                      Change photo
                    </AppButton>
                  </View>
                )}
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <AppTextInput
                label="Full name"
                value={fullName}
                onChangeText={setFullName}
                editable={isEditing && !saving}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <AppTextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={isEditing && !saving}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <AppTextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={isEditing && !saving}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <AppTextInput
                label="Phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                editable={isEditing && !saving}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <AppSelect
                label="Gender"
                value={gender}
                onChange={setGender}
                disabled={!isEditing || saving}
                options={[
                  { label: "Nam", value: "Nam" },
                  { label: "Nữ", value: "Nữ" },
                  { label: "Không tiết lộ", value: "Không tiết lộ" },
                ]}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <AppDateInput
                label="Date of birth"
                value={dateOfBirth}
                onChange={setDateOfBirth}
                disabled={!isEditing || saving}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <AppTextInput
                label="Address"
                value={address}
                onChangeText={setAddress}
                editable={isEditing && !saving}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <AppSelect
                label="Thành phố/Tỉnh"
                value={province}
                onChange={(v) => {
                  setProvince(v);
                  setWard("");
                }}
                disabled={!isEditing || saving}
                options={provinces.map((p) => ({ label: p.name, value: p.name }))}
                placeholder="Chọn tỉnh/thành"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <AppSelect
                label="Phường/Xã"
                value={ward}
                onChange={setWard}
                disabled={!isEditing || saving || loadingWards}
                options={wards.map((w) => ({ label: w.name, value: w.name }))}
                placeholder={loadingWards ? "Đang tải..." : "Chọn phường/xã"}
              />
            </View>

            
          </FormCard>
          <AppButton
            mode="contained"
            onPress={onLogout}
            mt={8}
            buttonColor={theme.colors.error}
            textColor={theme.colors.onError}
          >
            Logout
          </AppButton>
        </View>
      </ScrollView>
    </Surface>
  );
}

