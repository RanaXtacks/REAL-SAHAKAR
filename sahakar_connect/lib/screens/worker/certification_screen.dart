import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/localization_service.dart';

class CertificationScreen extends StatefulWidget {
  const CertificationScreen({super.key});

  @override
  State<CertificationScreen> createState() => _CertificationScreenState();
}

class _CertificationScreenState extends State<CertificationScreen> {
  final TextEditingController _aadhaarController = TextEditingController(text: '7842 9012 3456');
  final TextEditingController _certNumberController = TextEditingController(text: 'MH-ITI-ELEC-2018-4902');
  String _selectedTrade = 'इलेक्ट्रिकल व वायरिंग (Electrical)';
  bool _isSubmitting = false;

  @override
  void dispose() {
    _aadhaarController.dispose();
    _certNumberController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        title: const Row(
          children: [
            Icon(Icons.verified_rounded, color: AppColors.primaryGreen, size: 28),
            SizedBox(width: 10),
            Text('पडताळणी यशस्वी!', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
          ],
        ),
        content: const Text(
          'आपले आधार, फेस कार्ड आणि कौशल्य प्रमाणपत्र जिल्हा सहकारी समितीकडे यशस्वीरीत्या सादर झाले आहे. आपली निष्पक्षता मानांकन १००% सक्रिय आहे.',
          style: TextStyle(fontSize: 14, height: 1.4),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGreen),
            child: const Text('समजले (OK)'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          LocalizationService.t('certification_title'),
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Trust Banner
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primaryGreen, AppColors.primaryGreenDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shield_rounded, color: AppColors.saffronLight, size: 28),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '१००% कामगार निष्पक्षता व पारदर्शकता',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'आधार आणि फेस कार्ड पडताळणीमुळे बोगस कामगारांना आळा बसतो व थेट मोबदला मिळतो.',
                            style: TextStyle(color: Colors.white70, fontSize: 11, height: 1.3),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // SECTION 1: TRADE & SKILL CERTIFICATES
              _buildSectionHeader(
                icon: Icons.workspace_premium_rounded,
                title: LocalizationService.t('trade_cert_title'),
                subtitle: LocalizationService.t('trade_cert_desc'),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('व्यवसाय श्रेणी (Trade Skill)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedTrade,
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: [
                        'इलेक्ट्रिकल व वायरिंग (Electrical)',
                        'प्लंबिंग व ड्रेनेज (Plumbing)',
                        'सुतारकाम व फर्निचर (Carpentry)',
                        'रंगकाम व पॉलिश (Painting)',
                        'घरगुती उपकरण दुरुस्ती (Appliance)',
                      ].map((trade) => DropdownMenuItem(value: trade, child: Text(trade, style: const TextStyle(fontSize: 13)))).toList(),
                      onChanged: (val) => setState(() => _selectedTrade = val!),
                    ),
                    const SizedBox(height: 14),
                    const Text('प्रमाणपत्र क्रमांक (Certificate / License No.)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _certNumberController,
                      decoration: InputDecoration(
                        hintText: 'उदा. ITI-1029481',
                        prefixIcon: const Icon(Icons.badge_outlined, color: AppColors.primaryGreen),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 14),
                    // Certificate File Upload Card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreenSurface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.picture_as_pdf_rounded, color: AppColors.primaryGreenDark, size: 28),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'ITI_National_Trade_Certificate.pdf',
                                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                ),
                                Text(
                                  '२.४ MB • शासकीय कौशल्य परिषद प्रमाणित',
                                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.primaryGreen,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('जोडले', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // SECTION 2: AADHAAR CARD VERIFICATION
              _buildSectionHeader(
                icon: Icons.credit_card_rounded,
                title: LocalizationService.t('aadhaar_verification'),
                subtitle: LocalizationService.t('aadhaar_desc'),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('१२ अंकी आधार क्रमांक (12-Digit Aadhaar)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _aadhaarController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(Icons.fingerprint_rounded, color: AppColors.primaryGreen),
                        suffixIcon: const Icon(Icons.check_circle_rounded, color: AppColors.success),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.verified_rounded, size: 16, color: AppColors.success),
                        const SizedBox(width: 6),
                        Text(
                          'UIDAI द्वारे आधार पडताळणी पूर्ण (Aadhaar Verified)',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.green.shade800),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // SECTION 3: WORKER FACE CARD & FAIRNESS CHECK
              _buildSectionHeader(
                icon: Icons.face_retouching_natural_rounded,
                title: LocalizationService.t('face_card_title'),
                subtitle: LocalizationService.t('face_card_desc'),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.primaryGreen, width: 1.5),
                  boxShadow: AppTheme.elevatedShadow,
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        // Live Worker Face Card Photo Avatar
                        Container(
                          width: 80,
                          height: 90,
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.primaryGreen, width: 2),
                            boxShadow: AppTheme.cardShadow,
                          ),
                          child: const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.face_rounded, size: 48, color: AppColors.primaryGreenDark),
                              SizedBox(height: 2),
                              Text(
                                'LIVE ID',
                                style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppColors.primaryGreenDark),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.primaryGreenSurface,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text(
                                      '९८.४% आधार चेहरा जुळणी',
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.primaryGreenDark),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'रमेश शामराव पाटील',
                                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                'बायोमेट्रिक सत्यता तपासणी उत्तीर्ण (Biometric Match Passed)',
                                style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Divider(height: 1, color: Color(0x0F000000)),
                    const SizedBox(height: 12),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'सहकारी निष्पक्षता रेटिंग:',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        Text(
                          '१००% सर्वोच्च प्राधान्य (Fair Rotation)',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.primaryGreenDark),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // SUBMISSION BUTTON
              ElevatedButton(
                onPressed: _isSubmitting ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: const StadiumBorder(),
                ),
                child: _isSubmitting
                    ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : Text(
                        LocalizationService.t('submit_verification'),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                      ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primaryGreenSurface,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.primaryGreenDark, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
        ),
      ],
    );
  }
}
