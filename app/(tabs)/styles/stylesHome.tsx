import { StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F6",
    padding: 24,
    paddingTop: 72,
  },
  greeting: { color: "#66736D", fontSize: 16 },
  title: { color: "#17342D", fontSize: 38, fontWeight: "800", marginTop: 4 },
  balanceCard: {
    backgroundColor: "#1D6B5B",
    borderRadius: 16,
    marginTop: 32,
    padding: 24,
  },
  cardLabel: {
    color: "#BFE3D4",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  balance: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 12 },
  cardDescription: {
    color: "#DDF1E9",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
  },
  button: { backgroundColor: "#FFFFFF", borderRadius: 8, padding: 12 },
  balanceInterno: { color: "#BFE3D4", fontSize: 18, fontWeight: "800", marginTop: 12 },
});