import { useState } from "react";
import { View, Image, TouchableOpacity, StyleSheet, Text } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function QRScanner() {
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

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

  const handleScan = (data: any) => {
    if (scanned) return;
    setScanned(true);
    console.log("QR Data:", data.data);
  };

  return (
    <View style={styles.container}>
      {!showScanner ? (
        <TouchableOpacity onPress={() => setShowScanner(true)}>
          <Image
            source={require("../../assets/images/scan.png")}
            style={styles.image}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setShowScanner(false);
            setScanned(false); // reset for next time
          }}
        >
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={handleScan}
          />
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
  camera: {
    width: 200,
    height: 200,
  },
});