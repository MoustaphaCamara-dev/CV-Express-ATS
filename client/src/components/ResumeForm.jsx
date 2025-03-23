import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { PlusIcon, TrashIcon, DocumentArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ATSResumePDF from './ATSResumePDF';
import ErrorBoundary from './ErrorBoundary';

export default function ResumeForm() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialFormData = {
    title: '',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    },
    experience: [{
      title: '',
      company: '',
      location: '',
      contractType: '',
      startDate: '',
      endDate: '',
      inProgress: false,
      description: ''
    }],
    education: [{
      degree: '',
      school: '',
      startDate: '',
      endDate: '',
      inProgress: false,
      description: ''
    }],
    skills: [],
    certifications: [{
      name: '',
      issuer: '',
      date: ''
    }]
  };

  const [formData, setFormData] = useState(initialFormData);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value || '' // Assurer qu'une valeur vide est utilisée au lieu de undefined
      }
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setFormData(prev => {
      const newExperience = [...prev.experience];
      if (field === 'inProgress') {
        newExperience[index] = {
          ...newExperience[index],
          inProgress: value,
          endDate: value ? '' : newExperience[index].endDate
        };
      } else if (field === 'endDate') {
        newExperience[index] = {
          ...newExperience[index],
          [field]: value,
          inProgress: value ? false : newExperience[index].inProgress
        };
      } else {
        newExperience[index] = {
          ...newExperience[index],
          [field]: value || ''
        };
      }
      return {
        ...prev,
        experience: newExperience
      };
    });
  };

  const handleRemoveExperience = (index) => {
    const newExperience = [...formData.experience];
    newExperience.splice(index, 1);
    setFormData({
      ...formData,
      experience: newExperience
    });
  };

  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        location: '',
        contractType: '',
        startDate: '',
        endDate: '',
        inProgress: false,
        description: ''
      }]
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      if (field === 'inProgress') {
        newEducation[index] = {
          ...newEducation[index],
          inProgress: value,
          endDate: value ? '' : newEducation[index].endDate
        };
      } else if (field === 'endDate') {
        newEducation[index] = {
          ...newEducation[index],
          [field]: value,
          inProgress: value ? false : newEducation[index].inProgress
        };
      } else {
        newEducation[index] = {
          ...newEducation[index],
          [field]: value || ''
        };
      }
      return {
        ...prev,
        education: newEducation
      };
    });
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        school: '',
        startDate: '',
        endDate: '',
        inProgress: false,
        description: ''
      }]
    }));
  };

  const handleSkillsChange = (e) => {
    const skillsString = e.target.value || ''; // S'assurer qu'on a toujours une chaîne
    const skillsArray = skillsString.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill);
    
    setFormData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const cleanDataForFirestore = (data) => {
    if (Array.isArray(data)) {
      return data.map(item => cleanDataForFirestore(item));
    }
    if (typeof data === 'object' && data !== null) {
      const cleaned = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          cleaned[key] = cleanDataForFirestore(value);
        }
      }
      return cleaned;
    }
    return data || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setError(null);
      const cleanedFormData = cleanDataForFirestore(formData);
      
      const resumeData = {
        ...cleanedFormData,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      };
      
      const resumeRef = doc(db, 'resumes', id || user.uid);
      await setDoc(resumeRef, resumeData);
      alert(id ? 'CV mis à jour avec succès !' : 'CV sauvegardé avec succès !');
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du CV');
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
      loadResume();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadResume = async () => {
    try {
      setLoading(true);
      setError(null);
      const resumeRef = doc(db, 'resumes', id);
      const resumeSnap = await getDoc(resumeRef);
      if (resumeSnap.exists()) {
        const data = resumeSnap.data();
        // S'assurer que les valeurs booléennes sont correctement initialisées
        const processedData = {
          ...initialFormData,
          ...data,
          experience: (data.experience || []).map(exp => ({
            ...initialFormData.experience[0],
            ...exp,
            inProgress: Boolean(exp.inProgress),
            endDate: exp.inProgress ? '' : (exp.endDate || '')
          })),
          education: (data.education || []).map(edu => ({
            ...initialFormData.education[0],
            ...edu,
            inProgress: Boolean(edu.inProgress),
            endDate: edu.inProgress ? '' : (edu.endDate || '')
          }))
        };
        setFormData(processedData);
      }
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement du CV:', err);
      setError('Erreur lors du chargement du CV');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Bouton d'export PDF */}
      <div className="flex justify-end">
        <ErrorBoundary fallback={<button className="btn-secondary">Erreur PDF</button>}>
          <Suspense fallback={<button className="btn-secondary">Chargement...</button>}>
            {formData.personalInfo.fullName && (
              <div className="relative">
                <PDFDownloadLink
                  document={<ATSResumePDF resume={formData} />}
                  fileName={`${formData.title || 'CV'}-ATS.pdf`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {({ blob, url, loading, error }) =>
                    loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Génération du PDF...
                      </div>
                    ) : error ? (
                      <div className="flex items-center text-red-500">
                        <span className="mr-2">Erreur PDF</span>
                      </div>
                    ) : (
                      <>
                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                        Télécharger CV ATS
                      </>
                    )
                  }
                </PDFDownloadLink>
              </div>
            )}
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Nom du CV */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Informations générales</h2>
        </div>

        {/* Nom du CV */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Nom du CV
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Mon CV"
            />
            <p className="mt-1 text-sm text-gray-500">
              Ce nom sera utilisé pour identifier le CV dans votre liste et comme nom du fichier PDF
            </p>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <section className="card">
        <h3 className="text-xl font-semibold mb-4">Informations personnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom complet</label>
            <input
              type="text"
              name="fullName"
              value={formData.personalInfo.fullName}
              onChange={handlePersonalInfoChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.personalInfo.email}
              onChange={handlePersonalInfoChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.personalInfo.phone}
              onChange={handlePersonalInfoChange}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Localisation</label>
            <input
              type="text"
              name="location"
              value={formData.personalInfo.location}
              onChange={handlePersonalInfoChange}
              className="form-input"
            />
          </div>
        </div>
      </section>

      {/* Expérience professionnelle */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Expérience professionnelle</h3>
          <button
            type="button"
            onClick={handleAddExperience}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter une expérience
          </button>
        </div>

        <div className="space-y-4">
          {formData.experience.map((exp, index) => (
            <div key={index} className="card relative">
              <button
                type="button"
                onClick={() => handleRemoveExperience(index)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                title="Supprimer cette expérience"
              >
                <TrashIcon className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Poste</label>
                  <input
                    type="text"
                    name={`experience.${index}.title`}
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                    className="form-input"
                    placeholder="Ex: Développeur Full Stack"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Entreprise</label>
                  <input
                    type="text"
                    name={`experience.${index}.company`}
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className="form-input"
                    placeholder="Ex: Tech Solutions Inc."
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Type de contrat</label>
                  <select
                    name={`experience.${index}.contractType`}
                    value={exp.contractType}
                    onChange={(e) => handleExperienceChange(index, 'contractType', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Sélectionner</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Alternance">Alternance</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Interim">Intérim</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Localisation</label>
                  <input
                    type="text"
                    name={`experience.${index}.location`}
                    value={exp.location}
                    onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                    className="form-input"
                    placeholder="Ex: Paris, France (Hybride)"
                  />
                </div>

                <div>
                  <label className="form-label">Date de début</label>
                  <input
                    type="date"
                    name={`experience.${index}.startDate`}
                    value={exp.startDate}
                    onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="form-label">Date de fin</label>
                    <input
                      type="date"
                      name={`experience.${index}.endDate`}
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      className="form-input"
                      disabled={exp.inProgress}
                    />
                  </div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`experience.${index}.inProgress`}
                      checked={exp.inProgress}
                      onChange={(e) => {
                        handleExperienceChange(index, 'inProgress', e.target.checked);
                        if (e.target.checked) {
                          handleExperienceChange(index, 'endDate', '');
                        }
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`experience.${index}.inProgress`} className="ml-2 block text-sm text-gray-700">
                      Présent
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Description</label>
                  <textarea
                    name={`experience.${index}.description`}
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    className="form-textarea"
                    rows="4"
                    placeholder="• Décrivez vos principales responsabilités et réalisations&#13;• Utilisez des verbes d'action et des chiffres clés&#13;• Mentionnez les technologies et outils utilisés"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Conseil : Utilisez des puces (•) pour lister vos réalisations et incluez des métriques quand c'est possible.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Éducation */}
      <section className="card">
        <h3 className="text-xl font-semibold mb-4">Formation</h3>
        {formData.education.map((edu, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Diplôme</label>
                <input
                  type="text"
                  name={`education.${index}.degree`}
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">École/Université</label>
                <input
                  type="text"
                  name={`education.${index}.school`}
                  value={edu.school}
                  onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de début</label>
                <input
                  type="date"
                  name={`education.${index}.startDate`}
                  value={edu.startDate}
                  onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                  <input
                    type="date"
                    name={`education.${index}.endDate`}
                    value={edu.endDate}
                    onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                    className="form-input"
                    disabled={edu.inProgress}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`education.${index}.inProgress`}
                    checked={edu.inProgress}
                    onChange={(e) => {
                      handleEducationChange(index, 'inProgress', e.target.checked);
                      if (e.target.checked) {
                        handleEducationChange(index, 'endDate', '');
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`education.${index}.inProgress`} className="ml-2 block text-sm text-gray-700">
                    Présent
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name={`education.${index}.description`}
                  value={edu.description}
                  onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addEducation}
          className="mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Ajouter une formation
        </button>
      </section>

      {/* Compétences */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Compétences</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
              Liste des compétences (séparées par des virgules)
            </label>
            <textarea
              id="skills"
              name="skills"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
              onChange={handleSkillsChange}
              placeholder="React, JavaScript, Node.js, etc."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          Sauvegarder le CV
        </button>
      </div>
    </form>
  );
}
