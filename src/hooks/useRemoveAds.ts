/**
 * useRemoveAds — gestion de l'achat in-app "Supprimer les pubs" via RevenueCat.
 *
 * Identifiant produit App Store : io.near.app.remove_ads
 * Prix : 0,99€ (achat unique, non-consommable)
 *
 * Setup requis avant que cela fonctionne :
 *   1. Installer : npx expo install react-native-purchases
 *   2. Créer le produit dans App Store Connect :
 *      - Type : Achat intégré — Non consommable
 *      - ID : io.near.app.remove_ads
 *      - Prix : 0,99€
 *   3. Créer un compte RevenueCat (revenuecat.com) et relier l'app
 *   4. Remplacer REVENUECAT_API_KEY_IOS par la clé iOS du dashboard RevenueCat
 *   5. Ajouter le plugin dans app.json :
 *      ["react-native-purchases", { "iosApiKey": "<ta-cle>" }]
 *   6. Rebuilder EAS
 */
import { useState } from 'react';
import { Alert } from 'react-native';
import { useAdsStore } from '@/store/adsStore';

// TODO : remplacer par ta clé RevenueCat iOS
const REVENUECAT_API_KEY_IOS = 'REVENUECAT_IOS_KEY_PLACEHOLDER';
const ENTITLEMENT_ID = 'remove_ads';

export function useRemoveAds() {
  const { adsRemoved, setAdsRemoved } = useAdsStore();
  const [loading, setLoading] = useState(false);

  async function purchase() {
    setLoading(true);
    try {
      // Lazy import pour éviter les erreurs si le SDK n'est pas installé
      const Purchases = (await import('react-native-purchases')).default;
      const PurchasesPackageType = (await import('react-native-purchases')).PACKAGE_TYPE;

      await Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });

      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        (p) => p.packageType === PurchasesPackageType.LIFETIME,
      );

      if (!pkg) {
        Alert.alert('Indisponible', 'L’offre n’est pas disponible pour le moment.');
        return;
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        setAdsRemoved(true);
        Alert.alert('✨ Merci !', 'Les publicités ont été supprimées.');
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Erreur', e.message ?? 'L’achat a échoué.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function restore() {
    setLoading(true);
    try {
      const Purchases = (await import('react-native-purchases')).default;
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        setAdsRemoved(true);
        Alert.alert('Achats restaurés', 'Les publicités ont été supprimées.');
      } else {
        Alert.alert('Aucun achat trouvé', 'Aucun achat à restaurer sur ce compte Apple.');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'La restauration a échoué.');
    } finally {
      setLoading(false);
    }
  }

  return { adsRemoved, loading, purchase, restore };
}
