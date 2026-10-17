import React, { useEffect, useState, useRef  } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { store } from '../src/store';
import { styles } from '../src/styles';
import { router } from "expo-router";

import { Footer } from '../components/Footer';

type ItemTabela = {
  id: string;
  nome: string;
  valor: number;
};

export default function Tabelas() {
    const [salgados, setSalgados] = useState<ItemTabela[]>([]);
    const [bebidas, setBebidas] = useState<ItemTabela[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({ nome: '', valor: '', tabela: '', id: '' });
    const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
    const [itemParaApagar, setItemParaApagar] = useState<{ id: string; nome: string; tabela: string } | null>(null);

    function getTabela(tabelaNome: string): ItemTabela[] {
        const data = store.getTable(tabelaNome);
        const response = Object.entries(data).map(([id, valores]) => ({
        id,
        nome: String(valores.nome),
        valor: Number(valores.valor),
        }));
        return response;
    }

    useEffect(() => {
        setSalgados(getTabela('Salgados'));
        setBebidas(getTabela('Bebidas'));
    }, []);

    function abrirModal(tabela: string) {
        setFormData({ nome: '', valor: '', tabela, id: '' });
        setModalVisible(true);
    }

    function editarItem(tabela: string, id: string) {
        const nome = store.getCell(tabela, id, 'nome');
        const valor = store.getCell(tabela, id, 'valor');
        setFormData({
            nome: String(nome),
            valor: String(valor),
            tabela,
            id,
        });
        setModalVisible(true);
    }

    function confirmarApagar(tabela: string, id: string) {
        const nome = store.getCell(tabela, id, 'nome') ?? '';
        setItemParaApagar({ id, nome: String(nome), tabela });
        setModalConfirmVisible(true);
    }

    function apagarItemConfirmado() {
        if (itemParaApagar) {
            store.delRow(itemParaApagar.tabela, itemParaApagar.id);
            if (itemParaApagar.tabela === 'Salgados') {
            setSalgados(getTabela('Salgados'));
            } else {
            setBebidas(getTabela('Bebidas'));
            }
            setItemParaApagar(null);
            setModalConfirmVisible(false);
        }
    }


    function salvarItem() {
        const { nome, valor, tabela, id } = formData;
        if (!nome || !valor || !tabela) return;

        if (id) {
            // Editar existente
            store.setRow(tabela, id, {
            nome,
            valor: parseFloat(valor.replace(',', '.')),
            });
        } else {
            // Adicionar novo
            const novoId = Date.now().toString();
            store.setRow(tabela, novoId, {
            nome,
            valor: parseFloat(valor.replace(',', '.')),
            });
        }

        if (tabela === 'Salgados') {
            setSalgados(getTabela('Salgados'));
        } else {
            setBebidas(getTabela('Bebidas'));
        }

        setModalVisible(false);
    }


    return (
        <View style={{ flex: 1 }}>
            <View style={styles.main}>
                <Text style={styles.titulo}>Tabela de preços</Text>
                <ScrollView style={{width: '100%', flex: 0.85, marginBottom: 40}}>
                    <View style={styles.tabelas}>
                        <Text style={styles.subtitulo}>Salgados</Text>
                        <View>
                            {salgados.map((item) => (
                                <View key={item.id} style={{ marginBottom: 15, flexDirection: 'column', alignItems: 'center'}}>
                                    <Text style={styles.texto}>
                                    {item.nome} - R$ {item.valor.toFixed(2)}
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: 30 }}>
                                        <TouchableOpacity onPress={() => editarItem('Salgados', item.id)}>
                                            <Text style={{ color: '#007bff' }}>✏️ Editar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => confirmarApagar('Salgados', item.id)}>
                                            <Text style={{ color: '#ff4444' }}>🗑️ Apagar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.botaoAdd} onPress={() => abrirModal('Salgados')}>
                            <Text style={{color: 'green', textAlign: 'center'}}>➕  Adicionar item</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tabelas}>
                        <Text style={styles.subtitulo}>Bebidas</Text>
                        <View>
                        {bebidas.map((item) => (
                                <View key={item.id} style={{ marginBottom: 15, flexDirection: 'column', alignItems: 'center'}}>
                                    <Text style={styles.texto}>
                                    {item.nome} - R$ {item.valor.toFixed(2)}
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: 30 }}>
                                        <TouchableOpacity onPress={() => editarItem('Bebidas', item.id)}>
                                            <Text style={{ color: '#007bff' }}>✏️ Editar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => confirmarApagar('Bebidas', item.id)}>
                                            <Text style={{ color: '#ff4444' }}>🗑️ Apagar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.botaoAdd} onPress={() => abrirModal('Bebidas')}>
                            <Text style={{color: 'green', textAlign: 'center'}}>➕  Adicionar item</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={{ marginTop: 20 }}
                        onPress={() => router.push('/cardapio')}
                    >
                        <Text style={{ color: "blue", textAlign: "center" }}>
                        📥 Ajustar e baixar Cardápio em Imagem
                        </Text>
                    </TouchableOpacity>

                </ScrollView>

                <Modal visible={modalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalFundo}>
                        <View style={styles.modalContainer}>
                        <Text style={styles.modalTitulo}>Adicionar item a {formData.tabela}</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nome do item"
                            placeholderTextColor="black"
                            value={formData.nome}
                            onChangeText={(text) => setFormData({ ...formData, nome: text })}
                        />

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Valor unitário"
                            placeholderTextColor="black"
                            keyboardType="numeric"
                            value={formData.valor}
                            onChangeText={(text) => setFormData({ ...formData, valor: text })}
                        />

                        <TouchableOpacity onPress={salvarItem} style={styles.modalBotao} >
                            <Text style={{fontWeight: 'semibold', fontSize: 15}}>Salvar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBotao} >
                            <Text style={{fontWeight: 'semibold', fontSize: 15}}>Cancelar</Text>
                        </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal visible={modalConfirmVisible} animationType="fade" transparent={true}>
                    <View style={styles.modalFundo}>
                        <View style={styles.modalContainer}>
                        <Text style={styles.modalTitulo}>
                            Tem certeza que deseja apagar o item{' '}
                            <Text style={{ fontWeight: 'bold' }}>{itemParaApagar?.nome}</Text>?
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                            <TouchableOpacity onPress={apagarItemConfirmado}>
                            <Text style={{ color: 'red' }}>Sim, apagar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalConfirmVisible(false)}>
                            <Text style={{ color: '#007bff' }}>Não, cancelar</Text>
                            </TouchableOpacity>
                        </View>
                        </View>
                    </View>
                </Modal>
            </View>
            <Footer />
        </View>
    );
}
