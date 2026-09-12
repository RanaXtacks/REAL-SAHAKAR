import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../config/theme.dart';
import '../models/service_category.dart';

class ServiceCategoryCard extends StatelessWidget {
  final ServiceCategory category;
  final VoidCallback onTap;

  const ServiceCategoryCard({
    super.key,
    required this.category,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.borderSubtle, width: 1.0),
          boxShadow: AppTheme.cardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreenSurface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.15)),
                  ),
                  child: Icon(
                    category.iconData,
                    color: AppColors.primaryGreen,
                    size: 24,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.saffronLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'सहकारी',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppColors.saffronDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              category.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              category.description,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '₹${category.basePrice.toInt()}',
                  style: AppTheme.currencyStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primaryGreenDark,
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_rounded,
                  size: 16,
                  color: AppColors.primaryGreen,
                ),
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 250.ms).scale(begin: const Offset(0.96, 0.96));
  }
}
