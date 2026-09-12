class AppUser {
  final String id;
  final String firebaseUid;
  final String displayName;
  final String phoneNumber;
  final String email;
  final String role; // 'customer', 'worker', 'admin'
  final String profilePhotoUrl;
  final bool isActive;
  final DateTime? createdAt;

  AppUser({
    required this.id,
    required this.firebaseUid,
    required this.displayName,
    required this.phoneNumber,
    this.email = '',
    this.role = 'customer',
    this.profilePhotoUrl = '',
    this.isActive = true,
    this.createdAt,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['_id'] ?? json['id'] ?? '',
      firebaseUid: json['firebaseUid'] ?? '',
      displayName: json['displayName'] ?? 'Sahakar Member',
      phoneNumber: json['phoneNumber'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'customer',
      profilePhotoUrl: json['profilePhotoUrl'] ?? '',
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'firebaseUid': firebaseUid,
      'displayName': displayName,
      'phoneNumber': phoneNumber,
      'email': email,
      'role': role,
      'profilePhotoUrl': profilePhotoUrl,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  AppUser copyWith({
    String? id,
    String? firebaseUid,
    String? displayName,
    String? phoneNumber,
    String? email,
    String? role,
    String? profilePhotoUrl,
    bool? isActive,
  }) {
    return AppUser(
      id: id ?? this.id,
      firebaseUid: firebaseUid ?? this.firebaseUid,
      displayName: displayName ?? this.displayName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      email: email ?? this.email,
      role: role ?? this.role,
      profilePhotoUrl: profilePhotoUrl ?? this.profilePhotoUrl,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt,
    );
  }
}
