import { Text, View } from 'react-native';

import { Tabs } from '@/components/ui/headless';

interface PageTabsProps {
  defaultValue: string;
  tabs: { value: string; label: string }[];
  children: React.ReactNode;
  className?: string;
}

export function PageTabs({ defaultValue, tabs, children, className = 'flex-1' }: PageTabsProps) {
  return (
    <Tabs.Root defaultValue={defaultValue} className={className}>
      <Tabs.List className="flex-row gap-1 border-b border-neutral-100 px-5">
        {tabs.map((t) => (
          <Tabs.Trigger key={t.value} value={t.value} className="py-3">
            {({ selected }) => (
              <View
                className={`border-b-2 pb-2 ${
                  selected ? 'border-[#256EF4]' : 'border-transparent'
                }`}
              >
                <Text
                  className={
                    selected
                      ? 'text-sm font-semibold text-[#256EF4]'
                      : 'text-sm text-neutral-500'
                  }
                >
                  {t.label}
                </Text>
              </View>
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {children}
    </Tabs.Root>
  );
}
