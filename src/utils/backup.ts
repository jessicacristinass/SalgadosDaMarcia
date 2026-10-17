import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { store } from '../store';

export async function gerarBackup() {
  if (!FileSystem.documentDirectory) {
    throw new Error('Não foi possível acessar o armazenamento de arquivos.');
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento de arquivos não está disponível neste dispositivo.');
  }

  const backup = {
    versao: '1.0',
    dataBackup: new Date().toISOString(),
    Salgados: store.getTable('Salgados'),
    Bebidas: store.getTable('Bebidas'),
    Historico: store.getTable('Historico'),
    Compras: store.getTable('Compras'),
  };

  const nomeArquivo = `${FileSystem.documentDirectory}backup-${Date.now()}.json`;

  await FileSystem.writeAsStringAsync(
    nomeArquivo,
    JSON.stringify(backup, null, 2),
    { encoding: FileSystem.EncodingType.UTF8 }
  );
  await Sharing.shareAsync(nomeArquivo, {
    mimeType: 'application/json',
    dialogTitle: 'Salvar backup',
    UTI: 'public.json',
  });
}