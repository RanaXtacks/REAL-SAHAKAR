import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as socket_io;
import '../config/api_config.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  socket_io.Socket? _socket;
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  // Stream controllers for realtime events
  final _newOfferController = StreamController<Map<String, dynamic>>.broadcast();
  final _locationStreamController = StreamController<Map<String, dynamic>>.broadcast();
  final _jobStatusController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get onNewOffer => _newOfferController.stream;
  Stream<Map<String, dynamic>> get onLocationStream => _locationStreamController.stream;
  Stream<Map<String, dynamic>> get onJobStatusChanged => _jobStatusController.stream;

  void connect({String? socketUrl}) {
    if (_socket != null && _socket!.connected) return;

    final url = socketUrl ?? ApiConfig.socketUrl;

    _socket = socket_io.io(
      url,
      socket_io.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionDelay(2000)
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
      debugPrint('🔌 [Socket.io Connected] to $url');
    });

    _socket!.onDisconnect((reason) {
      _isConnected = false;
      debugPrint('🔌 [Socket.io Disconnected] Reason: $reason');
    });

    _socket!.onConnectError((err) {
      debugPrint('❌ [Socket.io Connect Error] $err');
    });

    // Listen for incoming job offers (Worker)
    _socket!.on('new-offer', (data) {
      debugPrint('🚨 [New Offer Received]: $data');
      if (data is Map<String, dynamic>) {
        _newOfferController.add(data);
      } else if (data is Map) {
        _newOfferController.add(Map<String, dynamic>.from(data));
      }
    });

    // Listen for GPS location stream (Customer)
    _socket!.on('worker-location-stream', (data) {
      if (data is Map<String, dynamic>) {
        _locationStreamController.add(data);
      } else if (data is Map) {
        _locationStreamController.add(Map<String, dynamic>.from(data));
      }
    });

    // Listen for job milestone updates (Customer & Worker)
    _socket!.on('job-status-changed', (data) {
      debugPrint('🔄 [Job Status Changed]: $data');
      if (data is Map<String, dynamic>) {
        _jobStatusController.add(data);
      } else if (data is Map) {
        _jobStatusController.add(Map<String, dynamic>.from(data));
      }
    });
  }

  // Worker joins their private channel
  void registerWorker(String workerId) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit('register-worker', workerId);
      debugPrint('👷 Registered worker room for ID: $workerId');
    }
  }

  // Customer or Worker joins booking tracking channel
  void joinBooking(String bookingId) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit('join-booking', bookingId);
      debugPrint('📍 Joined booking channel: $bookingId');
    }
  }

  // Worker accepts job offer
  void acceptOffer(String bookingId, String workerId) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit('offer-accepted', {
        'bookingId': bookingId,
        'workerId': workerId,
      });
      debugPrint('✅ Emitted offer-accepted for booking: $bookingId');
    }
  }

  // Worker declines job offer
  void rejectOffer(String bookingId, String workerId, {String? reason}) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit('offer-rejected', {
        'bookingId': bookingId,
        'workerId': workerId,
        'reason': reason ?? 'Worker unavailable',
      });
      debugPrint('❌ Emitted offer-rejected for booking: $bookingId');
    }
  }

  // Worker streams live location
  void updateWorkerLocation({
    required String bookingId,
    required String workerId,
    required double latitude,
    required double longitude,
    double heading = 0.0,
  }) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit('worker-location-update', {
        'bookingId': bookingId,
        'workerId': workerId,
        'latitude': latitude,
        'longitude': longitude,
        'heading': heading,
      });
    }
  }

  // Worker updates job execution milestone
  void updateJobStatus({
    required String bookingId,
    required String status,
    String? note,
  }) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit('job-status-update', {
        'bookingId': bookingId,
        'status': status,
        'note': note,
      });
      debugPrint('🔄 Emitted job-status-update: $status for booking $bookingId');
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }
}
