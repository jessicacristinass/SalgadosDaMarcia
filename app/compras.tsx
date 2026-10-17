import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Modal, TextInput, Dimensions } from 'react-native';
import { Footer } from '../components/Footer';
import { store } from '../src/store';
import { styles } from '../src/styles';

type CompraItem = {
  item: string;
  qtd: string | number;
  preco: string | number;
};

const { height: alturaTela } = Dimensions.get('window');

export default function Compras(){
    const alturaMaxima = alturaTela * 0.6;
    const compras = store.getTable('Compras');

    const mesesDisponiveis: string[] = Array.from(
        new Set(Object.values(compras).map((valores) => String(valores.data).slice(3)))
    );
    const hoje = new Date();
    const mesAtual = hoje.toLocaleDateString().slice(3);
    const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
    const nomeDosMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const comprasFiltradas = Object.entries(compras)
    .filter(([_, valores]) => String(valores.data).includes(mesSelecionado))
    .map(([id, valores]) => {
        let itens;

        try {
            itens = typeof valores.itens === 'string'
            ? JSON.parse(valores.itens)
            : valores.itens;
        } catch {
            itens = [];
        }

        return {
            id,
            data: String(valores.data),
            hora: String(valores.hora),
            itens,
            total: Number(valores.total),
        };
    });

    const comprasOrdenadas = comprasFiltradas.sort((a, b) => {
        const [diaA, mesA, anoA] = a.data.split('/');
        const [horaA, minutoA, segundoA] = a.hora.split(':');
        const dataA = new Date(Number(anoA), Number(mesA) - 1, Number(diaA), Number(horaA), Number(minutoA), Number(segundoA));

        const [diaB, mesB, anoB] = b.data.split('/');
        const [horaB, minutoB, segundoB] = b.hora.split(':');
        const dataB = new Date(Number(anoB), Number(mesB) - 1, Number(diaB), Number(horaB), Number(minutoB), Number(segundoB));

        return dataB.getTime() - dataA.getTime();
    });



    const totalMes = comprasFiltradas.reduce((acum, item) => acum + item.total, 0);

    const [modalVisible, setModalVisible] = useState(false);
    const [linhas, setLinhas] = useState<CompraItem[]>([
    { item: '', qtd: '', preco: '' }
    ]);
    const [indiceEditando, setIndiceEditando] = useState('')

    function adicionarLinha() {
        setLinhas([...linhas, { item: '', qtd: '', preco: '' }]);
    }

    function removerLinha(index: number) {
        const atualizadas = [...linhas];
        atualizadas.splice(index, 1);
        setLinhas(atualizadas);
    }

    function atualizarLinha(index: number, campo: keyof CompraItem, valor: string) {
        const atualizadas = [...linhas];
        let valorFormatado = valor.replace(',', '.');
        const regexValido = /^(\d+)?([.]?\d*)?$/;

        if (campo === 'qtd' || campo === 'preco') {
            if (valor === '' || regexValido.test(valorFormatado)) {
            atualizadas[index][campo] = valor;
            }
        } else {
            atualizadas[index].item = valor;
        }

        setLinhas(atualizadas);
    }

    function salvarCompra() {
        const agora = new Date();
        const dataHoje = agora.toLocaleDateString();
        const horaAgora = agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const idCompra = indiceEditando || agora.getTime().toString();

        const linhasValidas = linhas.filter(
            (linha) => linha.item.trim() !== '' && linha.qtd !== '' && linha.preco !== ''
        );

        const totalCompra = linhasValidas.reduce(
            (soma, linha) => soma + Number(String(linha.preco).replace(',', '.')) || 0,
            0
        );

        store.setRow('Compras', idCompra, {
            data: dataHoje,
            hora: horaAgora,
            itens: JSON.stringify(linhasValidas),
            total: totalCompra,
        });

        setModalVisible(false);
        setLinhas([{ item: '', qtd: '', preco: '' }]);
        setIndiceEditando(''); // ← limpa o estado de edição
    }

    useEffect(() => {
    if (!modalVisible) {
        setLinhas([
        { item: '', qtd: '', preco: '' }
        ]);
    }
    }, [modalVisible]);

    const editarCompra = (id: string) => {
    const valores = store.getRow('Compras', id);
    const itens = typeof valores.itens === 'string'
        ? JSON.parse(valores.itens)
        : valores.itens;

    setLinhas(itens);
    setModalVisible(true);
    setIndiceEditando(id);
    };

    const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
    const [compraParaApagar, setCompraParaApagar] = useState<{ id: string, data: string, total: number } | null>(null);

    function confirmarApagar(id: string) {
        const dados = store.getRow('Compras', id);
        setCompraParaApagar({
            id,
            data: String(dados?.data ?? ''),
            total: Number(dados?.total ?? 0),
        });
        setModalConfirmVisible(true);
    }
    
    function apagarCompraConfirmada() {
        if (compraParaApagar) {
            store.delRow('Compras', compraParaApagar.id);
            setCompraParaApagar(null);
            setModalConfirmVisible(false);
        }
    }

    return(
        <View style={{ flex: 1 }}>
            <View style={styles.main}>
                <Text style={styles.titulo}>Compras do mês</Text>

                <View style={{ marginVertical: 10 }}>
                    <Picker
                        selectedValue={mesSelecionado}
                        onValueChange={(valor) => setMesSelecionado(valor)}
                        style={{ backgroundColor: '#f7c92c', borderRadius: 8, width: 200, marginBottom: 10 }}
                        >
                        {mesesDisponiveis.map((mes) => {
                            const [numeroMes, ano] = mes.split('/');          // Ex: '08' e '2025'
                            const nomeDoMes = nomeDosMeses[parseInt(numeroMes, 10) - 1]; // Ajusta índice
                            const labelFormatada = `${nomeDoMes}/${ano}`;

                            return <Picker.Item key={mes} label={labelFormatada} value={mes} />;
                        })}
                    </Picker>
                </View>

                <ScrollView style={{ width: '100%', marginBottom: 10 }}>
                    {comprasOrdenadas.length === 0 ? (
                        <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 15 }}>Nenhuma compra registrada para esse mês.</Text>
                    ) : (
                        comprasOrdenadas.map((compra) => (
                            <View key={compra.id} style={{ marginBottom: 20, borderWidth: 0.7, padding: 5 }}>
                                <Text style={styles.subtitulo}>Compra de {compra.data}</Text>
                                {compra.itens.map((linha: CompraItem, i: number) => (
                                    <Text key={i} style={styles.texto}>
                                        {linha.qtd} {linha.item} ------ R$ {Number(String(linha.preco).replace(',', '.')).toFixed(2) || 0}
                                    </Text>
                                ))}
                                <Text style={{ marginTop: 4, fontWeight: 'bold', textAlign: 'center', fontSize: 18 }}>
                                    Total: R$ {compra.total.toFixed(2)}
                                </Text>
                                <View style={{ flexDirection: 'row', gap: 50, alignSelf: 'center', marginTop: 10 }}>
                                    <TouchableOpacity onPress={() => editarCompra(compra.id)}>
                                        <Text style={{ color: '#007bff' }}>✏️ Editar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => confirmarApagar(compra.id)}>
                                        <Text style={{ color: '#ff4444' }}>🗑️ Apagar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View> 
            <View style={{flexDirection: 'row', width: "100%", marginBottom: 30, justifyContent:'center', backgroundColor: "#fdf9bcff", gap: 10}}>
                <View style={{ marginBottom: 45, borderWidth: 2, padding: 15, backgroundColor: '#ffffff' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
                        Total gasto no mês:   R$ {totalMes.toFixed(2)}
                    </Text>
                </View>
                <TouchableOpacity style={styles.botaoFlutuante} onPress={() => setModalVisible(true)}>
                    <Text style={{ fontSize: 50, color: '#fff', textAlign: 'center', lineHeight: 55 }}>+</Text>
                </TouchableOpacity>
            </View>
            <Footer/>
            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={{flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 20}}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 15, maxHeight: alturaMaxima }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>
                            Nova Compra
                        </Text>
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 10 }}
                            showsVerticalScrollIndicator={true}
                        >
                            {linhas.map((linha, index) => (
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <TextInput
                                placeholder="Qtd"
                                keyboardType="numeric"
                                value={String(linha.qtd)}
                                onChangeText={(text) => atualizarLinha(index, 'qtd', text)}
                                style={{ borderWidth: 1, width: 60, textAlign: 'center' }}
                                />
                                <TextInput
                                placeholder="Item"
                                value={linha.item}
                                onChangeText={(text) => atualizarLinha(index, 'item', text)}
                                style={{ borderWidth: 1, flex: 1, marginHorizontal: 8, paddingHorizontal: 5 }}
                                />
                                <TextInput
                                placeholder="R$"
                                keyboardType="numeric"
                                value={String(linha.preco)}
                                onChangeText={(text) => atualizarLinha(index, 'preco', text)}
                                style={{ borderWidth: 1, width: 80, textAlign: 'center' }}
                                />
                                <TouchableOpacity onPress={() => removerLinha(index)} style={{ marginLeft: 8, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 18 }}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={adicionarLinha} style={{ marginBottom: 10 }}>
                        <Text style={{ color: '#007bff', textAlign: 'center' }}>＋ Adicionar linha</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={salvarCompra} style={{ backgroundColor: '#f7c92c', padding: 10, borderRadius: 8 }}>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Salvar compra</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#ff4444' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {modalConfirmVisible && (
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
                            Tem certeza que deseja apagar a compra do dia {compraParaApagar?.data} — Total R$ {compraParaApagar?.total.toFixed(2)}?
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                            <TouchableOpacity onPress={apagarCompraConfirmada}>
                            <Text style={{ color: 'red', fontWeight: 'bold' }}>Sim, apagar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalConfirmVisible(false)}>
                            <Text style={{ color: '#007bff' }}>Não, cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}