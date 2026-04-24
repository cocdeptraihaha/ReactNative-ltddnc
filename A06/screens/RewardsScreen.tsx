import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootStack";
import { useAuth } from "../context/AuthContext";
import { getMyPoints } from "../lib/points";
import { listPointRewards, redeemPointReward, type PointReward } from "../lib/rewards";
import { getMe } from "../lib/users";
import { ScreenHeader, EmptyState } from "../components";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function RewardsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { token, setAuth } = useAuth();
  const [balance, setBalance] = useState<number>(0);
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
      "Xác nhận đổi điểm",
      `Đổi ${rw.cost_points} điểm lấy «${rw.name}»?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đổi ngay",
          onPress: async () => {
            setRedeeming(rw.id);
            try {
              const res = await redeemPointReward(token, rw.id);
              const me = await getMe(token).catch(() => null);
              if (me) await setAuth(token, me);
              setBalance(res.points_balance_after);
              Alert.alert(
                "Thành công",
                `Mã của bạn: ${res.code}\n\nMã đã được lưu tại «Kho voucher của tôi». Có thể dùng ngay khi thanh toán.`,
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
      <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Đổi điểm lấy voucher" />
        <EmptyState
          icon="gift-outline"
          title="Đăng nhập để đổi voucher"
          description="Tích lũy điểm sau mỗi đơn hàng và đánh giá để nhận mã giảm giá độc quyền."
        />
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Đổi điểm lấy voucher" />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(item) => `rw-${item.id}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
          ListHeaderComponent={
            <View style={{ marginBottom: 4 }}>
              <PointsBalanceCard
                balance={balance}
                onHistory={() => navigation.navigate("PointsHistory")}
                onWallet={() => navigation.navigate("MyVouchers")}
              />
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="ticket-percent-outline"
              title="Chưa có ưu đãi"
              description="Vui lòng quay lại sau."
              compact
            />
          }
          renderItem={({ item: rw }) => (
            <RewardCard
              reward={rw}
              affordable={balance >= rw.cost_points}
              loading={redeeming === rw.id}
              onRedeem={() => onRedeem(rw)}
              theme={theme}
            />
          )}
        />
      )}
    </Surface>
  );
}

function PointsBalanceCard({
  balance,
  onHistory,
  onWallet,
}: {
  balance: number;
  onHistory: () => void;
  onWallet: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        borderRadius: 16,
        padding: 16,
        backgroundColor: theme.colors.primary,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "rgba(255,255,255,0.18)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="star-circle" size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="labelMedium" style={{ color: "#fff", opacity: 0.85 }}>
            Điểm tích lũy hiện có
          </Text>
          <Text variant="headlineMedium" style={{ color: "#fff", fontWeight: "800" }}>
            {balance.toLocaleString("vi-VN")}
            <Text variant="titleSmall" style={{ color: "#fff", opacity: 0.85 }}> điểm</Text>
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          mode="contained-tonal"
          icon="history"
          onPress={onHistory}
          style={{ flex: 1, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)" }}
          textColor="#fff"
          compact
        >
          Lịch sử
        </Button>
        <Button
          mode="contained-tonal"
          icon="ticket-confirmation-outline"
          onPress={onWallet}
          style={{ flex: 1, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)" }}
          textColor="#fff"
          compact
        >
          Kho voucher
        </Button>
      </View>
    </View>
  );
}

function RewardCard({
  reward,
  affordable,
  loading,
  onRedeem,
  theme,
}: {
  reward: PointReward;
  affordable: boolean;
  loading: boolean;
  onRedeem: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        overflow: "hidden",
      }}
    >
      {/* Left ticket stub */}
      <View
        style={{
          width: 84,
          backgroundColor: theme.colors.primary,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 16,
          gap: 4,
        }}
      >
        <MaterialCommunityIcons name="ticket-percent" size={26} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
          -{reward.discount_percent}%
        </Text>
      </View>
      <View style={{ flex: 1, padding: 12, gap: 6 }}>
        <Text variant="titleSmall" style={{ fontWeight: "700" }} numberOfLines={2}>
          {reward.name}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Giảm {reward.discount_percent}%
          {reward.max_discount != null
            ? ` · tối đa ${Number(reward.max_discount).toLocaleString("vi-VN")}đ`
            : ""}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MaterialCommunityIcons
            name="star-four-points"
            size={14}
            color="#F5A623"
          />
          <Text variant="labelMedium" style={{ fontWeight: "700" }}>
            {reward.cost_points} điểm
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            · hiệu lực {reward.valid_days} ngày
          </Text>
        </View>
        <Button
          mode={affordable ? "contained" : "outlined"}
          compact
          loading={loading}
          disabled={!affordable || loading}
          onPress={onRedeem}
          style={{ alignSelf: "flex-start", marginTop: 4, borderRadius: 8 }}
        >
          {affordable ? "Đổi ngay" : "Chưa đủ điểm"}
        </Button>
      </View>
    </View>
  );
}
