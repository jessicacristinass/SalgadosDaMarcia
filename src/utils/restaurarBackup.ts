import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { store } from '../store';

type Cell = string | number | boolean;
type LinhaBackup = Record<string, Cell>;
type TabelaBackup = Record<string, LinhaBackup>;
type Backup = {
  Salgados: TabelaBackup;
  Bebidas: TabelaBackup;
  Historico: TabelaBackup;
  Compras: TabelaBackup;
};

const tabelas = ['Salgados', 'Bebidas', 'Historico', 'Compras'] as const;

export async function restaurarBackup(): Promise<boolean> {
  const arquivo = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (arquivo.canceled) return false;

  const conteudo = await FileSystem.readAsStringAsync(
    arquivo.assets[0].uri
  );

  let dados: unknown;
  try {
    dados = JSON.parse(conteudo);
  } catch {
    throw new Error('O arquivo selecionado não contém um JSON válido.');
  }

  const backup = validarBackup(dados);

  store.transaction(() => {
    tabelas.forEach((tabela) => {
      store.delTable(tabela);
      store.setTable(tabela, backup[tabela]);
    });
  });

  return true;
}

function validarBackup(dados: unknown): Backup {
  if (!isRecord(dados) || dados.versao !== '1.0') {
    throw new Error('O arquivo selecionado não é um backup compatível.');
  }

  const backup: Backup = {
    Salgados: {},
    Bebidas: {},
    Historico: {},
    Compras: {},
  };
  tabelas.forEach((tabela) => {
    const dadosTabela = dados[tabela];
    if (!isRecord(dadosTabela)) {
      throw new Error(`O backup está inválido: tabela ${tabela} ausente ou incorreta.`);
    }

    const linhas: TabelaBackup = Object.create(null);
    Object.entries(dadosTabela).forEach(([id, valores]) => {
      if (!id || !isRecord(valores)) {
        throw new Error(`O backup está inválido: registro incorreto na tabela ${tabela}.`);
      }

      const linha: LinhaBackup = Object.create(null);
      Object.entries(valores).forEach(([celula, valor]) => {
        if (!isCell(valor)) {
          throw new Error(`O backup está inválido: registro incorreto na tabela ${tabela}.`);
        }
        linha[celula] = valor;
      });
      linhas[id] = linha;
    });
    backup[tabela] = linhas;
  });

  return backup;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCell(value: unknown): value is Cell {
  return typeof value === 'string'
    || typeof value === 'boolean'
    || (typeof value === 'number' && Number.isFinite(value));
}