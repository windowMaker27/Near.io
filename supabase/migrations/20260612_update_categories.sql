-- Migration : nettoyage catégories Near.io
-- Supprime : boucherie, poissonnerie, fromagerie, cave_vins, traiteur (deli)
-- Fusionne : parapharmacy → pharmacy
-- Ajoute   : pharmacy, fast_food, restaurant, other

-- 1. Fusionner parapharmacy → pharmacy
UPDATE place_submissions
SET category = 'pharmacy'
WHERE category IN ('parapharmacy', 'parapharmacie', 'parapharmacies', 'chemist');

-- 2. Reclasser les catégories retirées en 'other'
UPDATE place_submissions
SET category = 'other'
WHERE category IN (
  'butcher',     'boucherie',    'boucheries',
  'fishmonger',  'poissonnerie', 'poissonneries',
  'cheese',      'fromagerie',   'fromageries',
  'wine',        'cave_vins',    'cave-vins',    'cave_a_vins',
  'deli',        'traiteur',     'traiteurs'
);

-- 3. Contrainte CHECK optionnelle (décommenter pour l'activer) :
-- ALTER TABLE place_submissions
--   ADD CONSTRAINT category_valid CHECK (category IN (
--     'supermarket','convenience','bakery','grocery','organic','halal',
--     'pharmacy','fast_food','restaurant','other','street_vendor','unknown'
--   ));
