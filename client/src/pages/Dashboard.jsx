import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resumeService } from '../services/resumeService';
import { 
  DocumentPlusIcon, 
  PencilSquareIcon, 
  DocumentDuplicateIcon, 
  TrashIcon,
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ATSResumePDF from '../components/ATSResumePDF';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const userResumes = await resumeService.getUserResumes(user.uid);
      setResumes(userResumes);
    } catch (err) {
      setError('Erreur lors du chargement des CV');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async () => {
    try {
      const newResume = await resumeService.createResume(user.uid, {
        title: 'Nouveau CV',
        personalInfo: {},
        education: [],
        experience: [],
        skills: []
      });
      navigate(`/resume/${newResume.id}`);
    } catch (err) {
      setError('Erreur lors de la création du CV');
      console.error(err);
    }
  };

  const handleDuplicateResume = async (resumeId) => {
    try {
      await resumeService.duplicateResume(user.uid, resumeId);
      loadResumes();
    } catch (err) {
      setError('Erreur lors de la duplication du CV');
      console.error(err);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    try {
      await resumeService.deleteResume(resumeId);
      setDeleteConfirm(null);
      loadResumes();
    } catch (err) {
      setError('Erreur lors de la suppression du CV');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes CV</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez vos CV et créez-en de nouveaux
              </p>
            </div>
            <button
              onClick={handleCreateResume}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <DocumentPlusIcon className="h-5 w-5 mr-2" />
              Nouveau CV
            </button>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Liste des CV */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-500">Chargement de vos CV...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun CV</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer votre premier CV
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateResume}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <DocumentPlusIcon className="h-5 w-5 mr-2" />
                  Nouveau CV
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {resumes.map((resume) => (
                  <li key={resume.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 break-words">
                            {resume.title || 'CV sans titre'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {resume.personalInfo?.fullName && (
                              <span className="mr-3">{resume.personalInfo.fullName}</span>
                            )}
                            <span>
                              Dernière modification: {new Date(resume.updatedAt).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-row justify-start sm:justify-end items-center space-x-4 pt-2 sm:pt-0">
                          <PDFDownloadLink
                            document={<ATSResumePDF resume={resume} />}
                            fileName={`${resume.title || 'CV'}-ATS.pdf`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            {({ blob, url, loading, error }) =>
                              loading ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent mr-1.5"></div>
                                  PDF
                                </div>
                              ) : (
                                <>
                                  <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                                  PDF ATS
                                </>
                              )
                            }
                          </PDFDownloadLink>
                          <Link
                            to={`/resume/${resume.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDuplicateResume(resume.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4 mr-1.5" />
                            Dupliquer
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(resume.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <TrashIcon className="h-4 w-4 mr-1.5" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Modal de confirmation de suppression */}
                    {deleteConfirm === resume.id && (
                      <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <TrashIcon className="h-6 w-6 text-red-600" />
                              </div>
                              <div className="mt-3 text-center sm:mt-5">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                  Confirmer la suppression
                                </h3>
                                <div className="mt-2">
                                  <p className="text-sm text-gray-500">
                                    Êtes-vous sûr de vouloir supprimer ce CV ? Cette action est irréversible.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                              <button
                                type="button"
                                onClick={() => handleDeleteResume(resume.id)}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                              >
                                Supprimer
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm(null)}
                                className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-1 sm:text-sm"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
