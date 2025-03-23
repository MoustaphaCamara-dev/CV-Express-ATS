import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

const RESUMES_COLLECTION = 'resumes';

export const resumeService = {
  // Récupérer tous les CV d'un utilisateur
  async getUserResumes(userId) {
    try {
      const resumesRef = collection(db, RESUMES_COLLECTION);
      const q = query(resumesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des CV:', error);
      throw error;
    }
  },

  // Récupérer un CV spécifique
  async getResume(resumeId) {
    try {
      const resumeRef = doc(db, RESUMES_COLLECTION, resumeId);
      const resumeSnap = await getDoc(resumeRef);
      
      if (!resumeSnap.exists()) {
        return null;
      }

      const data = resumeSnap.data();
      return {
        id: resumeSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du CV:', error);
      throw error;
    }
  },

  // Créer un nouveau CV
  async createResume(userId, resumeData) {
    try {
      const resumesRef = collection(db, RESUMES_COLLECTION);
      const newResumeData = {
        ...resumeData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(resumesRef, newResumeData);
      
      return {
        id: docRef.id,
        ...newResumeData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Erreur lors de la création du CV:', error);
      throw error;
    }
  },

  // Mettre à jour un CV existant
  async updateResume(resumeId, resumeData) {
    try {
      const resumeRef = doc(db, RESUMES_COLLECTION, resumeId);
      const updateData = {
        ...resumeData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(resumeRef, updateData);
      
      return {
        id: resumeId,
        ...updateData,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du CV:', error);
      throw error;
    }
  },

  // Dupliquer un CV
  async duplicateResume(userId, resumeId) {
    try {
      const originalResume = await this.getResume(resumeId);
      if (!originalResume) {
        throw new Error('CV original non trouvé');
      }

      const { id, createdAt, updatedAt, ...resumeData } = originalResume;
      resumeData.title = `${resumeData.title || 'CV'} (copie)`;

      return await this.createResume(userId, resumeData);
    } catch (error) {
      console.error('Erreur lors de la duplication du CV:', error);
      throw error;
    }
  },

  // Supprimer un CV
  async deleteResume(resumeId) {
    try {
      const resumeRef = doc(db, RESUMES_COLLECTION, resumeId);
      await deleteDoc(resumeRef);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du CV:', error);
      throw error;
    }
  }
};
