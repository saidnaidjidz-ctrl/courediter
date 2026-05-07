import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../constants/theme';
import { ENDPOINTS } from '../config/api';

const HISTORY_KEY = '@cour_editer_history';

export default function HomeScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(2);
  const [borderThickness, setBorderThickness] = useState(0.7);
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string | null>(null);

  const resetSettings = () => {
    setFile(null);
    setRows(3);
    setCols(2);
    setBorderThickness(0.7);
    setCustomName('');
    setResultUrl(null);
    setResultFilename(null);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
        setResultUrl(null);
        setResultFilename(null);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const generateGrid = async () => {
    if (!file) {
      Alert.alert('خطأ', 'يرجى اختيار ملف PDF أولاً');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf'
      } as any);
      formData.append('rows', rows.toString());
      formData.append('cols', cols.toString());
      formData.append('borderThickness', borderThickness.toString());
      if (customName.trim()) {
        formData.append('customName', customName.trim());
      }

      const response = await fetch(ENDPOINTS.generate, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Content-Type is set automatically by fetch when using FormData
        },
      });

      const data = await response.json();
      if (data.success) {
        setResultUrl(ENDPOINTS.download(data.filename));
        setResultFilename(data.filename);
        
        // Save to history
        const newHistoryItem = {
          id: Date.now().toString(),
          originalName: file.name,
          generatedName: data.filename,
          date: new Date().toISOString(),
          downloadUrl: ENDPOINTS.download(data.filename),
          rows,
          cols
        };
        
        try {
          const existingHistory = await AsyncStorage.getItem(HISTORY_KEY);
          const history = existingHistory ? JSON.parse(existingHistory) : [];
          const updatedHistory = [newHistoryItem, ...history].slice(0, 50); // Keep last 50
          await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (e) {
          console.error("Error saving history:", e);
        }

        Alert.alert('نجاح', 'تم إنشاء الشبكة بنجاح!');
      } else {
        const errorMsg = data.error || data.detail || 'حدث خطأ غير معروف';
        Alert.alert('خطأ', typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (error) {
      console.error('Error generating grid:', error);
      Alert.alert('خطأ الاتصال', 'لا يمكن الاتصال بالخادم. تأكد من أن الخادم يعمل.');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async () => {
    if (!resultUrl || !resultFilename) return;

    setLoading(true);
    try {
      const fileUri = FileSystem.documentDirectory + resultFilename;
      const downloadRes = await FileSystem.downloadAsync(resultUrl, fileUri);
      
      if (downloadRes.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          Alert.alert('نجاح', 'تم تحميل الملف إلى: ' + downloadRes.uri);
        }
      } else {
        Alert.alert('خطأ', 'فشل تحميل الملف');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الملف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={resetSettings} style={styles.resetButton}>
            <Ionicons name="refresh" size={24} color={COLORS.error} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cour Editer</Text>
        </View>
        <Text style={styles.headerSubtitle}>صانع شبكات PDF السريع</Text>
      </View>

      <TouchableOpacity 
        style={[styles.uploadCard, file && styles.uploadCardActive]} 
        onPress={pickDocument}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={file ? "document-text" : "cloud-upload"} 
          size={48} 
          color={file ? COLORS.primaryLight : COLORS.textMuted} 
        />
        <Text style={[styles.uploadText, file && styles.uploadTextActive]}>
          {file ? file.name : 'انقر لاختيار ملف PDF'}
        </Text>
        {file && (
          <Text style={styles.fileSize}>
            {((file.size || 0) / 1024 / 1024).toFixed(2)} MB
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>تخصيص الملف</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>اسم الملف (اختياري)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="مثال: ملخص الدرس"
            placeholderTextColor={COLORS.textMuted}
            value={customName}
            onChangeText={setCustomName}
            textAlign="right"
          />
        </View>
      </View>

      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>الإعدادات</Text>
        
        {/* Rows */}
        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>الصفوف (Rows)</Text>
            <Text style={styles.settingValue}>{rows}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={rows}
            onValueChange={setRows}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primaryLight}
          />
        </View>

        {/* Cols */}
        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>الأعمدة (Cols)</Text>
            <Text style={styles.settingValue}>{cols}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={cols}
            onValueChange={setCols}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primaryLight}
          />
        </View>

        {/* Border Thickness */}
        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>سمك الإطار (Border)</Text>
            <Text style={styles.settingValue}>{borderThickness.toFixed(1)} pt</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5}
            step={0.1}
            value={borderThickness}
            onValueChange={setBorderThickness}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primaryLight}
          />
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {resultUrl ? (
          <TouchableOpacity 
            style={[styles.button, styles.downloadButton]} 
            onPress={downloadFile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <>
                <Ionicons name="download" size={24} color={COLORS.textPrimary} />
                <Text style={styles.buttonText}>تحميل / مشاركة PDF</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, (!file || loading) && styles.buttonDisabled]} 
            onPress={generateGrid}
            disabled={!file || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <>
                <Ionicons name="color-wand" size={24} color={COLORS.textPrimary} />
                <Text style={styles.buttonText}>توليد الشبكة</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  resetButton: {
    position: 'absolute',
    left: 0,
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  uploadCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: SPACING.xl,
    minHeight: 200,
  },
  uploadCardActive: {
    borderColor: COLORS.primaryLight,
    borderStyle: 'solid',
    backgroundColor: COLORS.surfaceLight,
  },
  uploadText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  uploadTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  fileSize: {
    marginTop: SPACING.xs,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  settingsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingItem: {
    marginBottom: SPACING.lg,
  },
  settingHeader: {
    flexDirection: 'row-reverse', // Arabic layout
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  settingLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  settingValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.primaryLight,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  actionsContainer: {
    marginTop: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.purple,
  },
  downloadButton: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    marginLeft: SPACING.sm, // since it's english icons left, text right
  },
});
