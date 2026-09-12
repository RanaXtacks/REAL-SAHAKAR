import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';
import 'home_screen.dart';

class RatingScreen extends StatefulWidget {
  final Booking booking;

  const RatingScreen({super.key, required this.booking});

  @override
  State<RatingScreen> createState() => _RatingScreenState();
}

class _RatingScreenState extends State<RatingScreen> {
  int _rating = 5;
  final Set<String> _selectedTags = {'वेळेवर आले', 'उत्कृष्ट काम'};
  final TextEditingController _commentController = TextEditingController();

  final List<String> _tags = [
    'वेळेवर आले (On Time)',
    'उत्कृष्ट काम (Quality Work)',
    'विनम्र स्वभाव (Polite)',
    'योग्य दर (Fair Price)',
    'स्वच्छता राखली (Cleanliness)',
  ];

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _submitRating() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('मूल्यांकन नोंदवल्याबद्दल धन्यवाद! (Rating Submitted)'),
        backgroundColor: AppColors.primaryGreen,
      ),
    );

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const HomeScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),

              // Success Icon
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.primaryGreenSurface,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.3), width: 2),
                ),
                child: const Icon(Icons.check_circle_rounded, color: AppColors.primaryGreen, size: 44),
              ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack),

              const SizedBox(height: 16),

              const Text(
                'सेवा यशस्वीरीत्या पूर्ण झाली!',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),

              const SizedBox(height: 6),

              const Text(
                'सहकारी कामगाराच्या सेवेचे मूल्यांकन करा',
                style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
              ),

              const SizedBox(height: 28),

              // Star Selector
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starNum = index + 1;
                  return IconButton(
                    onPressed: () => setState(() => _rating = starNum),
                    icon: Icon(
                      starNum <= _rating ? Icons.star_rounded : Icons.star_outline_rounded,
                      size: 40,
                      color: AppColors.starGold,
                    ),
                  );
                }),
              ),

              const SizedBox(height: 20),

              // Quick Feedback Tags
              Wrap(
                spacing: 8,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: _tags.map((tag) {
                  final isSelected = _selectedTags.contains(tag);
                  return FilterChip(
                    label: Text(tag),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedTags.add(tag);
                        } else {
                          _selectedTags.remove(tag);
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

              // Comment TextField
              TextField(
                controller: _commentController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'आपला सविस्तर अभिप्राय येथे लिहा... (Optional)',
                ),
              ),

              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: _submitRating,
                child: const Text('मूल्यांकन सबमिट करा आणि मुख्य पृष्ठावर जा'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
