import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../services/auth_service.dart';
import '../../services/localization_service.dart';
import '../../widgets/language_selector.dart';
import '../customer/home_screen.dart';
import '../worker/worker_dashboard_screen.dart';
import 'otp_verification_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  bool _isLoading = false;
  String _selectedRole = 'customer'; // customer or worker

  @override
  void dispose() {
    _phoneController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _handleSendOtp() {
    final phone = _phoneController.text.trim();
    if (phone.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('कृपया १० अंकी वैध मोबाईल नंबर टाका / Enter valid 10-digit number')),
      );
      return;
    }

    setState(() => _isLoading = true);

    AuthService().sendOtp(
      phoneNumber: '+91$phone',
      onCodeSent: (verificationId) {
        setState(() => _isLoading = false);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => OtpVerificationScreen(
              verificationId: verificationId,
              phoneNumber: '+91$phone',
              displayName: _nameController.text.trim().isNotEmpty
                  ? _nameController.text.trim()
                  : 'Sahakar Member',
              role: _selectedRole,
            ),
          ),
        );
      },
      onError: (err) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('त्रुटी: $err')),
        );
      },
    );
  }

  void _handleQuickDemoLogin(String role, String name, String phone) async {
    setState(() => _isLoading = true);
    try {
      await AuthService().demoLogin(role: role, name: name, phone: phone);
      if (!mounted) return;
      if (role == 'worker') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const WorkerDashboardScreen()),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('लॉगिन त्रुटी: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(''),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: LanguageSelectorButton(),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logo badge
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primaryGreen, AppColors.saffron],
                  ),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: const Icon(Icons.diversity_3_rounded, color: Colors.white, size: 30),
              ).animate().fadeIn().scale(),

              const SizedBox(height: 20),

              // Title & Subtitle
              Text(
                LocalizationService.t('login_title'),
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.4,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                LocalizationService.t('login_subtitle'),
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),

              const SizedBox(height: 24),

              // Role Toggle: Customer / Worker
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => setState(() => _selectedRole = 'customer'),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedRole == 'customer' ? Colors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: _selectedRole == 'customer' ? AppTheme.cardShadow : null,
                          ),
                          child: Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.person_rounded,
                                  size: 16,
                                  color: _selectedRole == 'customer'
                                      ? AppColors.primaryGreen
                                      : AppColors.textSecondary,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  LocalizationService.t('customer_mode'),
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: _selectedRole == 'customer'
                                        ? FontWeight.w700
                                        : FontWeight.w500,
                                    color: _selectedRole == 'customer'
                                        ? AppColors.primaryGreenDark
                                        : AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: InkWell(
                        onTap: () => setState(() => _selectedRole = 'worker'),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedRole == 'worker' ? Colors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: _selectedRole == 'worker' ? AppTheme.cardShadow : null,
                          ),
                          child: Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.engineering_rounded,
                                  size: 16,
                                  color: _selectedRole == 'worker'
                                      ? AppColors.primaryGreen
                                      : AppColors.textSecondary,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  LocalizationService.t('worker_mode'),
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: _selectedRole == 'worker'
                                        ? FontWeight.w700
                                        : FontWeight.w500,
                                    color: _selectedRole == 'worker'
                                        ? AppColors.primaryGreenDark
                                        : AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Name input (optional)
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'पूर्ण नाव / Full Name',
                  prefixIcon: Icon(Icons.badge_outlined, color: AppColors.primaryGreen),
                  hintText: 'उदा. सागर पाटील',
                ),
              ),

              const SizedBox(height: 14),

              // Phone number input
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                maxLength: 10,
                decoration: InputDecoration(
                  labelText: LocalizationService.t('phone_label'),
                  prefixIcon: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                    child: Text(
                      '🇮🇳 +91',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  hintText: '9876543210',
                  counterText: '',
                ),
              ),

              const SizedBox(height: 20),

              // Send OTP Button
              ElevatedButton(
                onPressed: _isLoading ? null : _handleSendOtp,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(LocalizationService.t('send_otp')),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward_rounded, size: 18),
                        ],
                      ),
              ),

              const SizedBox(height: 28),

              // Quick Demo Testing Section
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.bolt_rounded, size: 18, color: AppColors.saffronDark),
                        SizedBox(width: 6),
                        Text(
                          'त्वरित डेमो लॉगिन / Quick Instant Demo Login',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _isLoading
                                ? null
                                : () => _handleQuickDemoLogin(
                                      'customer',
                                      'Sagar Patil (Customer)',
                                      '9876500001',
                                    ),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              minimumSize: const Size(0, 42),
                            ),
                            child: const Text('👤 ग्राहक डेमो', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isLoading
                                ? null
                                : () => _handleQuickDemoLogin(
                                      'worker',
                                      'Ramesh Patil (Worker)',
                                      '9876543210',
                                    ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryGreenSurface,
                              foregroundColor: AppColors.primaryGreenDark,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              minimumSize: const Size(0, 42),
                              elevation: 0,
                            ),
                            child: const Text('👷 कामगार डेमो', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
