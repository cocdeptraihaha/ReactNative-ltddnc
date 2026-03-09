import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { HomeHeader } from "../components/HomeHeader";
import { FormCard } from "../components/FormCard";
import { formatDateVN, parseYmdToDate } from "../utils/date";
import {
  CardTitleWrap,
  CardWrap,
  Centered,
  Container,
  InfoRowWrap,
  LabelWrap,
} from "./styled/HomeScreen.styled";

type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

export function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<HomeNav>();
  const { user, token, isReady, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
    if (value === undefined || value === null || value === "") return null;
    return (
      <InfoRowWrap>
        <LabelWrap>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>
        </LabelWrap>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
          {String(value)}
        </Text>
      </InfoRowWrap>
    );
  }

  useEffect(() => {
    if (isReady && !token) {
      navigation.replace("Welcome");
    }
  }, [isReady, token, navigation]);

  if (!isReady || !token) {
    return (
      <Surface style={{ flex: 1 }}>
        <Centered>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 12 }}>
          Loading...
        </Text>
        </Centered>
      </Surface>
    );
  }

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    navigation.replace("Welcome");
  };

  const handleProfile = () => {
    setMenuVisible(false);
    navigation.navigate("Profile");
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <HomeHeader
        title="KeBook"
        userDisplayName={user?.full_name ?? user?.email ?? undefined}
        menuVisible={menuVisible}
        onMenuDismiss={() => setMenuVisible(false)}
        onMenuOpen={() => setMenuVisible(true)}
        onProfile={handleProfile}
        onLogout={handleLogout}
      />

      <ScrollView style={{ flex: 1 }}>
        <CardWrap>
          <FormCard>
            <CardTitleWrap>
              <Text variant="titleMedium" style={{ fontWeight: "700", color: theme.colors.onSurface }}>
                Account information
              </Text>
            </CardTitleWrap>

            <InfoRow label="ID" value={user?.id} />
            <InfoRow label="Full name" value={user?.full_name} />
            <InfoRow label="Username" value={user?.username ?? null} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Phone" value={user?.phone_number ?? null} />
            <InfoRow label="Gender" value={user?.gender ?? null} />
            <InfoRow
              label="Date of birth"
              value={
                user?.date_of_birth instanceof Date
                  ? formatDateVN(user.date_of_birth)
                  : formatDateVN(parseYmdToDate(user?.date_of_birth ?? null))
              }
            />
            <InfoRow label="Address" value={user?.address ?? null} />
            <InfoRow
              label="Status"
              value={
                user?.is_active === true
                  ? "Active"
                  : user?.is_active === false
                    ? "Inactive"
                    : undefined
              }
            />
            <InfoRow label="Vai trò" value={user?.is_superuser === true ? "Admin" : "User"} />

          </FormCard>
        </CardWrap>
      </ScrollView>
    </Surface>
  );
}

