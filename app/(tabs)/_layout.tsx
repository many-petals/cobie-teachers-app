import { Tabs } from 'expo-router';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../data/theme';
import { useSEN } from '../context/SENContext';

export default function TabLayout() {
  const { senMode, toggleSENMode } = useSEN(); 
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'left',  
        headerTitle: () => null,
        headerLeft: () => (
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 160, height: 48, marginLeft: 12 }}
            resizeMode="contain"
          />
             ), 
             headerRight: () => (
              <TouchableOpacity style={styles.senButton}>
                <Text style={styles.senButtonText}>SEN</Text>
              </TouchableOpacity>
            ),        
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.mediumGray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="color-palette" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="printables"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="print" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="parents"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calm"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  senButton: {
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#6B46C1',
    borderRadius: 16
  },

  senButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});
