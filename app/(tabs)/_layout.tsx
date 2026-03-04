import { ChatbotIcon } from '@/components/ui/ChatbotIcon';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.purple,
      tabBarInactiveTintColor: Colors.gray[400],
      tabBarStyle: { backgroundColor: Colors.card, borderTopColor: Colors.border },
      headerStyle: { backgroundColor: Colors.background },
      headerTintColor: Colors.foreground,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} />
      <Tabs.Screen name="meals" options={{ title: 'Meals', tabBarIcon: ({ color }) => <Ionicons name="restaurant" size={24} color={color} /> }} />
      <Tabs.Screen name="workouts" options={{ title: 'Workouts', tabBarIcon: ({ color }) => <Ionicons name="barbell" size={24} color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'AI Chat', tabBarIcon: () => <ChatbotIcon width={28} height={25} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> }} />
    </Tabs>
  );
}
