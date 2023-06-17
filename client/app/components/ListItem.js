import React from 'react';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { View, StyleSheet, Text } from 'react-native';
import AppText from './AppText';


function ListItem({ image, text, IconComponent, switchComponent }) {

    return (
        <TouchableHighlight underlayColor={"#d3d3d3"} onPress={console.log()}>
            <View style={styles.container}>
                {IconComponent}
                {image && <Image style={styles.image} source={image} />}
                <View style={styles.detailsContainer}>
                    <AppText style={styles.text}>{text}</AppText>
                </View>
                {switchComponent}
            </View>
        </TouchableHighlight >
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 10
    },
    detailsContainer: {
        marginLeft: 10,
        marginTop: 7,
        marginRight: 20

    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 10
    },
    text: {
        paddingTop: 30
    }
})

export default ListItem;