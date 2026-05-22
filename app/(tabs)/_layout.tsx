import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';

const TAB_ICONS: Record<string, string> = {
  index: '🏠',
  roommate: '🔍',
  interests: '♥',
  chat: '💬',
  mypage: '👤',
};

function TabIcon({
  name,
  focused,
}: {
  name: string;
  focused: boolean;
}) {
  return (
    <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.6 }}>
      {TAB_ICONS[name] ?? '•'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#737373',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="roommate"
        options={{
          title: '룸메이트 구하기',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="roommate" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="interests"
        options={{
          title: '관심',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="interests" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '채팅',
          tabBarIcon: ({ focused }) => <TabIcon name="chat" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="mypage" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
