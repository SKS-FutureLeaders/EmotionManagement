import { useColorScheme as useDefaultColorScheme } from "react-native";
import { useState } from "react";

export function useColorScheme() {
  const systemColorScheme = useDefaultColorScheme(); // Gets system setting
  const [scheme, setScheme] = useState(systemColorScheme);

  return {
    scheme,
    setScheme, // Function to manually change theme
  };
}
