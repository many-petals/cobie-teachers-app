import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from './data/theme';
import { BRAND, LOCAL_LOGO } from './data/brand';

const LAST_UPDATED = '30 September 2026';

interface PolicySectionProps {
  number: string;
  title: string;
  icon: string;
  iconColor: string;
  children: React.ReactNode;
}

function PolicySection({ number, title, icon, iconColor, children }: PolicySectionProps) {
  return (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.header}>
        <View style={[sectionStyles.iconCircle, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={icon as any} size={22} color={iconColor} />
        </View>
        <View style={sectionStyles.headerText}>
          <Text style={sectionStyles.number}>Section {number}</Text>
          <Text style={sectionStyles.title}>{title}</Text>
        </View>
      </View>
      <View style={sectionStyles.content}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  number: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  content: {},
});

function BulletPoint({ text, icon, color }: { text: string; icon?: string; color?: string }) {
  return (
    <View style={bulletStyles.row}>
      <View style={[bulletStyles.dot, color ? { backgroundColor: color } : null]}>
        {icon ? (
          <Ionicons name={icon as any} size={10} color={COLORS.white} />
        ) : null}
      </View>
      <Text style={bulletStyles.text}>{text}</Text>
    </View>
  );
}

const bulletStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 21,
  },
});

function InfoCard({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) {
  return (
    <View style={[infoStyles.card, { borderLeftColor: color }]}>
      <View style={[infoStyles.iconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <View style={infoStyles.textWrap}>
        <Text style={infoStyles.title}>{title}</Text>
        <Text style={infoStyles.desc}>{description}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  desc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 18,
  },
});

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={paraStyle}>{children}</Text>;
}

const paraStyle: any = {
  fontSize: FONT_SIZES.sm,
  color: COLORS.textLight,
  lineHeight: 22,
  marginBottom: SPACING.md,
};

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconRow}>
            <View style={styles.heroShield}>
              <Ionicons name="shield-checkmark" size={36} color={COLORS.white} />
            </View>
          </View>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroSubtitle}>{BRAND.name}</Text>
          <Text style={styles.heroApp}>{BRAND.storyTitle} Teacher Pack</Text>
          <View style={styles.heroDateBadge}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.white} />
            <Text style={styles.heroDateText}>Last updated: {LAST_UPDATED}</Text>
          </View>
        </View>

        {/* GDPR Compliance Badge */}
        <View style={styles.gdprBanner}>
          <View style={styles.gdprLeft}>
            <View style={styles.gdprIcon}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.secondary} />
            </View>
            <View style={styles.gdprTextWrap}>
              <Text style={styles.gdprTitle}>Pupil data needs school approval</Text>
              <Text style={styles.gdprText}>
                Use the lessons and resources without entering pupil records until your school has reviewed and approved the data arrangements. Using pupil codes reduces identification risk but does not, by itself, establish UK GDPR compliance.
              </Text>
            </View>
          </View>
        </View>

        {/* Key Principles Summary */}
        <View style={styles.principlesCard}>
          <Text style={styles.principlesTitle}>Our Privacy Principles</Text>
          <View style={styles.principlesGrid}>
            {[
              { icon: 'eye-off-outline', label: 'Use pupil codes\nnot names', color: COLORS.primary },
              { icon: 'lock-closed-outline', label: 'School approval\nbefore pupil data', color: COLORS.secondary },
              { icon: 'people-outline', label: 'Keep code keys\nwith your school', color: COLORS.purple },
              { icon: 'trash-outline', label: 'Full deletion\nrights', color: COLORS.error },
            ].map((item) => (
              <View key={item.label} style={styles.principleItem}>
                <View style={[styles.principleIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={styles.principleLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.introCard}>
          <Paragraph>
            {BRAND.name} ("we", "us", "our") operates the {BRAND.storyTitle} Teacher Pack application (the "App"). This Privacy Policy explains how we collect, use, store, and protect information when you use our App.
          </Paragraph>
          <Paragraph>
            This App is designed for use by teachers and educational professionals working with children in Early Years Foundation Stage (EYFS) and Key Stage 1 (KS1) settings. We take the privacy and safeguarding of children extremely seriously.
          </Paragraph>
          <View style={styles.importantBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.importantText}>
              Use pupil codes such as "P1" instead of names. If your school can link a code to a child, the record is pseudonymised personal data. Do not enter identifying details in codes, notes or recordings; free-text fields cannot guarantee that such details are excluded.
            </Text>
          </View>
        </View>

        {/* Section 1: What Data We Collect */}
        <PolicySection
          number="1"
          title="What Data We Collect"
          icon="document-text-outline"
          iconColor={COLORS.primary}
        >
          <Paragraph>
            We collect the minimum amount of data necessary to provide the App's functionality. The data we collect falls into two categories:
          </Paragraph>

          <Text style={styles.subHeading}>1.1 Account Data</Text>
          <Paragraph>
            When you create an account, the app sends the following details to its authentication and database service:
          </Paragraph>
          <InfoCard
            icon="mail-outline"
            title="Email Address"
            description="Used for authentication and account recovery. Your name, school, role and account-linked records may also be personal data."
            color={COLORS.primary}
          />
          <InfoCard
            icon="person-outline"
            title="Display Name & Role"
            description="Your chosen display name and professional role (e.g. 'EYFS Teacher'). You control what you enter here."
            color={COLORS.primaryLight}
          />
          <InfoCard
            icon="school-outline"
            title="School Name (Optional)"
            description="If provided, stored to personalise your experience. This is entirely optional."
            color={COLORS.info}
          />

          <Text style={[styles.subHeading, { marginTop: SPACING.lg }]}>1.2 Educational Tracking Data (Database)</Text>
          <Paragraph>
            To support teaching and learning, the following data is stored in our database:
          </Paragraph>
          <BulletPoint
            text="Pupil codes (e.g. 'Pupil A', 'Cactus 3') - never real names"
            icon="checkmark"
            color={COLORS.secondary}
          />
          <BulletPoint
            text="Emotion check-in records linked to pupil codes"
            icon="checkmark"
            color={COLORS.secondary}
          />
          <BulletPoint
            text="Milestone tracking progress linked to pupil codes"
            icon="checkmark"
            color={COLORS.secondary}
          />
          <BulletPoint
            text="Lesson completion records linked to your teacher account"
            icon="checkmark"
            color={COLORS.secondary}
          />
          <BulletPoint
            text="Saved favourites (bookmarked lessons, activities, printables)"
            icon="checkmark"
            color={COLORS.secondary}
          />
          <BulletPoint
            text="Saved calm corner configurations"
            icon="checkmark"
            color={COLORS.secondary}
          />

          <Text style={[styles.subHeading, { marginTop: SPACING.lg }]}>1.3 Local Data (AsyncStorage on Your Device)</Text>
          <Paragraph>
            Some data is stored locally on your device using AsyncStorage and is never transmitted to our servers:
          </Paragraph>
          <InfoCard
            icon="phone-portrait-outline"
            title="SEN Mode Preference"
            description="Your choice of whether SEN (Special Educational Needs) mode is enabled. Stored locally only."
            color={COLORS.accentOrange}
          />
          <InfoCard
            icon="mic-outline"
            title="Voice Notes (if used)"
            description="Audio recordings made using the voice notes feature are stored locally on your device and are never uploaded to our servers."
            color={COLORS.pink}
          />
          <InfoCard
            icon="calendar-outline"
            title="Planner Data"
            description="Weekly lesson planner entries are stored locally on your device using AsyncStorage."
            color={COLORS.purple}
          />

          <Text style={[styles.subHeading, { marginTop: SPACING.lg }]}>1.4 Information to Keep Out of Pupil Records</Text>
          <View style={styles.noCollectBox}>
            {[
              'Real names of children or pupils',
              'Photographs or images of children',
              'Home addresses or contact details of children or parents',
              'Location or GPS data',
              'Device identifiers or advertising IDs',
              'Browsing history or third-party tracking cookies',
              'Biometric data of any kind',
            ].map((item) => (
              <View key={item} style={styles.noCollectRow}>
                <View style={styles.noCollectIcon}>
                  <Ionicons name="close" size={12} color={COLORS.error} />
                </View>
                <Text style={styles.noCollectText}>{item}</Text>
              </View>
            ))}
          </View>
        </PolicySection>

        {/* Section 2: How We Store It */}
        <PolicySection
          number="2"
          title="How We Store Your Data"
          icon="server-outline"
          iconColor={COLORS.secondary}
        >
          <Paragraph>
            We use a combination of cloud database storage and local device storage to keep your data secure and accessible.
          </Paragraph>

          <Text style={styles.subHeading}>2.1 Cloud Database and Hosting</Text>
          <Paragraph>
            The app connects to a DatabasePad service through a Supabase-compatible client for authentication and cloud records. Schools should obtain confirmed supplier, hosting-location and data-processing information before using pupil records.
          </Paragraph>
          <BulletPoint
            text="Hosting location, encryption at rest and supplier assurance documents must be confirmed for the deployed service"
            icon="checkmark"
            color={COLORS.secondary}
          />
          <BulletPoint
            text="The app uses HTTPS connections to its cloud service"
            icon="checkmark"
            color={COLORS.secondary}
          />
          <BulletPoint
            text="Ask for the applicable data-processing agreement and subprocessor information"
            icon="checkmark"
            color={COLORS.secondary}
          />
          <BulletPoint
            text="Backup frequency, retention and restore arrangements require confirmation"
            icon="checkmark"
            color={COLORS.secondary}
          />
          <BulletPoint
            text="Database access controls must be verified with separate teacher accounts before pupil records are used"
            icon="checkmark"
            color={COLORS.secondary}
          />

          <Text style={[styles.subHeading, { marginTop: SPACING.lg }]}>2.2 Local Device Storage (AsyncStorage)</Text>
          <Paragraph>
            Certain preferences and locally-created content are stored on your device using React Native's AsyncStorage:
          </Paragraph>
          <BulletPoint
            text="Data remains on your device and is not transmitted to any server"
            icon="checkmark"
            color={COLORS.primary}
          />
          <BulletPoint
            text="Clearing the app's data or uninstalling the app will remove all local data"
            icon="checkmark"
            color={COLORS.primary}
          />
          <BulletPoint
            text="Local data includes: SEN mode preference, voice note recordings, and planner entries"
            icon="checkmark"
            color={COLORS.primary}
          />

          <Text style={[styles.subHeading, { marginTop: SPACING.lg }]}>2.3 Data Retention</Text>
          <Paragraph>
            You can remove app records using Delete My Data and request account deletion through the privacy contact below. Schools should agree retention periods, account-deletion procedures and backup retention before using pupil records.
          </Paragraph>
        </PolicySection>

        {/* Section 3: Who Can Access It */}
        <PolicySection
          number="3"
          title="Who Can Access Your Data"
          icon="people-outline"
          iconColor={COLORS.purple}
        >
          <Paragraph>
            The app associates cloud records with a teacher account. School approval should include verification that the deployed database prevents access between different teachers.
          </Paragraph>

          <Text style={styles.subHeading}>3.1 Teacher Account Boundaries</Text>
          <View style={styles.rlsBox}>
            <View style={styles.rlsHeader}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
              <Text style={styles.rlsTitle}>Teacher Data Isolation</Text>
            </View>
            <Paragraph>
              Filtering records in the app is not a substitute for database-enforced access controls. The deployment review must verify that:
            </Paragraph>
            <BulletPoint
              text="Each teacher can view, edit and delete only the records their account is authorised to access"
              icon="checkmark"
              color={COLORS.primary}
            />
            <BulletPoint
              text="A second teacher cannot read or change the first teacher's pupil records, check-ins or progress data"
              icon="checkmark"
              color={COLORS.primary}
            />
            <BulletPoint
              text="Database policies enforce account boundaries even when requests are made directly to the service"
              icon="checkmark"
              color={COLORS.primary}
            />
            <BulletPoint
              text="Signed-out requests cannot access teacher or pupil records"
              icon="checkmark"
              color={COLORS.primary}
            />
          </View>

          <Text style={[styles.subHeading, { marginTop: SPACING.lg }]}>3.2 Access Summary</Text>
          <InfoCard
            icon="person-outline"
            title="You (the Teacher)"
            description="Full access to your own account data, pupil codes, check-ins, milestones, favourites, and calm configurations."
            color={COLORS.primary}
          />
          <InfoCard
            icon="construct-outline"
            title="Many Petals Learning (Admin)"
            description="Contact us for the documented administrator-access and support arrangements applicable to your school."
            color={COLORS.accentOrange}
          />
          <InfoCard
            icon="server-outline"
            title="Database and Authentication Provider"
            description="The current service endpoint is provided through DatabasePad. Confirm the responsible provider, subprocessors and data-processing agreement before using pupil records."
            color={COLORS.secondary}
          />

          <Text style={[styles.subHeading, { marginTop: SPACING.lg }]}>3.3 Third-Party Sharing</Text>
          <View style={styles.importantBox}>
            <Ionicons name="hand-left" size={20} color={COLORS.error} />
            <Text style={styles.importantText}>
              The app uses external services for hosting, authentication and database records. When you use billing, Stripe receives your teacher account reference, email and billing details. Do not include pupil information in billing. School review should cover all applicable suppliers and their terms.
            </Text>
          </View>
        </PolicySection>

        {/* Section 4: Your Rights Under GDPR */}
        <PolicySection
          number="4"
          title="Your Rights Under GDPR"
          icon="document-lock-outline"
          iconColor={COLORS.info}
        >
          <Paragraph>
            Under the UK GDPR and Data Protection Act 2018, you have the following rights regarding your personal data:
          </Paragraph>

          {[
            {
              icon: 'eye-outline',
              title: 'Right of Access',
              desc: 'You can request a copy of all personal data we hold about you. We will provide this within 30 days.',
              color: COLORS.primary,
            },
            {
              icon: 'create-outline',
              title: 'Right to Rectification',
              desc: 'You can update or correct your personal data at any time through your profile settings in the app.',
              color: COLORS.secondary,
            },
            {
              icon: 'trash-outline',
              title: 'Right to Erasure',
              desc: 'You can request complete deletion of your account and all associated data (see Section 5).',
              color: COLORS.error,
            },
            {
              icon: 'hand-left-outline',
              title: 'Right to Restrict Processing',
              desc: 'You can request that we limit how we process your data while a concern is being resolved.',
              color: COLORS.accentOrange,
            },
            {
              icon: 'download-outline',
              title: 'Right to Data Portability',
              desc: 'You can request your data in a structured, machine-readable format (JSON or CSV).',
              color: COLORS.info,
            },
            {
              icon: 'megaphone-outline',
              title: 'Right to Object',
              desc: 'You can object to any processing of your data. As we do not use data for marketing, this is unlikely to apply.',
              color: COLORS.purple,
            },
          ].map((right) => (
            <InfoCard
              key={right.title}
              icon={right.icon}
              title={right.title}
              description={right.desc}
              color={right.color}
            />
          ))}

          <Paragraph>
            To exercise any of these rights, please contact us using the details in Section 6 below. We will respond to all requests within 30 days.
          </Paragraph>
        </PolicySection>

        {/* Section 5: How to Delete Your Data */}
        <PolicySection
          number="5"
          title="How to Delete Your Data"
          icon="trash-outline"
          iconColor={COLORS.error}
        >
          <Paragraph>
            Use Delete My Data in your profile to remove app records and sign out. This does not delete your authentication account or cancel a Stripe subscription. Use Manage billing to cancel, and the contact below to request account deletion.
          </Paragraph>

          <Text style={styles.subHeading}>5.1 Delete App Records or Request Account Deletion</Text>
          <View style={styles.stepsContainer}>
            {[
              { step: '1', text: 'Send an email to info@manypetals.co.uk with the subject line "Data Deletion Request"' },
              { step: '2', text: 'Include the email address associated with your account' },
              { step: '3', text: 'We will verify your identity and process the deletion within 30 days' },
              { step: '4', text: 'You will receive confirmation once all data has been permanently deleted' },
            ].map((item) => (
              <View key={item.step} style={styles.stepRow}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNum}>{item.step}</Text>
                </View>
                <Text style={styles.stepText}>{item.text}</Text>
              </View>
            ))}
          </View>

          <Paragraph>
            Upon deletion, the following data will be permanently removed from our database:
          </Paragraph>
          <BulletPoint text="Your account profile (email, name, role, school)" color={COLORS.error} />
          <BulletPoint text="All pupil codes you created" color={COLORS.error} />
          <BulletPoint text="All emotion check-in records" color={COLORS.error} />
          <BulletPoint text="All milestone tracking data" color={COLORS.error} />
          <BulletPoint text="All lesson completion records" color={COLORS.error} />
          <BulletPoint text="All saved favourites and calm corner configurations" color={COLORS.error} />

          <Text style={[styles.subHeading, { marginTop: SPACING.lg }]}>5.2 Delete Local Data (Browser or Device)</Text>
          <Paragraph>
            In the web app, use Delete My Data to clear the app records for your signed-in account. To clear all local records for this site on a shared device, use your browser settings to clear its site data. Export anything you need first. For installed mobile apps:
          </Paragraph>
          <BulletPoint
            text="iOS: Go to Settings > General > iPhone Storage > Cobie Teacher Pack > Delete App"
            color={COLORS.primary}
          />
          <BulletPoint
            text="Android: Go to Settings > Apps > Cobie Teacher Pack > Storage > Clear Data, or uninstall the app"
            color={COLORS.primary}
          />
          <Paragraph>
            Uninstalling the app will remove all locally stored data including SEN preferences, voice notes, and planner entries.
          </Paragraph>
        </PolicySection>

        {/* Section 6: Contact Information */}
        <PolicySection
          number="6"
          title="Contact Information"
          icon="mail-outline"
          iconColor={COLORS.accentOrange}
        >
          <Paragraph>
            If you have any questions about this Privacy Policy, wish to exercise your data rights, or have any concerns about how we handle your data, please contact us:
          </Paragraph>

          <View style={styles.contactCard}>
            <Image
              source={LOCAL_LOGO}
              style={styles.contactLogo}
              resizeMode="contain"
            />
            <Text style={styles.contactName}>{BRAND.name}</Text>
            <Text style={styles.contactRole}>Privacy Contact</Text>

            <View style={styles.contactDivider} />

            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL('mailto:info@manypetals.co.uk?subject=Privacy%20Enquiry')}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="mail" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Privacy Enquiries</Text>
                <Text style={styles.contactValue}>info@manypetals.co.uk</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={COLORS.mediumGray} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL('mailto:info@manypetals.co.uk?subject=General%20Enquiry')}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                <Ionicons name="chatbubble" size={18} color={COLORS.secondary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>General Enquiries</Text>
                <Text style={styles.contactValue}>info@manypetals.co.uk</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={COLORS.mediumGray} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subHeading, { marginTop: SPACING.lg }]}>Supervisory Authority</Text>
          <Paragraph>
            If you are not satisfied with our response to a privacy concern, you have the right to lodge a complaint with the Information Commissioner's Office (ICO):
          </Paragraph>
          <TouchableOpacity
            style={styles.icoCard}
            onPress={() => Linking.openURL('https://ico.org.uk/make-a-complaint/')}
            activeOpacity={0.7}
          >
            <View style={styles.icoLeft}>
              <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
              <View>
                <Text style={styles.icoTitle}>Information Commissioner's Office</Text>
                <Text style={styles.icoUrl}>ico.org.uk/make-a-complaint</Text>
              </View>
            </View>
            <Ionicons name="open-outline" size={16} color={COLORS.mediumGray} />
          </TouchableOpacity>
        </PolicySection>

        {/* Section 7: Children's Privacy */}
        <PolicySection
          number="7"
          title="Children's Privacy & Safeguarding"
          icon="shield-outline"
          iconColor={COLORS.pink}
        >
          <View style={styles.importantBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.pink} />
            <Text style={styles.importantText}>
              This App is designed for use by teachers and educational professionals only. It is not intended for direct use by children.
            </Text>
          </View>
          <Paragraph>
            We are committed to safeguarding children's privacy:
          </Paragraph>
          <BulletPoint
            text="Children do not create accounts or interact directly with the App"
            icon="checkmark"
            color={COLORS.pink}
          />
          <BulletPoint
            text="Pupils are identified only by pupil codes chosen by the teacher (e.g. 'Pupil A', 'Cactus 3')"
            icon="checkmark"
            color={COLORS.pink}
          />
          <BulletPoint
            text="Do not include child names, photographs or identifying details in pupil records, free-text notes or recordings"
            icon="checkmark"
            color={COLORS.pink}
          />
          <BulletPoint
            text="Emotion check-ins linked to a pupil code may still be personal data where your school can identify the child"
            icon="checkmark"
            color={COLORS.pink}
          />
          <BulletPoint
            text="Your school should determine the controller and processor responsibilities and keep any code-to-name mapping separately under its data protection policy"
            icon="checkmark"
            color={COLORS.pink}
          />
        </PolicySection>

        {/* Section 8: Changes to This Policy */}
        <PolicySection
          number="8"
          title="Changes to This Policy"
          icon="refresh-outline"
          iconColor={COLORS.darkGray}
        >
          <Paragraph>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make material changes:
          </Paragraph>
          <BulletPoint
            text="We will update the 'Last Updated' date at the top of this policy"
            color={COLORS.darkGray}
          />
          <BulletPoint
            text="For significant changes, we will notify you via an in-app notification or email"
            color={COLORS.darkGray}
          />
          <BulletPoint
            text="Review policy changes with your school before continuing to enter pupil information"
            color={COLORS.darkGray}
          />
          <Paragraph>
            We encourage you to review this Privacy Policy periodically.
          </Paragraph>
        </PolicySection>

        {/* Legal Basis */}
        <View style={styles.legalBasisCard}>
          <Text style={styles.legalBasisTitle}>Legal Basis for Processing</Text>
          <Paragraph>
            The lawful basis depends on the purpose of processing. Schools must determine the basis for pupil records and agree the provider responsibilities before using the tracker.
          </Paragraph>
          <InfoCard
            icon="checkmark-circle-outline"
            title="Reading a Privacy Notice"
            description="Creating an account or reading this notice does not automatically provide consent for processing pupil information."
            color={COLORS.secondary}
          />
          <InfoCard
            icon="document-outline"
            title="Account and Billing Services"
            description="Teacher account and billing information is used to provide the service. The applicable service terms and processing arrangements should be confirmed before purchase."
            color={COLORS.primary}
          />
          <InfoCard
            icon="scale-outline"
            title="School Pupil Records"
            description="Ask your school data protection officer to review the purpose, lawful basis, retention and any additional conditions needed for the pupil information you intend to record."
            color={COLORS.accentOrange}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Image
            source={LOCAL_LOGO}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerBrand}>{BRAND.name}</Text>
          <Text style={styles.footerText}>{BRAND.copyright}</Text>
          <Text style={styles.footerDate}>Privacy Policy last updated: {LAST_UPDATED}</Text>
          <TouchableOpacity
            style={styles.backToHomeBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
            <Text style={styles.backToHomeText}>Back to App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.huge,
  },
  heroBanner: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  heroIconRow: {
    marginBottom: SPACING.lg,
  },
  heroShield: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  heroApp: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  heroDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    marginTop: SPACING.lg,
  },
  heroDateText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  gdprBanner: {
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    ...SHADOWS.medium,
  },
  gdprLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  gdprIcon: {
    marginTop: 2,
  },
  gdprTextWrap: {
    flex: 1,
  },
  gdprTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  gdprText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 21,
  },
  principlesCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.small,
  },
  principlesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  principlesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  principleItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  principleIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  principleLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  introCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.small,
  },
  importantBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginTop: SPACING.sm,
  },
  importantText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 21,
  },
  subHeading: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  noCollectBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  noCollectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  noCollectIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCollectText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  rlsBox: {
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    marginBottom: SPACING.md,
  },
  rlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  rlsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepsContainer: {
    marginBottom: SPACING.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  stepText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 21,
    paddingTop: 3,
  },
  contactCard: {
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  contactLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  contactName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  contactRole: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  contactDivider: {
    width: '80%',
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SPACING.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  contactValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 1,
  },
  icoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  icoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  icoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  icoUrl: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: 2,
  },
  legalBasisCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  legalBasisTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    marginTop: SPACING.xl,
  },
  footerLogo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginBottom: SPACING.sm,
  },
  footerBrand: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footerDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  backToHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.bgLight,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  backToHomeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
