---
name: sahakar-flutter-ui
description: Design system, architecture, and coding rules for SahakarConnect Flutter mobile app. Use whenever building or modifying Flutter screens for this project.
---

# SahakarConnect Flutter UI/UX Skill

## Resolved Architecture
- **Platform**: Flutter (Dart) — Android APK only
- **Backend**: Express + Socket.io + MongoDB (DO NOT rebuild)
- **App Type**: Single unified SuperApp with Customer ↔ Worker role-switching
- **State Management**: Simple StatefulWidget + setState
- **Auth**: Firebase Phone OTP
- **Maps**: OpenStreetMap / flutter_map (no API key)
- **Admin Panel**: Next.js web only (not in Flutter)
- **Repo Location**: `sahakar_flutter/` inside REAL-SAHAKAR

## Color Palette — India Cooperative Movement (Light Mode)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary Green | #1B7A4E | Headers, CTAs, active nav |
| Primary Green Light | #2D9B6A | Hover/pressed states |
| Primary Green Surface | #E8F5EE | Card tints |
| Saffron | #FF9933 | Accent, badges, notifications |
| Saffron Light | #FFF3E0 | Warning surfaces |
| Background | #FAFBFC | Page backgrounds (never raw #FFF) |
| Card | #FFFFFF | Cards with rim borders |
| Text Primary | #1A1A2E | Headings |
| Text Secondary | #6B7280 | Labels |
| Divider | rgba(0,0,0,0.06) | Borders |
| Success | #10B981 | Online/completed |
| Error | #EF4444 | Reject/error |
| Star Gold | #F59E0B | Ratings |

## UI Rules (from expect.md, adapted for light mode)
1. **Never use raw #FFFFFF backgrounds** — use #FAFBFC
2. **Card borders**: `Border.all(color: Colors.black.withOpacity(0.06), width: 1.0)`
3. **Shadows**: `blurRadius: 20–32, spreadRadius: -4, opacity: 0.04–0.08`
4. **Corner radii**: Cards = `BorderRadius.circular(24)`, Buttons = `StadiumBorder()`
5. **Currency text**: Always use `FontFeature.tabularFigures()` + FontWeight.w700
6. **Hit targets**: Minimum 48×48 dp
7. **Micro-interactions**: Use `flutter_animate` for scale/opacity triggers
8. **Progress bars**: Rounded glowing pill tracks with green/saffron glow

## Languages Supported
English, Hindi, Marathi, Tamil, Telugu, Bengali, Kannada
