import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateJobStatus } from '../services/socket';
import { API_URL, STATUS_COLORS } from '../config';

const JOB_STEPS = [
    { status: 'en_route',    label: 'En Route',    icon: '🚗', desc: 'On my way to customer' },
    { status: 'arrived',     label: 'Arrived',     icon: '📍', desc: 'Reached customer location' },
    { status: 'in_progress', label: 'Start Job',   icon: '🔧', desc: 'Job work started' },
    { status: 'completed',   label: 'Complete Job', icon: '✅', desc: 'Job done successfully' },
];

export default function ActiveJobScreen({ route, navigation }) {
    const booking = route.params?.booking;
    const [currentStatus, setCurrentStatus] = useState(booking?.status || 'accepted');
    const [loading, setLoading] = useState(false);

    if (!booking) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No active booking found.</Text>
            </View>
        );
    }

    const currentStepIndex = JOB_STEPS.findIndex(s => s.status === currentStatus);
    const nextStep = JOB_STEPS[currentStepIndex + 1] || JOB_STEPS[currentStepIndex];
    const isCompleted = currentStatus === 'completed';

    async function handleStatusUpdate() {
        const nextStatus = JOB_STEPS[currentStepIndex + 1]?.status;
        if (!nextStatus) return;

        setLoading(true);
        try {
            const workerId = await AsyncStorage.getItem('workerId');

            // Send realtime update via Socket.io (customer sees this instantly)
            updateJobStatus(booking._id, nextStatus);

            // Also persist to REST API as backup
            await axios.patch(`${API_URL}/api/bookings/${booking._id}/status`,
                { status: nextStatus, workerId },
                { headers: { 'x-dev-uid': workerId } }
            );

            setCurrentStatus(nextStatus);

            if (nextStatus === 'completed') {
                Alert.alert('🎉 Job Completed!',
                    'Great work! The customer has been notified to pay.',
                    [{ text: 'Back to Home', onPress: () => navigation.replace('Home') }]
                );
            }
        } catch (e) {
            Alert.alert('Update Failed', e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 56 }}>
            {/* Header */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Active Job</Text>
            <Text style={styles.bookingNum}>#{booking.bookingNumber}</Text>

            {/* Job Info */}
            <View style={styles.infoCard}>
                <Text style={styles.serviceType}>{booking.service?.name}</Text>
                <Text style={styles.address}>
                    📍 {booking.serviceAddress?.streetAddress},{' '}
                    {booking.serviceAddress?.city}
                </Text>
                {booking.notes ? (
                    <Text style={styles.notes}>📝 {booking.notes}</Text>
                ) : null}
                <Text style={styles.earning}>
                    💰 Your Payout: ₹{Math.round((booking.pricing?.totalAmount || 0) * 0.88)}
                </Text>
            </View>

            {/* Status Timeline */}
            <Text style={styles.sectionTitle}>Job Progress</Text>
            <View style={styles.timeline}>
                {JOB_STEPS.map((step, i) => {
                    const isDone = i <= currentStepIndex;
                    const isActive = step.status === currentStatus;
                    return (
                        <View key={step.status} style={styles.timelineRow}>
                            <View style={[styles.dot,
                                isDone && styles.dotDone,
                                isActive && styles.dotActive
                            ]}>
                                <Text style={styles.dotIcon}>{isDone ? '✓' : `${i + 1}`}</Text>
                            </View>
                            {i < JOB_STEPS.length - 1 && (
                                <View style={[styles.line, isDone && styles.lineDone]} />
                            )}
                            <View style={styles.stepInfo}>
                                <Text style={[styles.stepLabel,
                                    isActive && { color: '#6C63FF' },
                                    isDone && !isActive && { color: '#34C759' }
                                ]}>
                                    {step.icon} {step.label}
                                </Text>
                                <Text style={styles.stepDesc}>{step.desc}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Action Button */}
            {!isCompleted && (
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleStatusUpdate}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.actionText}>
                            {nextStep.icon}  Mark as {nextStep.label}
                        </Text>
                    }
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A' },
    backBtn: { marginBottom: 12 },
    backText: { color: '#6C63FF', fontSize: 15 },
    title: { fontSize: 28, fontWeight: '800', color: '#fff' },
    bookingNum: { fontSize: 13, color: '#555', marginBottom: 20 },
    infoCard: {
        backgroundColor: '#12122A', borderRadius: 20, padding: 20,
        marginBottom: 24, borderWidth: 1, borderColor: '#2A2A4A', gap: 10,
    },
    serviceType: { fontSize: 20, fontWeight: '700', color: '#fff' },
    address: { fontSize: 14, color: '#aaa' },
    notes: { fontSize: 14, color: '#888', fontStyle: 'italic' },
    earning: { fontSize: 22, fontWeight: '800', color: '#34C759' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },
    timeline: { marginBottom: 32 },
    timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    dot: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#1E1E3A', justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#2A2A4A', marginRight: 12, zIndex: 1,
    },
    dotDone: { backgroundColor: '#34C759', borderColor: '#34C759' },
    dotActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
    dotIcon: { color: '#fff', fontSize: 12, fontWeight: '800' },
    line: { position: 'absolute', left: 15, top: 32, width: 2, height: 32, backgroundColor: '#2A2A4A' },
    lineDone: { backgroundColor: '#34C759' },
    stepInfo: { flex: 1, paddingTop: 4 },
    stepLabel: { fontSize: 15, fontWeight: '700', color: '#555' },
    stepDesc: { fontSize: 12, color: '#444', marginTop: 2 },
    actionBtn: {
        backgroundColor: '#6C63FF', borderRadius: 16,
        padding: 20, alignItems: 'center', marginBottom: 32,
    },
    actionText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    errorText: { color: '#FF3B30', textAlign: 'center', marginTop: 100 },
});
