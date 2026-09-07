import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

let socket = null;

export function connectSocket(workerId, onNewOffer, onOfferCancelled) {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
        // Join personal worker room so offers are delivered only to this device
        socket.emit('register-worker', workerId);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
    });

    // NEW JOB OFFER — realtime push from Fair-Match engine
    socket.on('new-offer', (data) => {
        console.log('📬 New offer received:', data.booking.bookingNumber);
        if (onNewOffer) onNewOffer(data);
    });

    // Offer cancelled (worker timeout / customer cancelled)
    socket.on('offer-cancelled', (data) => {
        console.log('❌ Offer cancelled:', data);
        if (onOfferCancelled) onOfferCancelled(data);
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connect error:', err.message);
    });

    return socket;
}

export function acceptOffer(bookingId, workerId) {
    if (socket?.connected) {
        socket.emit('offer-accepted', { bookingId, workerId });
    }
}

export function rejectOffer(bookingId, workerId) {
    if (socket?.connected) {
        socket.emit('offer-rejected', { bookingId, workerId });
    }
}

export function updateJobStatus(bookingId, status) {
    if (socket?.connected) {
        socket.emit('job-status-update', { bookingId, status });
    }
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function getSocket() {
    return socket;
}
