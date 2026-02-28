import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExternalLink } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

const schemes = [
  {
    name: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    ministry: "Ministry of Finance",
    category: "Financial Inclusion",
    description: "Financial inclusion program ensuring access to financial services like banking, credit, insurance, and pension.",
    features: ["Zero balance bank account", "RuPay Debit Card", "₹2 Lakh accident insurance"],
    applyLink: "https://pmjdy.gov.in/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/d9/Pradhan_Mantri_Jan_Dhan_Yojana_logo.png"
  },
  {
    name: "Sukanya Samriddhi Yojana",
    ministry: "Ministry of Finance",
    category: "Savings",
    description: "A savings scheme for the girl child under the Beti Bachao, Beti Padhao campaign with attractive interest rates.",
    features: ["8.2% interest rate", "Tax benefits under 80C", "Maturity at 21 years"],
    applyLink: "https://www.india.gov.in/sukanya-samriddhi-yojana",
    logoUrl: "https://goodmoneying.com/wp-content/uploads/2015/03/sukanya-samridhi-scheme.jpg"
  },
  {
    name: "Atal Pension Yojana (APY)",
    ministry: "Ministry of Finance",
    category: "Pension",
    description: "Pension scheme for workers in the unorganized sector providing guaranteed minimum pension.",
    features: ["₹1,000 - ₹5,000 monthly pension", "Govt co-contribution", "Tax benefits"],
    applyLink: "https://npscra.nsdl.co.in/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/db/Atal_Pension_Yojana.png"
  },
  {
    name: "PM Mudra Yojana",
    ministry: "Ministry of Finance",
    category: "Loans",
    description: "Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises.",
    features: ["Shishu: up to ₹50,000", "Kishore: up to ₹5 Lakh", "Tarun: up to ₹10 Lakh"],
    applyLink: "https://www.mudra.org.in/",
    logoUrl: "https://www.ibef.org/uploads/govtschemes/Pradhan-Mantri-Mudra-Loan-Bank-Yojana-july-2025.png"
  },
  {
    name: "Public Provident Fund (PPF)",
    ministry: "Ministry of Finance",
    category: "Savings",
    description: "Long-term savings instrument with attractive interest and returns fully exempted from tax.",
    features: ["7.1% interest rate", "15 year maturity", "EEE tax status"],
    applyLink: "https://www.indiapost.gov.in/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/32/India_Post.svg/500px-India_Post.svg.png"
  },
  {
    name: "National Savings Certificate (NSC)",
    ministry: "Ministry of Finance",
    category: "Savings",
    description: "Fixed income investment scheme with guaranteed returns, available at any post office.",
    features: ["7.7% interest rate", "5 year lock-in", "Tax deduction under 80C"],
    applyLink: "https://www.indiapost.gov.in/",
    logoUrl: "https://www.iasgyan.in//ig-uploads/images//All_about_National_Savings_Certificate_(NSC)_Scheme.jpg"
  }
];

export default function GovSchemesScreen() {
  const { t } = useTranslation();

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Government Schemes</Text>
          <Text style={styles.subtitle}>
            Explore various government financial schemes designed to empower citizens with savings, loans, and pension benefits.
          </Text>
        </View>

        {schemes.map((scheme, index) => (
          <View key={index} style={styles.card}>
            <Image source={{ uri: scheme.logoUrl }} style={styles.logo} resizeMode="contain" />
            
            <Text style={styles.schemeName}>{scheme.name}</Text>
            <Text style={styles.ministry}>{scheme.ministry}</Text>
            
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{scheme.category}</Text>
            </View>
            
            <Text style={styles.description}>{scheme.description}</Text>
            
            <View style={styles.features}>
              {scheme.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.applyBtn} 
              onPress={() => openLink(scheme.applyLink)}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>Apply Now</Text>
              <ExternalLink size={16} color={colors.surface} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  schemeName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  ministry: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.lightSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  features: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    color: colors.secondary,
    fontSize: 16,
    marginRight: 8,
    marginTop: -2,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
});
