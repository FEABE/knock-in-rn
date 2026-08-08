import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import { useRequireLogin } from '@/lib/auth';

const TAB_ICONS: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  explore: { active: 'compass', inactive: 'compass-outline' },
  interests: { active: 'heart', inactive: 'heart-outline' },
  chat: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  mypage: { active: 'person', inactive: 'person-outline' },
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icon = TAB_ICONS[name] ?? TAB_ICONS.explore;
  return <Ionicons name={focused ? icon.active : icon.inactive} size={22} color={color} />;
}

export default function TabLayout() {
  const tabBottomPadding = useSafeBottomPadding(0, 18);
  const { isLoggedIn, requireLogin } = useRequireLogin();
  const protectedTabListeners = {
    tabPress: (event: { preventDefault: () => void }) => {
      if (isLoggedIn) return;
      event.preventDefault();
      requireLogin(() => undefined);
    },
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#404047',
        tabBarInactiveTintColor: '#AAAABA',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: {
          height: 60 + tabBottomPadding,
          paddingTop: 8,
          paddingBottom: tabBottomPadding,
          borderTopColor: '#ECECF3',
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: '탐색',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="explore" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="interests"
        listeners={protectedTabListeners}
        options={{
          title: '관심',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="interests" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        listeners={protectedTabListeners}
        options={{
          title: '채팅',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="chat" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        listeners={protectedTabListeners}
        options={{
          title: '마이',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="mypage" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="roommate" options={{ href: null }} />
    </Tabs>
  );
}
