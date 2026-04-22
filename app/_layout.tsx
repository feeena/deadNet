import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Qr Code Scanner",
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}