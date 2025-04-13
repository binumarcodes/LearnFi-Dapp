import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import ExploreScreen from "../screens/ExploreScreen";
import CreateScreen from "../screens/CreateScreen";
import WalletScreen from "../screens/WalletScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();


type TabRoutes = "Home" | "Explore" | "Create" | "Wallet" | "Profile";

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
         
          const icons: Record<TabRoutes, keyof typeof Ionicons.glyphMap> = {
            Home: "home",
            Explore: "search",
            Create: "add-circle",
            Wallet: "wallet",
            Profile: "person",
          };

          return <Ionicons name={icons[route.name as TabRoutes]} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: "#121212", borderTopWidth: 0 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
