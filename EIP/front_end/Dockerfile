# Étape 1: Builder - Installation des dépendances et build de l'application
FROM node:18-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production

# Copier les fichiers de gestion de dépendances
COPY package*.json ./

# Installer toutes les dépendances (y compris devDependencies pour le build)
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Lancer le build de l'application Next.js
RUN npx next build

# Étape 2: Runner - Exécution de l'application en production
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Créer un utilisateur et un groupe non-root pour plus de sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis l'étape de build
# Le mode "standalone" crée un dossier avec tout ce qu'il faut
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Donner la propriété du répertoire de travail à l'utilisateur non-root
RUN chown -R nextjs:nodejs /app

# Utiliser l'utilisateur non-root
USER nextjs

EXPOSE 3000

# La commande de démarrage est maintenant différente avec le mode standalone
CMD ["node", "server.js"]