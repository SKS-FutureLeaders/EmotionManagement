import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  useColorScheme,
  ActivityIndicator,
  Image,
} from 'react-native';
import { 
  Moon, 
  Sun, 
  UserCheck, 
  LogOut,
  User,
  Menu,
  X,
  Upload,
  FileText // Add this import
} from 'react-native-feather';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');

interface NavItemProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  isActive: boolean;
  isDarkMode: boolean;
}

interface User {
  name: string;
  type: string;
  email: string;
  no_of_children?: number;
  avatar?: string | null;
}

const NavItem: React.FC<NavItemProps> = ({ title, icon, onPress, isActive, isDarkMode }) => {
  return (
    <TouchableOpacity
      style={[
        styles.navItem,
        isActive && (isDarkMode ? styles.activeNavItemDark : styles.activeNavItem),
      ]}
      onPress={onPress}
    >
      <View style={styles.navIconContainer}>{icon}</View>
      <Text
        style={[
          styles.navText,
          isDarkMode && styles.textDark,
          isActive && styles.activeNavText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const AdminDashboard: React.FC = () => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [activeTab, setActiveTab] = useState('registeredUsers');
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [totalChildren, setTotalChildren] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Update dark mode if system preference changes
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);
  
  useEffect(() => {
    if (activeTab === 'registeredUsers') {
      const refreshInterval = setInterval(() => {
        fetchUsers();
      }, 10000); // Refresh every 2 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [activeTab]);

  useEffect(() => {
    const startGlowAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startGlowAnimation();
    return () => glowAnim.stopAnimation();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    
    // Add animation for mode change
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const toggleMenu = () => {
    if (menuOpen) {
      // Close menu
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuOpen(false));
    } else {
      // Open menu
      setMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };
  
  const handleTabPress = (tab: string) => {
    if (tab === 'uploadContent') {
      router.push('/upload_content');
      return;
    }
    if (tab === 'viewContent') {
      router.push('/view_content');
      return;
    }
    setActiveTab(tab);
    if (width < 768) {
      toggleMenu();
    }
  };
 const API_URL = Platform.OS === "web" 
  ? "http://localhost:5000" 
  : "http://192.168.206.225:5000";
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/admin/users`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
        setTotalChildren(data.totalChildren);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'registeredUsers') {
      fetchUsers();
    }
  }, [activeTab]);

  const iconColor = isDarkMode ? '#fff' : '#333';
  const activeIconColor = '#4C6EF5';

  return (
    <Animated.View
      style={[
        styles.container,
        isDarkMode && styles.containerDark,
        { opacity: fadeAnim },
      ]}
    >
      {/* Top Navigation Bar */}
      <View style={[styles.navbar, isDarkMode && styles.navbarDark]}>
        <View style={styles.navbarLeft}>
          {width < 768 && (
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              {menuOpen ? (
                <X stroke={iconColor} width={24} height={24} />
              ) : (
                <Menu stroke={iconColor} width={24} height={24} />
              )}
            </TouchableOpacity>
          )}
          <Text style={[styles.logoText, isDarkMode && styles.textDark]}>
            Admin<Text style={styles.logoAccent}>Dashboard</Text>
          </Text>
        </View>
        
        <View style={styles.navbarRight}>
          <TouchableOpacity
            style={[styles.themeToggle, isDarkMode && styles.themeToggleDark]}
            onPress={toggleDarkMode}
          >
            {isDarkMode ? (
              <Moon stroke="#fff" width={20} height={20} />
            ) : (
              <Sun stroke="#333" width={20} height={20} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.profileButton, isDarkMode && styles.profileButtonDark]}
            onPress={() => handleTabPress('profile')}
          >
            <User stroke={iconColor} width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Side Navigation (Full width) */}
        {width >= 768 ? (
          <View style={[styles.sidebar, isDarkMode && styles.sidebarDark]}>
            <NavItem
              title="Registered Users"
              icon={<UserCheck stroke={activeTab === 'registeredUsers' ? activeIconColor : iconColor} width={24} height={24} />}
              onPress={() => handleTabPress('registeredUsers')}
              isActive={activeTab === 'registeredUsers'}
              isDarkMode={isDarkMode}
            />
            <NavItem
              title="Upload Content"
              icon={<Upload stroke={activeTab === 'uploadContent' ? activeIconColor : iconColor} width={24} height={24} />}
              onPress={() => handleTabPress('uploadContent')}
              isActive={activeTab === 'uploadContent'}
              isDarkMode={isDarkMode}
            />
            <NavItem
              title="View Content"
              icon={<FileText stroke={activeTab === 'viewContent' ? activeIconColor : iconColor} width={24} height={24} />}
              onPress={() => handleTabPress('viewContent')}
              isActive={activeTab === 'viewContent'}
              isDarkMode={isDarkMode}
            />
            <NavItem
              title="Profile"
              icon={<User stroke={activeTab === 'profile' ? activeIconColor : iconColor} width={24} height={24} />}
              onPress={() => handleTabPress('profile')}
              isActive={activeTab === 'profile'}
              isDarkMode={isDarkMode}
            />
            <View style={styles.spacer} />
            <NavItem
              title="Log Out"
              icon={<LogOut stroke={iconColor} width={24} height={24} />}
              onPress={() => console.log('Logging out')}
              isActive={false}
              isDarkMode={isDarkMode}
            />
          </View>
        ) : (
          // Mobile menu
          menuOpen && (
            <Animated.View
              style={[
                styles.mobileMenu,
                isDarkMode && styles.mobileMenuDark,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <NavItem
                title="Registered Users"
                icon={<UserCheck stroke={activeTab === 'registeredUsers' ? activeIconColor : iconColor} width={24} height={24} />}
                onPress={() => handleTabPress('registeredUsers')}
                isActive={activeTab === 'registeredUsers'}
                isDarkMode={isDarkMode}
              />
              <NavItem
                title="Upload Content"
                icon={<Upload stroke={activeTab === 'uploadContent' ? activeIconColor : iconColor} width={24} height={24} />}
                onPress={() => handleTabPress('uploadContent')}
                isActive={activeTab === 'uploadContent'}
                isDarkMode={isDarkMode}
              />
              <NavItem
                title="View Content"
                icon={<FileText stroke={activeTab === 'viewContent' ? activeIconColor : iconColor} width={24} height={24} />}
                onPress={() => handleTabPress('viewContent')}
                isActive={activeTab === 'viewContent'}
                isDarkMode={isDarkMode}
              />
              <NavItem
                title="Profile"
                icon={<User stroke={activeTab === 'profile' ? activeIconColor : iconColor} width={24} height={24} />}
                onPress={() => handleTabPress('profile')}
                isActive={activeTab === 'profile'}
                isDarkMode={isDarkMode}
              />
              <View style={styles.spacer} />
              <NavItem
                title="Log Out"
                icon={<LogOut stroke={iconColor} width={24} height={24} />}
                onPress={() => console.log('Logging out')}
                isActive={false}
                isDarkMode={isDarkMode}
              />
            </Animated.View>
          )
        )}

        {/* Main Content Area */}
        <ScrollView
          style={[styles.mainContent, isDarkMode && styles.mainContentDark]}
          contentContainerStyle={styles.mainContentContainer}
        >
          {activeTab === 'registeredUsers' && (
            <View style={styles.tabContent}>
              <Text style={[styles.tabTitle, isDarkMode && styles.textDark]}>
                Registered Users
              </Text>
              <View style={[styles.statsContainer, isDarkMode && styles.statsContainerDark]}>
                <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                  <Text style={[styles.statNumber, isDarkMode && styles.textDark]}>{users.length}</Text>
                  <Text style={[styles.statLabel, isDarkMode && styles.textDark]}>Total Users</Text>
                </View>
                <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                  <Text style={[styles.statNumber, isDarkMode && styles.textDark]}>
                    {users.filter(u => u.type === 'parent').length}
                  </Text>
                  <Text style={[styles.statLabel, isDarkMode && styles.textDark]}>Parents</Text>
                </View>
                <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                  <Text style={[styles.statNumber, isDarkMode && styles.textDark]}>
                    {totalChildren}
                  </Text>
                  <Text style={[styles.statLabel, isDarkMode && styles.textDark]}>Children</Text>
                </View>
              </View>
              
              <View style={[styles.userList, isDarkMode && styles.userListDark]}>
                {loading ? (
                  <ActivityIndicator size="large" color="#4C6EF5" />
                ) : error ? (
                  <Text style={[styles.errorText, isDarkMode && styles.textDark]}>{error}</Text>
                ) : (
                  users.map((user) => (
                    <TouchableOpacity 
                      key={user.email} 
                      style={[styles.userCard, isDarkMode && styles.userCardDark]}
                      onPress={() => {
                        if (user.type === 'parent') {
                          // Encode the email to handle special characters in URLs
                          const encodedEmail = encodeURIComponent(user.email);
                          router.push(`/parent-profile?email=${encodedEmail}`);
                        }
                      }}
                    >
                      {user.avatar ? (
                        <Image 
                          source={{ uri: user.avatar }} 
                          style={styles.userAvatar}
                        />
                      ) : (
                        <View style={[styles.userAvatar, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ fontSize: 18, color: '#666' }}>
                            {user.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.userInfo}>
                        <Text style={[styles.userName, isDarkMode && styles.textDark]}>
                          {user.name}
                        </Text>
                        <Text style={[styles.userEmail, isDarkMode && styles.textDark]}>
                          {user.email}
                        </Text>
                        <Text style={[styles.userType, isDarkMode && styles.textDark]}>
                          {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                          {user.type === 'parent' && user.no_of_children !== undefined && 
                            ` (${user.no_of_children} children)`}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}

          {activeTab === 'profile' && (
            <View style={styles.tabContent}>
              <Text style={[styles.tabTitle, isDarkMode && styles.textDark]}>
                Admin Profile
              </Text>
              <View style={[styles.profileSection, isDarkMode && styles.profileSectionDark]}>
                <View style={styles.adminAvatar} />
                <Text style={[styles.adminName, isDarkMode && styles.textDark]}>Admin User</Text>
                <Text style={[styles.adminRole, isDarkMode && styles.textDark]}>Super Administrator</Text>
                
                <View style={styles.profileStats}>
                  <View style={[styles.profileStatItem, isDarkMode && styles.profileStatItemDark]}>
                    <Text style={[styles.profileStatValue, isDarkMode && styles.textDark]}>523</Text>
                    <Text style={[styles.profileStatLabel, isDarkMode && styles.textDark]}>Actions</Text>
                  </View>
                  <View style={[styles.profileStatItem, isDarkMode && styles.profileStatItemDark]}>
                    <Text style={[styles.profileStatValue, isDarkMode && styles.textDark]}>128</Text>
                    <Text style={[styles.profileStatLabel, isDarkMode && styles.textDark]}>Reports</Text>
                  </View>
                  <View style={[styles.profileStatItem, isDarkMode && styles.profileStatItemDark]}>
                    <Text style={[styles.profileStatValue, isDarkMode && styles.textDark]}>32</Text>
                    <Text style={[styles.profileStatLabel, isDarkMode && styles.textDark]}>Days Active</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.editProfileButton, isDarkMode && styles.editProfileButtonDark]}
                >
                  <Text style={[styles.editProfileText, isDarkMode && styles.editProfileTextDark]}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  navbarDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  logoAccent: {
    color: '#4C6EF5',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  themeToggleDark: {
    backgroundColor: '#333',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonDark: {
    backgroundColor: '#333',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sidebarDark: {
    backgroundColor: '#1e1e1e',
    borderRightColor: '#333',
  },
  menuButton: {
    marginRight: 16,
  },
  mobileMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 100,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  mobileMenuDark: {
    backgroundColor: '#1e1e1e',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  activeNavItem: {
    backgroundColor: 'rgba(76, 110, 245, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#4C6EF5',
  },
  activeNavItemDark: {
    backgroundColor: 'rgba(76, 110, 245, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#4C6EF5',
  },
  navIconContainer: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  navText: {
    fontSize: 16,
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  activeNavText: {
    color: '#4C6EF5',
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  mainContentDark: {
    backgroundColor: '#121212',
  },
  mainContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  tabContent: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  statsContainerDark: {
    borderColor: '#333',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    minWidth: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statCardDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4C6EF5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  userList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  userListDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userCardDark: {
    borderBottomColor: '#333',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
  },
  activeStatus: {
    color: '#10b981',
  },
  inactiveStatus: {
    color: '#9ca3af',
  },
  userTime: {
    fontSize: 14,
    color: '#666',
  },
  userRegistered: {
    fontSize: 14,
    color: '#666',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userType: {
    fontSize: 12,
    color: '#4C6EF5',
  },
  loginMethod: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    padding: 16,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profileSectionDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
  },
  adminAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  adminName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  adminRole: {
    fontSize: 16,
    color: '#4C6EF5',
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  profileStatItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  profileStatItemDark: {
    borderColor: '#333',
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  editProfileButton: {
    backgroundColor: '#4C6EF5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  editProfileButtonDark: {
    backgroundColor: '#3456CC',
  },
  editProfileText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  editProfileTextDark: {
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
});

export default AdminDashboard;