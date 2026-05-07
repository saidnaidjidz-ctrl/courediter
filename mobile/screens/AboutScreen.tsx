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
});
