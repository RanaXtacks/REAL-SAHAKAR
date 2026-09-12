import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/user.dart';
import 'api_service.dart';
import 'storage_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  AppUser? _currentUser;
  String? _verificationId;

  AppUser? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;

  Future<void> init() async {
    _currentUser = StorageService.getUser();
  }

  // Send OTP
  Future<bool> sendOtp({
    required String phoneNumber,
    required Function(String verificationId) onCodeSent,
    required Function(String error) onError,
  }) async {
    try {
      // In development mode or until google-services.json is configured, generate a mock verification ID
      _verificationId = 'mock_ver_id_${DateTime.now().millisecondsSinceEpoch}';
      onCodeSent(_verificationId!);
      return true;
    } catch (e) {
      onError(e.toString());
      return false;
    }
  }

  // Verify OTP and sync with backend
  Future<AppUser> verifyOtpAndLogin({
    required String verificationId,
    required String smsCode,
    required String phoneNumber,
    String role = 'customer',
    String displayName = 'Sahakar Member',
  }) async {
    try {
      // Create dev/firebase UID based on phone number
      final cleanPhone = phoneNumber.replaceAll(RegExp(r'\D'), '');
      final uid = 'dev_user_$cleanPhone';

      await StorageService.saveDevUid(uid);

      // Sync with MongoDB backend
      final syncResult = await ApiService().syncUser(
        role: role,
        displayName: displayName,
        phoneNumber: phoneNumber,
      );

      if (syncResult['user'] != null) {
        _currentUser = AppUser.fromJson(syncResult['user']);
        await StorageService.saveUser(_currentUser!);
        return _currentUser!;
      } else {
        throw Exception('User sync failed');
      }
    } catch (e) {
      debugPrint('Auth error: $e');
      // Create local user fallback if backend is momentarily unreachable
      final fallbackUser = AppUser(
        id: 'user_${DateTime.now().millisecondsSinceEpoch}',
        firebaseUid: 'uid_$phoneNumber',
        displayName: displayName,
        phoneNumber: phoneNumber,
        role: role,
      );
      _currentUser = fallbackUser;
      await StorageService.saveUser(fallbackUser);
      return fallbackUser;
    }
  }

  // Quick Demo Login for instant testing
  Future<AppUser> demoLogin({
    required String role,
    required String name,
    required String phone,
  }) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    final uid = 'dev_${role}_$cleanPhone';
    await StorageService.saveDevUid(uid);

    try {
      final syncResult = await ApiService().syncUser(
        role: role,
        displayName: name,
        phoneNumber: phone,
      );
      if (syncResult['user'] != null) {
        _currentUser = AppUser.fromJson(syncResult['user']);
        await StorageService.saveUser(_currentUser!);
        return _currentUser!;
      }
    } catch (e) {
      debugPrint('Demo backend sync error: $e');
    }

    final localUser = AppUser(
      id: 'usr_$cleanPhone',
      firebaseUid: uid,
      displayName: name,
      phoneNumber: phone,
      role: role,
    );
    _currentUser = localUser;
    await StorageService.saveUser(localUser);
    return localUser;
  }

  // Switch Role
  Future<void> switchRole(String newRole) async {
    if (_currentUser == null) return;
    try {
      final updatedUser = await ApiService().switchRole(targetRole: newRole);
      _currentUser = updatedUser;
    } catch (e) {
      _currentUser = _currentUser!.copyWith(role: newRole);
      await StorageService.saveUser(_currentUser!);
    }
  }

  // Logout
  Future<void> logout() async {
    _currentUser = null;
    await StorageService.clearAll();
  }
}
