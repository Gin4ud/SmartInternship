const express = require('express');
const app = express();

app.use(express.json());

function evaluerStagiaire(noteTechnique, noteSoftSkills, joursAbsence, livreEnAvance, commentaireTuteur) {
    let statut = "";
    let scoreFinal = 0;

    if (noteTechnique != null) {
        if (noteSoftSkills != null) {
            scoreFinal = noteTechnique + noteSoftSkills;

            if (livreEnAvance === true) {
                scoreFinal = scoreFinal + 2;

                if (joursAbsence > 5) {
                    if (scoreFinal > 12) {
                        scoreFinal = 12; // Plafonné à 12
                        // Condition inutile mais qui ajoute de la complexité
                        if (scoreFinal > 16) {
                            statut = "Proposition d'Embauche";
                        } else {
                            statut = "Pas de proposition";
                        }
                    }
                    else {
                        statut = "Pas de proposition";
                    }
                } else {
                    if (scoreFinal > 16) {
                        if (commentaireTuteur === "Insuffisant") {
                            statut = "Embauche bloquée";
                        } else {
                            statut = "Proposition d'Embauche";
                        }
                    } else {
                        statut = "Pas de proposition";
                    }
                }
            } else {
                if (joursAbsence > 5) {
                    if (scoreFinal > 12) {
                        scoreFinal = 12;
                        statut = "Pas de proposition";
                    }
                    else {
                        statut = "Pas de proposition";
                    }
                } else {
                    if (scoreFinal > 16) {
                        if (commentaireTuteur === "Insuffisant") {
                            statut = "Embauche bloquée";
                        } else {
                            statut = "Proposition d'Embauche";
                        }
                    } else {
                        statut = "Pas de proposition";
                    }
                }
            }
        } else {
            return { error: "Note Soft Skills manquante", statusCode: 400 };
        }
    } else {
        return { error: "Note Technique manquante manquante", statusCode: 400 };
    }

    return { score: scoreFinal, statut: statut };
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