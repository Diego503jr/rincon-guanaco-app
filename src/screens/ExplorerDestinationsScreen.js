import { useEffect } from "react";
import { ActivityIndicator, FlatList, Text } from "react-native";
import useApi from "../hooks/useApi";
import { destinationService } from "../api/services/destinationService";

export default function ExplorerDestinationsScreen() {
  const { data, loading, error, execute } = useApi(destinationService.getAll);

  useEffect(() => {
    execute({ category: "playa" });
  }, [execute]);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>{error}</Text>;

  return (
    <FlatList
      data={data?.data ?? data ?? []}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
