import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/user.dart';
import '../models/worker_profile.dart';
import '../models/service_category.dart';
import '../models/booking.dart';
import 'storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String _baseUrl = ApiConfig.baseUrl;

  void setBaseUrl(String url) {
    _baseUrl = url;
  }

  Map<String, String> _getHeaders() {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final token = StorageService.getAuthToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    final devUid = StorageService.getDevUid();
    if (devUid != null && devUid.isNotEmpty) {
      headers['x-dev-uid'] = devUid;
    }

    return headers;
  }

  // Check Backend Health
  Future<bool> checkHealth() async {
    try {
      final response = await http
          .get(Uri.parse('$_baseUrl${ApiConfig.health}'))
          .timeout(const Duration(seconds: 6));
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // Auth: Sync Firebase/Dev User with MongoDB
  Future<Map<String, dynamic>> syncUser({
    required String role,
    String? displayName,
    String? phoneNumber,
    String? email,
    String? profilePhotoUrl,
    List<String>? skills,
    List<double>? coordinates,
  }) async {
    final body = {
      'role': role,
      'displayName': ?displayName,
      'phoneNumber': ?phoneNumber,
      'email': ?email,
      'profilePhotoUrl': ?profilePhotoUrl,
      'skills': ?skills,
      'coordinates': ?coordinates,
    };

    final response = await http.post(
      Uri.parse('$_baseUrl${ApiConfig.authSync}'),
      headers: _getHeaders(),
      body: jsonEncode(body),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      if (data['user'] != null) {
        final user = AppUser.fromJson(data['user']);
        await StorageService.saveUser(user);
      }
      return data;
    } else {
      throw Exception('Failed to sync user: ${response.body}');
    }
  }

  // Auth: Switch active role
  Future<AppUser> switchRole({String? targetRole}) async {
    final response = await http.post(
      Uri.parse('$_baseUrl${ApiConfig.authSwitchRole}'),
      headers: _getHeaders(),
      body: jsonEncode({'targetRole': ?targetRole}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final user = AppUser.fromJson(data['user']);
      await StorageService.saveUser(user);
      return user;
    } else {
      throw Exception('Failed to switch role: ${response.body}');
    }
  }

  // Services: Fetch active categories
  Future<List<ServiceCategory>> getServiceCategories() async {
    try {
      final response = await http
          .get(Uri.parse('$_baseUrl${ApiConfig.services}'), headers: _getHeaders())
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['data'] is List) {
          return (data['data'] as List)
              .map((item) => ServiceCategory.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      }
      return _getDefaultCategories();
    } catch (e) {
      // Fallback categories for offline / quick preview
      return _getDefaultCategories();
    }
  }

  // Workers: Fetch registered cooperative workers
  Future<List<WorkerProfile>> getWorkers() async {
    try {
      final response = await http
          .get(Uri.parse('$_baseUrl${ApiConfig.adminWorkers}'), headers: _getHeaders())
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['data'] is List) {
          return (data['data'] as List)
              .map((item) => WorkerProfile.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      }
      return _getDefaultWorkers();
    } catch (e) {
      return _getDefaultWorkers();
    }
  }

  // Bookings: Create new service booking
  Future<Booking> createBooking({
    required String serviceId,
    required String streetAddress,
    String city = 'Mumbai',
    String pincode = '',
    List<double>? coordinates,
    DateTime? scheduledAt,
    String notes = '',
  }) async {
    final body = {
      'serviceId': serviceId,
      'streetAddress': streetAddress,
      'city': city,
      'pincode': pincode,
      'coordinates': coordinates ?? [72.8777, 19.0760],
      'scheduledAt': (scheduledAt ?? DateTime.now()).toIso8601String(),
      'notes': notes,
    };

    final response = await http.post(
      Uri.parse('$_baseUrl${ApiConfig.bookings}'),
      headers: _getHeaders(),
      body: jsonEncode(body),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return Booking.fromJson(data['data']);
    } else {
      throw Exception('Failed to create booking: ${response.body}');
    }
  }

  // Bookings: Get My Bookings
  Future<List<Booking>> getMyBookings() async {
    try {
      final response = await http
          .get(Uri.parse('$_baseUrl${ApiConfig.myBookings}'), headers: _getHeaders())
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['data'] is List) {
          return (data['data'] as List)
              .map((item) => Booking.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // Payments: Confirm Payment (Razorpay or COD)
  Future<Map<String, dynamic>> confirmPayment({
    required String bookingId,
    required String method,
    String? razorpayPaymentId,
    String? razorpayOrderId,
  }) async {
    final body = {
      'bookingId': bookingId,
      'method': method,
      'razorpayPaymentId': ?razorpayPaymentId,
      'razorpayOrderId': ?razorpayOrderId,
    };

    final response = await http.post(
      Uri.parse('$_baseUrl${ApiConfig.paymentConfirm}'),
      headers: _getHeaders(),
      body: jsonEncode(body),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Payment confirmation failed: ${response.body}');
    }
  }

  // Fallback Service Categories
  List<ServiceCategory> _getDefaultCategories() {
    return [
      ServiceCategory(
        id: 'cat_1',
        name: 'Plumbing Services',
        slug: 'plumbing',
        description: 'Leak repairs, tap fittings, pipe maintenance & drain cleaning',
        iconName: 'Wrench',
        basePrice: 299,
        estimatedDurationMinutes: 60,
      ),
      ServiceCategory(
        id: 'cat_2',
        name: 'Electrical Repairs',
        slug: 'electrical',
        description: 'Wiring, switchboard fixes, fan/light installations & MCB tripping',
        iconName: 'Zap',
        basePrice: 249,
        estimatedDurationMinutes: 45,
      ),
      ServiceCategory(
        id: 'cat_3',
        name: 'Carpentry & Woodwork',
        slug: 'carpentry',
        description: 'Door lock repair, furniture assembly, hinge fixes & custom shelving',
        iconName: 'Hammer',
        basePrice: 349,
        estimatedDurationMinutes: 90,
      ),
      ServiceCategory(
        id: 'cat_4',
        name: 'Home Appliance Repair',
        slug: 'appliances',
        description: 'AC servicing, washing machine, refrigerator & microwave repair',
        iconName: 'Cpu',
        basePrice: 399,
        estimatedDurationMinutes: 75,
      ),
      ServiceCategory(
        id: 'cat_5',
        name: 'Deep Cleaning & Sanitization',
        slug: 'cleaning',
        description: 'Full home deep cleaning, kitchen degreasing & bathroom sanitization',
        iconName: 'Sparkles',
        basePrice: 599,
        estimatedDurationMinutes: 120,
      ),
      ServiceCategory(
        id: 'cat_6',
        name: 'Painting & Waterproofing',
        slug: 'painting',
        description: 'Wall touch-ups, single room painting, ceiling waterproofing & damp fix',
        iconName: 'Paintbrush',
        basePrice: 799,
        estimatedDurationMinutes: 180,
      ),
    ];
  }

  // Fallback Workers
  List<WorkerProfile> _getDefaultWorkers() {
    return [
      WorkerProfile(
        id: 'w_1',
        userId: 'u_1',
        user: AppUser(
          id: 'u_1',
          firebaseUid: 'fb_1',
          displayName: 'Ramesh Patil',
          phoneNumber: '+91 98765 43210',
          role: 'worker',
        ),
        skills: ['Electrical Repairs', 'Appliance Fixing'],
        experienceYears: 7,
        ratingAverage: 4.9,
        totalJobsCompleted: 142,
        isOnline: true,
        societyName: 'Bandra Labour Cooperative Society Ltd.',
        societyType: 'Govt Certified',
        hourlyRate: 299,
      ),
      WorkerProfile(
        id: 'w_2',
        userId: 'u_2',
        user: AppUser(
          id: 'u_2',
          firebaseUid: 'fb_2',
          displayName: 'Suresh More',
          phoneNumber: '+91 98231 11223',
          role: 'worker',
        ),
        skills: ['Plumbing Services', 'Sanitary Fitting'],
        experienceYears: 5,
        ratingAverage: 4.8,
        totalJobsCompleted: 98,
        isOnline: true,
        societyName: 'Dharavi Shramik Cooperative Union',
        societyType: 'Govt Certified',
        hourlyRate: 249,
      ),
      WorkerProfile(
        id: 'w_3',
        userId: 'u_3',
        user: AppUser(
          id: 'u_3',
          firebaseUid: 'fb_3',
          displayName: 'Anil Shinde',
          phoneNumber: '+91 97654 33221',
          role: 'worker',
        ),
        skills: ['Carpentry & Woodwork', 'Furniture Assembly'],
        experienceYears: 10,
        ratingAverage: 5.0,
        totalJobsCompleted: 215,
        isOnline: true,
        societyName: 'Andheri Artisan Sahakari Mandal',
        societyType: 'Govt Certified',
        hourlyRate: 349,
      ),
    ];
  }
}
