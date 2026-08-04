import type { PrefilledProgressReportData } from './parentLetterGenerator';

export type ParentShareStatus = 'disabled' | 'pending-link' | 'active' | 'revoked';

export interface ParentShareApproval {
  pupilCode: string;
  moduleSlug: string;
  status: ParentShareStatus;
  sharingApproved: boolean;
  approvedAt?: string;
  approvedByTeacherId?: string;
  sharingRevokedAt?: string;
}

export interface ParentProgressSummary {
  moduleSlug: string;
  childLabel: string;
  pupilCode: string;
  ageGroup: 'EYFS' | 'KS1';
  reportPeriod?: string;
  classYear?: string;
  summaryLine: string;
  topStrengths: string[];
  nextSteps: string[];
  homeSuggestions: string[];
  emotionHighlights: Array<{ name: string; count: number }>;
  latestApprovedReportNotes?: string;
  generatedAt: string;
  approvedAt?: string;
}

export const PARENT_VISIBLE_PROGRESS_FIELDS = [
  'summaryLine',
  'topStrengths',
  'nextSteps',
  'homeSuggestions',
  'emotionHighlights',
  'latestApprovedReportNotes',
] as const;

export const TEACHER_ONLY_PROGRESS_FIELDS = [
  'rawTrackerEvents',
  'internalTeacherNotes',
  'unapprovedDraftReports',
  'fullAssessmentHistory',
] as const;

function dedupeAndTrim(items: string[], maxItems: number): string[] {
  return Array.from(
    new Set(
      items
        .map(item => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
}

function buildSummaryLine(reportData: PrefilledProgressReportData): string {
  const strongestArea = reportData.progressAreas[0]?.area;

  if (strongestArea) {
    return `${reportData.childLabel} is making steady progress in ${strongestArea.toLowerCase()} with classroom support and consistent practice.`;
  }

  return `${reportData.childLabel} is engaging with the programme and building emotional literacy skills over time.`;
}

export function buildParentProgressSummary(
  reportData: PrefilledProgressReportData,
  options?: {
    moduleSlug?: string;
    approvedAt?: string;
  },
): ParentProgressSummary {
  return {
    moduleSlug: options?.moduleSlug ?? 'cobie-the-cactus',
    childLabel: reportData.childLabel,
    pupilCode: reportData.pupilCode,
    ageGroup: reportData.ageGroup,
    reportPeriod: reportData.reportPeriod,
    classYear: reportData.classYear,
    summaryLine: buildSummaryLine(reportData),
    topStrengths: dedupeAndTrim(reportData.strengths, 3),
    nextSteps: dedupeAndTrim(reportData.nextSteps, 3),
    homeSuggestions: dedupeAndTrim(reportData.homeSuggestions, 4),
    emotionHighlights: reportData.emotionSummary.slice(0, 4),
    latestApprovedReportNotes: reportData.additionalNotes?.trim() || undefined,
    generatedAt: new Date().toISOString(),
    approvedAt: options?.approvedAt,
  };
}
