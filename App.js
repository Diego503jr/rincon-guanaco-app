import StackNavigation from "./src/routes/StackNavigation";
import { useFonts } from "expo-font";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { Inter_400Regular } from "@expo-google-fonts/inter";

export default function App() {
  const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Inter_400Regular });

  return (
    <>
      <StackNavigation />
    </>
  );
}
