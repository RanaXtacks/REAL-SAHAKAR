import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../services/auth_service.dart';
import '../../services/storage_service.dart';
import '../../services/localization_service.dart';
import '../customer/home_screen.dart';
import '../auth/login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _bootstrapApp();
  }

  Future<void> _bootstrapApp() async {
    // Wait for splash animations and services init
    await Future.wait([
      StorageService.init(),
      AuthService().init(),
      Future.delayed(const Duration(milliseconds: 1800)),
    ]);

    // Load saved language
    final savedLang = StorageService.getLanguage();
    LocalizationService.setLocale(savedLang);

    if (!mounted) return;

    // Check if user is logged in
    final user = AuthService().currentUser;
    if (user != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),

              // Animated Logo Icon
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.saffron, AppColors.primaryGreen],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: AppTheme.elevatedShadow,
                ),
                child: const Center(
                  child: Icon(
                    Icons.diversity_3_rounded,
                    size: 54,
                    color: Colors.white,
                  ),
                ),
              )
                  .animate()
                  .scale(duration: 600.ms, curve: Curves.easeOutBack)
                  .then(delay: 200.ms)
                  .shimmer(duration: 1000.ms, color: Colors.white.withOpacity(0.4)),

              const SizedBox(height: 24),

              // Title
              Text(
                AppConstants.appName,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2, end: 0),

              const SizedBox(height: 8),

              // Tagline in Marathi / English
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreenSurface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primaryGreen.withOpacity(0.2)),
                ),
                child: const Text(
                  'महाराष्ट्र कामगार सहकारी महासंघ',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryGreenDark,
                  ),
                ),
              ).animate().fadeIn(delay: 500.ms),

              const Spacer(),

              // Bottom spinner + Trust note
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.primaryGreen,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    '८८% थेट कामगार मोबदला • शून्य मध्यस्थ कट',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ).animate().fadeIn(delay: 800.ms),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
