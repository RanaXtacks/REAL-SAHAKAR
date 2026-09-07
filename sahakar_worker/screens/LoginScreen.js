import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

export default function LoginScreen({ navigation }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    // Dev mode login — replace with Firebase Phone OTP in Phase 3 Firebase integration
    async function handleLogin() {
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Missing Info', 'Please enter your name and phone number');
            return;
        }

        setLoading(true);
        try {
            const devUid = `worker-${phone.replace(/\s/g, '')}`;

            const response = await authApi.sync({
                role: 'worker',
                displayName: name,
                phoneNumber: phone,
                skills: ['General Repairs'],
            });

            await AsyncStorage.setItem('workerToken', devUid);
            await AsyncStorage.setItem('workerName', name);
            await AsyncStorage.setItem('workerId', response.data.user._id);

            navigation.replace('Home');
        } catch (error) {
            Alert.alert('Login Failed', error?.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.card}>
                <Text style={styles.logo}>⚙️ SahakarConnect</Text>
                <Text style={styles.subtitle}>Worker App</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Your full name"
                    placeholderTextColor="#888"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone number (e.g. 9876543210)"
                    placeholderTextColor="#888"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Login & Start Working →</Text>
                    }
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A1A',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#12122A',
        borderRadius: 20,
        padding: 32,
        borderWidth: 1,
        borderColor: '#2A2A4A',
    },
    logo: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 32,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#1E1E3A',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2A2A4A',
    },
    button: {
        backgroundColor: '#6C63FF',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
