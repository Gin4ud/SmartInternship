const express = require('express');
const app = express();

app.use(express.json());

function validerNotes(noteTechnique, noteSoftSkills) {
  if (noteTechnique == null) {
    return { error: "Note Technique manquante", statusCode: 400 };
  }
  if (noteSoftSkills == null) {
    return { error: "Note Soft Skills manquante", statusCode: 400 };
  }
  return null;
}

function calculerScore(noteTechnique, noteSoftSkills, livreEnAvance) {
  let score = noteTechnique + noteSoftSkills;
  if (livreEnAvance === true) {
    score += 2;
  }
  return score;
}

function plafonnerScore(score, joursAbsence) {
  if (joursAbsence > 5 && score > 12) {
    return 12;
  }
  return score;
}

function determinerStatut(score, joursAbsence, commentaireTuteur) {
  if (joursAbsence > 5) {
    return "Pas de proposition";
  }
  if (score > 16 && commentaireTuteur === "Insuffisant") {
    return "Embauche bloquée";
  }
  if (score > 16) {
    return "Proposition d'Embauche";
  }
  return "Pas de proposition";
}

function evaluerStagiaire(noteTechnique, noteSoftSkills, joursAbsence, livreEnAvance, commentaireTuteur) {
  const erreur = validerNotes(noteTechnique, noteSoftSkills);
  if (erreur) return erreur;

  const scoreAvantPlafond = calculerScore(noteTechnique, noteSoftSkills, livreEnAvance);
  const scoreFinal = plafonnerScore(scoreAvantPlafond, joursAbsence);
  const statut = determinerStatut(scoreFinal, joursAbsence, commentaireTuteur);

  return { score: scoreFinal, statut };
}

app.post('/api/intern-eval', (req, res) => {
    const resultat = evaluerStagiaire(
        req.body.noteTechnique,
        req.body.noteSoftSkills,
        req.body.joursAbsence,
        req.body.livreEnAvance,
        req.body.commentaireTuteur
    );

    if (resultat.error) {
        return res.status(resultat.statusCode).json({ error: resultat.error });
    }

    res.json(resultat);


});

app.get('/api/test', (req, res) => {
    console.log("Route /api/test appelée avec succès");
    res.json({
        message: "Le serveur fonctionne !",
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

if (require.main === module) {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
}

module.exports = evaluerStagiaire;