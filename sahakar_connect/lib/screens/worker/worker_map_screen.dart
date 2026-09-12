import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../config/theme.dart';
import '../../services/location_service.dart';
import '../../services/localization_service.dart';
import '../../widgets/worker_bottom_nav.dart';
import 'worker_dashboard_screen.dart';
import 'worker_jobs_screen.dart';
import 'worker_profile_screen.dart';

class WorkerMapScreen extends StatefulWidget {
  const WorkerMapScreen({super.key});

  @override
  State<WorkerMapScreen> createState() => _WorkerMapScreenState();
}

class _WorkerMapScreenState extends State<WorkerMapScreen> {
  final int _currentTabIndex = 2; // Map tab
  late MapController _mapController;
  LatLng _workerPosition = LocationService.defaultLocation;
  double _selectedRadiusKm = 3.0;
  Map<String, dynamic>? _selectedHotspot;

  // Nearby demand hotspots (spatial clusters)
  final List<Map<String, dynamic>> _demandHotspots = [
    {
      'id': 'd_1',
      'name': 'वांद्रे पश्चिम (Bandra West Co-op)',
      'skill': 'इलेक्ट्रिकल व वायरिंग (Electrical)',
      'requestsCount': 18,
      'avgPayout': '₹३२०',
      'position': const LatLng(19.0596, 72.8360),
    },
    {
      'id': 'd_2',
      'name': 'खार पश्चिम (Khar West)',
      'skill': 'प्लंबिंग व पाईप फिटिंग (Plumbing)',
      'requestsCount': 12,
      'avgPayout': '₹३८०',
      'position': const LatLng(19.0680, 72.8420),
    },
    {
      'id': 'd_3',
      'name': 'सांताक्रूझ पश्चिम (Santacruz)',
      'skill': 'सुतारकाम व फर्निचर (Carpentry)',
      'requestsCount': 15,
      'avgPayout': '₹४५०',
      'position': const LatLng(19.0820, 72.8390),
    },
    {
      'id': 'd_4',
      'name': 'बीकेसी कॉम्प्लेक्स (BKC Business Hub)',
      'skill': 'सफाई व स्वच्छता (Deep Cleaning)',
      'requestsCount': 24,
      'avgPayout': '₹५२०',
      'position': const LatLng(19.0650, 72.8777),
    },
  ];

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _determinePosition();
  }

  Future<void> _determinePosition() async {
    final pos = await LocationService().getCurrentPosition();
    if (mounted) {
      setState(() {
        _workerPosition = pos;
      });
      _mapController.move(pos, 14.5);
    }
  }

  void _handleTabSelected(int index) {
    if (index == 0) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerDashboardScreen()),
      );
    } else if (index == 1) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerJobsScreen()),
      );
    } else if (index == 3) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WorkerProfileScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          LocalizationService.t('map_view'),
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh Demand',
            onPressed: _determinePosition,
          ),
        ],
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // 1. OpenStreetMap
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _workerPosition,
                initialZoom: 14.2,
                onTap: (tapPosition, point) {
                  setState(() => _selectedHotspot = null);
                },
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.sahakar.sahakar_connect',
                ),
                MarkerLayer(
                  markers: [
                    // Worker's Own Live Position Marker
                    Marker(
                      point: _workerPosition,
                      width: 52,
                      height: 52,
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3.5),
                          boxShadow: AppTheme.elevatedShadow,
                        ),
                        child: const Icon(Icons.engineering_rounded, color: Colors.white, size: 28),
                      ),
                    ),

                    // Demand Hotspots Markers
                    ..._demandHotspots.map((hotspot) {
                      final isSelected = _selectedHotspot?['id'] == hotspot['id'];
                      return Marker(
                        point: hotspot['position'] as LatLng,
                        width: isSelected ? 56 : 46,
                        height: isSelected ? 56 : 46,
                        child: GestureDetector(
                          onTap: () {
                            setState(() => _selectedHotspot = hotspot);
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.saffronDark : AppColors.saffron,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 3),
                              boxShadow: AppTheme.cardShadow,
                            ),
                            child: Center(
                              child: Text(
                                '${hotspot['requestsCount']}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ],
            ),

            // 2. Top Radius Filter Chips
            Positioned(
              top: 12,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: AppTheme.cardShadow,
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      LocalizationService.t('filter_radius'),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    Row(
                      children: [1.0, 3.0, 5.0, 10.0].map((radius) {
                        final isSel = _selectedRadiusKm == radius;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedRadiusKm = radius),
                          child: Container(
                            margin: const EdgeInsets.only(left: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isSel ? AppColors.primaryGreen : AppColors.surfaceVariant,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '${radius.toInt()} किमी',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: isSel ? FontWeight.w800 : FontWeight.w500,
                                color: isSel ? Colors.white : AppColors.textPrimary,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),

            // 3. Floating Re-center Action Button
            Positioned(
              right: 16,
              bottom: _selectedHotspot != null ? 180 : 24,
              child: FloatingActionButton.small(
                heroTag: 'recenter_worker_map',
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primaryGreen,
                onPressed: () {
                  _mapController.move(_workerPosition, 15.0);
                },
                child: const Icon(Icons.my_location_rounded),
              ),
            ),

            // 4. Hotspot Details Bottom Card (if tapped)
            if (_selectedHotspot != null)
              Positioned(
                bottom: 16,
                left: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.saffron, width: 1.5),
                    boxShadow: AppTheme.elevatedShadow,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: AppColors.saffronLight,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.local_fire_department_rounded, color: AppColors.saffronDark, size: 20),
                              ),
                              const SizedBox(width: 10),
                              Text(
                                _selectedHotspot!['name'],
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                              ),
                            ],
                          ),
                          IconButton(
                            icon: const Icon(Icons.close_rounded, size: 20),
                            onPressed: () => setState(() => _selectedHotspot = null),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _selectedHotspot!['skill'],
                        style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${_selectedHotspot!['requestsCount']} प्रलंबित मागण्या (Requests)',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                          ),
                          Text(
                            'सरासरी: ${_selectedHotspot!['avgPayout']}',
                            style: AppTheme.currencyStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primaryGreenDark),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
      bottomNavigationBar: WorkerBottomNavBar(
        currentIndex: _currentTabIndex,
        onTap: _handleTabSelected,
      ),
    );
  }
}
