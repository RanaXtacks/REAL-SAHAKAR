import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/localization_service.dart';

class WorkerBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const WorkerBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: AppColors.borderSubtle, width: 1.0),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                index: 0,
                icon: Icons.dashboard_rounded,
                label: LocalizationService.t('worker_dashboard'),
              ),
              _buildNavItem(
                index: 1,
                icon: Icons.work_history_rounded,
                label: LocalizationService.t('my_jobs'),
              ),
              _buildNavItem(
                index: 2,
                icon: Icons.map_rounded,
                label: LocalizationService.t('map_view'),
              ),
              _buildNavItem(
                index: 3,
                icon: Icons.badge_rounded,
                label: LocalizationService.t('worker_profile'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = currentIndex == index;

    return InkWell(
      onTap: () => onTap(index),
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGreenSurface : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected ? AppColors.primaryGreen : AppColors.textMuted,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.primaryGreenDark : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
