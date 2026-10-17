import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { store, jaCarregouDados, marcarComoCarregado } from '../src/store';
import { styles } from '../src/styles';

import { Footer } from '../components/Footer';

type ItemTabela = {
  id: string;
  nome: string;
};

type Quantidades = {
  [id: string]: string;
};

export default function Index() {
  const [carregando, setCarregando] = useState(true)
  const [salgados, setSalgados] = useState<ItemTabela[]>([]);
  const [bebidas, setBebidas] = useState<ItemTabela[]>([]);
  const [quantidade, setQuantidade] = useState<Quantidades>({});
  const [total, setTotal] = useState(0);
  const [resumo, setResumo] = useState<string[]>([]);
  const [podeCalcular, setPodeCalcular] = useState(false);
  const [erroCampo, setErroCampo] = useState<string | null>(null);

  function getTabela(tabelaNome: string): ItemTabela[] {
    const data = store.getTable(tabelaNome);
    return Object.entries(data).map(([id, valores]) => ({
      id,
      nome: String(valores.nome),
    }));
  }

  useEffect(() => {
    if (jaCarregouDados()) {
      const tabelaSalgados = getTabela('Salgados');
      const tabelaBebidas = getTabela('Bebidas');
      setSalgados(tabelaSalgados);
      setBebidas(tabelaBebidas);
      setCarregando(false);
      return;
    }

    const intervalo = setInterval(() => {
      const tabelaSalgados = getTabela('Salgados');
      const tabelaBebidas = getTabela('Bebidas');

      const temDados = Object.keys(tabelaSalgados).length > 0 || Object.keys(tabelaBebidas).length > 0;

      if (temDados) {
        setSalgados(tabelaSalgados);
        setBebidas(tabelaBebidas);
        setCarregando(false);
        marcarComoCarregado(); // marca como carregado
        clearInterval(intervalo);
      }
    }, 500);

    return () => clearInterval(intervalo);
  }, []);


  useEffect(() => {
    let valido = false;

    for (const valor of Object.values(quantidade)) {
      const qtd = Number(valor);
      if (!isNaN(qtd) && qtd > 0) {
        valido = true;
        break;
      }
    }

    setPodeCalcular(valido);
  }, [quantidade]);

  function atualizarQuantidade(id: string, valor: string) {
    setQuantidade((prev) => ({
      ...prev,
      [id]: valor,
    }));
  }

  function calcularTotal() {
    let erroDetectado = false;

    for (const valor of Object.values(quantidade)) {
      if (valor !== '' && isNaN(Number(valor))) {
        erroDetectado = true;
        break;
      }
    }

    if (erroDetectado) {
      setErroCampo('Há valores inválidos nos campos!');
      return;
    }

    setErroCampo(null);

    let acumulado = 0;
    const listaResumo: string[] = [];

    const tabelaSalgados = store.getTable('Salgados');
    for (const [id, valores] of Object.entries(tabelaSalgados)) {
      const qtd = Number(quantidade[id]);
      const valor = Number(valores.valor);

      if (!isNaN(qtd) && qtd > 0) {
        const totalItem = qtd * valor;
        acumulado += totalItem;
        listaResumo.push(`${valores.nome} — ${qtd} x R$ ${valor.toFixed(2)} = R$ ${totalItem.toFixed(2)}`);
      }
    }

    const tabelaBebidas = store.getTable('Bebidas');
    for (const [id, valores] of Object.entries(tabelaBebidas)) {
      const qtd = Number(quantidade[id]);
      const valor = Number(valores.valor);

      if (!isNaN(qtd) && qtd > 0) {
        const totalItem = qtd * valor;
        acumulado += totalItem;
        listaResumo.push(`${valores.nome} — ${qtd} x R$ ${valor.toFixed(2)} = R$ ${totalItem.toFixed(2)}`);
      }
    }

    setResumo(listaResumo);
    setTotal(acumulado);

    const agora = new Date();
    const dataHoje = agora.toLocaleDateString();
    const horaAgora = agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const idHistorico = agora.getTime().toString();

    store.setRow('Historico', idHistorico, {
    data: dataHoje,
    hora: horaAgora,
    resumo: JSON.stringify(listaResumo),
    total: acumulado,
    });
  }

  function limparTudo() {
    setQuantidade({});
    setTotal(0);
    setResumo([]);
    setErroCampo(null);
  }

  if(carregando){
    return (
      <View style={styles.carregando}>
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ transform: [{ scale: 2 }] }}
        />
        <Text style={{ marginTop: 25, fontSize: 20 }}>Carregando dados...</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.main}>
        <Text style={styles.titulo}>Salgados da Márcia</Text>
        <ScrollView style={{ width: '100%', marginBottom: 40 }}>
          <View style={styles.tabelas}>
            <Text style={styles.subtitulo}>Salgados</Text>
            {salgados.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={styles.texto}>{item.nome}</Text>
                <TextInput
                  style={{ borderWidth: 1, width: 50, textAlign: 'center' }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="black"
                  value={quantidade[item.id] ?? ''}
                  onChangeText={(text) => atualizarQuantidade(item.id, text)}
                />
              </View>
            ))}
          </View>

          <View style={styles.tabelas}>
            <Text style={styles.subtitulo}>Bebidas</Text>
            {bebidas.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={styles.texto}>{item.nome}</Text>
                <TextInput
                  style={{ borderWidth: 1, width: 50, textAlign: 'center' }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="black"
                  value={quantidade[item.id] ?? ''}
                  onChangeText={(text) => atualizarQuantidade(item.id, text)}
                />
              </View>
            ))}
          </View>

          <View style={{ marginVertical: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 20 }}>Total: R$ {total.toFixed(2)}</Text>
          </View>

          {resumo.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, marginBottom: 8, textAlign: 'center' }}>Resumo do pedido:</Text>
              {resumo.map((linha, index) => (
                <Text key={index} style={{ textAlign: 'center' }}>{linha}</Text>
              ))}
            </View>
          )}

          {erroCampo && (
            <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
              {erroCampo}
            </Text>
          )}

          <TouchableOpacity
              style={[styles.botaoCalculadora, { opacity: podeCalcular && resumo.length === 0 ? 1 : 0.5 }]}
              onPress={calcularTotal}
              disabled={!podeCalcular || resumo.length > 0}
          >
              <Text style={{ fontSize: 20 }}>Calcular</Text>
              {resumo.length > 0 && (
                  <Text style={{ color: 'gray', fontSize: 14, textAlign: 'center', marginBottom: 10 }}>
                      Já calculado. Limpe para refazer.
                  </Text>
              )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoCalculadora} onPress={limparTudo}>
            <Text style={{ fontSize: 20 }}>Limpar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <Footer />
    </View>
  );
}
