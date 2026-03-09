import { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Card,
  Surface,
  Text,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { HomeHeader } from "../components/HomeHeader";

type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <View style={styles.infoRow}>
      <Text variant="labelMedium" style={styles.infoLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={styles.infoValue}>
        {String(value)}
      </Text>
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { user, token, isReady, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (isReady && !token) {
      navigation.replace("Welcome");
    }
  }, [isReady, token, navigation]);

  if (!isReady || !token) {
    return (
      <Surface style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading...
        </Text>
      </Surface>
    );
  }

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    navigation.replace("Welcome");
  };

  return (
    <Surface style={styles.container}>
      <HomeHeader
        title="KeBook"
        userDisplayName={user?.full_name ?? user?.email ?? undefined}
        menuVisible={menuVisible}
        onMenuDismiss={() => setMenuVisible(false)}
        onMenuOpen={() => setMenuVisible(true)}
        onLogout={handleLogout}
      />

      <ScrollView style={styles.scroll}>
        <Card style={styles.userCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Account information
            </Text>

            <InfoRow label="ID" value={user?.id} />
            <InfoRow label="Full name" value={user?.full_name} />
            <InfoRow label="Username" value={user?.username ?? null} />
            <InfoRow label="Email" value={user?.email} />
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

            {user &&
              Object.entries(user as Record<string, unknown>).map(
                ([key, value]) => {
                  if (
                    ["id", "full_name", "username", "email", "is_active"].includes(
                      key,
                    )
                  )
                    return null;
                  if (value === undefined || value === null) return null;

                  const display =
                    typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : String(value);
                  if (!display) return null;

                  return (
                    <InfoRow
                      key={key}
                      label={key.replace(/_/g, " ")}
                      value={display}
                    />
                  );
                },
              )}
          </Card.Content>
        </Card>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  scroll: {
    flex: 1,
  },
  userCard: {
    margin: 12,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    color: "#666",
    marginBottom: 2,
  },
  infoValue: {
    color: "#111",
  },
});

