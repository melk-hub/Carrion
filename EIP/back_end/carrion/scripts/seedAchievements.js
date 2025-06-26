import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  // APPLICATIONS - Achievements basés sur le nombre total de candidatures
  {
    title: 'Premier pas',
    description: 'Envoyer sa première candidature',
    category: 'APPLICATIONS',
    type: 'COUNT',
    threshold: 1,
    condition: 'applications_count >= 1',
    points: 10,
  },
  {
    title: 'Démarrage solide',
    description: 'Envoyer 5 candidatures',
    category: 'APPLICATIONS',
    type: 'COUNT',
    threshold: 5,
    condition: 'applications_count >= 5',
    points: 25,
  },
  {
    title: 'Persévérant',
    description: 'Envoyer 10 candidatures',
    category: 'APPLICATIONS',
    type: 'COUNT',
    threshold: 10,
    condition: 'applications_count >= 10',
    points: 50,
  },
  {
    title: 'Déterminé',
    description: 'Envoyer 25 candidatures',
    category: 'APPLICATIONS',
    type: 'COUNT',
    threshold: 25,
    condition: 'applications_count >= 25',
    points: 100,
  },
  {
    title: 'Machine à candidater',
    description: 'Envoyer 50 candidatures',
    category: 'APPLICATIONS',
    type: 'COUNT',
    threshold: 50,
    condition: 'applications_count >= 50',
    points: 200,
  },
  {
    title: 'Centurion',
    description: 'Envoyer 100 candidatures',
    category: 'APPLICATIONS',
    type: 'COUNT',
    threshold: 100,
    condition: 'applications_count >= 100',
    points: 500,
  },

  // STREAK - Achievements basés sur les séries consécutives
  {
    title: 'Consistance',
    description: 'Envoyer des candidatures 3 jours consécutifs',
    category: 'STREAK',
    type: 'STREAK',
    threshold: 3,
    condition: 'consecutive_days >= 3',
    points: 75,
  },
  {
    title: 'Habitude',
    description: 'Envoyer des candidatures 7 jours consécutifs',
    category: 'STREAK',
    type: 'STREAK',
    threshold: 7,
    condition: 'consecutive_days >= 7',
    points: 150,
  },

  // INTERVIEWS - Achievements basés sur les entretiens
  {
    title: 'Premier entretien',
    description: 'Décrocher son premier entretien',
    category: 'INTERVIEWS',
    type: 'COUNT',
    threshold: 1,
    condition: 'interviews_count >= 1',
    points: 100,
  },
  {
    title: 'Séducteur',
    description: 'Décrocher 5 entretiens',
    category: 'INTERVIEWS',
    type: 'COUNT',
    threshold: 5,
    condition: 'interviews_count >= 5',
    points: 250,
  },
  {
    title: 'Charmeur',
    description: "Avoir un taux d'entretien supérieur à 20%",
    category: 'INTERVIEWS',
    type: 'PERCENTAGE',
    threshold: 20,
    condition: 'interview_rate >= 20',
    points: 300,
  },

  // SUCCESS - Achievements basés sur les succès d'embauche
  {
    title: 'Première victoire',
    description: "Recevoir sa première offre d'emploi",
    category: 'SUCCESS',
    type: 'COUNT',
    threshold: 1,
    condition: 'offers_count >= 1',
    points: 500,
  },
  {
    title: 'Choix cornélien',
    description: 'Avoir le choix entre plusieurs offres',
    category: 'SUCCESS',
    type: 'COUNT',
    threshold: 2,
    condition: 'offers_count >= 2',
    points: 750,
  },

  // PROFILE - Achievements basés sur la completion du profil
  {
    title: 'Profil complet',
    description: 'Compléter 100% de son profil',
    category: 'PROFILE',
    type: 'PERCENTAGE',
    threshold: 100,
    condition: 'profile_completion >= 100',
    points: 150,
  },
  {
    title: 'CV en ligne',
    description: 'Télécharger son CV',
    category: 'PROFILE',
    type: 'SPECIAL',
    threshold: 1,
    condition: 'has_cv = true',
    points: 50,
  },

  // MILESTONE - Achievements de milestones spéciaux
  {
    title: 'Premier jour',
    description: "S'inscrire sur Carrion",
    category: 'MILESTONE',
    type: 'SPECIAL',
    threshold: 1,
    condition: 'registration = true',
    points: 25,
  },
  {
    title: 'Première semaine',
    description: 'Utiliser Carrion pendant 7 jours',
    category: 'MILESTONE',
    type: 'TIME_BASED',
    threshold: 7,
    condition: 'active_days >= 7',
    points: 100,
  },

  // SEASONAL - Achievements saisonniers
  {
    title: 'Bonne année',
    description: 'Envoyer une candidature le 1er janvier',
    category: 'SEASONAL',
    type: 'SPECIAL',
    threshold: 1,
    condition: 'new_year_application = true',
    points: 100,
  },

  // INTERACTION - Achievements basés sur l'utilisation de l'app
  {
    title: 'Explorer',
    description: "Visiter toutes les sections de l'app",
    category: 'INTERACTION',
    type: 'COUNT',
    threshold: 5,
    condition: 'sections_visited >= 5',
    points: 100,
  },
  {
    title: 'Méthodique',
    description: 'Exporter ses données',
    category: 'INTERACTION',
    type: 'SPECIAL',
    threshold: 1,
    condition: 'data_exported = true',
    points: 150,
  },
];

async function seedAchievements() {
  try {
    console.log('Début du seeding des achievements...');

    // Supprimer tous les achievements existants (en gardant les relations utilisateur)
    console.log('Suppression des achievements existants...');
    const deletedCount = await prisma.carrionAchievement.deleteMany({});
    console.log(`${deletedCount.count} achievements supprimés`);

    // Insérer les nouveaux achievements
    console.log('Insertion des nouveaux achievements...');
    const createdAchievements = await prisma.carrionAchievement.createMany({
      data: achievements,
      skipDuplicates: true,
    });

    console.log(`${createdAchievements.count} achievements créés avec succès!`);

    // Statistiques par catégorie
    const stats = {};
    achievements.forEach((achievement) => {
      if (!stats[achievement.category]) {
        stats[achievement.category] = 0;
      }
      stats[achievement.category]++;
    });

    console.log('\nRépartition par catégorie:');
    Object.entries(stats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} achievements`);
    });

    console.log(`\nTotal: ${achievements.length} achievements disponibles`);
    console.log('Seeding terminé avec succès!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAchievements().catch((error) => {
    console.error(' Erreur fatale:', error);
    process.exit(1);
  });
}

export { seedAchievements, achievements };
