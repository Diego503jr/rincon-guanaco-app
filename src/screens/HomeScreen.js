import { View, Text, Button } from "react-native";
import { useUser } from "../context/UserContext";

export default function HomeScreen() {
  const { user, logout } = useUser();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Hola, {user?.name}</Text>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}
