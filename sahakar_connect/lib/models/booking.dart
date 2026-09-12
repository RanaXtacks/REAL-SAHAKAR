import 'user.dart';
import 'service_category.dart';

class BookingTimeline {
  final String status;
  final DateTime changedAt;
  final String? note;

  BookingTimeline({
    required this.status,
    required this.changedAt,
    this.note,
  });

  factory BookingTimeline.fromJson(Map<String, dynamic> json) {
    return BookingTimeline(
      status: json['status'] ?? 'pending',
      changedAt: json['changedAt'] != null
          ? DateTime.tryParse(json['changedAt']) ?? DateTime.now()
          : DateTime.now(),
      note: json['note'],
    );
  }
}

class BookingPricing {
  final double basePrice;
  final double convenienceFee;
  final double totalAmount;
  final String paymentStatus; // 'pending', 'paid', 'refunded'
  final String paymentMethod; // 'razorpay', 'cash', 'pending'
  final Map<String, dynamic>? splitBreakdown;

  BookingPricing({
    required this.basePrice,
    this.convenienceFee = 20.0,
    required this.totalAmount,
    this.paymentStatus = 'pending',
    this.paymentMethod = 'pending',
    this.splitBreakdown,
  });

  factory BookingPricing.fromJson(Map<String, dynamic> json) {
    return BookingPricing(
      basePrice: (json['basePrice'] as num?)?.toDouble() ?? 0.0,
      convenienceFee: (json['convenienceFee'] as num?)?.toDouble() ?? 20.0,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      paymentStatus: json['paymentStatus'] ?? 'pending',
      paymentMethod: json['paymentMethod'] ?? 'pending',
      splitBreakdown: json['splitBreakdown'] is Map<String, dynamic> ? json['splitBreakdown'] : null,
    );
  }

  // 88/5/4/3 Cooperative Calculation
  double get workerShare => totalAmount * 0.88;
  double get societyShare => totalAmount * 0.05;
  double get platformShare => totalAmount * 0.04;
  double get welfareShare => totalAmount * 0.03;
}

class Booking {
  final String id;
  final String bookingNumber;
  final String customerId;
  final AppUser? customer;
  final String? workerId;
  final AppUser? worker;
  final String serviceId;
  final ServiceCategory? service;
  final String status; // 'pending', 'offered', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'
  final String streetAddress;
  final String city;
  final String pincode;
  final double latitude;
  final double longitude;
  final DateTime scheduledAt;
  final String notes;
  final BookingPricing pricing;
  final double? ratingScore;
  final String? ratingComment;
  final List<BookingTimeline> timeline;
  final DateTime? createdAt;

  Booking({
    required this.id,
    required this.bookingNumber,
    required this.customerId,
    this.customer,
    this.workerId,
    this.worker,
    required this.serviceId,
    this.service,
    required this.status,
    required this.streetAddress,
    this.city = 'Mumbai',
    this.pincode = '',
    this.latitude = 19.0760,
    this.longitude = 72.8777,
    required this.scheduledAt,
    this.notes = '',
    required this.pricing,
    this.ratingScore,
    this.ratingComment,
    this.timeline = const [],
    this.createdAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    AppUser? cust;
    String cId = '';
    if (json['customer'] is Map<String, dynamic>) {
      cust = AppUser.fromJson(json['customer']);
      cId = cust.id;
    } else if (json['customer'] is String) {
      cId = json['customer'];
    }

    AppUser? wrk;
    String? wId;
    if (json['worker'] is Map<String, dynamic>) {
      wrk = AppUser.fromJson(json['worker']);
      wId = wrk.id;
    } else if (json['worker'] is String) {
      wId = json['worker'];
    }

    ServiceCategory? srv;
    String sId = '';
    if (json['service'] is Map<String, dynamic>) {
      srv = ServiceCategory.fromJson(json['service']);
      sId = srv.id;
    } else if (json['service'] is String) {
      sId = json['service'];
    }

    double lat = 19.0760;
    double lng = 72.8777;
    String street = '';
    String cty = 'Mumbai';
    String pin = '';
    if (json['serviceAddress'] is Map<String, dynamic>) {
      final addr = json['serviceAddress'] as Map<String, dynamic>;
      street = addr['streetAddress'] ?? '';
      cty = addr['city'] ?? 'Mumbai';
      pin = addr['pincode'] ?? '';
      if (addr['location'] != null && addr['location']['coordinates'] is List) {
        final coords = addr['location']['coordinates'] as List;
        if (coords.length >= 2) {
          lng = (coords[0] as num).toDouble();
          lat = (coords[1] as num).toDouble();
        }
      }
    }

    List<BookingTimeline> tl = [];
    if (json['timeline'] is List) {
      tl = (json['timeline'] as List)
          .map((item) => BookingTimeline.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    double? rScore;
    String? rComment;
    if (json['rating'] is Map<String, dynamic>) {
      rScore = (json['rating']['score'] as num?)?.toDouble();
      rComment = json['rating']['comment'];
    }

    return Booking(
      id: json['_id'] ?? json['id'] ?? '',
      bookingNumber: json['bookingNumber'] ?? 'SC-100000',
      customerId: cId,
      customer: cust,
      workerId: wId,
      worker: wrk,
      serviceId: sId,
      service: srv,
      status: json['status'] ?? 'pending',
      streetAddress: street,
      city: cty,
      pincode: pin,
      latitude: lat,
      longitude: lng,
      scheduledAt: json['scheduledAt'] != null
          ? DateTime.tryParse(json['scheduledAt']) ?? DateTime.now()
          : DateTime.now(),
      notes: json['notes'] ?? '',
      pricing: json['pricing'] is Map<String, dynamic>
          ? BookingPricing.fromJson(json['pricing'])
          : BookingPricing(basePrice: 299, totalAmount: 319),
      ratingScore: rScore,
      ratingComment: rComment,
      timeline: tl,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }
}
