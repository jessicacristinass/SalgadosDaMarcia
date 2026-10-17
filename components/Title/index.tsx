import { View, Text } from "react-native";
import { styles } from "../../src/styles";

type TitleProps = {
  title: string;
};

export function Title({title}:TitleProps){
    return(
        <View style={{backgroundColor: "#fcd451", padding: 10, alignItems: "center"}}>
            <Text style={styles.titulo}>{title}</Text>
        </View>
    )
}