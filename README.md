///Scénario 1 - Proposition d'embauche
{
    "noteTechnique": 15,
    "noteSoftSkills": 14,
    "joursAbsence": 2,
    "livreEnAvance": true,
    "commentaireTuteur": "Excellent"
}

////Résultat attendu : { "score": 31, "statut": "Proposition d'Embauche" }






///Scénario 2 - Embauche bloquée (score>16 mais commentaire insuffisant)

{
    "noteTechnique": 18,
    "noteSoftSkills": 19,
    "joursAbsence": 1,
    "livreEnAvance": false,
    "commentaireTuteur": "Insuffisant"
}

///Résultat attendu : { "score": 37, "statut": "Embauche bloquée" }
