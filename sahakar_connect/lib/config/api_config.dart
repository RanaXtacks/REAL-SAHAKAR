import 'package:flutter/foundation.dart';

class ApiConfig {
  // Local backend URL for active development
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000';
    }
    // Android Emulator uses 10.0.2.2 to reach host machine localhost
    return 'http://10.0.2.2:5000';
  }

  static String get socketUrl {
    if (kIsWeb) {
      return 'http://localhost:5000';
    }
    return 'http://10.0.2.2:5000';
  }

  // Fallback local URL if testing locally
  static const String localBaseUrl = 'http://10.0.2.2:5000';

  // Endpoints
  static const String health = '/health';
  static const String authSync = '/api/auth/sync';
  static const String authMe = '/api/auth/me';
  static const String authSwitchRole = '/api/auth/switch-role';
  static const String services = '/api/services';
  static const String bookings = '/api/bookings';
  static const String myBookings = '/api/bookings/my';
  static const String matchAudit = '/api/bookings/{id}/match-audit';
  static const String paymentSplit = '/api/payments/preview-split/{bookingId}';
  static const String paymentConfirm = '/api/payments/confirm';
  static const String adminWorkers = '/api/admin/workers';
  static const String adminStats = '/api/admin/stats';
  static const String spatialNearby = '/api/spatial/nearby-workers';
}
