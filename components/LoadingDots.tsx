import { spacingY } from "@/constants/theme";
import { scale } from "@/utils/styling";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const LoadingDots = ({ color }: { color: string }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animation: Animated.Value) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: -10,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createAnimation(dot1);
    const anim2 = createAnimation(dot2);
    const anim3 = createAnimation(dot3);

    // Start with slight delay between dots
    anim1.start();
    setTimeout(() => anim2.start(), 100);
    setTimeout(() => anim3.start(), 200);

    // Optional cleanup
    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.dot, { transform: [{ translateY: dot1 }], backgroundColor: color }]}
      />
      <Animated.View
        style={[styles.dot, { transform: [{ translateY: dot2 }], backgroundColor: color }]}
      />
      <Animated.View
        style={[styles.dot, { transform: [{ translateY: dot3 }], backgroundColor: color }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: spacingY._10,
  },
  dot: {
    width: scale(5),
    height: scale(5),
    marginHorizontal: 6,
    borderRadius: 8,
  },
});

export default LoadingDots;
