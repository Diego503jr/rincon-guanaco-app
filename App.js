import { UserProvider } from "./src/context/UserContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import StackNavigation from "./src/routes/StackNavigation";

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <StackNavigation />
      </ThemeProvider>
    </UserProvider>
  );
}