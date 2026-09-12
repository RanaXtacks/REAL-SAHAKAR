import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/user.dart';
import '../../models/booking.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../services/localization_service.dart';
import '../../widgets/language_selector.dart';
import '../auth/login_screen.dart';
import '../worker/worker_dashboard_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  List<Booking> _myBookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    try {
      final bookings = await ApiService().getMyBookings();
      if (mounted) {
        setState(() {
          _myBookings = bookings;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleSwitchRole() async {
    final user = AuthService().currentUser;
    final targetRole = user?.role == 'worker' ? 'customer' : 'worker';

    await AuthService().switchRole(targetRole);

    if (!mounted) return;

    if (targetRole == 'worker') {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerDashboardScreen()),
      );
    } else {
      setState(() {});
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ग्राहक मोड सक्रिय झाला (Switched to Customer Mode)')),
      );
    }
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
          id: 'u_1',
          firebaseUid: 'fb_1',
          displayName: 'सागर पाटील (Sagar Patil)',
          phoneNumber: '+91 98765 00001',
          role: 'customer',
        );

    final isWorker = user.role == 'worker';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          LocalizationService.t('profile'),
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: LanguageSelectorButton(),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Profile User Card
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
                          radius: 30,
                          backgroundColor: AppColors.primaryGreen,
                          child: Text(
                            user.displayName.isNotEmpty ? user.displayName[0].toUpperCase() : 'S',
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
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
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryGreenSurface,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  isWorker ? '👷 नोंदणीकृत कामगार (Worker)' : '👤 ग्राहक सदस्य (Customer)',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primaryGreenDark,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 18),
                    const Divider(height: 1, color: Color(0x0F000000)),
                    const SizedBox(height: 14),

                    // Privacy & Security Controls Tag
                    Row(
                      children: [
                        const Icon(Icons.security_rounded, size: 18, color: AppColors.primaryGreen),
                        const SizedBox(width: 8),
                        const Text(
                          'गोपनीयता व सुरक्षा नियंत्रण (Verified & Secured)',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // 2. Role Switcher CTA Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isWorker ? AppColors.blueSurface : AppColors.saffronLight,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isWorker ? AppColors.blueBadge.withOpacity(0.3) : AppColors.saffronDark.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(
                          isWorker ? Icons.person_rounded : Icons.engineering_rounded,
                          color: isWorker ? AppColors.blueBadge : AppColors.saffronDark,
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isWorker ? 'ग्राहक मोडवर जा' : 'कामगार पोर्टलवर जा',
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                            ),
                            Text(
                              isWorker ? 'सेवा बुक करण्यासाठी स्विच करा' : '८८% थेट मोबदल्यावर काम मिळवा',
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: _handleSwitchRole,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isWorker ? AppColors.blueBadge : AppColors.saffronDark,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        minimumSize: Size.zero,
                      ),
                      child: const Text('स्विच करा', style: TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 3. Booking History
              const Text(
                'बुकिंग इतिहास / Booking History',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 12),

              _isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
                  : _myBookings.isEmpty
                      ? _buildSampleHistory()
                      : Column(
                          children: _myBookings.map((b) => _buildBookingHistoryCard(b)).toList(),
                        ),

              const SizedBox(height: 24),

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
    );
  }

  Widget _buildSampleHistory() {
    return Column(
      children: [
        _buildHistoryItem(
          bookingNumber: 'SC-100234',
          serviceName: 'इलेक्ट्रिकल रिपेअर (Electrical Repairs)',
          workerName: 'रमेश पाटील',
          status: 'पूर्ण झाले (Completed)',
          amount: '₹२६९',
          date: '१० सप्टें २०२६',
        ),
        const SizedBox(height: 10),
        _buildHistoryItem(
          bookingNumber: 'SC-099412',
          serviceName: 'प्लंबिंग दुरुस्ती (Plumbing Services)',
          workerName: 'सुरेश मोरे',
          status: 'पूर्ण झाले (Completed)',
          amount: '₹३१९',
          date: '२८ ऑगस्ट २०२६',
        ),
      ],
    );
  }

  Widget _buildHistoryItem({
    required String bookingNumber,
    required String serviceName,
    required String workerName,
    required String status,
    required String amount,
    required String date,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(serviceName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              Text(
                amount,
                style: AppTheme.currencyStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primaryGreenDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'कामगार: $workerName • $bookingNumber • $date',
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreenSurface,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  status,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryGreenDark),
                ),
              ),
              const Text(
                '★ ५.० दिलेले मूल्यांकन',
                style: TextStyle(fontSize: 12, color: AppColors.starGold, fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBookingHistoryCard(Booking b) {
    return _buildHistoryItem(
      bookingNumber: b.bookingNumber,
      serviceName: b.service?.name ?? 'General Service',
      workerName: b.worker?.displayName ?? 'सहकारी कामगार',
      status: b.status == 'completed' ? 'पूर्ण झाले (Completed)' : b.status,
      amount: '₹${b.pricing.totalAmount.toInt()}',
      date: '${b.scheduledAt.day}/${b.scheduledAt.month}/${b.scheduledAt.year}',
    );
  }
}
