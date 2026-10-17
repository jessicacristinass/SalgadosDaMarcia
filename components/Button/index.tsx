import { Text, TouchableOpacity, StyleSheet } from 'react-native';

type ButtonProps = {
  title: string;
  ação: () => void;
};

export function Button({ title, ação }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.botao} onPress={ação}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}

export const styles = StyleSheet.create({
  botao: {
    padding: 5,
    backgroundColor: '#ff08086c',
    alignItems: 'center',
  },
});
