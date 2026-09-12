import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';
import '../../models/user.dart';
import '../../models/service_category.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../../services/localization_service.dart';
import '../../widgets/customer_bottom_nav.dart';
import 'home_screen.dart';
import 'worker_listing_screen.dart';
import 'profile_screen.dart';
import 'live_tracking_screen.dart';
import 'rating_screen.dart';

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  final int _currentTabIndex = 2; // My Bookings tab
  bool _isLoading = true;
  List<Booking> _bookings = [];

  @override
  void initState() {
    super.initState();
    _fetchBookings();
  }

  Future<void> _fetchBookings() async {
    setState(() => _isLoading = true);
    try {
      final user = AuthService().currentUser;
      if (user != null) {
        final data = await ApiService().getMyBookings();
        if (mounted) {
          setState(() {
            _bookings = data.isNotEmpty ? data : _bookings;
            _isLoading = false;
          });
        }
      } else {
        _setMockBookings();
      }
    } catch (e) {
      if (mounted) {
        _setMockBookings();
      }
    }
  }

  void _setMockBookings() {
    final mockWorkerUser = AppUser(
      id: 'u_w1',
      firebaseUid: 'fb_1',
      displayName: 'रमेश पाटील (Ramesh Patil)',
      phoneNumber: '+91 98765 43210',
      role: 'worker',
    );

    setState(() {
      _bookings = [
        Booking(
          id: 'b_active_1',
          bookingNumber: 'SC-108241',
          customerId: 'c_1',
          customer: AuthService().currentUser ??
              AppUser(
                id: 'c_1',
                firebaseUid: 'fb_c',
                displayName: 'Sagar Patil',
                phoneNumber: '+91 98765 00001',
                role: 'customer',
              ),
          workerId: 'w_1',
          worker: mockWorkerUser,
          serviceId: 'cat_elec',
          service: ServiceCategory(
            id: 'cat_elec',
            name: 'इलेक्ट्रिकल रिपेअर (Electrical)',
            slug: 'electrical',
            description: 'Wiring & switches',
            iconName: 'Zap',
            basePrice: 263,
          ),
          status: 'en_route',
          streetAddress: 'फ्लॅट ४०२, शिवनेरी, वांद्रे पश्चिम, मुंबई',
          scheduledAt: DateTime.now(),
          pricing: BookingPricing(basePrice: 263, totalAmount: 299),
        ),
        Booking(
          id: 'b_past_1',
          bookingNumber: 'SC-100234',
          customerId: 'c_1',
          customer: AuthService().currentUser ??
              AppUser(
                id: 'c_1',
                firebaseUid: 'fb_c',
                displayName: 'Sagar Patil',
                phoneNumber: '+91 98765 00001',
                role: 'customer',
              ),
          workerId: 'w_1',
          worker: mockWorkerUser,
          serviceId: 'cat_fan',
          service: ServiceCategory(
            id: 'cat_fan',
            name: 'फॅन बसवणे व वायरिंग',
            slug: 'fan_wiring',
            description: 'Fan repair & install',
            iconName: 'Fan',
            basePrice: 351,
          ),
          status: 'completed',
          streetAddress: 'फ्लॅट ४०२, शिवनेरी, वांद्रे पश्चिम, मुंबई',
          scheduledAt: DateTime.now().subtract(const Duration(days: 2)),
          pricing: BookingPricing(basePrice: 351, totalAmount: 399),
        ),
      ];
      _isLoading = false;
    });
  }

  void _handleTabSelected(int index) {
    if (index == 0) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } else if (index == 1) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerListingScreen()),
      );
    } else if (index == 3) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const ProfileScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          LocalizationService.t('my_bookings'),
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchBookings,
          color: AppColors.primaryGreen,
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primaryGreen),
                )
              : _bookings.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey.shade400),
                            const SizedBox(height: 16),
                            Text(
                              LocalizationService.t('no_bookings'),
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 15,
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      itemCount: _bookings.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 14),
                      itemBuilder: (context, index) {
                        final booking = _bookings[index];
                        final isActive = booking.status != 'completed' && booking.status != 'cancelled';

                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isActive
                                  ? AppColors.primaryGreen.withValues(alpha: 0.4)
                                  : AppColors.borderSubtle,
                              width: isActive ? 1.5 : 1.0,
                            ),
                            boxShadow: isActive ? AppTheme.elevatedShadow : AppTheme.cardShadow,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: AppColors.surfaceVariant,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          booking.bookingNumber,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isActive
                                          ? AppColors.primaryGreenSurface
                                          : Colors.grey.shade100,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      isActive ? '● ${booking.status.toUpperCase()}' : 'पूर्ण झाले (Completed)',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: isActive
                                            ? AppColors.primaryGreenDark
                                            : AppColors.textSecondary,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                booking.serviceCategory,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.person_outline_rounded, size: 16, color: AppColors.textSecondary),
                                  const SizedBox(width: 4),
                                  Text(
                                    booking.worker?.displayName ?? 'Assigned Co-op Worker',
                                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_outlined, size: 16, color: AppColors.textSecondary),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      booking.serviceAddress,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              const Divider(height: 1, color: Color(0x0F000000)),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '₹${booking.totalAmount.toInt()}',
                                        style: AppTheme.currencyStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                      const Text(
                                        '८८% थेट कामगाराला मोबदला',
                                        style: TextStyle(fontSize: 10, color: AppColors.primaryGreenDark, fontWeight: FontWeight.w600),
                                      ),
                                    ],
                                  ),
                                  if (isActive)
                                    ElevatedButton.icon(
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => LiveTrackingScreen(booking: booking),
                                          ),
                                        );
                                      },
                                      icon: const Icon(Icons.navigation_rounded, size: 16),
                                      label: const Text('थेट ट्रॅकिंग पहा (Track)'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primaryGreen,
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                      ),
                                    )
                                  else
                                    OutlinedButton(
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => RatingScreen(booking: booking),
                                          ),
                                        );
                                      },
                                      style: OutlinedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                      ),
                                      child: const Text('रेटिंग द्या / पावती'),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
        ),
      ),
      bottomNavigationBar: CustomerBottomNavBar(
        currentIndex: _currentTabIndex,
        onTap: _handleTabSelected,
      ),
    );
  }
}
