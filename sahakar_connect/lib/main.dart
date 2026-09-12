import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'config/theme.dart';
import 'services/localization_service.dart';
import 'screens/shared/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SahakarConnectApp());
}

class SahakarConnectApp extends StatelessWidget {
  const SahakarConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: LocalizationService.currentLocale,
      builder: (context, localeCode, child) {
        return MaterialApp(
          title: 'SahakarConnect',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          locale: Locale(localeCode),
          supportedLocales: LocalizationService.supportedLanguages.keys.map((k) => Locale(k)),
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: const SplashScreen(),
        );
      },
    );
  }
}
