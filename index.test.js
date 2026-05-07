const evaluerStagiaire = require('./index');

describe('evaluerStagiaire', () => {
  // === Gestion des erreurs ===
  describe('validation des notes', () => {
    test('retourne une erreur si noteTechnique est null', () => {
      const result = evaluerStagiaire(null, 8, 0, false, 'Bon');
      expect(result).toEqual({
        error: 'Note Technique manquante manquante',
        statusCode: 400
      });
    });

    test('retourne une erreur si noteSoftSkills est null', () => {
      const result = evaluerStagiaire(10, null, 0, false, 'Bon');
      expect(result).toEqual({
        error: 'Note Soft Skills manquante',
        statusCode: 400
      });
    });
  });

  // === Calcul de base sans bonus ni absence ===
  describe('calcul de base', () => {
    test('calcule correctement la somme technique + soft skills', () => {
      const result = evaluerStagiaire(8, 7, 0, false, 'Bien');
      expect(result).toEqual({ score: 15, statut: 'Pas de proposition' });
    });

    test('statut Proposition d\'Embauche quand score > 16', () => {
      const result = evaluerStagiaire(9, 8, 0, false, 'Bien'); // 17 > 16
      expect(result).toEqual({ score: 17, statut: 'Proposition d\'Embauche' });
    });
  });

  // === Bonus livraison en avance ===
  describe('bonus livraison en avance', () => {
    test('ajoute +2 points si livreEnAvance = true', () => {
      const result = evaluerStagiaire(8, 7, 0, true, 'Bien'); // 15+2=17
      expect(result).toEqual({ score: 17, statut: 'Proposition d\'Embauche' });
    });

    test('ne déclenche pas le bonus si livreEnAvance = false', () => {
      const result = evaluerStagiaire(8, 7, 0, false, 'Bien');
      expect(result).toEqual({ score: 15, statut: 'Pas de proposition' });
    });
  });

  // === Absences > 5 jours ===
  describe('plafonnement à 12 si absence > 5 jours', () => {
    test('plafonne le score à 12 quand score initial > 12', () => {
      const result = evaluerStagiaire(10, 8, 6, false, 'Bien'); // 18 -> plafonné 12
      expect(result).toEqual({ score: 12, statut: 'Pas de proposition' });
    });

    test('ne plafonne pas si score initial <= 12', () => {
      const result = evaluerStagiaire(6, 4, 6, false, 'Bien'); // 10 <= 12
      expect(result).toEqual({ score: 10, statut: 'Pas de proposition' });
    });

    test('avec bonus +2 puis plafonnement', () => {
      const result = evaluerStagiaire(9, 8, 6, true, 'Bien'); // 17+2=19 -> plafonné 12
      expect(result).toEqual({ score: 12, statut: 'Pas de proposition' });
    });
  });

  // === Commentaire "Insuffisant" bloque l'embauche ===
  describe('blocage par commentaire "Insuffisant"', () => {
    test('statut "Embauche bloquée" si score > 16 et commentaire = "Insuffisant"', () => {
      const result = evaluerStagiaire(9, 8, 0, false, 'Insuffisant'); // 17
      expect(result).toEqual({ score: 17, statut: 'Embauche bloquée' });
    });

    test('statut "Proposition d\'Embauche" si score > 16 et commentaire différent', () => {
      const result = evaluerStagiaire(9, 8, 0, false, 'Excellent');
      expect(result).toEqual({ score: 17, statut: 'Proposition d\'Embauche' });
    });

    test('pas d\'effet si score <= 16 (même avec "Insuffisant")', () => {
      const result = evaluerStagiaire(8, 7, 0, false, 'Insuffisant'); // 15
      expect(result).toEqual({ score: 15, statut: 'Pas de proposition' });
    });

    test('commentaire "Insuffisant" avec absence > 5 jours (score plafonné à 12) => pas de blocage car score <= 16', () => {
      const result = evaluerStagiaire(10, 9, 6, false, 'Insuffisant'); // 19 -> plafonné 12
      // Dans l'implémentation actuelle, avec absence>5, on ne vérifie pas le commentaire
      expect(result).toEqual({ score: 12, statut: 'Pas de proposition' });
    });
  });

  // === Cas particuliers ===
  describe('cas limites', () => {
    test('score exactement 16 : pas de proposition', () => {
      const result = evaluerStagiaire(8, 8, 0, false, 'Bien'); // 16
      expect(result).toEqual({ score: 16, statut: 'Pas de proposition' });
    });

    test('score exactement 17 avec bonus et absence > 5 : plafonné 12', () => {
      const result = evaluerStagiaire(8, 7, 6, true, 'Bien'); // 15+2=17 -> plafonné 12
      expect(result).toEqual({ score: 12, statut: 'Pas de proposition' });
    });

    test('absence = 5 jours (pas >5) : pas de plafonnement', () => {
      const result = evaluerStagiaire(10, 8, 5, false, 'Bien'); // 18
      expect(result).toEqual({ score: 18, statut: 'Proposition d\'Embauche' });
    });
  });
  // === Double null ===
describe('validation des deux notes manquantes', () => {
  test('retourne une erreur noteTechnique en priorité si les deux notes sont null', () => {
    const result = evaluerStagiaire(null, null, 0, false, 'Bien');
    expect(result).toEqual({
      error: 'Note Technique manquante manquante',
      statusCode: 400
    });
  });
});

// === livreEnAvance=true + absence > 5 + score après bonus <= 12 ===
describe('livraison en avance avec absence > 5 jours et score faible', () => {
  test('retourne Pas de proposition si score après bonus <= 12 malgré livreEnAvance=true', () => {
    const result = evaluerStagiaire(4, 4, 6, true, 'Bien'); // 8+2=10 <= 12
    expect(result).toEqual({ score: 10, statut: 'Pas de proposition' });
  });
});

// === livreEnAvance=true + commentaire Insuffisant ===
describe('blocage embauche avec livraison en avance', () => {
  test('bloque l\'embauche si livreEnAvance=true, score > 16 et commentaire Insuffisant', () => {
    const result = evaluerStagiaire(9, 8, 0, true, 'Insuffisant'); // 17+2=19
    expect(result).toEqual({ score: 19, statut: 'Embauche bloquée' });
  });

  test('propose l\'embauche si livreEnAvance=true, score > 16 et commentaire non Insuffisant', () => {
    const result = evaluerStagiaire(9, 8, 0, true, 'Excellent'); // 17+2=19
    expect(result).toEqual({ score: 19, statut: 'Proposition d\'Embauche' });
  });
});

// === Score exactement à 12 avec absence > 5 ===
describe('plafonnement : score déjà à 12 avec absence > 5 jours', () => {
  test('ne plafonne pas si le score est exactement 12 (pas > 12)', () => {
    const result = evaluerStagiaire(6, 6, 6, false, 'Bien'); // 12 pas > 12
    expect(result).toEqual({ score: 12, statut: 'Pas de proposition' });
  });
});

// === Valeurs extrêmes ===
describe('valeurs extrêmes des notes', () => {
  test('score = 0 si les deux notes sont à 0', () => {
    const result = evaluerStagiaire(0, 0, 0, false, 'Bien');
    expect(result).toEqual({ score: 0, statut: 'Pas de proposition' });
  });

  test('score = 20 si les deux notes sont au maximum sans bonus', () => {
    const result = evaluerStagiaire(10, 10, 0, false, 'Bien');
    expect(result).toEqual({ score: 20, statut: 'Proposition d\'Embauche' });
  });

  test('score = 22 si les deux notes sont au maximum avec bonus livraison', () => {
    const result = evaluerStagiaire(10, 10, 0, true, 'Bien'); // 20+2=22
    expect(result).toEqual({ score: 22, statut: 'Proposition d\'Embauche' });
  });
});
});