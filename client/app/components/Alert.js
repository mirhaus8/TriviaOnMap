import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FancyAlert } from 'react-native-expo-fancy-alerts';



function Alert({visible}) {
    const [vis, setVis] = React.useState(visible);
    function toggleVisible() {
        setVis(false);
    }
    
    return <FancyAlert
        visible={vis}
        icon={<View style={styles.icon}><Text>❌</Text></View>}
        style={{ backgroundColor: 'white' }}
    >
        <View >
            <Text>You are not registered!</Text>

            <TouchableOpacity style={styles.btn} onPress={toggleVisible}>
                <Text>OK</Text>
            </TouchableOpacity>
        </View>
    </FancyAlert>
}

const styles = StyleSheet.create({
    icon: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red',
        borderRadius: 50,
        width: '100%',
    },
    btn: {
        borderRadius: 32,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        alignSelf: 'stretch',
        backgroundColor: '#4CB748',
        marginTop: 16,
        minWidth: '50%',
        paddingHorizontal: 16,
      },

})

export default Alert;