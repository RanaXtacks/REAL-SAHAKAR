import React, { useState, useEffect } from 'react';
import {
    View, Text, Switch, StyleSheet,
    TouchableOpacity, ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectSocket, disconnectSocket } from '../services/socket';
import { bookingApi } from '../services/api';
import OfferModal from '../components/OfferModal';

export default function HomeScreen({ navigation }) {
    const [isOnline, setIsOnline] = useState(false);
    const [workerName, setWorkerName] = useState('');
    const [workerId, setWorkerId] = useState('');
    const [offerVisible, setOfferVisible] = useState(false);
    const [currentOffer, setCurrentOffer] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [stats, setStats] = useState({ completed: 0, earnings: 0 });

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        if (isOnline && workerId) {
            // Connect Socket.io and start listening for offers
            connectSocket(
                workerId,
                (offerData) => {
                    setCurrentOffer(offerData);
                    setOfferVisible(true);
                },
                () => {
                    setOfferVisible(false);
                    setCurrentOffer(null);
                    Alert.alert('Offer Expired', 'The job offer was cancelled or timed out.');
                }
            );
        } else {
            disconnectSocket();
        }

        return () => {
            if (!isOnline) disconnectSocket();
        };
    }, [isOnline, workerId]);

    async function loadProfile() {
        const name = await AsyncStorage.getItem('workerName');
        const id = await AsyncStorage.getItem('workerId');
        setWorkerName(name || 'Worker');
        setWorkerId(id || '');
        loadJobs();
    }

    async function loadJobs() {
        try {
            const res = await bookingApi.myJobs();
            const jobs = res.data.data || [];
            setRecentJobs(jobs.slice(0, 5));
            const completed = jobs.filter(j => j.status === 'completed');
            const totalEarnings = completed.reduce(
                (sum, j) => sum + Math.round((j.pricing?.totalAmount || 0) * 0.88), 0
            );
            setStats({ completed: completed.length, earnings: totalEarnings });
        } catch (e) {
            console.log('Jobs load error:', e.message);
        }
    }

    async function handleLogout() {
        disconnectSocket();
        await AsyncStorage.multiRemove(['workerToken', 'workerName', 'workerId']);
        navigation.replace('Login');
    }

    function handleOfferClose(result) {
        setOfferVisible(false);
        setCurrentOffer(null);
        if (result === 'accepted') {
            Alert.alert('✅ Job Accepted!', 'Head to the customer location now.');
            navigation.navigate('ActiveJob', { booking: currentOffer?.booking });
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {workerName} 👋</Text>
                    <Text style={styles.subGreeting}>
                        {isOnline ? '🟢 You are online & receiving jobs' : '🔴 You are offline'}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={styles.switchPill}
                        onPress={() => navigation.replace('CustomerHome')}
                    >
                        <Text style={styles.switchPillText}>👷 ⇄ 👤 Customer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 12 }}>
                        <Text style={styles.logout}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Online Toggle */}
            <View style={styles.toggleCard}>
                <View>
                    <Text style={styles.toggleLabel}>Go Online</Text>
                    <Text style={styles.toggleSub}>
                        {isOnline ? 'Receiving realtime job offers' : 'Toggle to start receiving jobs'}
                    </Text>
                </View>
                <Switch
                    value={isOnline}
                    onValueChange={setIsOnline}
                    trackColor={{ false: '#2A2A4A', true: '#34C759' }}
                    thumbColor={isOnline ? '#fff' : '#888'}
                />
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.completed}</Text>
                    <Text style={styles.statLabel}>Jobs Done</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>₹{stats.earnings}</Text>
                    <Text style={styles.statLabel}>Total Earned</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>88%</Text>
                    <Text style={styles.statLabel}>Your Share</Text>
                </View>
            </View>

            {/* Recent Jobs */}
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                {recentJobs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyText}>No jobs yet. Go online to receive offers!</Text>
                    </View>
                ) : (
                    recentJobs.map((job) => (
                        <TouchableOpacity
                            key={job._id}
                            style={styles.jobCard}
                            onPress={() => navigation.navigate('ActiveJob', { booking: job })}
                        >
                            <View>
                                <Text style={styles.jobService}>{job.service?.name}</Text>
                                <Text style={styles.jobAddress}>{job.serviceAddress?.streetAddress}</Text>
                                <Text style={styles.jobDate}>
                                    {new Date(job.createdAt).toLocaleDateString('en-IN')}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.jobEarning}>
                                    ₹{Math.round((job.pricing?.totalAmount || 0) * 0.88)}
                                </Text>
                                <Text style={[styles.jobStatus, { color: getStatusColor(job.status) }]}>
                                    {job.status.replace('_', ' ')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Realtime Offer Modal */}
            <OfferModal
                visible={offerVisible}
                offerData={currentOffer}
                onClose={handleOfferClose}
            />
        </View>
    );
}

function getStatusColor(status) {
    const colors = {
        pending: '#FFA500', accepted: '#34C759',
        completed: '#007AFF', cancelled: '#FF3B30',
        in_progress: '#FF9500',
    };
    return colors[status] || '#888';
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A', padding: 20, paddingTop: 56 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
    subGreeting: { fontSize: 13, color: '#888', marginTop: 4 },
    logout: { color: '#FF3B30', fontSize: 14, fontWeight: '600' },
    switchPill: {
        backgroundColor: '#1E2330',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#10B981',
    },
    switchPillText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
    toggleCard: {
        backgroundColor: '#12122A', borderRadius: 20, padding: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, borderWidth: 1, borderColor: '#2A2A4A',
    },
    toggleLabel: { fontSize: 18, fontWeight: '700', color: '#fff' },
    toggleSub: { fontSize: 12, color: '#888', marginTop: 4, maxWidth: 200 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: {
        flex: 1, backgroundColor: '#12122A', borderRadius: 16,
        padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A4A',
    },
    statValue: { fontSize: 22, fontWeight: '800', color: '#6C63FF' },
    statLabel: { fontSize: 11, color: '#888', marginTop: 4, textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
    jobCard: {
        backgroundColor: '#12122A', borderRadius: 16, padding: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, borderWidth: 1, borderColor: '#2A2A4A',
    },
    jobService: { fontSize: 15, fontWeight: '700', color: '#fff' },
    jobAddress: { fontSize: 12, color: '#888', marginTop: 2, maxWidth: 200 },
    jobDate: { fontSize: 11, color: '#555', marginTop: 2 },
    jobEarning: { fontSize: 17, fontWeight: '800', color: '#34C759', textAlign: 'right' },
    jobStatus: { fontSize: 11, fontWeight: '600', textAlign: 'right', marginTop: 4, textTransform: 'capitalize' },
    emptyState: { alignItems: 'center', padding: 48 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { color: '#555', textAlign: 'center', fontSize: 14 },
});
