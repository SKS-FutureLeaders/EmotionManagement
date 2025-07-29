import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useSegments, useRootNavigationState } from "expo-router";
import LogoutButton from "../components/LogoutButton";
import { useColorScheme } from "../hooks/useColorScheme";
import { AuthProvider, useAuth } from "../hooks/AuthContext";
import { ThemeProvider } from "../hooks/ThemeContext";

SplashScreen.preventAutoHideAsync();

// Define screens that should be accessible without authentication
const authScreens = [
  "auth/login",
  "auth/register",
  "auth/forgot-password",
  "auth/reset-password",
  "privacy",
  "letter",
  "(tabs)",
  "+not-found"
];

// Define explicit drawer screens with their configuration
const drawerScreens = {
  // Common screens for all users
  common: [
    // { name: "ProfileScreen", title: "Profile" },
    { name: "SettingsScreen", title: "Settings" },
  ],
  // Parent-only screens
  parent: [
    { name: "parent_dashboard", title: "Parent Dashboard" },
  ],
  // Child-only screens
  child: [
    { name: "dashboard", title: "Dashboard" },
    // { name: "activities/anger-thermometer", title: "Anger Thermometer" },
    // { name: "activity1/part1", title: "Say Hi to Anger" },
    // { name: "activities/activity2", title: "Getting to Know Your Anger" },
    { name: "JournalEntryScreen", title: "Journal Entry" },
    // { name: "activities/activity6", title: "Identify the emotions" },
    // { name: "activities/activity5", title: "What's Happening to Me?" },
    // { name: "challenge-dashboard", title: "Weekly Challenges" },
    { name: "ProfileScreen", title: "Profile" },
    // { name: "challenge", title: "Emotion Heroes Challenge" },
    { name: "chore", title: "Chores" },
    { name: "core-values", title: "Core Values Curriculum" },
    {name: "content-library", title: "Content Library"},
    {name: "core-values/CoreValues", title: "Core Values"},
    {name: "challenge-dashboard", title: "Weekly Challenges"},
    {name: "breathing", title: "Breathing Exercises"},
    {name: "detection", title: "Emotion Detection"},
    // {name: "EmotionManagement", title: "Emotion Management"},
    // {name: "journal", title: "Journal"},
    // {name: "challenge", title: "Challenges"},
  ],
  // Admin-only screens
  admin: [
    // { name: "child-profile", title: "Child Profile" },
    // { name: "parent-profile", title: "Parent Profile" },
    // { name: "upload_content", title: "Upload Content" },
    // { name: "view_content", title: "View Content" },
    {name: "admin", title: "Admin Dashboard" },
  ],
  // Nested routes that should be accessible but not in drawer
  hidden: [
    
  ]
};

// Get all screen names for reference
const allScreenNames = [
  ...drawerScreens.common.map(s => s.name),
  ...drawerScreens.parent.map(s => s.name),
  ...drawerScreens.child.map(s => s.name),
  ...drawerScreens.admin.map(s => s.name),  // Include admin screens
  ...drawerScreens.hidden.map(s => s.name),
  ...authScreens
];

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainLayout />
      </ThemeProvider>
    </AuthProvider>
  );
}

function MainLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading } = useAuth();
  const navigationState = useRootNavigationState();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

    useEffect(() => {
      if (loaded) {
        SplashScreen.hideAsync();
      }
    }, [loaded]);

    if (!loaded) {
      return null;
    }

  // Redirect logic
  useEffect(() => {
    // Only run this effect when navigation is ready and loading is complete
    if (!navigationState?.key || isLoading) return;

    const currentRoute = segments.join("/");

    // Check if the current route is an auth screen
    const inAuthGroup = authScreens.some(screen => currentRoute.includes(screen));
    
    if (!user && !inAuthGroup) {
      // User is not logged in and not on an auth screen -> redirect to login
      router.replace("/auth/login");
    } else if (user && inAuthGroup && currentRoute !== 'privacy' && currentRoute !== 'letter') {
      // User is logged in but on an auth screen (except privacy policy or letter) -> redirect to appropriate dashboard
      if (user.userType === "admin") {
        router.replace("/view_content"); // Redirect admin to view content page
      } else if (user.userType === "parent") {
        router.replace("/parent_dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, segments, navigationState?.key, isLoading]);

  // Function to determine if a screen should be visible in the drawer
  const isScreenVisibleInDrawer = (screenName) => {
    // Don't show any drawer items if user isn't loaded yet
    if (!user) return false;

    // Common screens are always visible
    if (drawerScreens.common.some(s => s.name === screenName)) return true;

    // Admin-only screens
    if (user.userType === "admin" && drawerScreens.admin.some(s => s.name === screenName)) return true;

    // Parent-only screens
    if (user.userType === "parent" && drawerScreens.parent.some(s => s.name === screenName)) return true;

    // Child-only screens
    if (user.userType === "child" && drawerScreens.child.some(s => s.name === screenName)) return true;

    // All other screens should be hidden from drawer
    return false;
  };

  // Get all screens that should appear in the drawer for current user
  const getUserScreens = () => {
    if (!user) return [];
    
    let userSpecificScreens = [];
    
    // Determine which screens to show based on user type
    if (user.userType === "admin") {
      userSpecificScreens = drawerScreens.admin;
    } else if (user.userType === "parent") {
      userSpecificScreens = drawerScreens.parent;
    } else { // child or any other user type
      userSpecificScreens = drawerScreens.child;
    }
    
    const screens = [
      ...drawerScreens.common,
      ...userSpecificScreens
    ];
    
    return screens;
  };

  // Get drawer label from route name
  function getLabelFromRoute(routeName) {
    const parts = routeName.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/([A-Z])/g, " $1").replace(/-/g, " ").replace(/^./, (str) => str.toUpperCase());
  }

  // Find the screen config by name
  const findScreenConfigByName = (name) => {
    const allScreens = [
      ...drawerScreens.common,
      ...drawerScreens.parent,
      ...drawerScreens.child,
      ...drawerScreens.admin,  // Include admin screens
      ...drawerScreens.hidden
    ];
    
    return allScreens.find(s => s.name === name);
  };

  return (
    <ThemeProvider value={colorScheme.scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Drawer
        screenOptions={({ route }) => {
          const routeName = route.name as string;
          const isAuthScreen = authScreens.some((screen) => routeName.includes(screen));
          const isExplicitlyConfigured = allScreenNames.some(name => routeName.includes(name));
          const screenConfig = findScreenConfigByName(routeName);
          const isVisible = isScreenVisibleInDrawer(routeName);
          
          // Determine if this route should be in the drawer
          const shouldHideFromDrawer = isAuthScreen || !isVisible || !isExplicitlyConfigured;

          return {
            headerShown: true,
            headerRight: () => (isAuthScreen ? null : <LogoutButton />),
            // Hide from drawer based on our logic
            drawerItemStyle: shouldHideFromDrawer ? { display: "none" } : undefined,
            // Use custom title from config if available, otherwise generate from route name
            drawerLabel: screenConfig?.title || getLabelFromRoute(routeName),
            title: screenConfig?.title || getLabelFromRoute(routeName),
          };
        }}
      >
        {/* Explicitly define screens in the drawer for current user */}
        {getUserScreens().map((screen) => (
          <Drawer.Screen 
            key={screen.name} 
            name={screen.name} 
            options={{ 
              title: screen.title,
              drawerItemStyle: undefined // Ensure visibility
            }} 
          />
        ))}

        {/* Include hidden and auth screens with display:none style */}
        {[...drawerScreens.hidden, ...authScreens.map(name => ({ name, title: "" }))].map((screen) => (
          <Drawer.Screen 
            key={screen.name} 
            name={screen.name} 
            options={{ 
              drawerItemStyle: { display: "none" },
              title: screen.title || getLabelFromRoute(screen.name)
            }} 
          />
        ))}
        
        {/* Also include all admin, parent, and child screens that aren't for the current user type */}
        {(() => {
          const currentUserType = user?.userType;
          let otherTypeScreens = [];
          
          if (currentUserType !== "admin") {
            otherTypeScreens = [...otherTypeScreens, ...drawerScreens.admin];
          }
          
          if (currentUserType !== "parent") {
            otherTypeScreens = [...otherTypeScreens, ...drawerScreens.parent];
          }
          
          if (currentUserType !== "child") {
            otherTypeScreens = [...otherTypeScreens, ...drawerScreens.child];
          }
          
          return otherTypeScreens.map((screen) => (
            <Drawer.Screen 
              key={screen.name} 
              name={screen.name} 
              options={{ 
                drawerItemStyle: { display: "none" },
                title: screen.title || getLabelFromRoute(screen.name)
              }} 
            />
          ));
        })()}
        
        {/* Add a catch-all for any other routes that might be in the app directory */}
        <Drawer.Screen 
          name="*" 
          options={{ 
            drawerItemStyle: { display: "none" } 
          }} 
        />
      </Drawer>
      <Toast />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
