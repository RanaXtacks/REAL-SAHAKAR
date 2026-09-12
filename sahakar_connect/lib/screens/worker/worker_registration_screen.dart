import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';

class WorkerRegistrationScreen extends StatefulWidget {
  const WorkerRegistrationScreen({super.key});

  @override
  State<WorkerRegistrationScreen> createState() => _WorkerRegistrationScreenState();
}

class _WorkerRegistrationScreenState extends State<WorkerRegistrationScreen> {
  final TextEditingController _societyController = TextEditingController(text: 'वांद्रे कामगार सहकारी संस्था');
  final TextEditingController _experienceController = TextEditingController(text: '5');
  final Set<String> _selectedSkills = {'Electrical Repairs', 'Plumbing Services'};
  String _selectedCategory = 'Govt Certified';
  bool _isSubmitting = false;

  final List<String> _availableSkills = [
    'Plumbing Services (प्लंबिंग)',
    'Electrical Repairs (इलेक्ट्रिकल)',
    'Carpentry & Woodwork (सुतारकाम)',
    'Home Appliance Repair (उपकरणे)',
    'Deep Cleaning (सफाई काम)',
    'Painting (रंगकाम)',
  ];

  @override
  void dispose() {
    _societyController.dispose();
    _experienceController.dispose();
    super.dispose();
  }

  void _handleRegister() async {
    setState(() => _isSubmitting = true);

    try {
      await ApiService().syncUser(
        role: 'worker',
        skills: _selectedSkills.toList(),
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('कामगार नोंदणी यशस्वी! (Registration Successful)'),
          backgroundColor: AppColors.primaryGreen,
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('त्रुटी: $e')),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('सहकारी कामगार नोंदणी', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Banner
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primaryGreen, AppColors.primaryGreenDark],
                  ),
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: AppTheme.elevatedShadow,
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'प्रत्येक कामावर ८८% थेट मोबदला मिळवा',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'शून्य कमिशन कट, सहकारी विमा संरक्षण व थेट बँक खात्यात पैसे जमा',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Category / Society Type
              const Text('१. पात्रता श्रेणी निवडा / Registration Type', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(height: 10),

              Row(
                children: [
                  _buildCategoryRadio('Govt Certified', 'शासकीय नोंदणीकृत'),
                  const SizedBox(width: 8),
                  _buildCategoryRadio('Independent Labour', 'स्वतंत्र कामगार'),
                ],
              ),

              const SizedBox(height: 20),

              // Cooperative Society Name
              const Text('२. संलग्न सहकारी संस्था / Cooperative Union', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(height: 8),
              TextField(
                controller: _societyController,
                decoration: const InputDecoration(
                  hintText: 'उदा. वांद्रे कामगार सहकारी संस्था मर्यादित',
                ),
              ),

              const SizedBox(height: 20),

              // Skills Selection
              const Text('३. तुमची कौशल्ये निवडा / Select Skills', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(height: 10),

              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _availableSkills.map((skill) {
                  final rawSkill = skill.split(' (')[0];
                  final isSelected = _selectedSkills.contains(rawSkill);
                  return FilterChip(
                    label: Text(skill),
                    selected: isSelected,
                    onSelected: (val) {
                      setState(() {
                        if (val) {
                          _selectedSkills.add(rawSkill);
                        } else {
                          _selectedSkills.remove(rawSkill);
                        }
                      });
                    },
                    selectedColor: AppColors.primaryGreenSurface,
                    checkmarkColor: AppColors.primaryGreen,
                    backgroundColor: Colors.white,
                    labelStyle: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected ? AppColors.primaryGreenDark : AppColors.textPrimary,
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  );
                }).toList(),
              ),

              const SizedBox(height: 20),

              // Experience Years
              const Text('४. एकूण अनुभव (वर्षे) / Experience', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(height: 8),
              TextField(
                controller: _experienceController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  hintText: 'उदा. ५',
                  suffixText: 'वर्षे',
                ),
              ),

              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: _isSubmitting ? null : _handleRegister,
                child: _isSubmitting
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                      )
                    : const Text('नोंदणी पूर्ण करा (Complete Registration)'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryRadio(String key, String label) {
    final isSelected = _selectedCategory == key;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedCategory = key),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
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
              Icon(
                isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_unchecked_rounded,
                color: isSelected ? AppColors.primaryGreen : AppColors.textMuted,
                size: 18,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? AppColors.primaryGreenDark : AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
