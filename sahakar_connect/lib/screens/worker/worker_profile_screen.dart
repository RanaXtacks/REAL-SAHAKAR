import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/user.dart';
import '../../services/auth_service.dart';
import '../../services/localization_service.dart';
import '../../widgets/language_selector.dart';
import '../../widgets/worker_bottom_nav.dart';
import '../customer/home_screen.dart';
import '../auth/login_screen.dart';
import 'certification_screen.dart';
import 'worker_dashboard_screen.dart';
import 'worker_jobs_screen.dart';
import 'worker_map_screen.dart';

class WorkerProfileScreen extends StatefulWidget {
  const WorkerProfileScreen({super.key});

  @override
  State<WorkerProfileScreen> createState() => _WorkerProfileScreenState();
}

class _WorkerProfileScreenState extends State<WorkerProfileScreen> {
  final int _currentTabIndex = 3; // Profile tab
  final bool _isCertified = true;

  void _handleTabSelected(int index) {
    if (index == 0) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerDashboardScreen()),
      );
    } else if (index == 1) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerJobsScreen()),
      );
    } else if (index == 2) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerMapScreen()),
      );
    }
  }

  void _handleSwitchRole() async {
    await AuthService().switchRole('customer');
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const HomeScreen()),
      (route) => false,
    );
  }

  void _handleLogout() async {
    await AuthService().logout();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthService().currentUser ??
        AppUser(
          id: 'w_1',
          firebaseUid: 'fb_1',
          displayName: 'रमेश पाटील (Ramesh Patil)',
          phoneNumber: '+91 98765 43210',
          role: 'worker',
        );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          LocalizationService.t('worker_profile'),
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        automaticallyImplyLeading: false,
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: LanguageSelectorButton(),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Worker Identity Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 32,
                          backgroundColor: AppColors.primaryGreen,
                          child: Text(
                            user.displayName.isNotEmpty ? user.displayName[0].toUpperCase() : 'W',
                            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user.displayName,
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                user.phoneNumber,
                                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                              ),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryGreenSurface,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.verified_rounded, size: 14, color: AppColors.primaryGreenDark),
                                    SizedBox(width: 4),
                                    Text(
                                      'वांद्रे कामगार सहकारी संस्था Ltd.',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.primaryGreenDark,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(height: 1, color: Color(0x0F000000)),
                    const SizedBox(height: 14),
                    // Fairness Score & Rating Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatCol('रेटिंग (Rating)', '४.९ ★', AppColors.starGold),
                        Container(width: 1, height: 28, color: Colors.grey.shade200),
                        _buildStatCol('पूर्ण कामे (Jobs)', '३८४', AppColors.primaryGreenDark),
                        Container(width: 1, height: 28, color: Colors.grey.shade200),
                        _buildStatCol('सहकारी पारदर्शकता', '९८.५%', AppColors.blueBadge),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 2. CERTIFICATION & AADHAAR VERIFICATION BANNER
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: _isCertified
                        ? [AppColors.primaryGreenSurface, Colors.white]
                        : [AppColors.saffronLight, Colors.white],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(
                    color: _isCertified ? AppColors.primaryGreen : AppColors.saffronDark,
                    width: 1.5,
                  ),
                  boxShadow: AppTheme.elevatedShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: _isCertified ? AppColors.primaryGreen : AppColors.saffronDark,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.verified_user_rounded, color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                LocalizationService.t('certification_title'),
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                              ),
                              Text(
                                _isCertified
                                    ? 'आधार व चेहरा पडताळणी पूर्ण (Aadhaar & Face Card Verified)'
                                    : 'प्रमाणपत्र जोडून अधिक कामे मिळवा',
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const CertificationScreen()),
                        );
                      },
                      icon: const Icon(Icons.document_scanner_rounded, size: 16),
                      label: const Text('प्रमाणपत्र व्यवस्थापित करा (Manage Certifications)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isCertified ? AppColors.primaryGreen : AppColors.saffronDark,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 3. Switch to Customer Mode Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.sync_alt_rounded, color: AppColors.primaryGreen),
                        SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'ग्राहक मोडवर जा',
                              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                            ),
                            Text(
                              'सेवा बुक करण्यासाठी ग्राहक मोड वापरा',
                              style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: _handleSwitchRole,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.saffronDark,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      ),
                      child: const Text('स्विच करा'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 4. Logout Button
              OutlinedButton.icon(
                onPressed: _handleLogout,
                icon: const Icon(Icons.logout_rounded, color: AppColors.error),
                label: Text(
                  LocalizationService.t('logout'),
                  style: const TextStyle(color: AppColors.error, fontWeight: FontWeight.w700),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.error),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
      bottomNavigationBar: WorkerBottomNavBar(
        currentIndex: _currentTabIndex,
        onTap: _handleTabSelected,
      ),
    );
  }

  Widget _buildStatCol(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
