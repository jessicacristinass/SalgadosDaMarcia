import React, { useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as Sharing from "expo-sharing";
import { store } from "../src/store";
import { styles } from "../src/styles";
import { Footer } from "../components/Footer";
import { SelecionarItens } from "../src/modals/editarCardapio";

export default function CardapioExport() {
  const pageRef = useRef<View>(null);

  const salgados = Object.values(store.getTable("Salgados"));
  const bebidas = Object.values(store.getTable("Bebidas"));

  const [selectedItems, setSelectedItems] = useState<string[]>([
    ...salgados.map((s: any) => s.nome),
    ...bebidas.map((b: any) => b.nome),
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  const gerarCardapioImagem = async () => {
    try {
      const uri = await captureRef(pageRef, { format: "png", quality: 1, result: "tmpfile" });
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.PNG }
      );
      const newPath = FileSystem.documentDirectory + `cardapio-${Date.now()}.png`;
      await FileSystem.copyAsync({ from: manipResult.uri, to: newPath });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newPath);
      } else {
        Alert.alert("Imagem gerada", "Cardápio salvo em: " + newPath);
      }
    } catch (error) {
      Alert.alert("Erro ao gerar cardápio", (error as Error).message);
    }
  };

  const salgadosSelecionados = salgados.filter((item: any) => selectedItems.includes(item.nome));
  const bebidasSelecionadas = bebidas.filter((item: any) => selectedItems.includes(item.nome));

  return (
    <View style={{ flex: 1 }}>
        <ScrollView style={{ marginBottom: 40, backgroundColor: "#fdf9bcff"}}>
          <View style={styles.main}>
            <View
              collapsable={false}
              ref={pageRef}
              style={{
                backgroundColor: "#f7c92c",
                padding: 20,
                borderRadius: 8,
                margin: 20,
                alignSelf: "center",
                width: "90%"
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
                Salgados da Márcia - Cardápio
              </Text>

              {salgadosSelecionados.length > 0 && (
                <>
                  <Text style={{ fontSize: 20, marginTop: 10, fontWeight: "bold", textAlign: "center" }}>
                    Salgados
                  </Text>
                  {salgadosSelecionados.map((item: any, index: number) => (
                    <View key={`salgado-${index}`} style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ fontSize: 18 }}>{item.nome}</Text>
                      <View style={{ flex: 1, borderBottomWidth: 1, borderStyle: "dashed", marginHorizontal: 8 }} />
                      <Text style={{ fontSize: 18 }}>R$ {item.valor.toFixed(2)}</Text>
                    </View>
                  ))}
                </>
              )}

              {bebidasSelecionadas.length > 0 && (
                <>
                  <Text style={{ fontSize: 20, marginTop: 20, fontWeight: "bold", textAlign: "center" }}>
                    Bebidas
                  </Text>
                  {bebidasSelecionadas.map((item: any, index: number) => (
                    <View key={`bebida-${index}`} style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ fontSize: 18 }}>{item.nome}</Text>
                      <View style={{ flex: 1, borderBottomWidth: 1, borderStyle: "dashed", marginHorizontal: 8 }} />
                      <Text style={{ fontSize: 18 }}>R$ {item.valor.toFixed(2)}</Text>
                    </View>
                  ))}
                </>
              )}

                <Image
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: "contain",
                    alignSelf: "center",
                    marginTop: 50,
                  }}
                  source={require("../assets/images/logo.png")}
                />
            </View>

            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={{ color: "green", textAlign: "center", margin: 20 }}>⚙️ Selecionar Itens</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={gerarCardapioImagem}>
              <Text style={{ color: "blue", textAlign: "center", margin: 20 }}>📥 Compartilhar como Imagem</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      <Footer />

      {modalVisible && (
        <SelecionarItens
          selectedItems={selectedItems}
          onSave={(novos) => {
            setSelectedItems(novos);
            setModalVisible(false);
          }}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
}