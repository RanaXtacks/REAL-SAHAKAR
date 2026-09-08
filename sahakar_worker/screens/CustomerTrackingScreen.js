import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, SafeAreaView, Linking
} from 'react-native';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import SplitReceiptModal from '../components/SplitReceiptModal';

export default function CustomerTrackingScreen({ route, navigation }) {
    const { bookingId } = route.params || {};

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [workerCoords, setWorkerCoords] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [etaMinutes, setEtaMinutes] = useState(8);

    useEffect(() => {
        fetchBookingDetails();
        setupSocketTracking();
    }, [bookingId]);

    async function fetchBookingDetails() {
        try {
            const res = await api.get(`/api/bookings/${bookingId}`);
            if (res.data.success) {
                setBooking(res.data.data);
                if (res.data.data.status === 'completed') {
                    setShowReceipt(true);
                }
            }
        } catch (error) {
            console.log('Error loading booking:', error.message);
        } finally {
            setLoading(false);
        }
    }

    function setupSocketTracking() {
        const socket = getSocket();
        if (socket?.connected && bookingId) {
            socket.emit('join-booking', bookingId);

            // Listen for live GPS location updates from worker
            socket.on('worker-location-stream', (data) => {
                if (data.bookingId === bookingId) {
                    setWorkerCoords({ latitude: data.latitude, longitude: data.longitude });
                    // Recalculate ETA dynamically
                    setEtaMinutes(prev => Math.max(2, prev - 1));
                }
            });

            // Listen for milestone changes (offered -> accepted -> en_route -> arrived -> in_progress -> completed)
            socket.on('job-status-changed', (data) => {
                if (data.bookingId === bookingId) {
                    setBooking(prev => {
                        const updated = { ...prev, status: data.status };
                        if (data.worker) updated.worker = data.worker;
                        if (data.timeline) updated.timeline = data.timeline;
                        return updated;
                    });

                    if (data.status === 'completed') {
                        setShowReceipt(true);
                    }
                }
            });
        }
    }

    function getMilestoneIndex(status) {
        switch (status) {
            case 'pending':
            case 'offered':
                return 0;
            case 'accepted':
                return 1;
            case 'en_route':
            case 'arrived':
                return 2;
            case 'in_progress':
                return 3;
            case 'completed':
                return 4;
            default:
                return 0;
        }
    }

    function handleCallWorker() {
        const phone = booking?.worker?.phoneNumber || '9820112233';
        Linking.openURL(`tel:${phone}`);
    }

    if (loading || !booking) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loadingText}>Connecting to Live Dispatch...</Text>
            </SafeAreaView>
        );
    }

    const currentStep = getMilestoneIndex(booking.status);
    const worker = booking.worker || {
        displayName: 'Ramesh Sharma',
        phoneNumber: '9820112233',
        ratingAverage: 4.9,
        skills: ['Certified Electrician']
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate('CustomerHome')} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← Home</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order #{booking.bookingNumber}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Floating Realtime ETA Pill */}
                <View style={styles.etaPillContainer}>
                    <View style={styles.pulsingGreenDot} />
                    <Text style={styles.etaText}>
                        {booking.status === 'en_route'
                            ? `Worker En Route • Arriving in ~${etaMinutes} mins`
                            : booking.status === 'in_progress'
                            ? 'Service In Progress on Site'
                            : booking.status === 'accepted'
                            ? 'Technician Preparing & Assigned'
                            : 'Fair-Match Dispatching Nearest Partner...'}
                    </Text>
                </View>

                {/* Simulated Live Route Map View */}
                <View style={styles.mapCard}>
                    <View style={styles.mapHeader}>
                        <Text style={styles.mapLabel}>🗺️ Real-Time GPS Tracking</Text>
                        <Text style={styles.mapLiveBadge}>● LIVE STREAM</Text>
                    </View>

                    <View style={styles.mapCanvasMock}>
                        <View style={styles.routeLine} />
                        <View style={styles.workerPinMock}>
                            <Text style={styles.workerPinIcon}>🚐</Text>
                            <Text style={styles.workerPinText}>{worker.displayName.split(' ')[0]}</Text>
                        </View>
                        <View style={styles.customerPinMock}>
                            <Text style={styles.customerPinIcon}>📍</Text>
                            <Text style={styles.customerPinText}>You</Text>
                        </View>
                    </View>

                    <Text style={styles.destinationText}>
                        Destination: {booking.serviceAddress?.streetAddress || 'Your Address'}
                    </Text>
                </View>

                {/* Milestone Stepper */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Milestone Progress</Text>
                    <View style={styles.stepperContainer}>
                        {[
                            { label: 'Confirmed', desc: 'Request logged' },
                            { label: 'Assigned', desc: 'Fair-Matched' },
                            { label: 'En Route', desc: 'Traveling' },
                            { label: 'Working', desc: 'On site' },
                            { label: 'Complete', desc: '88% Split' },
                        ].map((step, idx) => (
                            <View key={idx} style={styles.stepItem}>
                                <View style={[
                                    styles.stepCircle,
                                    currentStep > idx && styles.stepDone,
                                    currentStep === idx && styles.stepActive
                                ]}>
                                    <Text style={styles.stepNumber}>{currentStep > idx ? '✓' : idx + 1}</Text>
                                </View>
                                <Text style={[styles.stepLabel, currentStep >= idx && styles.stepLabelActive]}>
                                    {step.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Assigned Technician Card */}
                {booking.status !== 'pending' && (
                    <View style={styles.workerCard}>
                        <View style={styles.workerAvatar}>
                            <Text style={styles.avatarEmoji}>👷</Text>
                        </View>
                        <View style={styles.workerInfo}>
                            <View style={styles.workerNameRow}>
                                <Text style={styles.workerName}>{worker.displayName}</Text>
                                <View style={styles.verifiedBadge}>
                                    <Text style={styles.verifiedBadgeText}>✓ KYC Verified</Text>
                                </View>
                            </View>
                            <Text style={styles.workerTrade}>{booking.service?.name || 'Cooperative Partner'}</Text>
                            <Text style={styles.workerRating}>⭐ {worker.ratingAverage || '4.9'} • 140+ jobs completed</Text>
                        </View>

                        <TouchableOpacity style={styles.callButton} onPress={handleCallWorker}>
                            <Text style={styles.callIcon}>📞</Text>
                            <Text style={styles.callText}>Call</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Payment Breakdown Card */}
                <View style={styles.paymentNoticeCard}>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentNoticeTitle}>Total Payable</Text>
                        <Text style={styles.paymentNoticeAmount}>₹{booking.pricing?.totalAmount || 500}</Text>
                    </View>
                    <Text style={styles.paymentNoticeSub}>
                        Payment Method: {booking.pricing?.paymentMethod === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery'}
                    </Text>
                    <Text style={styles.coopNotice}>
                        🤝 88% (₹{Math.round((booking.pricing?.totalAmount || 500) * 0.88)}) directly supports your technician.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Cooperative Split Receipt Modal */}
            <SplitReceiptModal
                visible={showReceipt}
                booking={booking}
                onClose={() => setShowReceipt(false)}
                onFinish={() => {
                    setShowReceipt(false);
                    navigation.replace('CustomerHome');
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#07090E' },
    center: { flex: 1, backgroundColor: '#07090E', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#94A3B8', marginTop: 12, fontSize: 14 },
    container: { flex: 1, paddingHorizontal: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
    backBtn: { padding: 6 },
    backBtnText: { color: '#10B981', fontSize: 14, fontWeight: '700' },
    headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    etaPillContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F1E1B',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#10B981',
    },
    pulsingGreenDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', marginRight: 10 },
    etaText: { color: '#10B981', fontSize: 13, fontWeight: '700', flex: 1 },
    mapCard: {
        backgroundColor: '#111624',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    mapHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    mapLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    mapLiveBadge: { color: '#10B981', fontSize: 10, fontWeight: '800' },
    mapCanvasMock: {
        height: 140,
        backgroundColor: '#090D18',
        borderRadius: 14,
        position: 'relative',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#1A2338',
    },
    routeLine: {
        position: 'absolute',
        left: 50,
        right: 50,
        height: 4,
        backgroundColor: '#10B981',
        borderRadius: 2,
    },
    workerPinMock: { position: 'absolute', left: 40, alignItems: 'center' },
    workerPinIcon: { fontSize: 28 },
    workerPinText: { color: '#10B981', fontSize: 10, fontWeight: '700' },
    customerPinMock: { position: 'absolute', right: 40, alignItems: 'center' },
    customerPinIcon: { fontSize: 28 },
    customerPinText: { color: '#60A5FA', fontSize: 10, fontWeight: '700' },
    destinationText: { color: '#94A3B8', fontSize: 11, marginTop: 10 },
    card: {
        backgroundColor: '#111624',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    cardTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 14 },
    stepperContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    stepItem: { alignItems: 'center', width: '18%' },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    stepDone: { backgroundColor: '#10B981' },
    stepActive: { backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#60A5FA' },
    stepNumber: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    stepLabel: { color: '#64748B', fontSize: 10, textAlign: 'center' },
    stepLabelActive: { color: '#E2E8F0', fontWeight: '700' },
    workerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111624',
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    workerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarEmoji: { fontSize: 26 },
    workerInfo: { flex: 1 },
    workerNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    workerName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginRight: 6 },
    verifiedBadge: { backgroundColor: '#10B98122', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    verifiedBadgeText: { color: '#10B981', fontSize: 9, fontWeight: '700' },
    workerTrade: { color: '#94A3B8', fontSize: 12, marginBottom: 2 },
    workerRating: { color: '#F59E0B', fontSize: 11, fontWeight: '600' },
    callButton: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: 'center',
    },
    callIcon: { fontSize: 16 },
    callText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', marginTop: 2 },
    paymentNoticeCard: {
        backgroundColor: '#0F1826',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    paymentNoticeTitle: { color: '#94A3B8', fontSize: 13 },
    paymentNoticeAmount: { color: '#10B981', fontSize: 20, fontWeight: '800' },
    paymentNoticeSub: { color: '#64748B', fontSize: 11, marginBottom: 8 },
    coopNotice: { color: '#E2E8F0', fontSize: 11, fontWeight: '600', borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 8 },
});
