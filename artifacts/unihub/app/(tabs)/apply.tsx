import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import {
  APP_STATUS_CONFIG,
  APP_STATUS_ORDER,
  AppStatus,
  ApplicationEntry,
  useApplications,
} from "@/context/ApplicationsContext";
import { useUser } from "@/context/UserContext";
import { getUpcomingDeadlines } from "@/data/deadlines";
import { ALL_PROGRAMS } from "@/data/programs";
import { getUniversityById } from "@/data/universities";

const ED = {
  paper: '#f5f1e8',
  card: '#fbf8f1',
  ink: '#1a1612',
  softInk: '#5c4a2f',
  muted: '#8b7e62',
  rule: '#e8e0cf',
  pillBorder: '#d4c9b0',
  warn: '#c2410c',
  warnText: '#9a3412',
  warnBg: '#fef3e2',
  success: '#15803d',
  successText: '#14532d',
  successBg: '#ecfdf5',
};

const STATUS_ED: Record<AppStatus, { label: string; color: string; bg: string }> = {
  shortlisted: { label: 'Shortlisted', color: ED.muted,        bg: '#f0ebe0'     },
  applied:     { label: 'Submitted',   color: ED.ink,          bg: '#e8e2d4'     },
  supp_sent:   { label: 'Supp. Sent',  color: '#7c4a03',       bg: '#fef3c7'     },
  offer:       { label: 'Offer!',      color: ED.successText,  bg: ED.successBg  },
  accepted:    { label: 'Accepted ✓',  color: ED.successText,  bg: ED.successBg  },
  declined:    { label: 'Declined',    color: '#8b7e62',       bg: '#f0ebe0'     },
};

const ALL_UNIVERSITIES = [
  { id: 'uoft',         label: 'University of Toronto'           },
  { id: 'waterloo',     label: 'University of Waterloo'          },
  { id: 'western',      label: 'Western University'              },
  { id: 'mcmaster',     label: 'McMaster University'             },
  { id: 'queens',       label: "Queen's University"              },
  { id: 'ottawa',       label: 'University of Ottawa'            },
  { id: 'yorku',        label: 'York University'                 },
  { id: 'ryerson',      label: 'Toronto Metropolitan University' },
  { id: 'guelph',       label: 'University of Guelph'           },
  { id: 'carleton',     label: 'Carleton University'             },
  { id: 'windsor',      label: 'University of Windsor'           },
  { id: 'brock',        label: 'Brock University'                },
  { id: 'laurier',      label: 'Wilfrid Laurier University'      },
  { id: 'lakehead',     label: 'Lakehead University'             },
  { id: 'algoma',       label: 'Algoma University'               },
  { id: 'trent',        label: 'Trent University'                },
  { id: 'laurentian',   label: 'Laurentian University'           },
  { id: 'nipissing',    label: 'Nipissing University'            },
  { id: 'ocad',         label: 'OCAD University'                 },
  { id: 'ontario-tech', label: 'Ontario Tech University'         },
  { id: 'rmc',          label: 'Royal Military College'          },
  { id: 'hearst',       label: 'Université de Hearst'            },
  { id: 'uof',          label: "Université de l'Ontario français"},
];

function AppRow({
  entry,
  onUpdateStatus,
  onRemove,
}: {
  entry: ApplicationEntry;
  onUpdateStatus: (id: string, status: AppStatus) => void;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const uni = getUniversityById(entry.universityId);
  const status = STATUS_ED[entry.status];

  if (!uni) return null;

  return (
    <View style={styles.appRow}>
      <Pressable style={styles.appRowMain} onPress={() => setExpanded(e => !e)}>
        <View style={[styles.appUniDot, { backgroundColor: uni.color }]} />
        <View style={styles.appInfo}>
          <Text style={styles.appUniName}>{uni.shortName}</Text>
          {entry.programName ? (
            <Text style={styles.appProgramName} numberOfLines={1}>{entry.programName}</Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={ED.muted} />
      </Pressable>

      {expanded && (
        <View style={styles.appExpanded}>
          <Text style={styles.expandedLabel}>Update status</Text>
          <View style={styles.statusGrid}>
            {APP_STATUS_ORDER.map(s => {
              const cfg = STATUS_ED[s];
              const active = entry.status === s;
              return (
                <Pressable
                  key={s}
                  style={[styles.statusOption, active && styles.statusOptionActive]}
                  onPress={() => onUpdateStatus(entry.universityId, s)}
                >
                  <Text style={[styles.statusOptionText, active && styles.statusOptionTextActive]}>
                    {cfg.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable style={styles.removeBtn} onPress={() => onRemove(entry.universityId)}>
            <Feather name="trash-2" size={13} color={ED.muted} />
            <Text style={styles.removeBtnText}>Remove</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function AddApplicationModal({
  onAdd,
  onClose,
}: {
  onAdd: (uniId: string, programName: string) => void;
  onClose: () => void;
}) {
  const [uniQuery, setUniQuery] = useState('');
  const [programQuery, setProgramQuery] = useState('');
  const [selectedUniId, setSelectedUniId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [showUniSearch, setShowUniSearch] = useState(false);
  const [showProgramSearch, setShowProgramSearch] = useState(false);

  const filteredUnis = useMemo(() => {
    const q = uniQuery.trim().toLowerCase();
    if (!q) return ALL_UNIVERSITIES;
    return ALL_UNIVERSITIES.filter(u => u.label.toLowerCase().includes(q));
  }, [uniQuery]);

  const filteredPrograms = useMemo(() => {
    if (!selectedUniId) return [];
    const q = programQuery.trim().toLowerCase();
    return ALL_PROGRAMS
      .filter(p =>
        p.universityId === selectedUniId &&
        (!q || p.name.toLowerCase().includes(q))
      )
      .slice(0, 30);
  }, [selectedUniId, programQuery]);

  const selectedUniLabel = ALL_UNIVERSITIES.find(u => u.id === selectedUniId)?.label ?? '';

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add application</Text>
          <Pressable onPress={onClose}>
            <Feather name="x" size={18} color={ED.muted} />
          </Pressable>
        </View>

        {/* University search */}
        <Text style={styles.modalLabel}>University</Text>
        <Pressable
          style={[styles.searchField, showUniSearch && styles.searchFieldFocused]}
          onPress={() => { setShowUniSearch(true); setShowProgramSearch(false); }}
        >
          <Feather name="search" size={14} color={ED.muted} style={{ marginRight: 8 }} />
          {showUniSearch ? (
            <TextInput
              style={styles.searchFieldInput}
              value={uniQuery}
              onChangeText={setUniQuery}
              placeholder="Search universities…"
              placeholderTextColor={ED.muted}
              autoFocus
            />
          ) : (
            <Text style={[styles.searchFieldText, !selectedUniId && { color: ED.muted }]}>
              {selectedUniLabel || 'Select a university…'}
            </Text>
          )}
        </Pressable>
        {showUniSearch && (
          <View style={styles.dropdownBox}>
            <FlatList
              data={filteredUnis}
              keyExtractor={u => u.id}
              style={{ maxHeight: 180 }}
              keyboardShouldPersistTaps="always"
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.dropdownItem, item.id === selectedUniId && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedUniId(item.id);
                    setUniQuery('');
                    setSelectedProgram('');
                    setProgramQuery('');
                    setShowUniSearch(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, item.id === selectedUniId && styles.dropdownItemTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Program search */}
        <Text style={[styles.modalLabel, { marginTop: 12 }]}>Program (optional)</Text>
        <Pressable
          style={[styles.searchField, showProgramSearch && styles.searchFieldFocused, !selectedUniId && styles.searchFieldDisabled]}
          onPress={() => {
            if (!selectedUniId) return;
            setShowProgramSearch(true);
            setShowUniSearch(false);
          }}
        >
          <Feather name="book-open" size={14} color={ED.muted} style={{ marginRight: 8 }} />
          {showProgramSearch ? (
            <TextInput
              style={styles.searchFieldInput}
              value={programQuery}
              onChangeText={setProgramQuery}
              placeholder="Search programs…"
              placeholderTextColor={ED.muted}
              autoFocus
            />
          ) : (
            <Text style={[styles.searchFieldText, !selectedProgram && { color: ED.muted }]}>
              {selectedProgram || (selectedUniId ? 'Search programs…' : 'Select a university first')}
            </Text>
          )}
        </Pressable>
        {showProgramSearch && selectedUniId && (
          <View style={styles.dropdownBox}>
            <FlatList
              data={filteredPrograms}
              keyExtractor={p => p.id}
              style={{ maxHeight: 180 }}
              keyboardShouldPersistTaps="always"
              ListEmptyComponent={
                <View style={{ padding: 14 }}>
                  <Text style={{ fontSize: 12, color: ED.muted, fontFamily: 'Inter_400Regular' }}>
                    {programQuery ? 'No programs found' : 'Type to search programs'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedProgram(item.name);
                    setProgramQuery('');
                    setShowProgramSearch(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                  <Text style={styles.dropdownItemSub}>{item.faculty}</Text>
                </Pressable>
              )}
            />
          </View>
        )}

        <Pressable
          style={[styles.modalAddBtn, !selectedUniId && styles.modalAddBtnDisabled]}
          onPress={() => {
            if (selectedUniId) {
              onAdd(selectedUniId, selectedProgram);
              onClose();
            }
          }}
          disabled={!selectedUniId}
        >
          <Text style={styles.modalAddBtnText}>Add to tracker</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ApplyScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const { profile } = useUser();
  const { applications, addApplication, updateStatus, removeApplication } = useApplications();
  const [showAdd, setShowAdd] = useState(false);

  const deadlines = getUpcomingDeadlines(4);

  const submitted = applications.filter(a =>
    ['applied', 'supp_sent', 'offer', 'accepted'].includes(a.status)
  ).length;
  const total = applications.length;
  const progress = total > 0 ? (submitted / total) * 100 : 0;

  const handleAdd = (uniId: string, programName: string) => {
    addApplication(uniId, programName || undefined);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.ouacRow}>
              <Text style={styles.ouacLabel}>OUAC 101 · Ref </Text>
              <Text style={styles.ouacRef}>{profile.ouacRef}</Text>
            </View>
            <Text style={styles.title}>Your applications</Text>
          </View>
          <Pressable style={styles.scholarshipsLink} onPress={() => router.push('/scholarships')}>
            <Feather name="award" size={16} color={ED.softInk} />
          </Pressable>
        </View>

        {/* Progress summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryCount}>
              <Text style={styles.summaryNum}>{submitted}</Text>
              <Text style={styles.summaryDen}>/{total}</Text>
            </View>
            <Text style={styles.summaryCaption}>Submitted</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: total > 0 ? `${progress}%` as any : 0 }]} />
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryNote}>
              {total - submitted} in progress
            </Text>
            <Text style={styles.summaryNote}>
              {applications.filter(a => ['offer', 'accepted'].includes(a.status)).length} offers
            </Text>
          </View>
        </View>

        {/* By university */}
        {total > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>By university</Text>
            {applications.map(entry => (
              <AppRow
                key={entry.universityId}
                entry={entry}
                onUpdateStatus={(id, status) => updateStatus(id, status)}
                onRemove={removeApplication}
              />
            ))}
          </View>
        )}

        {/* Add button */}
        <Pressable style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Feather name="plus" size={16} color={ED.paper} />
          <Text style={styles.addBtnText}>Add application</Text>
        </Pressable>

        {/* Scholarships card */}
        <Pressable style={styles.scholCard} onPress={() => router.push('/scholarships')}>
          <View style={styles.scholCardIcon}>
            <Feather name="award" size={18} color={ED.softInk} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scholCardTitle}>Find scholarships</Text>
            <Text style={styles.scholCardSub}>
              Search awards up to $120,000 — eligibility, deadlines and apply links
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={ED.muted} />
        </Pressable>

        {/* Deadlines */}
        {deadlines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Upcoming deadlines</Text>
            {deadlines.map((d, i) => {
              const urgent = d.daysUntil >= 0 && d.daysUntil <= 14;
              const passed = d.daysUntil < 0;
              return (
                <View key={d.id} style={[styles.deadlineRow, i > 0 && styles.deadlineRowBorder]}>
                  <View style={styles.deadlineInfo}>
                    <Text style={styles.deadlineTitle}>{d.title}</Text>
                    <Text style={styles.deadlineDesc} numberOfLines={1}>{d.description}</Text>
                  </View>
                  <Text style={[
                    styles.deadlineDays,
                    urgent && { color: ED.warn },
                    passed && { color: ED.muted },
                  ]}>
                    {passed ? 'Passed' : d.daysUntil === 0 ? 'Today' : `${d.daysUntil}d`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {total === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptyBody}>
              Add the schools you're applying to and track your progress here.
            </Text>
          </View>
        )}
      </ScrollView>

      {showAdd && (
        <AddApplicationModal
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  content: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  ouacRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ouacLabel: { fontSize: 10, color: '#8b7e62', fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 1 },
  ouacRef: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: '#5c4a2f' },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#1a1612', lineHeight: 30 },
  scholarshipsLink: { padding: 4 },
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 14,
    padding: 18,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  summaryCount: { flexDirection: 'row', alignItems: 'baseline' },
  summaryNum: { fontFamily: 'Fraunces_600SemiBold', fontSize: 40, color: '#1a1612', lineHeight: 44 },
  summaryDen: { fontFamily: 'Fraunces_400Regular', fontSize: 28, color: '#8b7e62' },
  summaryCaption: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#8b7e62', fontFamily: 'Inter_500Medium' },
  progressTrack: { height: 5, backgroundColor: '#e8e0cf', borderRadius: 999, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: '#1a1612', borderRadius: 999 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryNote: { fontSize: 11, color: '#5c4a2f', fontFamily: 'Inter_400Regular' },
  section: { paddingHorizontal: 24, marginBottom: 20 },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  appRow: { borderTopWidth: 1, borderTopColor: '#e8e0cf' },
  appRowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  appUniDot: { width: 10, height: 10, borderRadius: 999, flexShrink: 0 },
  appInfo: { flex: 1 },
  appUniName: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#1a1612' },
  appProgramName: { fontSize: 11, color: '#8b7e62', fontFamily: 'Inter_400Regular', marginTop: 1 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  appExpanded: { paddingBottom: 14, paddingLeft: 20 },
  expandedLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4c9b0',
    backgroundColor: 'transparent',
  },
  statusOptionActive: { backgroundColor: '#1a1612', borderColor: '#1a1612' },
  statusOptionText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#1a1612' },
  statusOptionTextActive: { color: '#f5f1e8' },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  removeBtnText: { fontSize: 12, color: '#8b7e62', fontFamily: 'Inter_400Regular' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#1a1612',
    borderRadius: 999,
    paddingVertical: 14,
  },
  addBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#f5f1e8' },
  scholCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 14,
    padding: 16,
  },
  scholCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#f0ebe0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scholCardTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#1a1612' },
  scholCardSub: { fontSize: 11, color: '#8b7e62', fontFamily: 'Inter_400Regular', marginTop: 2, lineHeight: 16 },
  deadlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  deadlineRowBorder: { borderTopWidth: 1, borderTopColor: '#e8e0cf' },
  deadlineInfo: { flex: 1, marginRight: 12 },
  deadlineTitle: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#1a1612' },
  deadlineDesc: { fontSize: 11, color: '#8b7e62', fontFamily: 'Inter_400Regular', marginTop: 2 },
  deadlineDays: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 13, color: '#1a1612' },
  emptyState: { padding: 48, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 20, color: '#1a1612', marginBottom: 8 },
  emptyBody: { fontSize: 13, color: '#8b7e62', textAlign: 'center', lineHeight: 20, fontFamily: 'Inter_400Regular', maxWidth: 280 },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(26,22,18,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fbf8f1',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#1a1612' },
  modalLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 6,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f1e8',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 4,
  },
  searchFieldFocused: { borderColor: '#1a1612' },
  searchFieldDisabled: { opacity: 0.5 },
  searchFieldInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1a1612',
    padding: 0,
    margin: 0,
  },
  searchFieldText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: '#1a1612' },
  dropdownBox: {
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ebe0',
  },
  dropdownItemActive: { backgroundColor: '#1a1612' },
  dropdownItemText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#1a1612' },
  dropdownItemTextActive: { color: '#f5f1e8' },
  dropdownItemSub: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#8b7e62', marginTop: 2 },
  modalAddBtn: {
    marginTop: 16,
    backgroundColor: '#1a1612',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalAddBtnDisabled: { backgroundColor: '#d4c9b0' },
  modalAddBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#f5f1e8' },
});
