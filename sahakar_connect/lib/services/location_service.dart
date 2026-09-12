import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  // Default fallback coordinates: Mumbai Central / Bandra cooperative hub
  static const LatLng defaultLocation = LatLng(19.0760, 72.8777);

  LatLng _lastKnownLocation = defaultLocation;
  LatLng get lastKnownLocation => _lastKnownLocation;

  /// Check and request location permissions
  Future<bool> handlePermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    try {
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return false;
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return false;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  /// Get current device GPS position with robust timeout and fallback
  Future<LatLng> getCurrentPosition() async {
    try {
      final hasPermission = await handlePermission();
      if (!hasPermission) {
        return _lastKnownLocation;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 4),
        ),
      );

      _lastKnownLocation = LatLng(position.latitude, position.longitude);
      return _lastKnownLocation;
    } catch (e) {
      // Return last known or fallback on timeout/error
      return _lastKnownLocation;
    }
  }

  /// Stream position updates for en route tracking
  Stream<LatLng> getPositionStream() {
    try {
      return Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10, // update every 10 meters
        ),
      ).map((pos) {
        _lastKnownLocation = LatLng(pos.latitude, pos.longitude);
        return _lastKnownLocation;
      });
    } catch (e) {
      return Stream.value(_lastKnownLocation);
    }
  }

  /// Calculate distance in km between two points
  double distanceBetween(LatLng p1, LatLng p2) {
    final distInMeters = Geolocator.distanceBetween(
      p1.latitude,
      p1.longitude,
      p2.latitude,
      p2.longitude,
    );
    return distInMeters / 1000.0;
  }
}
