import { useEffect } from "react";
import { ActivityIndicator, FlatList, Text} from "react-native";
import useApi from "../hooks/useApi";
import { destinationService } from "../api/services/destinationService";
import MainLayout from "../components/MainLayout"; // agregar el nav

export default function ExplorerDestinationsScreen() {
  const { data, loading, error, execute } = useApi(destinationService.getAll);

  useEffect(() => {
    execute({ category: "playa" });
  }, [execute]);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>{error}</Text>;

  return (
    <MainLayout title="Explora El Salvador">
      {/*contenido de la pantalla*/}
      <FlatList
        data={data?.data ?? data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />
    </MainLayout>
  );

  
}
