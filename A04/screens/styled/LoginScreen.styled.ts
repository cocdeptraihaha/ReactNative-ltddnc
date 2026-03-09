import { View } from "react-native";
import styled from "styled-components/native";

export const Container = styled(View)`
  flex: 1;
  padding: 24px;
  justify-content: center;
`;

export const DividerRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-vertical: 24px;
`;

export const DividerLine = styled(View)<{ $color: string }>`
  flex: 1;
  height: 1px;
  background-color: ${(p: { $color: string }) => p.$color};
`;

export const BottomRow = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

