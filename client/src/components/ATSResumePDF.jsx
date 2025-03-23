import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#333333'
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a365d'
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 4,
    color: '#4a5568'
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  },
  link: {
    color: '#2b6cb0',
    textDecoration: 'none'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#2d3748',
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4
  },
  experienceItem: {
    marginBottom: 12
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  jobTitle: {
    fontWeight: 'bold',
    color: '#2d3748'
  },
  company: {
    fontWeight: 'bold',
    color: '#4a5568'
  },
  dateLocation: {
    color: '#718096',
    fontSize: 10
  },
  description: {
    marginTop: 4,
    paddingLeft: 12,
    fontSize: 10,
    lineHeight: 1.5
  },
  bulletPoint: {
    width: 3,
    height: 3,
    marginRight: 6,
    backgroundColor: '#4a5568'
  },
  skillsSection: {
    marginTop: 8
  },
  skillCategory: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8
  },
  skill: {
    backgroundColor: '#edf2f7',
    padding: '4 8',
    marginRight: 8,
    marginBottom: 4,
    borderRadius: 4,
    fontSize: 10,
    color: '#2d3748'
  },
  educationItem: {
    marginBottom: 10
  },
  school: {
    fontWeight: 'bold',
    color: '#2d3748'
  },
  degree: {
    color: '#4a5568'
  }
});

const BulletPoint = () => (
  <View style={styles.bulletPoint} />
);

const ATSResumePDF = ({ resume }) => {
  // Destructurer avec des valeurs par défaut
  const {
    personalInfo = {},
    experience = [],
    education = [],
    skills = []
  } = resume || {};

  // S'assurer que skills est toujours un tableau
  const skillsArray = Array.isArray(skills) ? skills : 
    typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : [];

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec informations personnelles */}
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.fullName || ''}</Text>
          <View style={[styles.contactInfo, { marginBottom: 8 }]}>
            {personalInfo.email && (
              <View style={styles.contactItem}>
                <Text>{personalInfo.email}</Text>
              </View>
            )}
          </View>
          <View style={[styles.contactInfo, { marginBottom: 8 }]}>
            {personalInfo.phone && (
              <View style={styles.contactItem}>
                <Text>Tél: {personalInfo.phone}</Text>
              </View>
            )}
          </View>
          <View style={styles.contactInfo}>
            {personalInfo.location && (
              <View style={styles.contactItem}>
                <Text>{personalInfo.location}</Text>
              </View>
            )}
            {personalInfo.linkedin && (
              <Link src={personalInfo.linkedin} style={[styles.link, styles.contactItem]}>
                LinkedIn
              </Link>
            )}
            {personalInfo.github && (
              <Link src={personalInfo.github} style={[styles.link, styles.contactItem]}>
                GitHub
              </Link>
            )}
          </View>
        </View>

        {/* Section Expérience */}
        {Array.isArray(experience) && experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>
            {experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{exp.title || ''}</Text>
                    <Text style={styles.company}>
                      {exp.company || ''} {exp.location ? `- ${exp.location}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.dateLocation}>
                    {formatDate(exp.startDate)} - {exp.inProgress ? 'Présent' : formatDate(exp.endDate)}
                    {exp.contractType ? ` · Type de contrat : ${exp.contractType}` : ''}
                  </Text>
                </View>
                {exp.description && (
                  <View style={styles.description}>
                    {exp.description.split('\n').map((line, i) => (
                      <View key={i} style={{ flexDirection: 'row', marginBottom: 2, alignItems: 'center' }}>
                        <BulletPoint />
                        <Text>{line.trim()}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Section Formation */}
        {Array.isArray(education) && education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Formation</Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.school}>{edu.school || ''}</Text>
                    <Text style={styles.degree}>{edu.degree || ''}</Text>
                  </View>
                  <Text style={styles.dateLocation}>
                    {formatDate(edu.startDate)} - {edu.inProgress ? 'Présent' : formatDate(edu.endDate)}
                  </Text>
                </View>
                {edu.description && (
                  <View style={styles.description}>
                    {edu.description.split('\n').map((line, i) => (
                      <View key={i} style={{ flexDirection: 'row', marginBottom: 2, alignItems: 'center' }}>
                        <BulletPoint />
                        <Text>{line.trim()}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Section Compétences */}
        {skillsArray.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Compétences</Text>
            <View style={styles.skillCategory}>
              {skillsArray.map((skill, index) => (
                <View key={index} style={styles.skill}>
                  <Text>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ATSResumePDF;
