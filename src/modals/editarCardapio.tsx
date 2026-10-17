import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { store } from "../store";

type Props = {
  selectedItems: string[];
  onSave: (items: string[]) => void;
  onClose: () => void;
};

export function SelecionarItens({ selectedItems, onSave, onClose }: Props) {
  const salgados = Object.values(store.getTable("Salgados"));
  const bebidas = Object.values(store.getTable("Bebidas"));

  const [localSelection, setLocalSelection] = useState<string[]>(selectedItems);

  const toggleItem = (nome: string) => {
    setLocalSelection((prev) =>
      prev.includes(nome) ? prev.filter((i) => i !== nome) : [...prev, nome]
    );
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: "90%", maxHeight: "80%" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
          Selecionar Itens do Cardápio
        </Text>
        <ScrollView>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Salgados</Text>
          {salgados.map((item: any, index: number) => (
            <Pressable key={`salgado-${index}`} onPress={() => toggleItem(item.nome)} style={{ flexDirection: "row", marginBottom: 8 }}>
              <Text style={{ flex: 1 }}>{item.nome}</Text>
              <Text>{localSelection.includes(item.nome) ? "✅" : "⬜"}</Text>
            </Pressable>
          ))}

          <Text style={{ fontSize: 18, marginVertical: 10 }}>Bebidas</Text>
          {bebidas.map((item: any, index: number) => (
            <Pressable key={`bebida-${index}`} onPress={() => toggleItem(item.nome)} style={{ flexDirection: "row", marginBottom: 8 }}>
              <Text style={{ flex: 1 }}>{item.nome}</Text>
              <Text>{localSelection.includes(item.nome) ? "✅" : "⬜"}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
          <Text style={{ color: "green", fontWeight: "bold" }} onPress={() => onSave(localSelection)}>
            Salvar
          </Text>
          <Text style={{ color: "red" }} onPress={onClose}>
            Cancelar
          </Text>
        </View>
      </View>
    </View>
  );
}