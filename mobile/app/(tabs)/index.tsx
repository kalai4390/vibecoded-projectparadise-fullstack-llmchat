import { Image } from 'expo-image';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

const roomImages = [
  require('../../assets/images/resort.jpg'),
  require('../../assets/images/react-logo.png'),
  require('../../assets/images/splash-icon.png'),
  require('../../assets/images/partial-react-logo.png'),
  require('../../assets/images/icon.png'),
];
const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
      setCurrent((prev) => (prev + 1) % roomImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      {/* Top half: static hero image and welcome text */}
      <View style={styles.topHalf}>
        <Image
          source={require('../../assets/images/resort.jpg')}
          style={styles.heroImage}
          contentFit="cover"
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.title}>Welcome to Paradise Beach Resort</Text>
          <Text style={styles.subtitle}>Luxury Villas & Prestige Rooms by the Sea</Text>
        </View>
      </View>
      {/* Bottom half: animated carousel behind buttons */}
      <View style={styles.bottomHalf}>
        <Animated.View style={[styles.carousel, { opacity: fadeAnim }]}> 
          <Image
            source={roomImages[current]}
            style={styles.carouselImage}
            contentFit="cover"
          />
        </Animated.View>
        <View style={styles.buttonOverlay}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/booking')}>
            <Text style={styles.buttonText}>Book Room</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.chatButton]} onPress={() => router.push('/(tabs)/chat')}>
            <Text style={styles.buttonText}>Chat with us</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  topHalf: {
    height: height * 0.38,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#0008',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textShadowColor: '#0006',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    marginBottom: 0,
    textAlign: 'center',
  },
  bottomHalf: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  carousel: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  buttonOverlay: {
    zIndex: 2,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 16,
    width: 220,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  chatButton: {
    backgroundColor: '#1D3D47',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
