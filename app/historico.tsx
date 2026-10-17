import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Footer } from '../components/Footer';
import { store } from '../src/store';
import { styles } from '../src/styles';
import { EditarHistorico } from '../src/modals/editarHistorico';

type Registro = {
  resumo: string;
  total: number;
  data: string;
  hora: string;
};

type RegistroComId = Registro & { id: string };

export default function Historico() {
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState<{ id: string, hora: string, total: number } | null>(null);
  const [modalCancelVisible, setModalCancelVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [pedidoParaEditar, setPedidoParaEditar] = useState<{ id: string} | null>(null);
  const historico = store.getTable('Historico');
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const todasDatas: string[] = Array.from(
    new Set(Object.values(historico).map((valores) => String(valores.data)))
  );

  const datasFiltradas: string[] = todasDatas
    .filter((data) => {
      const [dia, mes, ano] = data.split('/').map(Number);
      return mes - 1 === mesAtual && ano === anoAtual;
    })
    .sort((a, b) => {
    const [diaA, mesA, anoA] = a.split('/').map(Number);
    const [diaB, mesB, anoB] = b.split('/').map(Number);

    const dataA = new Date(anoA, mesA - 1, diaA);
    const dataB = new Date(anoB, mesB - 1, diaB);

    return dataB.getTime() - dataA.getTime();
  });

  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);

  useEffect(() => {
    if (!dataSelecionada && datasFiltradas.length > 0) {
      setDataSelecionada(datasFiltradas[0]);
    }
  }, [datasFiltradas]);

  const registrosFiltrados: RegistroComId[] = Object.entries(historico)
  .filter(([_, valores]) => String(valores.data) === dataSelecionada)
  .map(([id, valores]) => ({
    id,
    resumo: String(valores.resumo),
    total: Number(valores.total),
    data: String(valores.data),
    hora: String(valores.hora),
  }));

  const totalDia = registrosFiltrados.reduce((acum, item) => acum + item.total, 0);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.main}>
        <Text style={styles.titulo}>Histórico Diário</Text>

        <View style={{ marginVertical: 10 }}>
          <Picker
            selectedValue={dataSelecionada ?? ''}
            onValueChange={(valor) => setDataSelecionada(valor)}
            enabled={datasFiltradas.length > 0}
            style={{ backgroundColor: '#ff000052', borderRadius: 8, width: 200 }}
          >
            {datasFiltradas.length > 0 ? (
              datasFiltradas.map((data) => (
                <Picker.Item key={data} label={data} value={data} />
              ))
            ) : (
              <Picker.Item label="Nada disponível" value="" />
            )}
          </Picker>

        </View>

          <ScrollView style={{ width: '100%', marginBottom: 10 }}>
            {registrosFiltrados.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 15 }}>
                Nenhum pedido registrado para esse dia.
              </Text>
            ) : (
              registrosFiltrados.map((registro, index) => (
                <View key={index} style={{ marginBottom: 20, borderWidth: 0.7, padding: 5 }}>
                  <Text style={styles.subtitulo}>
                    Pedido #{index + 1} - {registro.hora}
                  </Text>

                  {/* Renderização segura do resumo */}
                  {(() => {
                    let linhas: any[] = [];
                    try {
                      linhas = JSON.parse(registro.resumo);
                    } catch {
                      linhas = [];
                    }

                    return linhas.map((linha, i) => {
                      if (typeof linha === "string") {
                        // Caso antigo: string já formatada
                        return (
                          <Text key={i} style={styles.texto}>
                            {linha}
                          </Text>
                        );
                      } else if (typeof linha === "object" && linha.item) {
                        // Novo formato: objeto com item, qtd, preco, total
                        return (
                          <Text key={i} style={styles.texto}>
                            {`${linha.item} — ${linha.qtd} x R$ ${linha.preco.toFixed(2)} = R$ ${linha.total.toFixed(2)}`}
                          </Text>
                        );
                      }
                      return null;
                    });
                  })()}

                  <Text style={{ marginTop: 4, fontWeight: 'bold', textAlign: 'center', fontSize: 20 }}>
                    Total: R$ {registro.total.toFixed(2)}
                  </Text>

                  <View style={{ justifyContent: 'space-evenly', flexDirection: 'row' }}>
                    <Text
                      style={{ color: '#ff4444', marginTop: 10, fontSize: 15 }}
                      onPress={() => {
                        setPedidoParaCancelar({ id: registro.id, hora: registro.hora, total: registro.total });
                        setModalCancelVisible(true);
                      }}
                    >
                      Cancelar pedido
                    </Text>

                    <Text
                      style={{ color: '#447fffff', marginTop: 10, fontSize: 15 }}
                      onPress={() => {
                        setPedidoParaEditar({ id: registro.id });
                        setModalEditVisible(true);
                      }}
                    >
                      Editar pedido
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <View style={{ marginBottom: 45, borderWidth: 2, padding: 15, backgroundColor: '#ffffff' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
              Total do dia:   R$ {totalDia.toFixed(2)}
            </Text>
          </View>
        </View>
        <Footer />

        {modalCancelVisible && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              width: '80%',
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
                Cancelar pedido das {pedidoParaCancelar?.hora}, com total R$ {pedidoParaCancelar?.total.toFixed(2)}?
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <Text style={{ color: 'red', fontWeight: 'bold' }} onPress={() => {
                  if (pedidoParaCancelar) {
                    store.delRow('Historico', pedidoParaCancelar.id);
                  }
                  setPedidoParaCancelar(null);
                  setModalCancelVisible(false);
                }}>
                  Sim, cancelar
                </Text>
                <Text style={{ color: '#007bff' }} onPress={() => {
                  setPedidoParaCancelar(null);
                  setModalCancelVisible(false);
                }}>
                  Não, manter
                </Text>
              </View>
            </View>
          </View>
        )}
      {modalEditVisible && pedidoParaEditar && (
        <EditarHistorico
          id={pedidoParaEditar.id}
          onClose={() => {
            setPedidoParaEditar(null);
            setModalEditVisible(false);
          }}
        />
      )}
    </View>
  );
}
