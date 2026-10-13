# Story 5.3 — Notification terrain : comment ça marche

## L'idée en une phrase
Quand tu arrives près d'un sommet que tu as regardé, le téléphone te souffle « Tu es au sommet ! Mer de nuage visible ? » et un tap ouvre directement la question Oui/Non.

## Pas de serveur ici
Ce n'est **pas** un push : l'iPhone se prévient lui-même (notification *locale*). Aucune position n'est envoyée ni stockée côté serveur.

## Deux modes (décision : on ne force rien)
```
                    permission GPS « Toujours » déjà accordée ?
                          │                      │
                         OUI                    NON
                          │                      │
        Geofencing iOS (app fermée OK)     Détection au premier plan
        rayon 500 m, notification locale   (app ouverte) → le sheet s'ouvre direct
```
On ne demande JAMAIS « Toujours » : si l'utilisateur l'a mis dans les réglages iOS, il en profite.

## Les garde-fous
- Préférence « Validation terrain GPS » désactivée → rien, dans les deux modes (copie locale relue à chaque focus / retour au premier plan, initialisée depuis le serveur).
- Sommets surveillés : les 3 derniers consultés, 48 h max. Cooldown : 1 notification / sommet / 12 h.
- Déconnexion ou suppression du compte → tout l'état local terrain est effacé.

## Le tap
Notification `{type:'terrain', slug}` → on charge le sommet, on l'ouvre à l'accueil, et le sheet de validation s'ouvre dès que la prévision est affichée.

## Fichiers impactés (mobile)
`src/utils/terrainWatch.ts`, `src/services/terrainGeofence.ts`, `src/hooks/useTerrainGeofence.ts`, `useTerrainNotificationTap.ts`, `usePendingTerrainOpen.ts`, `useTerrainPref.ts`, `useTerrainAutoDetect.ts` (paramètre `enabled`), `useNotificationPreferences.ts`, `src/contexts/AuthContext.tsx`, `src/app/_layout.tsx`, `src/app/(tabs)/index.tsx`, `src/locales/fr.ts` / `en.ts`, `app.json`, `package.json` (`expo-task-manager`).

## Limite connue
Quand l'app est tuée, la langue de la notification suit la langue de l'iPhone (le choix de langue in-app n'est pas persisté).
