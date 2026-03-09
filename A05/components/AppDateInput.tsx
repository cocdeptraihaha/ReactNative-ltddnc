import { useMemo, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { TextInput, useTheme } from "react-native-paper";
import { AppTextInput } from "./AppTextInput";
import { formatDateVN, toYmd } from "../utils/date";

export type AppDateInputProps = {
  label: string;
  value: Date | null;
  disabled?: boolean;
  onChange: (date: Date | null) => void;
};

export function AppDateInput({ label, value, disabled, onChange }: AppDateInputProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const display = useMemo(() => formatDateVN(value), [value]);

   // Fallback đơn giản cho web: dùng <input type="date">
   if (Platform.OS === "web") {
     const handleWebChange = (e: any) => {
       const v = e.target.value as string;
       if (!v) {
         onChange(null);
         return;
       }
       const [y, m, d] = v.split("-").map(Number);
       const dt = new Date(y, (m || 1) - 1, d || 1);
       onChange(dt);
     };

     const valueYmd = value ? toYmd(value) ?? "" : "";
     const maxYmd = toYmd(new Date()) ?? undefined;

     return (
       <View>
         <label style={{ display: "block", width: "100%" } as any}>
           <span
             style={{
               display: "block",
               marginBottom: 4,
               fontSize: 12,
               color: theme.colors.onSurfaceVariant,
             } as any}
           >
             {label}
           </span>
           <input
             type="date"
             value={valueYmd}
             max={maxYmd}
             disabled={disabled}
             onChange={handleWebChange}
             style={{
               boxSizing: "border-box",
               width: "100%",
               padding: 10,
               borderRadius: 4,
               border: `1px solid ${theme.colors.outline}`,
               color: theme.colors.onSurface,
               backgroundColor: theme.colors.surface,
               fontSize: 14,
             } as any}
           />
         </label>
       </View>
     );
   }

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setOpen(false);
    if (selected) onChange(selected);
  };

  return (
    <View>
      <Pressable disabled={disabled} onPress={() => setOpen(true)}>
        <AppTextInput
          label={label}
          value={display}
          editable={false}
          right={
            <TextInput.Icon icon="calendar" color={theme.colors.onSurfaceVariant} />
          }
        />
      </Pressable>

      {open && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

