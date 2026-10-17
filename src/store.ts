import { createStore } from 'tinybase';

const store = createStore();

export function applyDefaults(){
  if(!store.getTableIds().includes("Bebidas")) {
    store.setTable("Bebidas", {
      lata: { nome: 'Coca-Cola lata', valor: 4.50 },
      litro: { nome: 'Guaraná 1L', valor: 6.00 },
      garrafinha: { nome: 'Garrafinha 250ml', valor: 2.50 }
    })
  }

  if(!store.getTableIds().includes("Salgados")) {
    store.setTable("Salgados", {
      salgado: { nome: 'Salgados', valor: 1.50 },
      canudinho: { nome: 'Canudinho', valor: 0.40 },
      porcao: {nome: 'Mini salgados', valor: 5.00}
    })
  }

  if(!store.getTableIds().includes("Historico")) {
    store.setTable("Historico", {})
  }

  if(!store.getTableIds().includes("Compras")) {
    store.setTable("Compras", {})
  }
}

let dadosCarregados = false;

export function jaCarregouDados() {
  return dadosCarregados;
}

export function marcarComoCarregado() {
  dadosCarregados = true;
}

export { store };
