import 'package:flutter/material.dart';
import '../config/theme.dart';

class TrustBadge extends StatelessWidget {
  final String text;
  final IconData icon;
  final Color backgroundColor;
  final Color textColor;
  final Color iconColor;

  const TrustBadge({
    super.key,
    required this.text,
    this.icon = Icons.verified_rounded,
    this.backgroundColor = AppColors.primaryGreenSurface,
    this.textColor = AppColors.primaryGreen,
    this.iconColor = AppColors.primaryGreen,
  });

  factory TrustBadge.govtCertified() {
    return const TrustBadge(
      text: 'Govt Certified',
      icon: Icons.verified_user_rounded,
      backgroundColor: AppColors.primaryGreenSurface,
      textColor: AppColors.primaryGreenDark,
      iconColor: AppColors.primaryGreen,
    );
  }

  factory TrustBadge.saffron({required String text}) {
    return TrustBadge(
      text: text,
      icon: Icons.workspace_premium_rounded,
      backgroundColor: AppColors.saffronLight,
      textColor: AppColors.saffronDark,
      iconColor: AppColors.saffron,
    );
  }

  factory TrustBadge.independent() {
    return const TrustBadge(
      text: 'Independent Labour',
      icon: Icons.person_outline_rounded,
      backgroundColor: AppColors.blueSurface,
      textColor: AppColors.blueBadge,
      iconColor: AppColors.blueBadge,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: textColor.withOpacity(0.15), width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: iconColor),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
