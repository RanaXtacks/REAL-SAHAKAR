import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, Modal, TouchableOpacity,
    StyleSheet, Animated, Vibration
} from 'react-native';
import { acceptOffer, rejectOffer } from '../services/socket';

const OFFER_TIMEOUT = 45; // seconds

export default function OfferModal({ visible, offerData, onClose }) {
    const [countdown, setCountdown] = useState(OFFER_TIMEOUT);
    const timerRef = useRef(null);
    const progressAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!visible || !offerData) return;

        setCountdown(OFFER_TIMEOUT);

        // Animate countdown bar
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: OFFER_TIMEOUT * 1000,
            useNativeDriver: false,
        }).start();

        // Vibrate phone when offer arrives — realtime alert
        Vibration.vibrate([0, 400, 200, 400]);

        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    onClose('timeout');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timerRef.current);
            progressAnim.setValue(1);
        };
    }, [visible, offerData]);

    function handleAccept() {
        clearInterval(timerRef.current);
        if (offerData) {
            acceptOffer(offerData.booking._id, offerData.workerId);
        }
        onClose('accepted');
    }

    function handleReject() {
        clearInterval(timerRef.current);
        if (offerData) {
            rejectOffer(offerData.booking._id, offerData.workerId);
        }
        onClose('rejected');
    }

    if (!offerData) return null;

    const { booking } = offerData;
    const workerEarnings = Math.round(booking.pricing?.totalAmount * 0.88);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Countdown Progress Bar */}
                    <View style={styles.progressBg}>
                        <Animated.View
                            style={[styles.progressFill, {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                })
                            }]}
                        />
                    </View>

                    <Text style={styles.countdown}>{countdown}s</Text>
                    <Text style={styles.title}>🔔 New Job Offer!</Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.serviceType}>
                            {booking.service?.name || 'Service Request'}
                        </Text>
                        <Text style={styles.address}>
                            📍 {booking.serviceAddress?.streetAddress}, {booking.serviceAddress?.city}
                        </Text>
                        <Text style={styles.earnings}>
                            💰 Your Earnings: ₹{workerEarnings}
                        </Text>
                        <Text style={styles.bookingNum}>
                            #{booking.bookingNumber}
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={handleReject}
                        >
                            <Text style={styles.rejectText}>✕  Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={handleAccept}
                        >
                            <Text style={styles.acceptText}>✓  Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: '#12122A',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 28,
        borderWidth: 1,
        borderColor: '#2A2A5A',
    },
    progressBg: {
        height: 6,
        backgroundColor: '#2A2A4A',
        borderRadius: 3,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6C63FF',
        borderRadius: 3,
    },
    countdown: {
        color: '#6C63FF',
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'right',
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 20,
    },
    infoBox: {
        backgroundColor: '#1E1E3A',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        gap: 10,
    },
    serviceType: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    address: {
        fontSize: 14,
        color: '#aaa',
        lineHeight: 20,
    },
    earnings: {
        fontSize: 22,
        fontWeight: '800',
        color: '#34C759',
    },
    bookingNum: {
        fontSize: 12,
        color: '#555',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    rejectBtn: {
        flex: 1,
        padding: 18,
        borderRadius: 14,
        backgroundColor: '#2A1A1A',
        borderWidth: 1,
        borderColor: '#FF3B30',
        alignItems: 'center',
    },
    rejectText: {
        color: '#FF3B30',
        fontWeight: '700',
        fontSize: 16,
    },
    acceptBtn: {
        flex: 2,
        padding: 18,
        borderRadius: 14,
        backgroundColor: '#34C759',
        alignItems: 'center',
    },
    acceptText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },
});
