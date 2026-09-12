import 'package:flutter/material.dart';

class ServiceCategory {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String iconName;
  final double basePrice;
  final int estimatedDurationMinutes;
  final bool isActive;

  ServiceCategory({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.iconName,
    required this.basePrice,
    this.estimatedDurationMinutes = 60,
    this.isActive = true,
  });

  factory ServiceCategory.fromJson(Map<String, dynamic> json) {
    return ServiceCategory(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'] ?? '',
      iconName: json['iconName'] ?? 'Wrench',
      basePrice: (json['basePrice'] as num?)?.toDouble() ?? 299.0,
      estimatedDurationMinutes: (json['estimatedDurationMinutes'] as num?)?.toInt() ?? 60,
      isActive: json['isActive'] ?? true,
    );
  }

  IconData get iconData {
    switch (iconName.toLowerCase()) {
      case 'wrench':
      case 'plumbing':
        return Icons.plumbing_rounded;
      case 'zap':
      case 'electrical':
        return Icons.bolt_rounded;
      case 'hammer':
      case 'carpentry':
        return Icons.handyman_rounded;
      case 'cpu':
      case 'appliances':
        return Icons.kitchen_rounded;
      case 'sparkles':
      case 'cleaning':
        return Icons.cleaning_services_rounded;
      case 'paintbrush':
      case 'painting':
        return Icons.format_paint_rounded;
      default:
        return Icons.build_circle_rounded;
    }
  }
}
