// Convierte cualquier error de Axios/Laravel en un texto listo para mostrar
export function getErrorMessage(error) {
  console.log(error);

  if (error.response) {
    const { data, status } = error.response;
    if (data?.errors) return Object.values(data.errors).flat().join("\n"); // validación 422
    if (data?.message) return data.message;
    return `Error del servidor (${status}).`;
  }
  if (error.request) {
    return "No se pudo conectar con el servidor. Revisa tu conexión.";
  }
  return error.message || "Ocurrió un error inesperado.";
}
