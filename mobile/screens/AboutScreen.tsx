import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function AboutScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="layers" size={60} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.appName}>Cour Editer</Text>
        <Text style={styles.version}>الإصدار 1.0.0</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>عن التطبيق</Text>
        <Text style={styles.cardText}>
          تطبيق Cour Editer هو الأداة المثالية لتحويل ملفات PDF إلى تخطيط شبكي (Grid Layout) مناسب للطباعة والدراسة. يمكنك دمج عدة صفحات في صفحة A4 واحدة بسهولة.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>الميزات</Text>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          <Text style={styles.featureText}>سريع وسهل الاستخدام</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          <Text style={styles.featureText}>تحكم كامل بعدد الصفوف والأعمدة</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          <Text style={styles.featureText}>التحكم في سمك إطار الصفحات</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          <Text style={styles.featureText}>دعم الوضع الليلي المتطور</Text>
        </View>
      </View>

      <View style={styles.footerCard}>
        <View style={styles.footerGradient}>
          <Ionicons name="heart" size={32} color={COLORS.primaryLight} />
          <Text style={styles.footerTitle}>صُنع بحب وتفاني</Text>
          <Text style={styles.footerCreators}>
            من تطوير <Text style={styles.creatorName}>د. سعيد</Text> و <Text style={styles.creatorName}>د. ممون</Text>
          </Text>
          <Text style={styles.footerCopyright}>© 2024 جميع الحقوق محفوظة</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  appName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  version: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.primaryLight,
    marginBottom: SPACING.md,
    textAlign: 'right', // Arabic
  },
  cardText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'right',
  },
  featureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  footerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  footerGradient: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    padding: SPACING.xxl,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  footerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  footerCreators: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  creatorName: {
    fontWeight: '700',
    color: '#fbbf24',
  },
  footerCopyright: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
