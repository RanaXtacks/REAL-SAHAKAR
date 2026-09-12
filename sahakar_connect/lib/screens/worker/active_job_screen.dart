import 'dart:async';
import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/socket_service.dart';
import '../../services/auth_service.dart';

class ActiveJobScreen extends StatefulWidget {
  final String bookingId;
  final String bookingNumber;
  final String serviceName;
  final String customerName;
  final String customerPhone;
  final String address;
  final double totalPayout;

  const ActiveJobScreen({
    super.key,
    required this.bookingId,
    required this.bookingNumber,
    required this.serviceName,
    required this.customerName,
    required this.customerPhone,
    required this.address,
    required this.totalPayout,
  });

  @override
  State<ActiveJobScreen> createState() => _ActiveJobScreenState();
}

class _ActiveJobScreenState extends State<ActiveJobScreen> {
  String _currentMilestone = 'accepted'; // accepted, en_route, arrived, in_progress, completed
  Timer? _gpsSimulationTimer;
  double _lat = 19.0760;
  double _lng = 72.8777;

  @override
  void dispose() {
    _gpsSimulationTimer?.cancel();
    super.dispose();
  }

  void _startGpsStreaming() {
    _gpsSimulationTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      _lat += 0.0003;
      _lng += 0.0003;

      final worker = AuthService().currentUser;
      SocketService().updateWorkerLocation(
        bookingId: widget.bookingId,
        workerId: worker?.id ?? 'w_1',
        latitude: _lat,
        longitude: _lng,
      );
    });
  }

  void _advanceMilestone(String nextStatus) {
    setState(() => _currentMilestone = nextStatus);

    SocketService().updateJobStatus(
      bookingId: widget.bookingId,
      status: nextStatus,
    );

    if (nextStatus == 'en_route') {
      _startGpsStreaming();
    } else if (nextStatus == 'arrived' || nextStatus == 'completed') {
      _gpsSimulationTimer?.cancel();
    }

    if (nextStatus == 'completed') {
      _showCompletionDialog();
    }
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('🎉 काम यशस्वीरीत्या पूर्ण झाले!'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('आपली ८८% थेट कमाई: ₹${widget.totalPayout.toInt()}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primaryGreenDark)),
              const SizedBox(height: 8),
              const Text('रक्कम थेट आपल्या सहकार बँक खात्यात जमा करण्यात येईल.'),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              child: const Text('डॅशबोर्डवर परत जा'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('सक्रिय सेवा काम (${widget.bookingNumber})'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Customer & Address Info Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          widget.serviceName,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreenSurface,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '₹${widget.totalPayout.toInt()} कमाई',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryGreenDark,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1, color: Color(0x0F000000)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.person_outline_rounded, size: 18, color: AppColors.textSecondary),
                        const SizedBox(width: 8),
                        Text(
                          widget.customerName,
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.phone_outlined, size: 18, color: AppColors.textSecondary),
                        const SizedBox(width: 8),
                        Text(
                          widget.customerPhone,
                          style: const TextStyle(fontSize: 13, color: AppColors.primaryGreenDark, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 18, color: AppColors.textSecondary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            widget.address,
                            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // Milestone Sequence Controls
              const Text(
                '📍 कामाची स्थिती अपडेट करा / Step Progress',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 14),

              _buildStepButton(
                status: 'en_route',
                label: '१. मार्गावर निघत आहे (Start Traveling)',
                icon: Icons.directions_bike_rounded,
                isCompleted: ['en_route', 'arrived', 'in_progress', 'completed'].contains(_currentMilestone),
                isNext: _currentMilestone == 'accepted',
                onTap: () => _advanceMilestone('en_route'),
              ),

              const SizedBox(height: 10),

              _buildStepButton(
                status: 'arrived',
                label: '२. स्थळी पोहोचलो (Arrived on Site)',
                icon: Icons.pin_drop_rounded,
                isCompleted: ['arrived', 'in_progress', 'completed'].contains(_currentMilestone),
                isNext: _currentMilestone == 'en_route',
                onTap: () => _advanceMilestone('arrived'),
              ),

              const SizedBox(height: 10),

              _buildStepButton(
                status: 'in_progress',
                label: '३. काम सुरू केले (Start Working)',
                icon: Icons.play_arrow_rounded,
                isCompleted: ['in_progress', 'completed'].contains(_currentMilestone),
                isNext: _currentMilestone == 'arrived',
                onTap: () => _advanceMilestone('in_progress'),
              ),

              const SizedBox(height: 10),

              _buildStepButton(
                status: 'completed',
                label: '४. काम पूर्ण झाले (Job Completed)',
                icon: Icons.check_circle_rounded,
                isCompleted: _currentMilestone == 'completed',
                isNext: _currentMilestone == 'in_progress',
                onTap: () => _advanceMilestone('completed'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepButton({
    required String status,
    required String label,
    required IconData icon,
    required bool isCompleted,
    required bool isNext,
    required VoidCallback onTap,
  }) {
    Color bg = Colors.white;
    Color border = AppColors.borderSubtle;
    Color textCol = AppColors.textPrimary;

    if (isCompleted) {
      bg = AppColors.primaryGreenSurface;
      border = AppColors.primaryGreen;
      textCol = AppColors.primaryGreenDark;
    } else if (isNext) {
      bg = AppColors.saffronLight;
      border = AppColors.saffronDark;
      textCol = AppColors.saffronDark;
    }

    return InkWell(
      onTap: isNext ? onTap : null,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: border, width: isNext ? 2 : 1),
        ),
        child: Row(
          children: [
            Icon(
              isCompleted ? Icons.check_circle_rounded : icon,
              color: isCompleted ? AppColors.primaryGreen : (isNext ? AppColors.saffronDark : AppColors.textMuted),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: (isNext || isCompleted) ? FontWeight.w700 : FontWeight.w500,
                  color: textCol,
                ),
              ),
            ),
            if (isNext)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.saffronDark,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('टॅप करा', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
          ],
        ),
      ),
    );
  }
}
