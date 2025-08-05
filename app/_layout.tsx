import { AuthProvider } from "@/context/authContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen
          name="(modals)/profileModal"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="(modals)/walletModal"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="(modals)/transactionModal"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
