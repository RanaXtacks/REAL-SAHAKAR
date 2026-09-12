import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';
import '../../models/user.dart';
import '../../models/service_category.dart';
import '../../services/auth_service.dart';
import '../../services/socket_service.dart';
import '../../services/localization_service.dart';
import '../../widgets/worker_bottom_nav.dart';
import 'worker_dashboard_screen.dart';
import 'worker_map_screen.dart';
import 'worker_profile_screen.dart';

class WorkerJobsScreen extends StatefulWidget {
  const WorkerJobsScreen({super.key});

  @override
  State<WorkerJobsScreen> createState() => _WorkerJobsScreenState();
}

class _WorkerJobsScreenState extends State<WorkerJobsScreen> with SingleTickerProviderStateMixin {
  final int _currentTabIndex = 1; // My Jobs tab
  late TabController _tabController;

  List<Booking> _activeJobs = [];
  List<Booking> _completedJobs = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadJobs();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _loadJobs() {
    final workerUser = AuthService().currentUser ??
        AppUser(
          id: 'w_1',
          firebaseUid: 'fb_1',
          displayName: 'रमेश पाटील (Ramesh Patil)',
          phoneNumber: '+91 98765 43210',
          role: 'worker',
        );

    setState(() {
      _activeJobs = [
        Booking(
          id: 'b_act_101',
          bookingNumber: 'SC-109842',
          customerId: 'c_1',
          customer: AppUser(
            id: 'c_1',
            firebaseUid: 'fb_c',
            displayName: 'सागर पाटील (Sagar Patil)',
            phoneNumber: '+91 98765 00001',
            role: 'customer',
          ),
          workerId: 'w_1',
          worker: workerUser,
          serviceId: 'cat_elec',
          service: ServiceCategory(
            id: 'cat_elec',
            name: 'इलेक्ट्रिकल स्विचबोर्ड व वायरिंग दुरुस्ती',
            slug: 'electrical',
            description: 'Electrical repair',
            iconName: 'Zap',
            basePrice: 308,
          ),
          status: 'en_route',
          streetAddress: 'फ्लॅट ४०२, शिवनेरी इमारत, हिल रोड, वांद्रे पश्चिम, मुंबई',
          scheduledAt: DateTime.now(),
          pricing: BookingPricing(basePrice: 308, totalAmount: 350),
        ),
      ];

      _completedJobs = [
        Booking(
          id: 'b_past_102',
          bookingNumber: 'SC-100234',
          customerId: 'c_2',
          customer: AppUser(
            id: 'c_2',
            firebaseUid: 'fb_c2',
            displayName: 'अमित जोशी (Amit Joshi)',
            phoneNumber: '+91 98765 00002',
            role: 'customer',
          ),
          workerId: 'w_1',
          worker: workerUser,
          serviceId: 'cat_fan',
          service: ServiceCategory(
            id: 'cat_fan',
            name: 'इलेक्ट्रिकल सिलिंग फॅन बसवणे',
            slug: 'fan_install',
            description: 'Ceiling fan install',
            iconName: 'Fan',
            basePrice: 263,
          ),
          status: 'completed',
          streetAddress: 'दुकान क्र. १२, खार मार्केट, खार पश्चिम, मुंबई',
          scheduledAt: DateTime.now().subtract(const Duration(hours: 4)),
          pricing: BookingPricing(basePrice: 263, totalAmount: 299),
        ),
        Booking(
          id: 'b_past_103',
          bookingNumber: 'SC-100189',
          customerId: 'c_3',
          customer: AppUser(
            id: 'c_3',
            firebaseUid: 'fb_c3',
            displayName: 'प्रिया देसाई (Priya Desai)',
            phoneNumber: '+91 98765 00003',
            role: 'customer',
          ),
          workerId: 'w_1',
          worker: workerUser,
          serviceId: 'cat_mcb',
          service: ServiceCategory(
            id: 'cat_mcb',
            name: 'एमसीबी ट्रिपिंग दुरुस्ती',
            slug: 'mcb_repair',
            description: 'MCB tripping fix',
            iconName: 'Zap',
            basePrice: 396,
          ),
          status: 'completed',
          streetAddress: 'घर क्र. ८, लिंक रोड, सांताक्रूझ पश्चिम, मुंबई',
          scheduledAt: DateTime.now().subtract(const Duration(days: 1)),
          pricing: BookingPricing(basePrice: 396, totalAmount: 450),
        ),
      ];
    });
  }

  void _handleAdvanceMilestone(Booking job) {
    String nextStatus = 'arrived';
    String message = 'तुम्ही ग्राहकाच्या ठिकाणी पोहोचला आहात!';

    if (job.status == 'en_route') {
      nextStatus = 'arrived';
      message = 'स्थिती अपडेट: पोहोचलो (Arrived)';
    } else if (job.status == 'arrived') {
      nextStatus = 'in_progress';
      message = 'स्थिती अपडेट: काम सुरू झाले (In Progress)';
    } else if (job.status == 'in_progress') {
      nextStatus = 'completed';
      message = 'अभिनंदन! काम पूर्ण झाले. रक्कम खात्यात जमा होईल.';
    }

    setState(() {
      final updatedJob = job.copyWith(status: nextStatus);
      final idx = _activeJobs.indexWhere((j) => j.id == job.id);
      if (nextStatus == 'completed') {
        _activeJobs.removeWhere((j) => j.id == job.id);
        _completedJobs.insert(0, updatedJob);
      } else if (idx != -1) {
        _activeJobs[idx] = updatedJob;
      }
    });

    // Notify customer tracking room via socket
    SocketService().updateJobStatus(
      bookingId: job.id,
      status: nextStatus,
      note: 'Updated by worker',
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.primaryGreen,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _handleTabSelected(int index) {
    if (index == 0) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerDashboardScreen()),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          LocalizationService.t('my_jobs'),
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        automaticallyImplyLeading: false,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primaryGreen,
          labelColor: AppColors.primaryGreenDark,
          unselectedLabelColor: AppColors.textSecondary,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
          tabs: [
            Tab(text: '${LocalizationService.t('active_jobs')} (${_activeJobs.length})'),
            Tab(text: '${LocalizationService.t('past_jobs')} (${_completedJobs.length})'),
          ],
        ),
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: [
            // Active Jobs Tab
            _activeJobs.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.assignment_outlined, size: 60, color: Colors.grey.shade400),
                          const SizedBox(height: 14),
                          Text(
                            LocalizationService.t('no_active_jobs'),
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _activeJobs.length,
                    itemBuilder: (context, index) {
                      return _buildActiveJobCard(_activeJobs[index]);
                    },
                  ),

            // Completed Jobs Tab
            ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _completedJobs.length,
              itemBuilder: (context, index) {
                return _buildCompletedJobCard(_completedJobs[index]);
              },
            ),
          ],
        ),
      ),
      bottomNavigationBar: WorkerBottomNavBar(
        currentIndex: _currentTabIndex,
        onTap: _handleTabSelected,
      ),
    );
  }

  Widget _buildActiveJobCard(Booking job) {
    String milestoneButtonText = 'पोहोचलो (Mark Arrived)';
    IconData milestoneIcon = Icons.location_on_rounded;

    if (job.status == 'arrived') {
      milestoneButtonText = 'काम सुरू करा (Start Work)';
      milestoneIcon = Icons.play_arrow_rounded;
    } else if (job.status == 'in_progress') {
      milestoneButtonText = 'काम पूर्ण झाले (Complete Job)';
      milestoneIcon = Icons.check_circle_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.primaryGreen, width: 1.5),
        boxShadow: AppTheme.elevatedShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreenSurface,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  job.bookingNumber,
                  style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primaryGreenDark, fontSize: 13),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.saffronLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '● ${job.status.toUpperCase()}',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.saffronDark),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            job.serviceCategory,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 14),

          // Customer Contact Details Section
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.person_pin_rounded, size: 18, color: AppColors.primaryGreen),
                    const SizedBox(width: 8),
                    Text(
                      LocalizationService.t('customer_details'),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          job.customer?.displayName ?? 'ग्राहक (Customer)',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                        ),
                        Text(
                          job.customer?.phoneNumber ?? '',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('कॉल करत आहे: ${job.customer?.displayName ?? 'ग्राहक'} (${job.customer?.phoneNumber ?? ''})'),
                            backgroundColor: AppColors.primaryGreen,
                          ),
                        );
                      },
                      icon: const Icon(Icons.call_rounded, size: 16),
                      label: Text(LocalizationService.t('call_customer')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.location_on_outlined, size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        job.serviceAddress,
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Payout & Advance Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '₹${job.workerAmount.toInt()}',
                    style: AppTheme.currencyStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.w900,
                      color: AppColors.primaryGreenDark,
                    ),
                  ),
                  Text(
                    LocalizationService.t('payout_guarantee'),
                    style: const TextStyle(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () => _handleAdvanceMilestone(job),
                icon: Icon(milestoneIcon, size: 16),
                label: Text(milestoneButtonText),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.saffronDark,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCompletedJobCard(Booking job) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  job.serviceCategory,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 2),
                Text(
                  '${job.customer?.displayName ?? 'ग्राहक'} • ${job.bookingNumber}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 4),
                const Row(
                  children: [
                    Icon(Icons.check_circle_rounded, size: 14, color: AppColors.success),
                    SizedBox(width: 4),
                    Text(
                      'रक्कम थेट बँकेत जमा झाली',
                      style: TextStyle(fontSize: 11, color: AppColors.success, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Text(
            '₹${job.workerAmount.toInt()}',
            style: AppTheme.currencyStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: AppColors.primaryGreenDark,
            ),
          ),
        ],
      ),
    );
  }
}
