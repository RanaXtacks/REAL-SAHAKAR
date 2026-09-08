import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, FlatList, RefreshControl, Alert, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const CATEGORIES = [
    { id: '1', slug: 'electrical', name: 'Electrician', icon: '⚡', basePrice: 249, badge: 'Popular' },
    { id: '2', slug: 'plumbing', name: 'Plumber', icon: '🔧', basePrice: 299, badge: 'Fast Arrival' },
    { id: '3', slug: 'appliances', name: 'AC Repair', icon: '❄️', basePrice: 399, badge: 'Co-op Certified' },
    { id: '4', slug: 'carpentry', name: 'Carpenter', icon: '🔨', basePrice: 349, badge: 'Skilled' },
    { id: '5', slug: 'cleaning', name: 'Deep Clean', icon: '🧹', basePrice: 599, badge: 'Sanitized' },
    { id: '6', slug: 'painting', name: 'Painting', icon: '🎨', basePrice: 799, badge: 'Free Inspection' },
];

export default function CustomerHomeScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeBooking, setActiveBooking] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [userName, setUserName] = useState('Member');

    useEffect(() => {
        loadCustomerData();
    }, []);

    async function loadCustomerData() {
        try {
            const name = await AsyncStorage.getItem('userName') || 'Rana';
            setUserName(name);

            // Fetch active customer bookings
            const response = await api.get('/api/bookings/my');
            if (response.data.success && response.data.data.length > 0) {
                // Find non-completed booking
                const active = response.data.data.find(b => !['completed', 'cancelled'].includes(b.status));
                setActiveBooking(active || null);
            }
        } catch (error) {
            console.log('Error loading customer bookings:', error.message);
        }
    }

    async function handleSwitchToWorker() {
        Alert.alert(
            'Switch to Worker Mode',
            'Do you want to switch to your Worker Dashboard to accept incoming service jobs?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Switch to Worker Mode',
                    onPress: async () => {
                        await AsyncStorage.setItem('activeMode', 'worker');
                        navigation.replace('Home'); // Worker Home
                    }
                }
            ]
        );
    }

    const filteredCategories = CATEGORIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadCustomerData} tintColor="#10B981" />}
            >
                {/* Header with Location & Role Switcher */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.locationLabel}>📍 Current Location</Text>
                        <Text style={styles.locationText}>Koramangala, Bengaluru ▾</Text>
                    </View>

                    <TouchableOpacity style={styles.modeSwitchPill} onPress={handleSwitchToWorker}>
                        <Text style={styles.modeSwitchText}>👤 Customer ⇄ 👷</Text>
                    </TouchableOpacity>
                </View>

                {/* Hero Cooperative Transparency Banner */}
                <View style={styles.heroBanner}>
                    <View style={styles.heroContent}>
                        <View style={styles.coopBadge}>
                            <Text style={styles.coopBadgeText}>🤝 COOPERATIVE PLATFORM</Text>
                        </View>
                        <Text style={styles.heroTitle}>Fair Trades, Honest Rates.</Text>
                        <Text style={styles.heroSubtitle}>
                            88% of your payment goes directly into the hands of local certified tradespeople.
                        </Text>
                    </View>
                </View>

                {/* Active Tracking Mini-Card (If active booking exists) */}
                {activeBooking && (
                    <TouchableOpacity
                        style={styles.activeCard}
                        onPress={() => navigation.navigate('CustomerTracking', { bookingId: activeBooking._id })}
                    >
                        <View style={styles.activeCardHeader}>
                            <View style={styles.pulsingDot} />
                            <Text style={styles.activeCardTitle}>ACTIVE SERVICE IN PROGRESS</Text>
                            <Text style={styles.activeStatusPill}>{activeBooking.status.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.activeServiceText}>{activeBooking.service?.name || 'Home Service'}</Text>
                        <Text style={styles.activeEtaText}>Tap to view live worker GPS location & ETA →</Text>
                    </TouchableOpacity>
                )}

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Electrician, Plumber, AC Repair..."
                        placeholderTextColor="#71717A"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Service Categories Grid */}
                <Text style={styles.sectionTitle}>Explore Cooperative Services</Text>

                <View style={styles.grid}>
                    {filteredCategories.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.categoryCard}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('Booking', { category: item })}
                        >
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>{item.badge}</Text>
                            </View>
                            <Text style={styles.categoryIcon}>{item.icon}</Text>
                            <Text style={styles.categoryName}>{item.name}</Text>
                            <Text style={styles.categoryPrice}>From ₹{item.basePrice}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Cooperative Trust Metrics Footer */}
                <View style={styles.trustSection}>
                    <Text style={styles.trustTitle}>The Sahakar Cooperative Promise</Text>
                    <View style={styles.trustRow}>
                        <View style={styles.trustItem}>
                            <Text style={styles.trustIcon}>🛡️</Text>
                            <Text style={styles.trustHeading}>Verified Trades</Text>
                            <Text style={styles.trustSub}>Aadhaar & Police KYC</Text>
                        </View>
                        <View style={styles.trustItem}>
                            <Text style={styles.trustIcon}>⚖️</Text>
                            <Text style={styles.trustHeading}>Zero Surge</Text>
                            <Text style={styles.trustSub}>Fair regulated prices</Text>
                        </View>
                        <View style={styles.trustItem}>
                            <Text style={styles.trustIcon}>💰</Text>
                            <Text style={styles.trustHeading}>88% to Worker</Text>
                            <Text style={styles.trustSub}>Zero private commission</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#07090E' },
    container: { flex: 1, paddingHorizontal: 16 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    locationLabel: { color: '#71717A', fontSize: 12, fontWeight: '500' },
    locationText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 2 },
    modeSwitchPill: {
        backgroundColor: '#1E2330',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#10B981',
    },
    modeSwitchText: { color: '#10B981', fontSize: 13, fontWeight: '700' },
    heroBanner: {
        backgroundColor: '#0F1A1C',
        borderRadius: 20,
        padding: 20,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: '#10B98133',
    },
    coopBadge: {
        backgroundColor: '#10B98122',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    coopBadgeText: { color: '#10B981', fontSize: 11, fontWeight: '800' },
    heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 6 },
    heroSubtitle: { color: '#94A3B8', fontSize: 13, lineHeight: 18 },
    activeCard: {
        backgroundColor: '#131B2E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    activeCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    pulsingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6', marginRight: 8 },
    activeCardTitle: { color: '#60A5FA', fontSize: 11, fontWeight: '800', flex: 1 },
    activeStatusPill: { backgroundColor: '#1D4ED8', color: '#fff', fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    activeServiceText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
    activeEtaText: { color: '#94A3B8', fontSize: 12 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121622',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    searchIcon: { marginRight: 10, fontSize: 16 },
    searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },
    sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    categoryCard: {
        width: '48%',
        backgroundColor: '#111522',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    badgeContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#10B9811A',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: { color: '#10B981', fontSize: 9, fontWeight: '700' },
    categoryIcon: { fontSize: 36, marginVertical: 10 },
    categoryName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    categoryPrice: { color: '#10B981', fontSize: 13, fontWeight: '600' },
    trustSection: {
        marginTop: 16,
        backgroundColor: '#0E131F',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    trustTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
    trustRow: { flexDirection: 'row', justifyContent: 'space-around' },
    trustItem: { alignItems: 'center', width: '30%' },
    trustIcon: { fontSize: 24, marginBottom: 4 },
    trustHeading: { color: '#E2E8F0', fontSize: 11, fontWeight: '700', textAlign: 'center' },
    trustSub: { color: '#64748B', fontSize: 9, textAlign: 'center', marginTop: 2 },
});
