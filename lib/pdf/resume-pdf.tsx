import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { TailoredResume } from '@/lib/ai/resume-tools'

/**
 * Clean, single-column, ATS-friendly resume + cover-letter templates.
 * Rendered server-side (see app/api/ai/tailor/pdf/route.ts). Uses the built-in
 * Helvetica family so there's no font registration / loading to manage.
 */

const styles = StyleSheet.create({
  page: {
    paddingVertical: 42,
    paddingHorizontal: 48,
    fontSize: 10,
    color: '#111827',
    fontFamily: 'Helvetica',
  },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#111827', lineHeight: 1.15 },
  headline: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#4F46E5', marginTop: 2 },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#6B7280',
    fontFamily: 'Helvetica-Bold',
    marginTop: 14,
    marginBottom: 5,
  },
  body: { fontSize: 10, color: '#374151', lineHeight: 1.4 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  skill: {
    fontSize: 9,
    color: '#374151',
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  expBlock: { marginBottom: 9 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  role: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: '#111827' },
  period: { fontSize: 9, color: '#6B7280' },
  bullet: { flexDirection: 'row', marginTop: 2 },
  bulletDot: { width: 9, fontSize: 10, color: '#4F46E5' },
  bulletText: { flex: 1, fontSize: 10, color: '#374151', lineHeight: 1.35 },
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  letterPara: { fontSize: 10.5, color: '#374151', marginBottom: 10, lineHeight: 1.5 },
})

export function ResumeDocument({ resume }: { resume: TailoredResume }) {
  return (
    <Document title={`${resume.name} — Resume`} author="Segwae">
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{resume.name}</Text>
        <Text style={styles.headline}>{resume.headline}</Text>

        {resume.summary ? (
          <>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.body}>{resume.summary}</Text>
          </>
        ) : null}

        {resume.skills?.length ? (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {resume.skills.map((s, i) => (
                <Text key={i} style={styles.skill}>
                  {s}
                </Text>
              ))}
            </View>
          </>
        ) : null}

        {resume.experience?.length ? (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp, i) => (
              <View key={i} style={styles.expBlock} wrap={false}>
                <View style={styles.expHeader}>
                  <Text style={styles.role}>
                    {[exp.role, exp.company].filter(Boolean).join(' · ')}
                  </Text>
                  <Text style={styles.period}>{exp.period}</Text>
                </View>
                {exp.bullets?.map((b, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : null}

        {resume.education?.length ? (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((ed, i) => (
              <View key={i} style={styles.eduRow}>
                <Text style={styles.body}>
                  {[ed.credential, ed.institution].filter(Boolean).join(' · ')}
                </Text>
                <Text style={styles.period}>{ed.period}</Text>
              </View>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  )
}

export function CoverLetterDocument({ resume }: { resume: TailoredResume }) {
  const paragraphs = (resume.coverLetter ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <Document title={`${resume.name} — Cover letter`} author="Segwae">
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{resume.name}</Text>
        <Text style={styles.headline}>{resume.headline}</Text>
        <View style={{ marginTop: 18 }}>
          {paragraphs.map((p, i) => (
            <Text key={i} style={styles.letterPara}>
              {p}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  )
}
