import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { store } from "../store";

type Props = {
  id: string;
  onClose: () => void;
};

type Linha = {
  item: string;
  qtd: number;
  preco: number;
  total: number;
};

export function EditarHistorico({ id, onClose }: Props) {
  const registro = store.getRow("Historico", id);
  console.log(registro)

  // Carregar opções de Salgados e Bebidas
  const tabelaSalgados = store.getTable("Salgados");
  const tabelaBebidas = store.getTable("Bebidas");

  // Criar dicionário de preços por nome
  const priceMap: Record<string, number> = {
    ...Object.values(tabelaSalgados).reduce((acc: any, s: any) => {
      acc[s.nome] = Number(s.valor);
      return acc;
    }, {}),
    ...Object.values(tabelaBebidas).reduce((acc: any, b: any) => {
      acc[b.nome] = Number(b.valor);
      return acc;
    }, {}),
  };

  // Lista de opções para o Picker
  const opcoes = Object.values(tabelaSalgados)
    .concat(Object.values(tabelaBebidas))
    .map((o: any) => ({ nome: o.nome, preco: Number(o.valor) }));

  // Parse de linhas antigas
  const parseLinhaAntiga = (s: string): Linha => {
    const regex = /^(.+?)\s*—\s*(\d+)\s*x\s*R\$\s*([\d.,]+)/i;
    const m = s.match(regex);
    if (m) {
      const item = m[1].trim();
      const qtd = Number(m[2]);
      const precoTabela = priceMap[item] ?? Number(m[3].replace(",", "."));
      const total = qtd * precoTabela;
      return { item, qtd, preco: precoTabela, total };
    }
    return { item: s, qtd: 1, preco: priceMap[s] ?? 0, total: 0 };
  };

  // Estado inicial
  const [linhas, setLinhas] = useState<Linha[]>(() => {
    try {
      /* @ts-ignore */
      const parsed = JSON.parse(registro.resumo ?? "[]");
      if (Array.isArray(parsed) && typeof parsed[0] === "string") {
        return parsed.map(parseLinhaAntiga);
      }
      if (Array.isArray(parsed)) {
        return parsed.map((l: any) => {
          const item = String(l.item);
          const qtd = Number(l.qtd);
          const precoTabela = priceMap[item] ?? Number(l.preco);
          const total = qtd * precoTabela;
          return { item, qtd, preco: precoTabela, total };
        });
      }
      return [];
    } catch {
      return [];
    }
  });

  // Atualizar linha
  const atualizarLinha = (
    index: number,
    campo: "item" | "qtd" | "preco",
    valor: any
  ) => {
    const novas = [...linhas];
    if (campo === "item") {
      const novoItem = String(valor);
      novas[index].item = novoItem;
      const precoTabela = priceMap[novoItem] ?? 0;
      novas[index].preco = precoTabela;
      novas[index].total = novas[index].qtd * precoTabela;
    } else if (campo === "qtd") {
      const qtd = Number(String(valor).replace(",", "."));
      novas[index].qtd = isNaN(qtd) ? 0 : qtd;
      novas[index].total = novas[index].qtd * novas[index].preco;
    } else if (campo === "preco") {
      const preco = Number(String(valor).replace(",", "."));
      novas[index].preco = isNaN(preco) ? 0 : preco;
      novas[index].total = novas[index].qtd * novas[index].preco;
    }
    setLinhas(novas);
  };

  // Adicionar linha vazia
  const adicionarLinha = () => {
    setLinhas([...linhas, { item: "", qtd: 0, preco: 0, total: 0 }]);
  };

  // Remover linha
  const removerLinha = (index: number) => {
    setLinhas((prev) => prev.filter((_, i) => i !== index));
  };

  // Salvar no store
  const salvar = () => {
    const totalPedido = linhas.reduce((a, l) => a + (l.total || 0), 0);

    // Converte cada linha em string legível
    const resumoStrings = linhas.map(l =>
      `${l.item} — ${l.qtd} x R$ ${l.preco.toFixed(2)} = R$ ${l.total.toFixed(2)}`
    );

    store.setRow("Historico", id, {
      ...registro,
      resumo: JSON.stringify(resumoStrings), // salva como array de strings
      total: totalPedido,
    });

    console.log(store.getRow("Historico", id));
    onClose();
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 10,
          width: "90%",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          Editar pedido das {registro.hora}
        </Text>
        <ScrollView style={{
            maxHeight: "70%", // limita a altura do modal a 80% da tela
            }}
        >
          {linhas.map((linha, i) => (
            <View key={i} style={{ marginBottom: 15, borderWidth: 0.5, padding: 3}}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* Picker */}
                <Picker
                    selectedValue={linha.item}
                    style={{ flex: 3}}
                    itemStyle={{ color: 'black' }}
                    onValueChange={(val) => atualizarLinha(i, "item", val)}
                >
                    <Picker.Item label="Selecione..." value="" />
                    {opcoes.map((op, idx) => (
                    <Picker.Item key={idx} label={op.nome} value={op.nome} />
                    ))}
                </Picker>

                {/* Quantidade */}
                <TextInput
                    style={{
                    flex: 0.5,
                    borderWidth: 1,
                    marginHorizontal: 5,
                    fontSize: 14,
                    textAlign: "center",
                    }}
                    keyboardType="numeric"
                    value={String(linha.qtd)}
                    onChangeText={(val) => atualizarLinha(i, "qtd", val)}
                    placeholder="0"
                />

                <Text style={{ marginHorizontal: 4 }}> x </Text>

                {/* Preço unitário */}
                <Text style={{ flex: 1, textAlign: "center", fontSize: 14 }}>
                    R$ {(linha.preco ?? 0).toFixed(2)}
                </Text>

                <Text style={{ marginHorizontal: 4 }}> = </Text>

                {/* Total */}
                <Text
                    style={{
                    flex: 1,
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: 13,
                    }}
                >
                    R$ {(linha.total ?? 0).toFixed(2)}
                </Text>
                </View>
                
                {/* Botão apagar linha */}
                <Text
                style={{ color: "red", textAlign: "center", marginTop: 4, borderTopWidth: 0.20, width: '80%', alignSelf: 'center' }}
                onPress={() => removerLinha(i)}
                >
                ✖ Apagar linha
                </Text>
            </View>
            ))}
        </ScrollView>

        <Text
          style={{ color: "#007bff", marginTop: 10, textAlign: "center" }}
          onPress={adicionarLinha}
        >
          ＋ Adicionar item
        </Text>

        {/* Total geral */}
        <Text
          style={{
            marginTop: 12,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Total do pedido: R$ {linhas.reduce((a, l) => a + (l.total || 0), 0).toFixed(2)}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 20,
          }}
        >
          <Text style={{ color: "green", fontWeight: "bold" }} onPress={salvar}>
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