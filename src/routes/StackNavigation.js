import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useUser } from "../context/UserContext";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProfileScreen from "../screens/ProfileScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ExplorerDestinationsScreen from "../screens/ExplorerDestinationsScreen";

const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  // dentro de tu componente de navegación:
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Explorer" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Explorer" component={ExplorerDestinationsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
