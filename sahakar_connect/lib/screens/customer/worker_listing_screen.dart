import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../models/worker_profile.dart';
import '../../models/service_category.dart';
import '../../services/api_service.dart';
import '../../services/localization_service.dart';
import '../../widgets/worker_card.dart';
import 'booking_flow_screen.dart';

class WorkerListingScreen extends StatefulWidget {
  final String? initialCategoryFilter;

  const WorkerListingScreen({super.key, this.initialCategoryFilter});

  @override
  State<WorkerListingScreen> createState() => _WorkerListingScreenState();
}

class _WorkerListingScreenState extends State<WorkerListingScreen> {
  List<WorkerProfile> _allWorkers = [];
  List<WorkerProfile> _filteredWorkers = [];
  List<ServiceCategory> _categories = [];
  bool _isLoading = true;
  String _selectedFilter = 'all'; // 'all', 'govt', 'independent'
  String _searchQuery = '';
  String _currentRegion = AppConstants.defaultRegion;

  @override
  void initState() {
    super.initState();
    _fetchWorkers();
  }

  Future<void> _fetchWorkers() async {
    setState(() => _isLoading = true);
    try {
      final workersFuture = ApiService().getWorkers();
      final categoriesFuture = ApiService().getServiceCategories();

      final results = await Future.wait([workersFuture, categoriesFuture]);
      _allWorkers = results[0] as List<WorkerProfile>;
      _categories = results[1] as List<ServiceCategory>;

      _applyFilters();
    } catch (e) {
      // Fallback workers already in ApiService
      _allWorkers = [];
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _applyFilters() {
    List<WorkerProfile> filtered = List.from(_allWorkers);

    if (_selectedFilter == 'govt') {
      filtered = filtered.where((w) => w.societyType == 'Govt Certified').toList();
    } else if (_selectedFilter == 'independent') {
      filtered = filtered.where((w) => w.societyType == 'Independent Labour').toList();
    }

    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      filtered = filtered.where((w) {
        final matchName = w.displayName.toLowerCase().contains(q);
        final matchSkills = w.skills.any((s) => s.toLowerCase().contains(q));
        final matchSociety = w.societyName.toLowerCase().contains(q);
        return matchName || matchSkills || matchSociety;
      }).toList();
    }

    setState(() {
      _filteredWorkers = filtered;
    });
  }

  void _showChangeLocationDialog() {
    final controller = TextEditingController(text: _currentRegion);
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('स्थान बदला / Change Region'),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(
              hintText: 'उदा. दादर पश्चिम, मुंबई',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('रद्द करा'),
            ),
            ElevatedButton(
              onPressed: () {
                if (controller.text.trim().isNotEmpty) {
                  setState(() => _currentRegion = controller.text.trim());
                }
                Navigator.pop(ctx);
              },
              child: const Text('जतन करा'),
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
        title: Text(
          LocalizationService.t('workers'),
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Region Selector Card
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderSubtle),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on_rounded, color: AppColors.primaryGreen, size: 20),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'वर्तमान क्षेत्र / Current Region',
                            style: TextStyle(fontSize: 10, color: AppColors.textSecondary),
                          ),
                          Text(
                            _currentRegion,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: _showChangeLocationDialog,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      minimumSize: Size.zero,
                    ),
                    child: Text(
                      LocalizationService.t('change_location'),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 2. Search Field
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: TextField(
                onChanged: (val) {
                  _searchQuery = val;
                  _applyFilters();
                },
                decoration: InputDecoration(
                  hintText: LocalizationService.t('search_placeholder'),
                  prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textSecondary),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, size: 18),
                          onPressed: () {
                            _searchQuery = '';
                            _applyFilters();
                          },
                        )
                      : null,
                ),
              ),
            ),

            // 3. Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                children: [
                  _buildFilterChip('all', LocalizationService.t('all_providers')),
                  const SizedBox(width: 8),
                  _buildFilterChip('govt', LocalizationService.t('verified_badge')),
                  const SizedBox(width: 8),
                  _buildFilterChip('independent', LocalizationService.t('independent_labour')),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // 4. Workers List
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
                  : _filteredWorkers.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.person_search_rounded, size: 48, color: AppColors.textMuted),
                              const SizedBox(height: 12),
                              const Text(
                                'या निकषावर कामगार सापडले नाहीत',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextButton(
                                onPressed: () {
                                  setState(() {
                                    _selectedFilter = 'all';
                                    _searchQuery = '';
                                  });
                                  _applyFilters();
                                },
                                child: const Text('सर्व कामगार पहा / Reset Filters'),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: _filteredWorkers.length,
                          itemBuilder: (context, index) {
                            final worker = _filteredWorkers[index];
                            final cat = _categories.isNotEmpty
                                ? _categories.first
                                : ServiceCategory(
                                    id: 'cat_1',
                                    name: 'General Service',
                                    slug: 'general',
                                    description: 'General labor',
                                    iconName: 'Wrench',
                                    basePrice: 299,
                                  );

                            return WorkerCard(
                              worker: worker,
                              onBookTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => BookingFlowScreen(
                                      selectedCategory: cat,
                                      preSelectedWorker: worker,
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _selectedFilter == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) {
        setState(() => _selectedFilter = key);
        _applyFilters();
      },
      selectedColor: AppColors.primaryGreen,
      backgroundColor: Colors.white,
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
        color: isSelected ? Colors.white : AppColors.textPrimary,
      ),
      side: BorderSide(
        color: isSelected ? AppColors.primaryGreen : AppColors.borderSubtle,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    );
  }
}
