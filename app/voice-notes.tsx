import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from './data/theme';
import { VoiceNote, loadVoiceNotes, addVoiceNote, updateVoiceNote, removeVoiceNote } from './lib/storage';

// Tags for categorising voice notes
const TAGS = [
  { id: 'observation', label: 'Observation', icon: 'eye', color: '#FF8A65' },
  { id: 'progress', label: 'Progress', icon: 'trending-up', color: '#66BB6A' },
  { id: 'concern', label: 'Concern', icon: 'alert-circle', color: '#EF5350' },
  { id: 'idea', label: 'Idea', icon: 'bulb', color: '#FFA726' },
  { id: 'parent', label: 'Parent Note', icon: 'people', color: '#42A5F5' },
  { id: 'sen', label: 'SEN Note', icon: 'accessibility', color: '#AB47BC' },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month}, ${hours}:${mins}`;
  } catch {
    return '';
  }
}

export default function VoiceNotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPupilCode, setEditPupilCode] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPupilCode, setNewPupilCode] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const recordingRef = useRef<any>(null);
  const soundRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadNotes();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopPlayback();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const loadNotes = async () => {
    const loaded = await loadVoiceNotes();
    setNotes(loaded);
  };

  const startRecording = async () => {
    try {
      // Dynamic import to avoid issues on web
      const { Audio } = require('expo-av');
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone access is needed to record voice notes.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      // Fallback for web - simulate recording
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    let uri = '';
    let duration = recordingDuration;

    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        uri = recordingRef.current.getURI() || '';
        recordingRef.current = null;

        const { Audio } = require('expo-av');
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
    }

    if (duration < 1) return;

    // Show form to add details
    setNewTitle(`Note ${notes.length + 1}`);
    setNewPupilCode('');
    setNewTags([]);
    setShowNewNoteForm(true);

    // Store the URI and duration temporarily
    recordingRef.current = { uri, duration };
  };

  const saveNewNote = async () => {
    const data = recordingRef.current || { uri: '', duration: recordingDuration };
    const note = await addVoiceNote({
      title: newTitle || `Note ${notes.length + 1}`,
      uri: data.uri || 'simulated-recording',
      duration: data.duration || recordingDuration,
      pupilCode: newPupilCode || undefined,
      tags: newTags,
    });

    setNotes(prev => [note, ...prev]);
    setShowNewNoteForm(false);
    setRecordingDuration(0);
    recordingRef.current = null;
  };

  const cancelNewNote = () => {
    setShowNewNoteForm(false);
    setRecordingDuration(0);
    recordingRef.current = null;
  };

  const playNote = async (note: VoiceNote) => {
    try {
      await stopPlayback();
      if (playingId === note.id) {
        setPlayingId(null);
        return;
      }

      if (!note.uri || note.uri === 'simulated-recording') {
        Alert.alert('Playback', 'This recording was made in simulation mode and cannot be played back.');
        return;
      }

      const { Audio } = require('expo-av');
      const { sound } = await Audio.Sound.createAsync({ uri: note.uri });
      soundRef.current = sound;
      setPlayingId(note.id);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });

      await sound.playAsync();
    } catch (err) {
      console.error('Playback error:', err);
      setPlayingId(null);
    }
  };

  const stopPlayback = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (err) {
      // Ignore
    }
    setPlayingId(null);
  };

  const deleteNote = (note: VoiceNote) => {
    Alert.alert(
      'Delete Voice Note',
      `Delete "${note.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeVoiceNote(note.id);
            setNotes(prev => prev.filter(n => n.id !== note.id));
          },
        },
      ]
    );
  };

  const startEdit = (note: VoiceNote) => {
    setEditingNote(note.id);
    setEditTitle(note.title);
    setEditPupilCode(note.pupilCode || '');
    setEditTags(note.tags);
  };

  const saveEdit = async () => {
    if (!editingNote) return;
    await updateVoiceNote(editingNote, {
      title: editTitle,
      pupilCode: editPupilCode || undefined,
      tags: editTags,
    });
    setNotes(prev => prev.map(n =>
      n.id === editingNote
        ? { ...n, title: editTitle, pupilCode: editPupilCode || undefined, tags: editTags }
        : n
    ));
    setEditingNote(null);
  };

  const toggleTag = (tagId: string, target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
    } else {
      setEditTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
    }
  };

  const filteredNotes = filterTag
    ? notes.filter(n => n.tags.includes(filterTag))
    : notes;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Voice Notes</Text>
          <Text style={styles.headerSub}>{notes.length} recording{notes.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="mic" size={20} color={COLORS.error} />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={18} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Record quick observations during lessons. Tag notes by pupil or category for easy reference later.
          </Text>
        </View>

        {/* Recording Section */}
        <View style={styles.recordSection}>
          {!isRecording && !showNewNoteForm ? (
            <TouchableOpacity
              style={styles.recordBtn}
              onPress={startRecording}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.recordBtnInner, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="mic" size={32} color={COLORS.white} />
              </Animated.View>
              <Text style={styles.recordBtnLabel}>Tap to Record</Text>
            </TouchableOpacity>
          ) : isRecording ? (
            <View style={styles.recordingActive}>
              <Animated.View style={[styles.recordingPulse, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.recordingDot} />
              </Animated.View>
              <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
              <Text style={styles.recordingLabel}>Recording...</Text>
              <TouchableOpacity
                style={styles.stopBtn}
                onPress={stopRecording}
                activeOpacity={0.7}
              >
                <Ionicons name="stop" size={24} color={COLORS.white} />
                <Text style={styles.stopBtnText}>Stop</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* New Note Form */}
          {showNewNoteForm && (
            <View style={styles.newNoteForm}>
              <Text style={styles.formTitle}>Save Recording ({formatDuration(recordingDuration)})</Text>

              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. P3 - Calm breathing observation"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.inputLabel}>Pupil Code (optional)</Text>
              <TextInput
                style={styles.input}
                value={newPupilCode}
                onChangeText={setNewPupilCode}
                placeholder="e.g. P1, P2"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.inputLabel}>Tags</Text>
              <View style={styles.tagRow}>
                {TAGS.map(tag => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tagChip,
                      newTags.includes(tag.id) && { backgroundColor: tag.color + '20', borderColor: tag.color },
                    ]}
                    onPress={() => toggleTag(tag.id, 'new')}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={tag.icon as any}
                      size={14}
                      color={newTags.includes(tag.id) ? tag.color : COLORS.textMuted}
                    />
                    <Text style={[
                      styles.tagChipText,
                      newTags.includes(tag.id) && { color: tag.color, fontWeight: '700' },
                    ]}>
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={cancelNewNote} activeOpacity={0.7}>
                  <Text style={styles.cancelBtnText}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveNewNote} activeOpacity={0.7}>
                  <Ionicons name="checkmark" size={18} color={COLORS.white} />
                  <Text style={styles.saveBtnText}>Save Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Filter Tags */}
        {notes.length > 0 && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter by tag:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, !filterTag && styles.filterChipActive]}
                onPress={() => setFilterTag(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, !filterTag && styles.filterChipTextActive]}>
                  All ({notes.length})
                </Text>
              </TouchableOpacity>
              {TAGS.map(tag => {
                const count = notes.filter(n => n.tags.includes(tag.id)).length;
                if (count === 0) return null;
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[styles.filterChip, filterTag === tag.id && { backgroundColor: tag.color + '15', borderColor: tag.color }]}
                    onPress={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={tag.icon as any} size={14} color={filterTag === tag.id ? tag.color : COLORS.textMuted} />
                    <Text style={[styles.filterChipText, filterTag === tag.id && { color: tag.color }]}>
                      {tag.label} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Notes List */}
        {filteredNotes.length === 0 && !showNewNoteForm ? (
          <View style={styles.emptyState}>
            <Ionicons name="mic-off" size={48} color={COLORS.mediumGray} />
            <Text style={styles.emptyTitle}>
              {notes.length === 0 ? 'No voice notes yet' : 'No notes match this filter'}
            </Text>
            <Text style={styles.emptyText}>
              {notes.length === 0
                ? 'Tap the microphone button above to record your first observation.'
                : 'Try selecting a different tag filter.'}
            </Text>
          </View>
        ) : (
          <View style={styles.notesList}>
            {filteredNotes.map(note => {
              const isPlaying = playingId === note.id;
              const isEditing = editingNote === note.id;

              return (
                <View key={note.id} style={styles.noteCard}>
                  {isEditing ? (
                    <View style={styles.editForm}>
                      <TextInput
                        style={styles.editInput}
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="Title"
                        placeholderTextColor={COLORS.textMuted}
                      />
                      <TextInput
                        style={styles.editInput}
                        value={editPupilCode}
                        onChangeText={setEditPupilCode}
                        placeholder="Pupil code (optional)"
                        placeholderTextColor={COLORS.textMuted}
                      />
                      <View style={styles.tagRow}>
                        {TAGS.map(tag => (
                          <TouchableOpacity
                            key={tag.id}
                            style={[
                              styles.tagChipSmall,
                              editTags.includes(tag.id) && { backgroundColor: tag.color + '20', borderColor: tag.color },
                            ]}
                            onPress={() => toggleTag(tag.id, 'edit')}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.tagChipSmallText,
                              editTags.includes(tag.id) && { color: tag.color },
                            ]}>
                              {tag.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={styles.editActions}>
                        <TouchableOpacity onPress={() => setEditingNote(null)} style={styles.editCancelBtn}>
                          <Text style={styles.editCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={saveEdit} style={styles.editSaveBtn}>
                          <Text style={styles.editSaveText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.noteHeader}>
                        <TouchableOpacity
                          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
                          onPress={() => playNote(note)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={20}
                            color={isPlaying ? COLORS.white : COLORS.primary}
                          />
                        </TouchableOpacity>
                        <View style={styles.noteInfo}>
                          <Text style={styles.noteTitle}>{note.title}</Text>
                          <View style={styles.noteMeta}>
                            <Text style={styles.noteMetaText}>{formatDuration(note.duration)}</Text>
                            <Text style={styles.noteMetaDot}>|</Text>
                            <Text style={styles.noteMetaText}>{formatDate(note.created_at)}</Text>
                            {note.pupilCode ? (
                              <>
                                <Text style={styles.noteMetaDot}>|</Text>
                                <View style={styles.pupilBadge}>
                                  <Text style={styles.pupilBadgeText}>{note.pupilCode}</Text>
                                </View>
                              </>
                            ) : null}
                          </View>
                        </View>
                        <View style={styles.noteActions}>
                          <TouchableOpacity onPress={() => startEdit(note)} style={styles.noteActionBtn}>
                            <Ionicons name="pencil" size={16} color={COLORS.textMuted} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteNote(note)} style={styles.noteActionBtn}>
                            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      {note.tags.length > 0 && (
                        <View style={styles.noteTagRow}>
                          {note.tags.map(tagId => {
                            const tag = TAGS.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                              <View key={tagId} style={[styles.noteTag, { backgroundColor: tag.color + '15' }]}>
                                <Ionicons name={tag.icon as any} size={12} color={tag.color} />
                                <Text style={[styles.noteTagText, { color: tag.color }]}>{tag.label}</Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Quick Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
            <Text style={styles.tipText}>Record observations during free play or circle time</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
            <Text style={styles.tipText}>Use pupil codes (P1, P2) to link notes to tracker pupils</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
            <Text style={styles.tipText}>Tag notes for easy filtering and review later</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
            <Text style={styles.tipText}>All recordings are stored locally on your device</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgLight },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginTop: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.bgLight, borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  infoText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20 },
  recordSection: { marginHorizontal: SPACING.lg, marginTop: SPACING.xl, alignItems: 'center' },
  recordBtn: { alignItems: 'center', gap: SPACING.md },
  recordBtnInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.error, justifyContent: 'center', alignItems: 'center', ...SHADOWS.large },
  recordBtnLabel: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textLight },
  recordingActive: { alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.xl },
  recordingPulse: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center' },
  recordingDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.error },
  recordingTime: { fontSize: FONT_SIZES.hero, fontWeight: '800', color: COLORS.error },
  recordingLabel: { fontSize: FONT_SIZES.md, color: COLORS.textMuted },
  stopBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.error, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.round },
  stopBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
  newNoteForm: { width: '100%', backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOWS.medium },
  formTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  inputLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textLight, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: { backgroundColor: COLORS.bgLight, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.lightGray },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.round, borderWidth: 1.5, borderColor: COLORS.lightGray, backgroundColor: COLORS.white },
  tagChipText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '500' },
  tagChipSmall: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.round, borderWidth: 1, borderColor: COLORS.lightGray },
  tagChipSmallText: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  formActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
  cancelBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.bgLight, alignItems: 'center' },
  cancelBtnText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textMuted },
  saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.secondary },
  saveBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
  filterSection: { marginTop: SPACING.xl, paddingHorizontal: SPACING.lg },
  filterLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textLight, marginBottom: SPACING.sm },
  filterScroll: { flexDirection: 'row' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.round, borderWidth: 1.5, borderColor: COLORS.lightGray, backgroundColor: COLORS.white, marginRight: SPACING.sm },
  filterChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  filterChipText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.primary },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.huge, paddingHorizontal: SPACING.xl },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textLight, marginTop: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm },
  notesList: { paddingHorizontal: SPACING.lg, marginTop: SPACING.md, gap: SPACING.sm },
  noteCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.small },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary + '30' },
  playBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  noteInfo: { flex: 1 },
  noteTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  noteMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  noteMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  noteMetaDot: { fontSize: 10, color: COLORS.mediumGray },
  pupilBadge: { backgroundColor: COLORS.bgLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.sm },
  pupilBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  noteActions: { flexDirection: 'row', gap: SPACING.xs },
  noteActionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  noteTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.sm },
  noteTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm },
  noteTagText: { fontSize: 10, fontWeight: '600' },
  editForm: { gap: SPACING.sm },
  editInput: { backgroundColor: COLORS.bgLight, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.text },
  editActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  editCancelBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.bgLight, alignItems: 'center' },
  editCancelText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMuted },
  editSaveBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center' },
  editSaveText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  tipsSection: { marginHorizontal: SPACING.lg, marginTop: SPACING.xxl, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.small },
  tipsTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  tipText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20 },
});
