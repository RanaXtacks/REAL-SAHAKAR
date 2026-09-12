import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class StorageService {
  static const String _keyAuthToken = 'auth_token';
  static const String _keyDevUid = 'dev_uid';
  static const String _keyUserData = 'user_data';
  static const String _keyCurrentRole = 'current_role';
  static const String _keyLanguage = 'selected_language';

  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static Future<void> saveAuthToken(String token) async {
    await _prefs?.setString(_keyAuthToken, token);
  }

  static String? getAuthToken() {
    return _prefs?.getString(_keyAuthToken);
  }

  static Future<void> saveDevUid(String uid) async {
    await _prefs?.setString(_keyDevUid, uid);
  }

  static String? getDevUid() {
    return _prefs?.getString(_keyDevUid);
  }

  static Future<void> saveUser(AppUser user) async {
    final jsonStr = jsonEncode(user.toJson());
    await _prefs?.setString(_keyUserData, jsonStr);
    await saveRole(user.role);
  }

  static AppUser? getUser() {
    final str = _prefs?.getString(_keyUserData);
    if (str != null && str.isNotEmpty) {
      try {
        return AppUser.fromJson(jsonDecode(str));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  static Future<void> saveRole(String role) async {
    await _prefs?.setString(_keyCurrentRole, role);
  }

  static String getRole() {
    return _prefs?.getString(_keyCurrentRole) ?? 'customer';
  }

  static Future<void> saveLanguage(String langCode) async {
    await _prefs?.setString(_keyLanguage, langCode);
  }

  static String getLanguage() {
    return _prefs?.getString(_keyLanguage) ?? 'mr'; // default Marathi per screenshots
  }

  static Future<void> clearAll() async {
    await _prefs?.clear();
  }
}
