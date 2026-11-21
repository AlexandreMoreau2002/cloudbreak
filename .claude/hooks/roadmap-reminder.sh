#!/bin/bash
# PostToolUse(Bash) : rappelle à Claude de mettre à jour la carte de roadmap
# après un événement de livraison (merge de PR, tag, release, push vers develop/main/release).
# Règle complète : section « Suivi de chantier » du CLAUDE.md racine.

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null)
[ -z "$cmd" ] && exit 0

# La mise à jour de la carte elle-même ne doit pas redéclencher le rappel.
case "$cmd" in *docs/roadmap*) exit 0 ;; esac

if printf '%s' "$cmd" | grep -Eq 'gh pr merge|gh release create|git tag +-a|git push[^|;&]* (origin )?(HEAD:)?(main|develop|release/[^ ]+)( |$)'; then
  jq -n '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: "ROADMAP : un événement de livraison vient d’avoir lieu (merge, tag, release ou push vers develop/main/release). Si une fonctionnalité a changé de statut (develop, attente Apple, prod), mets à jour docs/roadmap/roadmap.json puis republie la carte (règle « Carte de roadmap » du CLAUDE.md racine). Sinon, ignore ce rappel."}}'
fi
exit 0
