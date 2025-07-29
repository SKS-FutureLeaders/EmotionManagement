import React from "react";
import { Text, ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const ALetterToGrownups = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>A Letter to Grownups</Text>
      <Text style={styles.paragraph}>Hello!</Text>
      <Text style={styles.paragraph}>
        As a parent, student, and working professional, I’ve come to realize that
        anger can be one of the biggest challenges affecting harmony at home,
        school, and the workplace. Many of us—children and adults alike—find
        ourselves stuck in cycles of frustration, especially during transitions
        like coming home from school or work, tackling homework, playing video
        games, or settling in for bedtime.
      </Text>
      <Text style={styles.paragraph}>
        Our goal with this app is to help families and individuals better
        understand and manage anger in a healthy way. By using this app, you’ll
        have the opportunity to connect with your children and support them in
        developing self-awareness and emotional regulation.
      </Text>
      <Text style={styles.paragraph}>
        I encourage you to partner with your child or, if they are 13 or older,
        allow them to explore the app independently. As you navigate the
        activities together, approach the experience with curiosity rather than
        judgment—think of yourself as a detective uncovering clues about what
        triggers anger and how to respond constructively. Share experiences,
        reflect on emotions, and collaborate on strategies to manage anger
        effectively.
      </Text>
      <Text style={styles.paragraph}>
        Throughout this journey, we’ll explore topics such as anger triggers,
        habits, and response patterns. We’ll focus on shifting from reacting to
        responding, improving communication, and fostering self-awareness.
        Additionally, we’ll emphasize kindness—both toward ourselves and
        others—along with gratitude and empathy.
      </Text>
      <Text style={styles.paragraph}>
        A little about me: I am a mom of two young boys, a part-time college
        student pursuing my doctorate, and a professional in the IT industry.
        Like you, I’m on this journey of learning and growth, and I hope this
        app becomes a valuable resource for you and your family.
      </Text>
      <Text style={styles.paragraph}>
        I’d love to hear your feedback as we work together to build a
        supportive community.
      </Text>
      <Text style={styles.signature}>Thank you for joining us!</Text>
      <Text style={styles.signature}>Best regards,</Text>
      <Text style={styles.signature}>Aparna</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/auth/login")}> 
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: "#555",
  },
  signature: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 10,
    color: "#333",
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ALetterToGrownups;
