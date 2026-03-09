import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Card, useTheme } from "react-native-paper";
import styled from "styled-components/native";

export type FormCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function FormCard({ children, style }: FormCardProps) {
  const theme = useTheme();

  return (
    <StyledCard
      mode="elevated"
      style={style}
      $surface={theme.colors.surface}
      $outline={theme.colors.outline}
    >
      <Card.Content>{children}</Card.Content>
    </StyledCard>
  );
}

const StyledCard = styled(Card)<{ $surface: string; $outline: string }>`
  background-color: ${(p) => p.$surface};
  border-color: ${(p) => p.$outline};
  border-width: 1px;
`;

