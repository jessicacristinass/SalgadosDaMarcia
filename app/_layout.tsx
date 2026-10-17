import { Slot } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createExpoSqlitePersister } from 'tinybase/persisters/persister-expo-sqlite';
import { useCreatePersister } from 'tinybase/ui-react';
import { store, applyDefaults } from '../src/store';

export default function Layout() {
  useCreatePersister(
    store,
    () => createExpoSqlitePersister(store, SQLite.openDatabaseSync('database.db')),
    [],
    async (persister) => {
      await persister.load();
      applyDefaults();
      persister.startAutoSave();
    }
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar style="light" translucent />
        <Slot />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}