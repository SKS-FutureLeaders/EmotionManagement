import { Tabs } from 'expo-router';
import React from 'react';

export default function Activity1Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="part1" options={{ title: "Say Hi to Anger" }} />
      <Tabs.Screen name="part2" options={{ title: "Describe Anger" }} />
      <Tabs.Screen name="part3" options={{ title: "Anger as a Character" }} />
    </Tabs>
  );
}
