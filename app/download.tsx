import { View, Text, ScrollView } from "react-native";
import React, { useState, useEffect } from 'react';
import { Footer } from "../components/Footer";
import { Button } from "../components/Button"; 
import { styles } from '../src/styles';
import { Picker } from '@react-native-picker/picker';
import { store } from '../src/store';
import { gerarPDFMes } from '../src/utils/pdfMes';
import { gerarPDFAno } from "../src/utils/pdfAno";

type RegistroBase = {
  id: string;
  origem: 'Compras' | 'Historico';
  data?: string;
  total?: number;
  [key: string]: any;
};

type Registro = {
  id: string;
  data: string;
  total: number;
  itens?: string;
  resumo?: string;
  origem: 'Compras' | 'Historico';
};

export default function Download(){
    const [dados, setDados] = useState<RegistroBase[]>([]);
    const [anoSelecionado, setAnoSelecionado] = useState('');
    const [anosDisponiveis, setAnosDisponiveis] = useState<string[]>([]);

    useEffect(() => {
        const historico: RegistroBase[] = Object.entries(store.getTable('Historico')).map(([id, valores]) => ({
            id,
            origem: 'Historico',
            ...valores,
        }));

        const compras: RegistroBase[] = Object.entries(store.getTable('Compras')).map(([id, valores]) => ({
            id,
            origem: 'Compras',
            ...valores,
        }));

        setDados([...historico, ...compras]);
    }, []);

    useEffect(() => {
        const anos = [...new Set(dados.map(item => item.data?.slice(6)))];
        setAnosDisponiveis(anos.filter((ano): ano is string => typeof ano === 'string'));
    }, [dados]);

    useEffect(() => {
        if (anosDisponiveis.length > 0) {
            setAnoSelecionado(anosDisponiveis[0]);
        }
    }, [anosDisponiveis]);

    const mesesOrdenados = [...new Set(
        dados
            .filter(item => item.data?.slice(6) === anoSelecionado)
            .map(item => item.data?.slice(3, 5))
            .filter((mes): mes is string => typeof mes === 'string')
    )].sort((a, b) => parseInt(a) - parseInt(b));

    
    function nomeDoMes(numeroMes: string): string {
        const nomes = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const index = parseInt(numeroMes, 10) - 1;
        return nomes[index] || numeroMes;
    }

    const dadosValidos: Registro[] = dados.filter(
        (item): item is Registro => typeof item.data === 'string' && typeof item.total === 'number'
    );

    const handlePlanilhaMes = async (mes: string, ano: string, dados: Registro[]) => {
        const { gerarPlanilhaMes } = await import('../src/utils/planilhaMes');
        await gerarPlanilhaMes(mes,anoSelecionado,dadosValidos);
    };

    const handlePlanilhaAno = async (ano: string, dados: Registro[]) => {
        const { gerarPlanilhaAno } = await import('../src/utils/planilhaAno');
        await gerarPlanilhaAno(anoSelecionado,dadosValidos);
    };

    return(
        <View style={{ flex: 1 }}>
            <View style={styles.main}>
                <Text style={styles.titulo}>Donwload mensal</Text>
                <View>
                    <Picker
                        selectedValue={anoSelecionado}
                        onValueChange={setAnoSelecionado}
                        style={{ backgroundColor: '#f7c92c', borderRadius: 8, width: 200, marginBottom: 10 }}
                    >
                        {anosDisponiveis.map(ano => (
                        <Picker.Item key={ano} label={ano} value={ano} />
                        ))}
                    </Picker>
                </View>
                <ScrollView style={{marginBottom: 40}}>
                    {mesesOrdenados.map(mes => {
                        const nomeMes = nomeDoMes(mes);
                        return (
                            <View key={mes} style={{ marginVertical: 10, alignItems: 'center' }}>
                                <View style={{ marginBottom: -14, backgroundColor:'#fdf9bcff', zIndex: 2, width: 140, borderWidth: 2 }}>
                                    <Text style={{ fontSize: 16, textAlign: 'center'}}>{nomeMes}/{anoSelecionado}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', borderWidth: 2, padding: 30, width: '95%' }}>
                                    <Button title="📄 PDF" ação={() => gerarPDFMes(mes, anoSelecionado, dadosValidos)} />
                                    {/* <Button title="📊 Planilha" ação={() => handlePlanilhaMes(mes, anoSelecionado, dadosValidos)}/>
                                 */}</View>
                            </View>
                        );
                    })}

                    <View style={{ marginTop: 30, alignItems: 'center' }}>
                        <View style={{ marginBottom: -16, backgroundColor:'#fdf9bcff', zIndex: 2, width: '75%', borderWidth: 3 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Download do total de {anoSelecionado}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', borderWidth: 3, padding: 30, width: '95%' }}>
                            <Button title="📄 PDF do Ano" ação={() => gerarPDFAno(anoSelecionado, dadosValidos)}/>
                            {/* <Button title="📊 Planilha do Ano" ação={() => handlePlanilhaAno(anoSelecionado, dadosValidos)}/>
                         */}</View>
                    </View>
                </ScrollView>
            </View>
            <Footer/>
        </View>
    )
}