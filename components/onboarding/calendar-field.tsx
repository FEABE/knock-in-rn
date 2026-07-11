import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/headless';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmt(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export type CalendarFieldProps = {
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
  /** 선택 가능한 최소 날짜(이전은 비활성). 기본 오늘. */
  minDate?: Date;
};

/** 탭하면 월 캘린더 바텀시트를 띄워 날짜를 선택하는 필드. */
export function CalendarField({
  value,
  onChange,
  placeholder = '날짜 선택',
  minDate,
}: CalendarFieldProps) {
  const [open, setOpen] = useState(false);
  const min = startOfDay(minDate ?? new Date());
  const [view, setView] = useState(() => {
    const base = value ?? min;
    return { y: base.getFullYear(), m: base.getMonth() };
  });

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () =>
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const nextMonth = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const select = (day: number) => {
    onChange(new Date(view.y, view.m, day));
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl bg-neutral-100 px-4 py-3.5 active:opacity-80"
      >
        <Text className={value ? 'text-base text-neutral-900' : 'text-base text-neutral-400'}>
          {value ? fmt(value) : placeholder}
        </Text>
        <Text className="text-base text-neutral-400">📅</Text>
      </Pressable>

      <BottomSheet open={open} onOpenChange={setOpen}>
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={prevMonth} hitSlop={8} className="px-4 py-1">
              <Ionicons name="chevron-back" size={22} color="#525252" />
            </Pressable>
            <Text className="text-base font-semibold text-neutral-900">
              {view.y}.{String(view.m + 1).padStart(2, '0')}
            </Text>
            <Pressable onPress={nextMonth} hitSlop={8} className="px-4 py-1">
              <Ionicons name="chevron-forward" size={22} color="#525252" />
            </Pressable>
          </View>

          <View className="flex-row">
            {WEEKDAYS.map((w) => (
              <View key={w} className="flex-1 items-center py-1">
                <Text className="text-xs text-neutral-400">{w}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {cells.map((day, i) => {
              if (day == null) {
                return <View key={`blank-${i}`} style={{ width: `${100 / 7}%`, height: 44 }} />;
              }
              const d = new Date(view.y, view.m, day);
              const disabled = d < min;
              const selected = value != null && startOfDay(value).getTime() === d.getTime();
              return (
                <Pressable
                  key={day}
                  disabled={disabled}
                  onPress={() => select(day)}
                  className="items-center justify-center"
                  style={{ width: `${100 / 7}%`, height: 44 }}
                >
                  <View
                    className={`h-9 w-9 items-center justify-center rounded-full ${
                      selected ? 'bg-[#256EF4]' : ''
                    }`}
                  >
                    <Text
                      className={
                        selected
                          ? 'text-sm font-semibold text-white'
                          : disabled
                            ? 'text-sm text-neutral-300'
                            : 'text-sm text-neutral-800'
                      }
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
