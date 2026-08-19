import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";
import { sunsetGradient } from "../theme";

// React Native has no CSS background-clip:text equivalent — this is the
// standard pattern: render the real text once (invisible, for layout), mask
// a gradient rectangle with it. Matches the web wordmark's exact gradient.
export default function GradientText({ children, style }) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: "transparent" }]}>{children}</Text>}>
      <LinearGradient
        colors={sunsetGradient.colors}
        locations={sunsetGradient.locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
