import { useMemo, useState } from "react";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
import { Menu, TextInput, useTheme } from "react-native-paper";
import styled from "styled-components/native";
import { AppTextInput } from "./AppTextInput";

export type SelectOption = { label: string; value: string };

export type AppSelectProps = {
  label: string;
  value?: string | null;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function AppSelect({
  label,
  value,
  options,
  placeholder = "Select...",
  disabled,
  onChange,
}: AppSelectProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [anchorWidth, setAnchorWidth] = useState<number>(0);

  const displayValue = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? value ?? "";
  }, [options, value]);

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      contentStyle={anchorWidth ? { width: anchorWidth } : undefined}
      anchor={
        <Pressable
          disabled={disabled}
          onPress={() => setOpen(true)}
          accessibilityRole="button"
        >
          <Anchor
            onLayout={(e: LayoutChangeEvent) => {
              const w = Math.round(e.nativeEvent.layout.width);
              if (w > 0 && w !== anchorWidth) setAnchorWidth(w);
            }}
          >
            <AppTextInput
              label={label}
              value={displayValue}
              placeholder={placeholder}
              editable={false}
              right={
                <TextInput.Icon
                  icon="chevron-down"
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
          </Anchor>
        </Pressable>
      }
    >
      {options.map((opt) => (
        <Menu.Item
          key={opt.value}
          title={opt.label}
          onPress={() => {
            setOpen(false);
            onChange(opt.value);
          }}
        />
      ))}
    </Menu>
  );
}

const Anchor = styled(View)`
  width: 100%;
`;

