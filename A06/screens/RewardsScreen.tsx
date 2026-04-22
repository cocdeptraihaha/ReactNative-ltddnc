import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getMyPoints } from "../lib/points";
import { listPointRewards, redeemPointReward, type PointReward } from "../lib/rewards";
import { getMe } from "../lib/users";

export function RewardsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token, setAuth } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [rewards, setRewards] = useState<PointReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, pts] = await Promise.all([
        listPointRewards(),
        token ? getMyPoints(token) : Promise.resolve({ balance: 0 }),
      ]);
      setRewards(r);
      setBalance(pts.balance);
    } catch {
      setRewards([]);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onRedeem = (rw: PointReward) => {
    if (!token) return;
    Alert.alert(
      "Đổi điểm",
      `Đổi ${rw.cost_points} điểm lấy «${rw.name}»?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đổi",
          onPress: async () => {
            setRedeeming(rw.id);
            try {
              const res = await redeemPointReward(token, rw.id);
              const me = await getMe(token).catch(() => null);
              if (me) await setAuth(token, me);
              setBalance(res.points_balance_after);
              Alert.alert(
                "Thành công",
                `Mã của bạn: ${res.code}\n(Sao chép và dùng ở thanh toán hoặc Kho voucher)`,
              );
            } catch (e) {
              Alert.alert("Lỗi", e instanceof Error ? e.message : "Đổi thất bại");
            } finally {
              setRedeeming(null);
            }
          },
        },
      ],
    );
  };

  if (!token) {
    return (
      <Surface style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Đổi điểm" />
        </Appbar.Header>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Đổi điểm lấy voucher" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Surface
            style={{
              padding: 16,
              borderRadius: 14,
              marginBottom: 16,
              backgroundColor: theme.colors.primaryContainer,
            }}
            elevation={0}
          >
            <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
              Điểm hiện có
            </Text>
            <Text variant="headlineMedium" style={{ fontWeight: "800", color: theme.colors.onPrimaryContainer }}>
              {balance ?? 0}
            </Text>
          </Surface>
          {rewards.map((rw) => (
            <Surface
              key={rw.id}
              style={{
                padding: 14,
                borderRadius: 14,
                marginBottom: 12,
                backgroundColor: theme.colors.surface,
              }}
              elevation={1}
            >
              <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                {rw.name}
              </Text>
              <Text variant="bodySmall" style={{ marginTop: 6, color: theme.colors.onSurfaceVariant }}>
                Giảm {rw.discount_percent}%
                {rw.max_discount != null ? ` · tối đa ${Number(rw.max_discount).toLocaleString("vi-VN")}đ` : ""}
              </Text>
              <Text variant="bodySmall" style={{ marginTop: 4 }}>
                Cần <Text style={{ fontWeight: "800" }}>{rw.cost_points}</Text> điểm · Hiệu lực {rw.valid_days} ngày
              </Text>
              <Button
                mode="contained"
                style={{ marginTop: 12, borderRadius: 10 }}
                disabled={(balance ?? 0) < rw.cost_points || redeeming === rw.id}
                loading={redeeming === rw.id}
                onPress={() => onRedeem(rw)}
              >
                Đổi ngay
              </Button>
            </Surface>
          ))}
        </ScrollView>
      )}
    </Surface>
  );
}
