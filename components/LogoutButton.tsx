import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/AuthContext'; // Import from AuthContext instead

const LogoutButton = () => {
    const router = useRouter();
    const { logout } = useAuth(); // Now correctly getting logout function

    const handleLogout = async () => {
        await logout();
        router.replace('/auth/login'); // Redirect to login
    };

    return (
        <TouchableOpacity onPress={handleLogout} style={{ padding: 10, backgroundColor: 'red', borderRadius: 5, marginRight: 10 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
    );
};

export default LogoutButton;
