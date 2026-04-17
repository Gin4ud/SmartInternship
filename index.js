const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/intern-eval', (req, res) => {
    let noteTechnique = req.body.noteTechnique;
    let noteSoftSkills = req.body.noteSoftSkills;
    let joursAbsence = req.body.joursAbsence;
    let livreEnAvance = req.body.livreEnAvance;
    let commentaireTuteur = req.body.commentaireTuteur;

    let statut = "Évalué";
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
            return res.status(400).json({ error: "Note Soft Skills manquante" });
        }
    } else {
        return res.status(400).json({ error: "Note Technique manquante" });
    }

    return res.json({ 
        score: scoreFinal, 
        statut: statut 
    });
});

app.get('/api/test', (req, res) => {
    console.log("Route /api/test appelée avec succès");
    res.json({ 
        message: "Le serveur fonctionne !", 
        status: "OK", 
        timestamp: new Date().toISOString() 
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});