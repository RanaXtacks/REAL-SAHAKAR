import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/service_category.dart';
import '../../models/worker_profile.dart';
import '../../services/api_service.dart';
import '../../services/socket_service.dart';
import 'live_tracking_screen.dart';

class BookingFlowScreen extends StatefulWidget {
  final ServiceCategory selectedCategory;
  final WorkerProfile? preSelectedWorker;

  const BookingFlowScreen({
    super.key,
    required this.selectedCategory,
    this.preSelectedWorker,
  });

  @override
  State<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends State<BookingFlowScreen> {
  final TextEditingController _addressController = TextEditingController(text: 'Flat 402, Shivneri CHS, Bandra West');
  final TextEditingController _notesController = TextEditingController();
  final String _selectedCity = 'Mumbai';
  final String _selectedPincode = '400050';
  DateTime _scheduledDate = DateTime.now();
  TimeOfDay _scheduledTime = TimeOfDay.now();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _handleCreateBooking() async {
    if (_addressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('कृपया सेवेचा पत्ता टाका / Please enter service address')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final scheduledDateTime = DateTime(
        _scheduledDate.year,
        _scheduledDate.month,
        _scheduledDate.day,
        _scheduledTime.hour,
        _scheduledTime.minute,
      );

      final booking = await ApiService().createBooking(
        serviceId: widget.selectedCategory.id,
        streetAddress: _addressController.text.trim(),
        city: _selectedCity,
        pincode: _selectedPincode,
        scheduledAt: scheduledDateTime,
        notes: _notesController.text.trim(),
      );

      // Connect and join tracking room
      SocketService().connect();
      SocketService().joinBooking(booking.id);

      if (!mounted) return;

      // Navigate to live tracking screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => LiveTrackingScreen(booking: booking),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('बुकिंग त्रुटी: $e')),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final basePrice = widget.selectedCategory.basePrice;
    const convenienceFee = 20.0;
    final totalAmount = basePrice + convenienceFee;
    final workerDirectShare = totalAmount * 0.88;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'सेवा बुकिंग / Book Service',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Selected Service Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreenSurface,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(
                        widget.selectedCategory.iconData,
                        color: AppColors.primaryGreen,
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.selectedCategory.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            widget.selectedCategory.description,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '₹${basePrice.toInt()}',
                      style: AppTheme.currencyStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryGreenDark,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Address Input
              const Text(
                '📍 सेवेचा पत्ता / Service Address',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _addressController,
                maxLines: 2,
                decoration: const InputDecoration(
                  hintText: 'घर क्र., इमारत, रस्ता, परिसर',
                  prefixIcon: Icon(Icons.home_outlined, color: AppColors.primaryGreen),
                ),
              ),

              const SizedBox(height: 18),

              // Date & Time Picker
              const Text(
                '📅 तारीख आणि वेळ / Schedule Slot',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _scheduledDate,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 14)),
                        );
                        if (picked != null) {
                          setState(() => _scheduledDate = picked);
                        }
                      },
                      icon: const Icon(Icons.calendar_today_rounded, size: 16),
                      label: Text(
                        '${_scheduledDate.day}/${_scheduledDate.month}/${_scheduledDate.year}',
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final picked = await showTimePicker(
                          context: context,
                          initialTime: _scheduledTime,
                        );
                        if (picked != null) {
                          setState(() => _scheduledTime = picked);
                        }
                      },
                      icon: const Icon(Icons.access_time_rounded, size: 16),
                      label: Text(
                        _scheduledTime.format(context),
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 18),

              // Additional Notes
              const Text(
                '📝 विशेष सूचना / Additional Notes (Optional)',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _notesController,
                decoration: const InputDecoration(
                  hintText: 'उदा. गळती किचन बेसिनमध्ये आहे / Specific task notes',
                ),
              ),

              const SizedBox(height: 24),

              // Cooperative Split Breakdown Card (88/5/4/3)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreenSurface.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.handshake_rounded, color: AppColors.primaryGreen, size: 18),
                        SizedBox(width: 6),
                        Text(
                          'सहकारी पारदर्शक मोबदला विभाजन',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryGreenDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildSplitRow('कामगार थेट मोबदला (८८% Direct Worker)', '₹${workerDirectShare.toStringAsFixed(1)}', true),
                    _buildSplitRow('जिल्हा सहकारी संस्था निधी (५% Society)', '₹${(totalAmount * 0.05).toStringAsFixed(1)}', false),
                    _buildSplitRow('प्लॅटफॉर्म व्यवस्थापन (४% Ops)', '₹${(totalAmount * 0.04).toStringAsFixed(1)}', false),
                    _buildSplitRow('कामगार कल्याण व विमा निधी (३% Welfare)', '₹${(totalAmount * 0.03).toStringAsFixed(1)}', false),
                    const Divider(height: 16, color: Color(0x1A000000)),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'एकूण रक्कम / Total Payable:',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                        ),
                        Text(
                          '₹${totalAmount.toInt()}',
                          style: AppTheme.currencyStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primaryGreenDark,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // Confirm Booking Button
              ElevatedButton(
                onPressed: _isSubmitting ? null : _handleCreateBooking,
                child: _isSubmitting
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('बुकिंग निश्चित करा आणि कामगार शोधा'),
                          SizedBox(width: 8),
                          Icon(Icons.bolt_rounded, size: 20),
                        ],
                      ),
              ),

              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSplitRow(String label, String amount, bool isWorker) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isWorker ? FontWeight.w700 : FontWeight.w500,
              color: isWorker ? AppColors.primaryGreenDark : AppColors.textSecondary,
            ),
          ),
          Text(
            amount,
            style: AppTheme.currencyStyle(
              fontSize: 13,
              fontWeight: isWorker ? FontWeight.w800 : FontWeight.w600,
              color: isWorker ? AppColors.primaryGreenDark : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
