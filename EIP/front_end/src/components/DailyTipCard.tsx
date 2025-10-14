import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from '../app/(dashboard)/home/Home.module.css';

const DailyTipCard = ({ className = '' }) => {
  const { t } = useLanguage();

  // Fonction pour obtenir le conseil du jour basé sur la date
  const getDailyTip = () => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    // Cycle sur 28 jours pour couvrir un mois
    const tipNumber = ((dayOfMonth - 1) % 28) + 1;
    const tipKey = `dailyTip.tip${tipNumber}`;
    
    // Vérifier si la traduction existe et n'est pas la clé elle-même
    const translatedTip = t(tipKey);
    if (translatedTip && translatedTip !== tipKey) {
      return translatedTip;
    }
    
    // Fallback vers les conseils hardcodés si la traduction n'existe pas
    const fallbackTips = [
      "Personnalisez votre lettre de motivation pour chaque candidature. Les recruteurs apprécient les candidats qui montrent un réel intérêt pour leur entreprise.",
      "Utilisez des mots-clés pertinents dans votre CV en lien avec l'offre d'emploi. Cela améliore vos chances d'être repéré par les systèmes de tri automatique.",
      "Préparez 3-4 questions pertinentes à poser en fin d'entretien. Cela montre votre intérêt pour le poste et l'entreprise.",
      "Créez un portfolio en ligne pour présenter vos réalisations et projets. Un lien dans votre CV peut faire la différence.",
      "Suivez les entreprises qui vous intéressent sur LinkedIn. Cela vous tient informé de leurs actualités et opportunités.",
      "Relancez poliment vos candidatures après 1-2 semaines sans réponse. Un simple message peut relancer votre dossier.",
      "Adaptez votre CV à chaque poste en mettant en avant les compétences les plus pertinentes pour l'offre.",
      "Préparez des exemples concrets de vos réalisations avec la méthode STAR (Situation, Tâche, Action, Résultat).",
      "Optimisez votre profil LinkedIn avec une photo professionnelle et un résumé accrocheur. C'est souvent le premier contact avec les recruteurs.",
      "Entraînez-vous à présenter votre parcours en 2 minutes. Cette présentation courte est souvent demandée en début d'entretien.",
      "Renseignez-vous sur le nom de votre interlocuteur avant l'entretien. Personnaliser vos échanges crée une meilleure connexion.",
      "Tenez un tableau de bord de vos candidatures pour éviter les doublons et assurer un suivi efficace.",
      "Mettez en avant vos soft skills avec des exemples précis. Les compétences humaines sont de plus en plus recherchées.",
      "Préparez des versions courtes et longues de votre CV selon le type de candidature (spontanée ou en réponse à une offre).",
      "Utilisez Google Alertes pour être informé des nouvelles offres dans votre domaine et des actualités de vos entreprises cibles.",
      "Soignez votre e-réputation en vérifiant ce qui apparaît quand on tape votre nom sur Google. Supprimez le contenu non professionnel.",
      "Participez à des événements de networking dans votre secteur. Les recommandations internes augmentent vos chances d'être embauché.",
      "Préparez des questions sur la culture d'entreprise lors des entretiens. Cela montre que vous vous projetez sur le long terme.",
      "Mettez régulièrement à jour vos compétences avec des formations en ligne. Mentionnez vos certifications récentes.",
      "Créez plusieurs versions de votre CV pour différents types de postes tout en gardant une cohérence dans votre parcours.",
      "Préparez-vous aux questions difficiles comme 'Parlez-moi de vos faiblesses' en tournant vos réponses positivement.",
      "Utilisez des chiffres pour quantifier vos réalisations : X% d'augmentation, Y€ de budget géré, équipe de Z personnes.",
      "Arrivez 10-15 minutes en avance à vos entretiens. Cela vous permet de vous installer sereinement et de faire bonne impression.",
      "Préparez un plan B pour vos entretiens vidéo : testez votre connexion, l'éclairage et ayez un numéro de téléphone de secours.",
      "Envoyez un message de remerciement dans les 24h après l'entretien. Cela renforce votre motivation et votre professionnalisme.",
      "Analysez les offres d'emploi pour identifier les compétences les plus recherchées dans votre secteur et les développer.",
      "Créez un réseau de contacts diversifié : anciens collègues, professeurs, professionnels de votre secteur.",
      "Restez authentique lors des entretiens. Les recruteurs savent détecter les candidats qui jouent un rôle plutôt que d'être eux-mêmes."
    ];
    
    return fallbackTips[(tipNumber - 1) % fallbackTips.length];
  };

  const currentTip = getDailyTip();

  return (
    <div className={`${styles.card} ${styles.tipsCard} ${className}`}>
      <div className={styles.cardHeader}>
        <h3>💡 {t('dailyTip.title') || 'Conseil du jour'}</h3>
      </div>
      <div className={styles.tipContent}>
        <p>
          {currentTip}
        </p>
      </div>
    </div>
  );
};

export default DailyTipCard; 