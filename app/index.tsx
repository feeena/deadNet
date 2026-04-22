import { useState, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Linking from "expo-linking";

const isValidUPI = (text: string) =>
  text.toLowerCase().startsWith("upi://pay");

const isLikelyURL = (text: string) =>
  /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/.test(text);

export default function QRScanner() {
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  if (!permission) {
    return <Text>Loading camera...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>No camera permission</Text>
        <Text onPress={requestPermission}>Grant Permission</Text>
      </View>
    );
  }

  const resetAll = () => {
    setShowScanner(false);
    setScanned(false);
    setSuccess(false);
    setError(null);
    fadeAnim.setValue(0);
  };

  const triggerSuccess = () => {
    setSuccess(true);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleScan = async ({ data }: any) => {
    if (scanned) return;

    setScanned(true);
    setError(null);

    const cleanData = data.trim();

    try {
      // 🔵 UPI
      if (isValidUPI(cleanData)) {
        const canOpen = await Linking.canOpenURL(cleanData);

        if (!canOpen) {
          setError("No UPI app found");
          setScanned(false);
          return;
        }

        triggerSuccess();
        await Linking.openURL(cleanData);

        setTimeout(resetAll, 1500);
        return;
      }

      // 🌐 URL
      if (isLikelyURL(cleanData)) {
        const url = cleanData.startsWith("http")
          ? cleanData
          : `https://${cleanData}`;

        const canOpen = await Linking.canOpenURL(url);

        if (!canOpen) {
          setError("Can't open this link");
          setScanned(false);
          return;
        }

        triggerSuccess();
        await Linking.openURL(url);

        setTimeout(resetAll, 1500);
        return;
      }

      // ❌ Unsupported
      setError("Unsupported QR code");
      setScanned(false);
    } catch {
      setError("Something went wrong");
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      {!showScanner ? (
        <TouchableOpacity onPress={() => setShowScanner(true)}>
          <Image
            source={require("../assets/images/scan.png")}
            style={styles.image}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity activeOpacity={1} onPress={resetAll}>
          <View style={{ width: 200, height: 200 }}>
            <CameraView
              style={{ flex: 1 }}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleScan}
            />

            {success && (
              <Animated.View
                style={[styles.successOverlay, { opacity: fadeAnim }]}
              >
                <Text style={styles.successText}>✓ Success</Text>
              </Animated.View>
            )}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
  errorText: {
    marginTop: 20,
    color: "red",
    fontSize: 18,
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  successText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});