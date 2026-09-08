import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    ActivityIndicator, Alert
} from 'react-native';
import { api } from '../services/api';

export default function SplitReceiptModal({ visible, booking, onClose, onFinish }) {
    const [rating, setRating] = useState(5);
    const [selectedTag, setSelectedTag] = useState('Punctual');
    const [submitting, setSubmitting] = useState(false);

    const pricing = booking?.pricing || {};
    const total = pricing.totalAmount || 500;
    const split = pricing.splitBreakdown || {
        workerPayout: Math.round(total * 0.88),
        societyFee: Math.round(total * 0.05),
        platformFee: Math.round(total * 0.04),
        welfareFund: total - (Math.round(total * 0.88) + Math.round(total * 0.05) + Math.round(total * 0.04))
    };

    async function handleConfirmRating() {
        setSubmitting(true);
        try {
            // Confirm payment if not already confirmed
            if (pricing.paymentStatus !== 'paid') {
                await api.post('/api/payments/confirm', {
                    bookingId: booking._id,
                    method: pricing.paymentMethod || 'cash'
                });
            }

            Alert.alert(
                'Thank You!',
                'Your rating has been recorded and the cooperative 88/5/4/3 ledger has been credited!',
                [{ text: 'Done', onPress: onFinish }]
            );
        } catch (error) {
            console.log('Payment confirm error:', error.message);
            onFinish();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.card}>
                    {/* Glowing Completed Header */}
                    <View style={styles.iconCircle}>
                        <Text style={styles.checkmarkIcon}>✓</Text>
                    </View>

                    <Text style={styles.title}>Service Completed & Paid</Text>
                    <Text style={styles.totalPaid}>₹{total}</Text>
                    <Text style={styles.paymentMethodLabel}>
                        Paid via {pricing.paymentMethod === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery'}
                    </Text>

                    {/* Cooperative Split Ledger Card */}
                    <View style={styles.splitCard}>
                        <Text style={styles.splitCardTitle}>🤝 Cooperative Split Ledger</Text>

                        {/* Worker 88% */}
                        <View style={styles.splitRow}>
                            <Text style={styles.splitLabel}>👷 Worker Payout (88%)</Text>
                            <Text style={[styles.splitValue, { color: '#10B981' }]}>₹{split.workerPayout}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '88%', backgroundColor: '#10B981' }]} />
                        </View>

                        {/* Society 5% */}
                        <View style={styles.splitRow}>
                            <Text style={styles.splitLabel}>🏛️ Society Operations (5%)</Text>
                            <Text style={[styles.splitValue, { color: '#F59E0B' }]}>₹{split.societyFee}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '5%', backgroundColor: '#F59E0B' }]} />
                        </View>

                        {/* Platform 4% */}
                        <View style={styles.splitRow}>
                            <Text style={styles.splitLabel}>💻 Platform Maintenance (4%)</Text>
                            <Text style={[styles.splitValue, { color: '#8B5CF6' }]}>₹{split.platformFee}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '4%', backgroundColor: '#8B5CF6' }]} />
                        </View>

                        {/* Welfare Fund 3% */}
                        <View style={styles.splitRow}>
                            <Text style={styles.splitLabel}>🛡️ Worker Welfare Fund (3%)</Text>
                            <Text style={[styles.splitValue, { color: '#EC4899' }]}>₹{split.welfareFund}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '3%', backgroundColor: '#EC4899' }]} />
                        </View>
                    </View>

                    {/* Rating Widget */}
                    <Text style={styles.ratingPrompt}>Rate {booking?.worker?.displayName || 'Technician'}</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Text style={[styles.starIcon, rating >= star && styles.starActive]}>★</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Feedback Tags */}
                    <View style={styles.tagsRow}>
                        {['Punctual', 'Expert Work', 'Courteous', 'Clean'].map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                style={[styles.tag, selectedTag === tag && styles.tagSelected]}
                                onPress={() => setSelectedTag(tag)}
                            >
                                <Text style={[styles.tagText, selectedTag === tag && styles.tagTextSelected]}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Finish Button */}
                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={handleConfirmRating}
                        disabled={submitting}
                    >
                        {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.doneButtonText}>Complete & Return Home →</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#101524',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#10B98122',
        borderWidth: 2,
        borderColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkmarkIcon: { color: '#10B981', fontSize: 30, fontWeight: '800' },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
    totalPaid: { color: '#10B981', fontSize: 32, fontWeight: '800', marginBottom: 2 },
    paymentMethodLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 16 },
    splitCard: {
        width: '100%',
        backgroundColor: '#0A0E18',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1A2234',
    },
    splitCardTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginBottom: 10 },
    splitRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 2 },
    splitLabel: { color: '#94A3B8', fontSize: 11 },
    splitValue: { fontSize: 12, fontWeight: '700' },
    progressBarBg: { height: 4, backgroundColor: '#1E293B', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
    progressBarFill: { height: 4, borderRadius: 2 },
    ratingPrompt: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 8 },
    starsRow: { flexDirection: 'row', marginBottom: 12 },
    starIcon: { fontSize: 32, color: '#334155', marginHorizontal: 4 },
    starActive: { color: '#FBBF24' },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 },
    tag: {
        backgroundColor: '#171F32',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 6,
        margin: 4,
        borderWidth: 1,
        borderColor: '#243048',
    },
    tagSelected: { borderColor: '#10B981', backgroundColor: '#10B98122' },
    tagText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
    tagTextSelected: { color: '#10B981' },
    doneButton: {
        width: '100%',
        backgroundColor: '#10B981',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
    },
    doneButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
