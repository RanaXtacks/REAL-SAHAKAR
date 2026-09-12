import 'user.dart';

class WorkerProfile {
  final String id;
  final String userId;
  final AppUser? user;
  final List<String> skills;
  final int experienceYears;
  final double latitude;
  final double longitude;
  final bool isOnline;
  final bool isBusy;
  final int totalJobsCompleted;
  final double ratingAverage;
  final int totalRatingsCount;
  final String kycStatus; // 'pending', 'verified', 'rejected'
  final String societyName;
  final String societyType; // 'Govt Certified', 'Independent Labour', 'Private Partner'
  final double hourlyRate;

  WorkerProfile({
    required this.id,
    required this.userId,
    this.user,
    required this.skills,
    this.experienceYears = 1,
    this.latitude = 19.0760,
    this.longitude = 72.8777,
    this.isOnline = false,
    this.isBusy = false,
    this.totalJobsCompleted = 0,
    this.ratingAverage = 5.0,
    this.totalRatingsCount = 0,
    this.kycStatus = 'verified',
    this.societyName = 'Bandra Labour Cooperative Society Ltd.',
    this.societyType = 'Govt Certified',
    this.hourlyRate = 299.0,
  });

  factory WorkerProfile.fromJson(Map<String, dynamic> json) {
    AppUser? userObj;
    String uId = '';

    if (json['user'] is Map<String, dynamic>) {
      userObj = AppUser.fromJson(json['user']);
      uId = userObj.id;
    } else if (json['user'] is String) {
      uId = json['user'];
    }

    // Coordinates are [lng, lat] in GeoJSON
    double lat = 19.0760;
    double lng = 72.8777;
    if (json['location'] != null && json['location']['coordinates'] is List) {
      final coords = json['location']['coordinates'] as List;
      if (coords.length >= 2) {
        lng = (coords[0] as num).toDouble();
        lat = (coords[1] as num).toDouble();
      }
    }

    final skillsRaw = json['skills'];
    List<String> skillsList = [];
    if (skillsRaw is List) {
      skillsList = skillsRaw.map((e) => e.toString()).toList();
    }

    return WorkerProfile(
      id: json['_id'] ?? json['id'] ?? '',
      userId: uId,
      user: userObj,
      skills: skillsList.isNotEmpty ? skillsList : ['General Repairs'],
      experienceYears: (json['experienceYears'] as num?)?.toInt() ?? 3,
      latitude: lat,
      longitude: lng,
      isOnline: json['isOnline'] ?? false,
      isBusy: json['isBusy'] ?? false,
      totalJobsCompleted: (json['totalJobsCompleted'] as num?)?.toInt() ?? 0,
      ratingAverage: (json['ratingAverage'] as num?)?.toDouble() ?? 4.9,
      totalRatingsCount: (json['totalRatingsCount'] as num?)?.toInt() ?? 12,
      kycStatus: json['kycStatus'] ?? 'verified',
      societyName: json['societyName'] ?? 'Bandra Labour Cooperative Society Ltd.',
      societyType: json['societyType'] ?? 'Govt Certified',
      hourlyRate: (json['hourlyRate'] as num?)?.toDouble() ?? 299.0,
    );
  }

  String get displayName => user?.displayName ?? 'Sahakar Worker';
  String get phoneNumber => user?.phoneNumber ?? '';
  String get initials {
    final parts = displayName.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return displayName.isNotEmpty ? displayName[0].toUpperCase() : 'W';
  }
}
