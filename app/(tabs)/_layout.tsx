import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';

const TAB_ICONS: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  explore: { active: 'search', inactive: 'search-outline' },
  interests: { active: 'heart', inactive: 'heart-outline' },
  chat: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  mypage: { active: 'person', inactive: 'person-outline' },
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icon = TAB_ICONS[name] ?? TAB_ICONS.explore;
  return <Ionicons name={focused ? icon.active : icon.inactive} size={22} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#256EF4',
        tabBarInactiveTintColor: '#737373',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 18,
          borderTopColor: '#E5E7EB',
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
        options={{
          title: '관심',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="interests" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '채팅',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="chat" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
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
