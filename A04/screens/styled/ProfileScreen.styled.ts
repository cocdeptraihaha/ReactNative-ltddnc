import { View } from "react-native";
import styled from "styled-components/native";

export const Screen = styled(View)`
  flex: 1;
`;

export const Scroll = styled(View)`
  flex: 1;
`;

export const CardWrap = styled(View)`
  margin: 12px;
`;

export const HeaderRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const AvatarRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

export const AvatarWrap = styled(View)<{ $bg: string; $border: string }>`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  overflow: hidden;
  background-color: ${(p: { $bg: string }) => p.$bg};
  border-width: 1px;
  border-color: ${(p: { $border: string }) => p.$border};
  align-items: center;
  justify-content: center;
`;

export const AvatarInfo = styled(View)`
  flex: 1;
  margin-left: 16px;
`;

export const Field = styled(View)`
  margin-bottom: 16px;
`;

export const ActionsRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
`;

