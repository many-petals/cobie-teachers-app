import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SENProvider } from './context/SENContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthModal from './components/AuthModal';

// Minimal loading placeholder that renders identically on server and client
function HydrationPlaceholder() {
  return (
    <View style={placeholderStyles.container}>
      <View style={placeholderStyles.dot} />
      <Text style={placeholderStyles.text}>Loading...</Text>
    </View>
  );
}

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B6B93',
    marginBottom: 12,
    opacity: 0.3,
  },
  text: {
    fontSize: 15,
    color: '#90A4AE',
    fontWeight: '500',
  },
});

export default function RootLayout() {
  // Track client-side mount to prevent hydration mismatches.
  // During SSR/static generation, mounted=false, so we render a simple placeholder.
  // After hydration completes and useEffect fires, mounted=true and we render the full app.
  // This guarantees the server HTML and initial client render are identical.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR / static export, render a minimal placeholder that will
  // always match between server and client on the first render pass.
  if (!mounted) {
    return <HydrationPlaceholder />;
  }

  // After client-side mount, render the full app with all providers and navigation
  return (
    <AuthProvider>
      <SENProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="lesson/[id]"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="activity/[id]"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="planner"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="voice-notes"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="privacy"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </Stack>


          <AuthModal />
        </ToastProvider>
      </SENProvider>
    </AuthProvider>
  );
}
