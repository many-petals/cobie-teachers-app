import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';

export default function GuideScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>How to Use the Cobie Programme</Text>
      <Text style={styles.text}>
        This programme includes daily emotion check-ins, structured lessons, and optional parent communication tools to support children's emotional literacy.</Text> 

      <Text style={styles.section}>1. Read the Story</Text>
      <Text style={styles.text}>
        Begin by reading the Cobie story with your class. The characters introduce
        emotions in a gentle and child-friendly way.
      </Text>

      <Text style={styles.section}>2. Choose a Core Lesson</Text>
      <Text style={styles.text}>
        Each lesson focuses on a specific emotional skill such as recognising
        feelings, empathy, or calming strategies.
      </Text>

      <Text style={styles.section}>3. Daily Emotion Check-Ins</Text>
      <Text style={styles.text}>
        Spend 1–2 minutes each day helping children identify how they feel.
        Over time this builds emotional awareness and communication.
      </Text>

      <Text style={styles.section}>4. Add Optional Activities</Text>
      <Text style={styles.text}>
        Activities reinforce learning through creative, sensory and movement-based
        experiences.
      </Text>

      <Text style={styles.section}>5. Send Home Parent Activities</Text>
      <Text style={styles.text}>
        Parent letters and home activities help families reinforce emotional
        language and regulation strategies at home.
      </Text>

      <Text style={styles.section}>6. Track Progress</Text>
      <Text style={styles.text}>
        Use the tracker to monitor emotional development and identify children
        who may benefit from additional support.
      </Text>
      <Text style={styles.section}>7. Home Support</Text>
      <Text style={styles.text}>
  Send parent letters home and invite families to download the Cobie Parent App so they can continue emotional check-ins, calming strategies and home activities beyond the classroom.
</Text>
<TouchableOpacity
  style={{ marginTop: 12, padding: 10, backgroundColor: "#4CAF50", borderRadius: 8 }}
  onPress={() => Linking.openURL("https://cobie-parent-app-nns9.vercel.app/")}
>
  <Text style={{ color: "#fff", fontWeight: "600" }}>
    Open the Cobie Parent App
  </Text>
</TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
});