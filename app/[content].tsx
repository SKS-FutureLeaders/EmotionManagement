import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Video } from 'expo-av';

const ContentViewer = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { fileUrl, type, title, description } = params;

    const handleDownload = async () => {
        try {
            if (Platform.OS === 'web') {
                window.open(fileUrl as string, '_blank');
            } else {
                const filename = (fileUrl as string).split('/').pop();
                const localFile = `${FileSystem.documentDirectory}${filename}`;
                
                const download = await FileSystem.downloadAsync(
                    fileUrl as string,
                    localFile
                );

                if (download.status === 200) {
                    await Sharing.shareAsync(download.uri);
                }
            }
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const renderContent = () => {
        if (Platform.OS === 'web') {
            // For web platform
            return (
                <iframe
                    src={fileUrl as string}
                    style={{
                        width: '100%',
                        height: '80vh',
                        border: 'none'
                    }}
                    allow="fullscreen"
                />
            );
        } else {
            // For mobile platforms
            switch (type) {
                case 'video':
                    return (
                        <Video
                            source={{ uri: fileUrl as string }}
                            useNativeControls
                            style={styles.contentView}
                            resizeMode="contain"
                        />
                    );
                case 'image':
                    return (
                        <Image
                            source={{ uri: fileUrl as string }}
                            style={styles.contentView}
                            resizeMode="contain"
                        />
                    );
                case 'pdf':
                case 'text':
                    return (
                        <View style={styles.fallbackContainer}>
                            <Text style={styles.fallbackText}>
                                To view this content, please use the download button above.
                            </Text>
                            <FontAwesome5 
                                name={type === 'pdf' ? 'file-pdf' : 'file-alt'} 
                                size={50} 
                                color="#6A5ACD" 
                            />
                        </View>
                    );
                default:
                    return <Text>Unsupported content type</Text>;
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome5 name="arrow-left" size={24} color="#6A5ACD" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
                    <FontAwesome5 name="download" size={24} color="#6A5ACD" />
                </TouchableOpacity>
            </View>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.contentContainer}>
                {renderContent()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F0E3',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A4A7C',
        marginHorizontal: 15,
        fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'sans-serif-condensed',
    },
    description: {
        padding: 15,
        fontSize: 16,
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        margin: 10,
        borderRadius: 10,
        overflow: 'hidden',
    },
    contentView: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    fallbackText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'sans-serif',
    },
    backButton: {
        padding: 5,
    },
    downloadButton: {
        padding: 5,
    },
});

export default ContentViewer;
