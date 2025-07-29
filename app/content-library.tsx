import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Dimensions,
    ImageBackground,
    Animated,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ContentCard = ({ title, subtitle, icon, color, emoji, onPress }) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const rotateAnim = React.useRef(new Animated.Value(0)).current;
    const bounceAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.spring(bounceAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 4,
                    useNativeDriver: true,
                }),
                Animated.spring(bounceAnim, {
                    toValue: 0,
                    friction: 3,
                    tension: 4,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleHoverIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 1.1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handleHoverOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '2deg']
    });

    const bounceTransform = bounceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -5]
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            activeOpacity={0.7}
            style={[styles.cardWrapper, Platform.OS === 'web' && styles.webCardWrapper]}
        >
            <Animated.View style={[
                styles.contentCard,
                { 
                    backgroundColor: color, 
                    transform: [
                        { scale: scaleAnim },
                        { rotate: rotate },
                        { translateY: bounceTransform }
                    ] 
                }
            ]}>
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.emoji}>{emoji}</Text>
                        <FontAwesome5 name={icon} size={32} color="#FFF" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.contentTitle}>{title}</Text>
                        <Text style={styles.contentSubtitle}>{subtitle}</Text>
                    </View>
                    <View style={styles.arrowContainer}>
                        <FontAwesome5 name="star" size={20} color="#FFD700" />
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const ContentLibrary = () => {
    const router = useRouter();

    const handleBack = () => {
        router.replace('/(child)/dashboard'); // Updated path to match Expo Router format
    };

    const contentTypes = [
        {
            title: "Picture Gallery",
            subtitle: "Fun pictures to explore!",
            icon: "dragon",
            color: "#FF6B81",
            route: '/image-content',
            emoji: "🎨"
        },
        {
            title: "Fun Videos",
            subtitle: "Watch amazing stories!",
            icon: "robot",
            color: "#70A1FF",
            route: '/video-content',
            emoji: "🎬"
        },
        {
            title: "Story Books",
            subtitle: "Read magical stories!",
            icon: "book-reader",
            color: "#7ED6DF",
            route: '/pdf-content',
            emoji: "📚"
        }
    ];

    return (
        <ImageBackground
            source={{ uri: 'https://img.freepik.com/free-vector/hand-drawn-cartoon-doodles-education_1284-52882.jpg' }}
            style={styles.backgroundImage}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Learning Library</Text>
                        <Text style={styles.headerSubtitle}>Pick something fun to explore! 🎨</Text>
                    </View>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <View style={styles.welcomeMessage}>
                            <FontAwesome5 name="star" size={24} color="#FFD700" />
                            <Text style={styles.welcomeText}>What would you like to discover today?</Text>
                        </View>

                        {contentTypes.map((item, index) => (
                            <ContentCard
                                key={index}
                                title={item.title}
                                subtitle={item.subtitle}
                                icon={item.icon}
                                color={item.color}
                                emoji={item.emoji}
                                onPress={() => router.replace(item.route)} // Changed to replace for consistency
                            />
                        ))}

                        <View style={styles.tipContainer}>
                            <FontAwesome5 name="lightbulb" size={20} color="#FFD700" />
                            <Text style={styles.tipText}>Tap any card to start your adventure!</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%'
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    header: {
        padding: 20,
        backgroundColor: '#6A5ACD',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    backButton: {
        marginRight: 15,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#FFF',
        opacity: 0.9,
        fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    content: {
        padding: 20,
        gap: 15,
    },
    welcomeMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    welcomeText: {
        marginLeft: 10,
        fontSize: 18,
        color: '#4A4A7C',
        fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
    },
    cardWrapper: {
        marginVertical: 10,  // Add some vertical spacing
    },
    webCardWrapper: {
        cursor: 'pointer',
    },
    contentCard: {
        width: '100%',
        minHeight: 130,
        borderRadius: 25,
        padding: 20,
        marginBottom: 15,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        borderWidth: 3,
        borderColor: '#FFF',
        transition: 'transform 0.3s ease',  // Smooth transition for web
        willChange: 'transform',  // Optimize animations
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 70,
        height: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    emoji: {
        position: 'absolute',
        top: -10,
        right: -10,
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
        marginLeft: 15,
    },
    contentTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
    },
    contentSubtitle: {
        fontSize: 16,
        color: '#FFF',
        opacity: 0.9,
        fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
        marginTop: 4,
    },
    arrowContainer: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 15,
        marginTop: 10,
    },
    tipText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
    }
});

export default ContentLibrary;
