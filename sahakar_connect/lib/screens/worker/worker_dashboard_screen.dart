import 'dart:async';
import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/user.dart';
import '../../services/auth_service.dart';
import '../../services/socket_service.dart';
import '../../services/localization_service.dart';
import '../../widgets/worker_bottom_nav.dart';
import 'offer_modal.dart';
import 'worker_registration_screen.dart';
import 'worker_jobs_screen.dart';
import 'worker_map_screen.dart';
import 'worker_profile_screen.dart';
import 'certification_screen.dart';

class WorkerDashboardScreen extends StatefulWidget {
  const WorkerDashboardScreen({super.key});

  @override
  State<WorkerDashboardScreen> createState() => _WorkerDashboardScreenState();
}

class _WorkerDashboardScreenState extends State<WorkerDashboardScreen> {
  bool _isOnline = true;
  StreamSubscription? _offerSub;

  @override
  void initState() {
    super.initState();
    _initSocketAndListeners();
  }

  void _initSocketAndListeners() {
    final worker = AuthService().currentUser;
    SocketService().connect();
    if (worker != null) {
      SocketService().registerWorker(worker.id);
    }

    _offerSub = SocketService().onNewOffer.listen((offerData) {
      if (mounted && _isOnline) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => OfferModal(offerData: offerData),
        );
      }
    });
  }

  @override
  void dispose() {
    _offerSub?.cancel();
    super.dispose();
  }

  void _handleTabSelected(int index) {
    if (index == 1) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerJobsScreen()),
      );
    } else if (index == 2) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerMapScreen()),
      );
    } else if (index == 3) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerProfileScreen()),
      );
    }
  }

  void _simulateIncomingOffer() {
    final mockOffer = {
      'bookingId': 'mock_book_${DateTime.now().millisecondsSinceEpoch}',
      'bookingNumber': 'SC-109842',
      'serviceName': 'इलेक्ट्रिकल रिपेअर (Electrical Repairs)',
      'customerName': 'सागर पाटील (Sagar Patil)',
      'customerPhone': '+91 98765 00001',
      'streetAddress': 'फ्लॅट ४०२, शिवनेरी, वांद्रे पश्चिम',
      'distanceKm': '1.8',
      'netPayout': 263.0,
    };

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => OfferModal(offerData: mockOffer),
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
          LocalizationService.t('worker_dashboard'),
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.verified_user_rounded, color: AppColors.primaryGreen),
            tooltip: 'Aadhaar & Certifications',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CertificationScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.app_registration_rounded),
            tooltip: 'Worker Registration',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const WorkerRegistrationScreen()),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Worker Profile Header
              Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: AppColors.primaryGreen,
                    child: Text(
                      user.displayName.isNotEmpty ? user.displayName[0].toUpperCase() : 'W',
                      style: const TextStyle(fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.displayName,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                        ),
                        const Text(
                          'वांद्रे कामगार सहकारी संस्था Ltd.',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // 2. Large "GO ONLINE" Glowing Toggle Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: _isOnline ? AppColors.primaryGreenSurface : Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: _isOnline ? AppColors.primaryGreen : AppColors.borderSubtle,
                    width: _isOnline ? 1.8 : 1.0,
                  ),
                  boxShadow: _isOnline ? AppTheme.elevatedShadow : AppTheme.cardShadow,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            color: _isOnline ? AppColors.success : AppColors.textMuted,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isOnline
                                  ? LocalizationService.t('go_online')
                                  : LocalizationService.t('go_offline'),
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: _isOnline ? AppColors.primaryGreenDark : AppColors.textSecondary,
                              ),
                            ),
                            Text(
                              _isOnline
                                  ? LocalizationService.t('online_desc')
                                  : LocalizationService.t('offline_desc'),
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Switch(
                      value: _isOnline,
                      activeTrackColor: AppColors.primaryGreen,
                      activeThumbColor: Colors.white,
                      onChanged: (val) {
                        setState(() => _isOnline = val);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(_isOnline ? 'आपण ऑनलाइन झाला आहात!' : 'आपण ऑफलाइन झाला आहात.'),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 3. Earnings & Performance Metric Cards (Row)
              Row(
                children: [
                  Expanded(
                    child: _buildMetricCard(
                      title: LocalizationService.t('earnings_today'),
                      value: '₹१,३२०',
                      subtitle: '८८% थेट निव्वळ',
                      icon: Icons.account_balance_wallet_rounded,
                      color: AppColors.primaryGreen,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      title: LocalizationService.t('completed_jobs'),
                      value: '४ कामे',
                      subtitle: 'आज पूर्ण',
                      icon: Icons.task_alt_rounded,
                      color: AppColors.blueBadge,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      title: LocalizationService.t('rating'),
                      value: '४.९ ★',
                      subtitle: '१४२ मते',
                      icon: Icons.star_rounded,
                      color: AppColors.starGold,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // 4. Test Simulation Button
              OutlinedButton.icon(
                onPressed: _simulateIncomingOffer,
                icon: const Icon(Icons.bolt_rounded, color: AppColors.saffronDark),
                label: const Text(
                  '⚡ नवीन ऑर्डरची चाचणी घ्या (Simulate Incoming 45s Offer)',
                  style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.saffronDark, fontSize: 13),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.saffronDark, width: 1.5),
                  backgroundColor: AppColors.saffronLight,
                ),
              ),

              const SizedBox(height: 16),

              // 5. Worker Certification Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primaryGreenSurface, Colors.white],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.4)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.verified_user_rounded, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'आधार व कौशल्य प्रमाणपत्र (Verified)',
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                          ),
                          Text(
                            'फेस कार्ड पडताळणीसह १००% निष्पक्ष वाटप',
                            style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const CertificationScreen()),
                        );
                      },
                      child: const Text('पहा (View)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 5. Recent Jobs
              const Text(
                'नुकतीच पूर्ण झालेली कामे / Recent Jobs',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 12),

              _buildRecentJobItem(
                bookingNumber: 'SC-100234',
                service: 'इलेक्ट्रिकल फॅन बसवणे',
                customer: 'अमित जोशी',
                earned: '₹३५०',
                time: 'आज, दुपारी २:३०',
              ),

              const SizedBox(height: 8),

              _buildRecentJobItem(
                bookingNumber: 'SC-100189',
                service: 'स्विचबोर्ड व वायरिंग दुरुस्ती',
                customer: 'प्रिया देसाई',
                earned: '₹२४०',
                time: 'आज, सकाळी ११:००',
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: WorkerBottomNavBar(
        currentIndex: 0,
        onTap: _handleTabSelected,
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
          ),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 10, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentJobItem({
    required String bookingNumber,
    required String service,
    required String customer,
    required String earned,
    required String time,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                service,
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
              ),
              const SizedBox(height: 2),
              Text(
                '$customer • $bookingNumber • $time',
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              ),
            ],
          ),
          Text(
            earned,
            style: AppTheme.currencyStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: AppColors.primaryGreenDark,
            ),
          ),
        ],
      ),
    );
  }
}
