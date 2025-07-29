import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Video } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simplify dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIDEO_WIDTH = Platform.OS === 'web' ? 640 : SCREEN_WIDTH * 0.9;
const VIDEO_HEIGHT = VIDEO_WIDTH * (9/16); // Standard 16:9 aspect ratio

const CARD_PADDING = 16;
const HEADER_HEIGHT = 100; // Approximate height for title and description
const VIDEO_CONTAINER_WIDTH = SCREEN_WIDTH * 0.6; // 60% of screen width
const VIDEO_CONTAINER_HEIGHT = (SCREEN_HEIGHT - HEADER_HEIGHT) * 0.45; // 45% of remaining space

interface ContentFile {
    fileUrl: string;
    mimeType: string;
    originalName: string;
    size: number;
}

interface Content {
    _id: string;
    type: string;
    heading: string;
    description: string;
    ageRange: {
        lower: number;
        upper: number;
    };
    files: ContentFile[];
}

const VideoContent = () => {
    const router = useRouter();
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideoContent();
    }, []);

    const fetchVideoContent = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/child/content/videos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setContents(data.content);
            } else {
                console.error('Error in response:', data.message);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.replace('/content-library');  // Changed to router.replace
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <FontAwesome5 name="arrow-left" size={24} color="#6A5ACD" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Video Library</Text>
            </View>

            <ScrollView style={styles.contentList}>
                {loading ? (
                    <Text style={styles.loadingText}>Loading videos...</Text>
                ) : contents.length === 0 ? (
                    <Text style={styles.noContentText}>No videos available</Text>
                ) : (
                    contents.map((content) => (
                        <View key={content._id} style={styles.contentCard}>
                            <View style={styles.contentInfo}>
                                <Text style={styles.contentTitle}>{content.heading}</Text>
                                <Text style={styles.description}>{content.description}</Text>
                                <Text style={styles.ageRange}>
                                    Age: {content.ageRange.lower} - {content.ageRange.upper} years
                                </Text>
                            </View>
                            {content.files.map((file, index) => (
                                <View key={index} style={styles.videoContainer}>
                                    <Video
                                        source={{ 
                                            uri: file.fileUrl.startsWith('http') 
                                                ? file.fileUrl 
                                                : `http://localhost:5000${file.fileUrl}` 
                                        }}
                                        rate={1.0}
                                        volume={1.0}
                                        isMuted={false}
                                        resizeMode="contain"
                                        shouldPlay={false}
                                        useNativeControls
                                        style={styles.video}
                                    />
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F0E3',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4A4A7C',
        fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
    },
    contentList: {
        padding: 15,
    },
    contentCard: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: CARD_PADDING,
        marginHorizontal: 16,
        marginVertical: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#8D6E63',
        maxHeight: SCREEN_HEIGHT * 0.8, // Limit card height
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginBottom: 20, // Add extra bottom margin
    },
    contentInfo: {
        width: '100%',
        marginBottom: 12, // Increased margin bottom
        paddingHorizontal: 8,
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A4A7C',
        marginBottom: 4,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
    },
    ageRange: {
        fontSize: 12,
        color: '#FF9800',
        marginBottom: 8,
        textAlign: 'center',
    },
    videoContainer: {
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        backgroundColor: '#000',
        borderRadius: 8,
        overflow: 'hidden',
        marginVertical: 12,
        alignSelf: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        borderRadius: 8,
    },
    videoPoster: {
        backgroundColor: '#000',
        resizeMode: 'contain',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    noContentText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default VideoContent;
