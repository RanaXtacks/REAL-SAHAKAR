import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ActiveJobScreen from './screens/ActiveJobScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        checkSession();
    }, []);

    async function checkSession() {
        const token = await AsyncStorage.getItem('workerToken');
        setInitialRoute(token ? 'Home' : 'Login');
    }

    if (!initialRoute) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0A0A1A', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ActiveJob" component={ActiveJobScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
