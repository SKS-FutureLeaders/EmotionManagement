import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const PDFContent = () => {
    const router = useRouter();
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPDFContent();
    }, []);

    const fetchPDFContent = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/child/content/pdfs', {
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
            console.error('Error fetching PDFs:', error);
        } finally {
            setLoading(false);
        }
    };

    const openPDF = (url: string) => {
        // Remove the localhost prefix if it exists in the URL
        const cleanUrl = url.replace('http://localhost:5000', '');
        const fullUrl = `http://localhost:5000${cleanUrl}`;
        Linking.openURL(fullUrl);
    };

    const handleBack = () => {
        router.push('/content-library');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <FontAwesome5 name="arrow-left" size={24} color="#6A5ACD" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PDF Library</Text>
            </View>

            <ScrollView style={styles.contentList}>
                {loading ? (
                    <Text style={styles.loadingText}>Loading PDFs...</Text>
                ) : contents.length === 0 ? (
                    <Text style={styles.noContentText}>No PDFs available</Text>
                ) : (
                    contents.map((content) => (
                        <View key={content._id} style={styles.contentCard}>
                            <Text style={styles.contentTitle}>{content.heading}</Text>
                            <Text style={styles.description}>{content.description}</Text>
                            <Text style={styles.ageRange}>
                                Age: {content.ageRange.lower} - {content.ageRange.upper} years
                            </Text>
                            {content.files.map((file, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.pdfButton}
                                    onPress={() => openPDF(file.fileUrl)}
                                >
                                    <FontAwesome5 name="file-pdf" size={24} color="#FF5252" />
                                    <Text style={styles.pdfName}>{file.originalName}</Text>
                                </TouchableOpacity>
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
        padding: 15,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#8D6E63',
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A4A7C',
        marginBottom: 5,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    ageRange: {
        fontSize: 12,
        color: '#FF9800',
        marginBottom: 10,
    },
    pdfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        marginVertical: 5,
    },
    pdfName: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
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

export default PDFContent;
