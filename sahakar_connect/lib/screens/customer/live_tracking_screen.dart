import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';
import '../../services/socket_service.dart';
import 'payment_screen.dart';

class LiveTrackingScreen extends StatefulWidget {
  final Booking booking;

  const LiveTrackingScreen({super.key, required this.booking});

  @override
  State<LiveTrackingScreen> createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends State<LiveTrackingScreen> {
  late MapController _mapController;
  late String _currentStatus;
  LatLng _workerPosition = const LatLng(19.0760, 72.8777);
  final LatLng _customerPosition = const LatLng(19.0780, 72.8790);
  StreamSubscription? _locationSub;
  StreamSubscription? _jobStatusSub;

  final List<Map<String, String>> _milestones = [
    {'key': 'pending', 'label': 'बुकिंग नोंदवली'},
    {'key': 'accepted', 'label': 'कामगाराने स्वीकारली'},
    {'key': 'en_route', 'label': 'कामगार मार्गावर आहे'},
    {'key': 'arrived', 'label': 'कामगार पोहोचला'},
    {'key': 'in_progress', 'label': 'काम चालू आहे'},
    {'key': 'completed', 'label': 'काम पूर्ण झाले'},
  ];

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _currentStatus = widget.booking.status;

    // Listen to realtime socket events
    _locationSub = SocketService().onLocationStream.listen((data) {
      if (data['bookingId'] == widget.booking.id || data['latitude'] != null) {
        final lat = (data['latitude'] as num).toDouble();
        final lng = (data['longitude'] as num).toDouble();
        if (mounted) {
          setState(() {
            _workerPosition = LatLng(lat, lng);
          });
        }
      }
    });

    _jobStatusSub = SocketService().onJobStatusChanged.listen((data) {
      if (data['bookingId'] == widget.booking.id && data['status'] != null) {
        if (mounted) {
          setState(() {
            _currentStatus = data['status'];
          });
        }
      }
    });
  }

  @override
  void dispose() {
    _locationSub?.cancel();
    _jobStatusSub?.cancel();
    super.dispose();
  }

  int _getMilestoneIndex() {
    switch (_currentStatus) {
      case 'pending':
      case 'offered':
        return 0;
      case 'accepted':
        return 1;
      case 'en_route':
        return 2;
      case 'arrived':
        return 3;
      case 'in_progress':
        return 4;
      case 'completed':
        return 5;
      default:
        return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final milestoneIdx = _getMilestoneIndex();
    final isCompleted = _currentStatus == 'completed';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'थेट ट्रॅकिंग (${widget.booking.bookingNumber})',
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Live OpenStreetMap
            Expanded(
              flex: 5,
              child: Stack(
                children: [
                  FlutterMap(
                    mapController: _mapController,
                    options: MapOptions(
                      initialCenter: _workerPosition,
                      initialZoom: 14.5,
                    ),
                    children: [
                      TileLayer(
                        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.sahakar.connect',
                      ),
                      MarkerLayer(
                        markers: [
                          // Customer Location Marker
                          Marker(
                            point: _customerPosition,
                            width: 44,
                            height: 44,
                            child: Container(
                              decoration: BoxDecoration(
                                color: AppColors.saffron,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2.5),
                                boxShadow: AppTheme.cardShadow,
                              ),
                              child: const Icon(Icons.home_rounded, color: Colors.white, size: 22),
                            ),
                          ),
                          // Moving Worker Marker
                          Marker(
                            point: _workerPosition,
                            width: 48,
                            height: 48,
                            child: Container(
                              decoration: BoxDecoration(
                                color: AppColors.primaryGreen,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 3),
                                boxShadow: AppTheme.elevatedShadow,
                              ),
                              child: const Icon(Icons.engineering_rounded, color: Colors.white, size: 24),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Floating Re-center button
                  Positioned(
                    bottom: 16,
                    right: 16,
                    child: FloatingActionButton.small(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.primaryGreen,
                      onPressed: () {
                        _mapController.move(_workerPosition, 15.0);
                      },
                      child: const Icon(Icons.my_location_rounded),
                    ),
                  ),
                ],
              ),
            ),

            // 2. Status & Milestone Timeline Bottom Panel
            Expanded(
              flex: 6,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Worker Quick Info Card
                    Row(
                      children: [
                        const CircleAvatar(
                          radius: 22,
                          backgroundColor: AppColors.primaryGreen,
                          child: Text(
                            'RP',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'रमेश पाटील (प्रमाणित कामगार)',
                                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                              ),
                              Text(
                                'वांद्रे कामगार सहकारी संस्था',
                                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreenSurface,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _milestones[milestoneIdx]['label']!,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryGreenDark,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),
                    const Divider(height: 1, color: Color(0x0F000000)),
                    const SizedBox(height: 10),

                    // Milestone Stepper (Horizontal/Vertical)
                    Expanded(
                      child: ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        itemCount: _milestones.length,
                        itemBuilder: (context, idx) {
                          final isPastOrCurrent = idx <= milestoneIdx;
                          final isCurrent = idx == milestoneIdx;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Row(
                              children: [
                                Container(
                                  width: 22,
                                  height: 22,
                                  decoration: BoxDecoration(
                                    color: isPastOrCurrent
                                        ? AppColors.primaryGreen
                                        : Colors.grey.shade200,
                                    shape: BoxShape.circle,
                                    border: isCurrent
                                        ? Border.all(color: AppColors.saffron, width: 2)
                                        : null,
                                  ),
                                  child: isPastOrCurrent
                                      ? const Icon(Icons.check_rounded, size: 14, color: Colors.white)
                                      : null,
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  _milestones[idx]['label']!,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: isCurrent
                                        ? FontWeight.w800
                                        : isPastOrCurrent
                                            ? FontWeight.w600
                                            : FontWeight.w400,
                                    color: isCurrent
                                        ? AppColors.primaryGreenDark
                                        : isPastOrCurrent
                                            ? AppColors.textPrimary
                                            : AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),

                    // Action Button (Pay if completed, or simulation button)
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => PaymentScreen(booking: widget.booking),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isCompleted ? AppColors.primaryGreen : AppColors.saffronDark,
                      ),
                      child: Text(
                        isCompleted ? 'पैसे भरा (Proceed to Payment)' : 'पेमेंट स्क्रीनवर जा (Pay Now)',
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
