import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';
import '../../services/api_service.dart';
import 'rating_screen.dart';

class PaymentScreen extends StatefulWidget {
  final Booking booking;

  const PaymentScreen({super.key, required this.booking});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedMethod = 'razorpay'; // 'razorpay' or 'cash'
  bool _isProcessing = false;

  void _handlePayment() async {
    setState(() => _isProcessing = true);

    try {
      await ApiService().confirmPayment(
        bookingId: widget.booking.id,
        method: _selectedMethod,
        razorpayPaymentId: _selectedMethod == 'razorpay' ? 'pay_mock_${DateTime.now().millisecondsSinceEpoch}' : null,
      );

      if (!mounted) return;

      // Navigate to Rating screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => RatingScreen(booking: widget.booking),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('पेमेंट त्रुटी: $e')),
      );
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.booking.pricing.totalAmount;
    final workerDirect = total * 0.88;
    final society = total * 0.05;
    final platform = total * 0.04;
    final welfare = total * 0.03;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('पेमेंट आणि सहकारी विभाजन', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 17)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Total Amount Header Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primaryGreen, AppColors.primaryGreenDark],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: AppTheme.elevatedShadow,
                ),
                child: Column(
                  children: [
                    const Text(
                      'देय एकूण रक्कम / Total Payable',
                      style: TextStyle(fontSize: 13, color: Colors.white70, fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '₹${total.toInt()}',
                      style: AppTheme.currencyStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.16),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        '८८% थेट कामगाराच्या बँक खात्यात',
                        style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 88/5/4/3 Visual Breakdown Card
              const Text(
                '📊 ८८/५/४/३ सहकारी पारदर्शक विभाजन',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 10),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Column(
                  children: [
                    _buildSplitItem('👷 कामगार थेट मोबदला (88%)', workerDirect, 0.88, AppColors.primaryGreen),
                    const SizedBox(height: 12),
                    _buildSplitItem('🏛️ जिल्हा सहकारी संस्था (5%)', society, 0.05, AppColors.blueBadge),
                    const SizedBox(height: 12),
                    _buildSplitItem('⚙️ तंत्रज्ञान व प्लॅटफॉर्म (4%)', platform, 0.04, AppColors.saffron),
                    const SizedBox(height: 12),
                    _buildSplitItem('🛡️ कामगार कल्याण व विमा निधी (3%)', welfare, 0.03, AppColors.starGold),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Payment Method Selection
              const Text(
                '💳 पेमेंट पद्धत निवडा / Select Method',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 10),

              _buildPaymentOption(
                key: 'razorpay',
                title: 'ऑनलाइन पेमेंट (UPI, Cards, NetBanking)',
                subtitle: 'Razorpay सुरक्षित गेटवे',
                icon: Icons.account_balance_wallet_rounded,
              ),

              const SizedBox(height: 10),

              _buildPaymentOption(
                key: 'cash',
                title: 'रोख रक्कम (Cash on Delivery - COD)',
                subtitle: 'काम पूर्ण झाल्यावर कामगाराला थेट रोख द्या',
                icon: Icons.payments_rounded,
              ),

              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: _isProcessing ? null : _handlePayment,
                child: _isProcessing
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('₹${total.toInt()} पेमेंट करा व पूर्ण करा'),
                          const SizedBox(width: 8),
                          const Icon(Icons.check_circle_rounded, size: 20),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSplitItem(String title, double amount, double pct, Color barColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            Text(
              '₹${amount.toStringAsFixed(1)}',
              style: AppTheme.currencyStyle(fontSize: 14, fontWeight: FontWeight.w700, color: barColor),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: pct,
            backgroundColor: Colors.grey.shade100,
            valueColor: AlwaysStoppedAnimation<Color>(barColor),
            minHeight: 6,
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentOption({
    required String key,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _selectedMethod == key;

    return InkWell(
      onTap: () => setState(() => _selectedMethod = key),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGreenSurface : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primaryGreen : AppColors.borderSubtle,
            width: isSelected ? 1.8 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppColors.primaryGreenDark : AppColors.textSecondary, size: 24),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? AppColors.primaryGreenDark : AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: AppColors.primaryGreen),
          ],
        ),
      ),
    );
  }
}
