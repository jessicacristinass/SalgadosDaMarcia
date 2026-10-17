import {View, Text, TouchableOpacity, Image, Modal, Animated, Easing, Alert} from 'react-native'
import { useState, useRef, useEffect } from 'react';
import { router } from "expo-router";
import {styles} from './styles'
import { gerarBackup } from '../../src/utils/backup';
import { restaurarBackup } from '../../src/utils/restaurarBackup';

export function Footer(){
    const [modalVisible, setModalVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(300)).current;

    async function handleBackup() {
        setModalVisible(false);
        try {
            await gerarBackup();
        } catch (erro) {
            Alert.alert('Erro ao criar backup', mensagemErro(erro));
        }
    }

    function confirmarImportacao() {
        setModalVisible(false);
        Alert.alert(
            'Importar backup',
            'A importação substituirá todos os dados atuais. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Importar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const importado = await restaurarBackup();
                            if (importado) {
                                Alert.alert('Backup importado', 'Os dados foram restaurados com sucesso.');
                            }
                        } catch (erro) {
                            Alert.alert('Erro ao importar backup', mensagemErro(erro));
                        }
                    },
                },
            ]
        );
    }

    useEffect(() => {
        if(modalVisible){
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
        } else {
        slideAnim.setValue(300);
        }
    }, [modalVisible, slideAnim]);

    return(
        <View style={styles.footer}>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={() => router.push('/')} style={styles.botao}>
                    <Image source={require('../../assets/images/calculadora.png')} style={{width: 30, height:35, alignSelf: 'center'}}/>
                    <Text>Calculadora</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/tabelas')} style={styles.botao}>
                    <Image source={require('../../assets/images/tabelas.png')} style={{width: 30, height:35, alignSelf: 'center'}}/>
                    <Text>Tabela de Preços</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/historico')} style={styles.botao}>
                    <Image source={require('../../assets/images/historico.png')} style={{width: 30, height:35, alignSelf: 'center'}}/>
                    <Text>Histórico</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.botao}>
                    <Image source={require('../../assets/images/menu.png')} style={{width: 30, height:35, alignSelf: 'center'}}/>
                    <Text>Menu</Text>
                </TouchableOpacity>
            </View>
            <Modal visible={modalVisible} transparent={true}>
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)'}}>
                    <Animated.View style={{transform: [{ translateY: slideAnim }], backgroundColor: '#f7c92c', padding: 20, paddingBottom: 40, borderTopLeftRadius: 20, borderTopRightRadius: 20}}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Mais páginas</Text>

                        <TouchableOpacity onPress={() => { router.push('/download'); setModalVisible(false); }}>
                            <Text style={{ fontSize: 18, marginVertical: 10 }}>📄 Download Mensal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { router.push('/compras'); setModalVisible(false); }}>
                            <Text style={{ fontSize: 18, marginVertical: 10 }}>🛒 Compras do mês</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleBackup}>
                            <Text style={{ fontSize: 18, marginVertical: 10 }}>💾 Fazer backup</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={confirmarImportacao}>
                            <Text style={{ fontSize: 18, marginVertical: 10 }}>📥 Importar backup</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 20, borderTopWidth: 0.5, paddingTop: 15}}>
                            <Text style={{ color: '#ff0000ff', textAlign: 'center', fontWeight: 'bold', fontSize: 15}}>Fechar</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    )
}

function mensagemErro(erro: unknown): string {
    return erro instanceof Error ? erro.message : 'Ocorreu um erro inesperado.';
}