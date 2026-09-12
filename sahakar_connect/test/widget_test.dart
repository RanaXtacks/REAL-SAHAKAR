import 'package:flutter_test/flutter_test.dart';
import 'package:sahakar_connect/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('SahakarConnectApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SahakarConnectApp());
    expect(find.byType(SahakarConnectApp), findsOneWidget);

    // Settle all splash animations and timers
    await tester.pumpAndSettle(const Duration(seconds: 3));
  });
}
