import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const HISTORY_KEY = '@cour_editer_history';

interface HistoryItem {
  id: string;
  originalName: string;
  generatedName: string;
  date: string;
  downloadUrl: string;
  rows: number;
  cols: number;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (data) {
        setHistory(JSON.parse(data));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const downloadItem = async (item: HistoryItem) => {
    setDownloadingId(item.id);
    try {
      const fileUri = FileSystem.documentDirectory + item.generatedName;
      const downloadRes = await FileSystem.downloadAsync(item.downloadUrl, fileUri);
      
      if (downloadRes.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          Alert.alert('نجاح', 'تم تحميل الملف');
        }
      } else {
        Alert.alert('خطأ', 'فشل تحميل الملف. ربما انتهت صلاحية الرابط على السيرفر.');
      }
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء التحميل');
    } finally {
      setDownloadingId(null);
    }
  };

  const deleteItem = async (id: string) => {
    Alert.alert(
      'حذف',
      'هل تريد حذف هذا الملف من السجل؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: async () => {
            const updated = history.filter(item => item.id !== id);
            setHistory(updated);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="document-text" size={30} color={COLORS.primaryLight} />
        <View style={styles.cardInfo}>
          <Text style={styles.fileName} numberOfLines={1}>{item.originalName}</Text>
          <Text style={styles.fileDate}>{new Date(item.date).toLocaleDateString('ar-EG')}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteItem(item.id)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailBadge}>
          <Text style={styles.detailText}>{item.rows} صفوف</Text>
        </View>
        <View style={styles.detailBadge}>
          <Text style={styles.detailText}>{item.cols} أعمدة</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.downloadBtn} 
        onPress={() => downloadItem(item)}
        disabled={!!downloadingId}
      >
        {downloadingId === item.id ? (
          <ActivityIndicator color={COLORS.textPrimary} size="small" />
        ) : (
          <>
            <Ionicons name="download-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.downloadBtnText}>تحميل / مشاركة</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>سجل الملفات</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={80} color={COLORS.borderLight} />
            <Text style={styles.emptyTitle}>السجل فارغ</Text>
            <Text style={styles.emptySubtitle}>
              الملفات التي تقوم بإنشائها ستظهر هنا لسهولة الوصول إليها لاحقاً.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  fileName: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  fileDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  cardDetails: {
    flexDirection: 'row-reverse',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  detailText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  downloadBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  downloadBtnText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
