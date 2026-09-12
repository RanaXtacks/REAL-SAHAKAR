import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../services/socket_service.dart';
import '../../services/auth_service.dart';
import 'active_job_screen.dart';

class OfferModal extends StatefulWidget {
  final Map<String, dynamic> offerData;

  const OfferModal({super.key, required this.offerData});

  @override
  State<OfferModal> createState() => _OfferModalState();
}

class _OfferModalState extends State<OfferModal> {
  int _secondsLeft = 45;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft > 0) {
        if (mounted) setState(() => _secondsLeft--);
      } else {
        _timer?.cancel();
        _handleDecline(reason: 'Time expired');
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _handleAccept() {
    _timer?.cancel();
    final bookingId = widget.offerData['bookingId'] ?? widget.offerData['_id'] ?? 'b_1';
    final worker = AuthService().currentUser;

    SocketService().acceptOffer(bookingId, worker?.id ?? 'w_1');

    Navigator.pop(context);
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ActiveJobScreen(
          bookingId: bookingId,
          bookingNumber: widget.offerData['bookingNumber'] ?? 'SC-100234',
          serviceName: widget.offerData['serviceName'] ?? 'इलेक्ट्रिकल रिपेअर (Electrical Repairs)',
          customerName: widget.offerData['customerName'] ?? 'सागर पाटील (Sagar Patil)',
          customerPhone: widget.offerData['customerPhone'] ?? '+91 98765 00001',
          address: widget.offerData['streetAddress'] ?? 'फ्लॅट ४०२, शिवनेरी, वांद्रे पश्चिम',
          totalPayout: (widget.offerData['netPayout'] as num?)?.toDouble() ?? 263.0,
        ),
      ),
    );
  }

  void _handleDecline({String? reason}) {
    _timer?.cancel();
    final bookingId = widget.offerData['bookingId'] ?? widget.offerData['_id'] ?? 'b_1';
    final worker = AuthService().currentUser;

    SocketService().rejectOffer(bookingId, worker?.id ?? 'w_1', reason: reason);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final serviceName = widget.offerData['serviceName'] ?? 'इलेक्ट्रिकल रिपेअर (Electrical Repairs)';
    final address = widget.offerData['streetAddress'] ?? 'फ्लॅट ४०२, शिवनेरी, वांद्रे पश्चिम';
    final distance = widget.offerData['distanceKm'] ?? '1.8';
    final netPayout = (widget.offerData['netPayout'] as num?)?.toDouble() ?? 263.0;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppColors.saffron.withOpacity(0.4), width: 1.5),
          boxShadow: AppTheme.saffronGlow,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header: Urgent Alert Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.saffronLight,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.saffronDark.withOpacity(0.3)),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.bolt_rounded, size: 16, color: AppColors.saffronDark),
                  SizedBox(width: 4),
                  Text(
                    'नवीन सेवा ऑफर आली आहे!',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AppColors.saffronDark,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // 45-Second Radial Countdown Progress Ring
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 90,
                  height: 90,
                  child: CircularProgressIndicator(
                    value: _secondsLeft / 45.0,
                    strokeWidth: 6,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      _secondsLeft > 15 ? AppColors.saffron : AppColors.error,
                    ),
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '$_secondsLeft',
                      style: AppTheme.currencyStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: _secondsLeft > 15 ? AppColors.textPrimary : AppColors.error,
                      ),
                    ),
                    const Text(
                      'सेकंद',
                      style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Service & Address Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.handyman_rounded, color: AppColors.primaryGreen, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          serviceName,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on_rounded, color: AppColors.textSecondary, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '$address ($distance किमी अंतर)',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Payout Guarantee
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.primaryGreenSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primaryGreen.withOpacity(0.2)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'हमी दिलेली निव्वळ कमाई (88%):',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryGreenDark),
                  ),
                  Text(
                    '₹${netPayout.toInt()}',
                    style: AppTheme.currencyStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: AppColors.primaryGreenDark,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Accept & Decline Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _handleDecline(reason: 'Rejected by worker'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error, width: 1.5),
                    ),
                    child: const Text('नकार द्या (Decline)'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _handleAccept,
                    child: const Text('स्वीकारा (Accept)'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ).animate().scale(duration: 250.ms, curve: Curves.easeOutBack);
  }
}
