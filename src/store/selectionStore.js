import { useSyncExternalStore } from "react";

let selections = [];
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => selections;

let counter = 0;
const newKey = () => `sel-${Date.now()}-${++counter}`;

// Agrega una selección y devuelve la selección creada (con su key)
export function addSelection(item) {
  const created = { ...item, key: newKey() };
  selections = [...selections, created];
  emit();
  return created;
}

// Cambia los datos de una selección (por ejemplo fecha, hora o personas)
export function updateSelection(key, changes) {
  selections = selections.map((s) => (s.key === key ? { ...s, ...changes } : s));
  emit();
}

// Quita una selección
export function removeSelection(key) {
  selections = selections.filter((s) => s.key !== key);
  emit();
}

// Vacía todo (después de "Confirmar Itinerario")
export function clearSelections() {
  selections = [];
  emit();
}

// Lectura sin hook (para funciones fuera de componentes)
export function getSelections() {
  return selections;
}

// Total de todo lo seleccionado
export function getSelectionsTotal(list = selections) {
  return list.reduce((sum, s) => sum + Number(s.subtotal || 0), 0);
}

// Hook para componentes: devuelve la lista y se vuelve a pintar cuando cambia
export function useSelections() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}