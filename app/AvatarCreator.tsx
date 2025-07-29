import React, { useState, useRef, useEffect } from "react";
import { SvgUri } from 'react-native-svg';
import { 
  View, 
  Button, 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  Image,
  StyleSheet,
  Alert,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Dimensions,
  Platform
} from "react-native";
import Svg, { Circle, Rect, G } from "react-native-svg";
import ViewShot from "react-native-view-shot";
import Eyepatch from "../assets/avatar/accessories/Eyepatch.svg";
import Glasses from "../assets/avatar/accessories/Glasses.svg";
import Glasses2 from "../assets/avatar/accessories/Glasses2.svg";
import Glasses3 from "../assets/avatar/accessories/Glasses3.svg";
import Glasses4 from "../assets/avatar/accessories/Glasses4.svg";
import Glasses5 from "../assets/avatar/accessories/Glasses5.svg";
import Sunglasses from "../assets/avatar/accessories/Sunglasses.svg";
import Sunglasses2 from "../assets/avatar/accessories/Sunglasses2.svg";

import AngrywithFang from "../assets/avatar/face/Angry with Fang.svg";
import Awe from "../assets/avatar/face/Awe.svg";
import Blank from "../assets/avatar/face/Blank.svg";
import Calm from "../assets/avatar/face/Calm.svg";
import cheeky from "../assets/avatar/face/Cheeky.svg";
import ConcernedFear from "../assets/avatar/face/Concerned Fear.svg";
import Concerned from "../assets/avatar/face/Concerned.svg";
import Contempt from "../assets/avatar/face/Contempt.svg";
import Cute from "../assets/avatar/face/Cute.svg";
import Cyclops from "../assets/avatar/face/Cyclops.svg";
import Driven from "../assets/avatar/face/Driven.svg";
import EatingHappy from "../assets/avatar/face/Eating Happy.svg";
import Explaining from "../assets/avatar/face/Explaining.svg";
import EyesClosed from "../assets/avatar/face/Eyes Closed.svg";
import Fear from "../assets/avatar/face/Fear.svg";
import Hectic from "../assets/avatar/face/Hectic.svg";
import LovingGrin1 from "../assets/avatar/face/Loving Grin 1.svg";
import LovingGrin2 from "../assets/avatar/face/Loving Grin 2.svg";
import Monster from "../assets/avatar/face/Monster.svg";
import Old from "../assets/avatar/face/Old.svg";
import Rage from "../assets/avatar/face/Rage.svg";
import Serious from "../assets/avatar/face/Serious.svg";
import SmileBig from "../assets/avatar/face/Smile Big.svg";
import SmileLOL from "../assets/avatar/face/Smile LOL.svg";
import Smile from "../assets/avatar/face/Smile.svg";
import SmileTeethGap from "../assets/avatar/face/Smile Teeth Gap.svg";
import Solemn from "../assets/avatar/face/Solemn.svg";
import Suspicious from "../assets/avatar/face/Suspicious.svg";
import Tired from "../assets/avatar/face/Tired.svg";
import VeryAngry from "../assets/avatar/face/Very Angry.svg";

import Afro from "../assets/avatar/head/Afro.svg";
import Bangs from "../assets/avatar/head/Bangs.svg";
import Bangs2 from "../assets/avatar/head/Bangs 2.svg";
import BantuKnots from "../assets/avatar/head/Bantu Knots.svg";
import Bear from "../assets/avatar/head/Bear.svg";
import Bun from "../assets/avatar/head/Bun.svg";
import Bun2 from "../assets/avatar/head/Bun 2.svg";
import Buns from "../assets/avatar/head/Buns.svg";
import Cornrows from "../assets/avatar/head/Cornrows.svg";
import Cornrows2 from "../assets/avatar/head/Cornrows 2.svg";
import FlatTopLong from "../assets/avatar/head/Flat Top Long.svg";
import FlatTop from "../assets/avatar/head/Flat Top.svg";
import GrayBun from "../assets/avatar/head/Gray Bun.svg";
import GrayMedium from "../assets/avatar/head/Gray Medium.svg";
import GrayShort from "../assets/avatar/head/Gray Short.svg";
import hatbeanie from "../assets/avatar/head/hat-beanie.svg";
import hathip from "../assets/avatar/head/hat-hip.svg";
import Hijab from "../assets/avatar/head/Hijab.svg";
import LongAfro from "../assets/avatar/head/Long Afro.svg";
import LongBangs from "../assets/avatar/head/Long Bangs.svg";
import LongCurly from "../assets/avatar/head/Long Curly.svg";
import Long from "../assets/avatar/head/Long.svg";
import Medium1 from "../assets/avatar/head/Medium 1.svg";
import Medium2 from "../assets/avatar/head/Medium 2.svg";
import Medium3 from "../assets/avatar/head/Medium 3.svg";
import MediumBangs from "../assets/avatar/head/Medium Bangs.svg";
import MediumBangs2 from "../assets/avatar/head/Medium Bangs 2.svg";
import MediumBangs3 from "../assets/avatar/head/Medium Bangs 3.svg";
import MediumStraight from "../assets/avatar/head/Medium Straight.svg";
import Mohawk from "../assets/avatar/head/Mohawk.svg";
import Mohawk2 from "../assets/avatar/head/Mohawk 2.svg";
import NoHair1 from "../assets/avatar/head/No Hair 1.svg";
import NoHair2 from "../assets/avatar/head/No Hair 2.svg";
import NoHair3 from "../assets/avatar/head/No Hair 3.svg";
import Pomp from "../assets/avatar/head/Pomp.svg";
import Shaved1 from "../assets/avatar/head/Shaved 1.svg";
import Shaved2 from "../assets/avatar/head/Shaved 2.svg";
import Shaved3 from "../assets/avatar/head/Shaved 3.svg";
import Short1 from "../assets/avatar/head/Short 1.svg";
import Short2 from "../assets/avatar/head/Short 2.svg";
import Short3 from "../assets/avatar/head/Short 3.svg";
import Short4 from "../assets/avatar/head/Short 4.svg";
import Short5 from "../assets/avatar/head/Short 5.svg";
import Turban from "../assets/avatar/head/Turban.svg";
import Twists from "../assets/avatar/head/Twists.svg";
import Twists2 from "../assets/avatar/head/Twists 2.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReactDOM from "react-dom";

// Add ViewShot type definition
type ViewShotType = {
  capture: () => Promise<string>;
} & React.Component;

// Define types for our components
type AvatarComponent = {
  id: string;
  component: React.FC;
};

// Add types for positioning
type Position = {
  x: number;
  y: number;
};

// Add type for selection tabs
type SelectionTab = 'hair' | 'face' | 'accessory' | 'background';

const POSITION_STEP = 10; // pixels to move per button press

// Adjust Y offset to move face higher (decrease the value)
const FACE_Y_OFFSET = 50; // Changed from 100 to 50
const ACCESSORY_Y_OFFSET = 50; // Changed from 100 to 50 to match face position

// Update avatar options with SVG components

const hairs: AvatarComponent[] = [
  { id: "Afro", component: Afro },
  { id: "Bangs", component: Bangs },
  { id: "Bangs2", component: Bangs2 },
  { id: "BantuKnots", component: BantuKnots },
  { id: "Bear", component: Bear },
  { id: "Bun", component: Bun },
  { id: "Bun2", component: Bun2 },
  { id: "Buns", component: Buns },
  { id: "Cornrows", component: Cornrows },
  { id: "Cornrows2", component: Cornrows2 },
  { id: "FlatTopLong", component: FlatTopLong },
  { id: "FlatTop", component: FlatTop },
  { id: "GrayBun", component: GrayBun },
  { id: "GrayMedium", component: GrayMedium },
  { id: "GrayShort", component: GrayShort },
  { id: "hatbeanie", component: hatbeanie },
  { id: "hathip", component: hathip },
  { id: "Hijab", component: Hijab },
  { id: "LongAfro", component: LongAfro },
  { id: "LongBangs", component: LongBangs },
  { id: "LongCurly", component: LongCurly },
  { id: "Long", component: Long },
  { id: "Medium1", component: Medium1 },
  { id: "Medium2", component: Medium2 },
  { id: "Medium3", component: Medium3 },
  { id: "MediumBangs", component: MediumBangs },
  { id: "MediumBangs2", component: MediumBangs2 },
  { id: "MediumBangs3", component: MediumBangs3 },
  { id: "MediumStraight", component: MediumStraight },
  { id: "Mohawk", component: Mohawk },
  { id: "Mohawk2", component: Mohawk2 },
  { id: "NoHair1", component: NoHair1 },
  { id: "NoHair2", component: NoHair2 },
  { id: "NoHair3", component: NoHair3 },
  { id: "Pomp", component: Pomp },
  { id: "Shaved1", component: Shaved1 },
  { id: "Shaved2", component: Shaved2 },
  { id: "Shaved3", component: Shaved3 },
  { id: "Short1", component: Short1 },
  { id: "Short2", component: Short2 },
  { id: "Short3", component: Short3 },
  { id: "Short4", component: Short4 },
  { id: "Short5", component: Short5 },
  { id: "Turban", component: Turban },
  { id: "Twists", component: Twists },
  { id: "Twists2", component: Twists2 },

];

const faces: AvatarComponent[] = [
  { id: "face1", component: Blank },
  { id: "face2", component: Awe },
  { id: "face3", component: Calm },
  { id: "face4", component: cheeky },
  { id: "face5", component: ConcernedFear },
  { id: "face6", component: Concerned },
  { id: "face7", component: Contempt },
  {id: "face 8", component: AngrywithFang},
  {id: "face 9", component: Cute},
  {id: "face 10", component: Cyclops},
  {id: "face 11", component: Driven},
  {id: "face 12", component: EatingHappy},
  {id: "face 13", component: Explaining},
  {id: "face 14", component: EyesClosed},
  {id: "face 15", component: Fear},
  {id: "face 16", component: Hectic},
  {id: "face 17", component: LovingGrin1},
  {id: "face 18", component: LovingGrin2},
  {id: "face 19", component: Monster},
  {id: "face 20", component: Old},
  {id: "face 21", component: Rage},
  {id: "face 22", component: Serious},
  {id: "face 23", component: SmileBig},
  {id: "face 24", component: SmileLOL},
  {id: "face 25", component: Smile},
  {id: "face 26", component: SmileTeethGap},
  {id: "face 27", component: Solemn},
  {id: "face 28", component: Suspicious},
  {id: "face 29", component: Tired},
  {id: "face 30", component: VeryAngry},
];

const accessories: AvatarComponent[] = [
  { id: "Eyepatch", component: Eyepatch },
  { id: "Glasses", component: Glasses },
  { id: "Glasses2", component: Glasses2 },
  { id: "Glasses3", component: Glasses3 },
  { id: "Glasses4", component: Glasses4 },
  { id: "Glasses5", component: Glasses5 },
  { id: "Sunglasses", component: Sunglasses },
  { id: "Sunglasses2", component: Sunglasses2 },
  { id: "None", component: () => null }, // Add option for no accessory
];

// Background colors
const backgroundColors = [
  "#FFFFFF",
  "#F5F5F5", 
  "#FFF9C4", 
  "#BBDEFB", 
  "#C8E6C9", 
  "#F8BBD0", 
  "#D1C4E9",
  "#B2DFDB",
  "#FFCCBC"
];

const AvatarCreator = () => {
  const [selectedFace, setSelectedFace] = useState<AvatarComponent | null>(null);
  const [selectedHair, setSelectedHair] = useState<AvatarComponent | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<AvatarComponent | null>(null);

  const viewShotRef = useRef<ViewShotType>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [facePosition, setFacePosition] = useState<Position>({ x: 0, y: 0 });
  const [accessoryPosition, setAccessoryPosition] = useState<Position>({ x: 0, y: 0 });
  const [manualAdjustment, setManualAdjustment] = useState<Position>({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const [confirmedHair, setConfirmedHair] = useState(false);
  const [confirmedFace, setConfirmedFace] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'hair' | 'face' | 'accessory' | null>(null);
  const [savedFacePosition, setSavedFacePosition] = useState<Position>({ x: 0, y: 0 });
  
  // Add new UI state variables
  const [selectedTab, setSelectedTab] = useState<SelectionTab>('hair');
  const [backgroundColor, setBackgroundColor] = useState('#F5F5F5');
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  
  const screenWidth = Dimensions.get('window').width;
  const avatarSize = Math.min(screenWidth * 0.85, 400); // Responsive avatar size

  const handleMouseDown = (e: React.MouseEvent, layer: 'face' | 'accessory') => {
    if ((layer === 'face' && !confirmedFace) || (layer === 'accessory' && confirmedFace)) {
      setIsDragging(true);
      setActiveLayer(layer);
      const position = layer === 'face' ? facePosition : accessoryPosition;
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      if (activeLayer === 'face') {
        setFacePosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      } else if (activeLayer === 'accessory') {
        setAccessoryPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Add event listeners for desktop drag
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove as any);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [isDragging, dragStart]);

  // Function to calculate center position
  const calculateCenterPosition = (parentBBox: DOMRect, childBBox: DOMRect): Position => {
    return {
      x: (parentBBox.width - childBBox.width) / 2,
      y: (parentBBox.height - childBBox.height) / 2
    };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (selectedFace) {
          setFacePosition(prev => ({
            x: prev.x + gestureState.dx,
            y: prev.y + gestureState.dy
          }));
        }
      },
      onPanResponderRelease: () => {
        // Optional: Add any cleanup or final position adjustment here
      },
    })
  ).current;

  // Update positions when components change
  useEffect(() => {
    if (selectedHair && selectedFace) {
      const hairElement = document.querySelector('#hair-component');
      const faceElement = document.querySelector('#face-component');
      
      if (hairElement && faceElement) {
        if (confirmedFace) {
          // Use saved position if face is confirmed
          setFacePosition(savedFacePosition);
        } else {
          // Calculate new position only if face isn't confirmed
          const hairBBox = hairElement.getBoundingClientRect();
          const faceBBox = faceElement.getBoundingClientRect();
          
          const newPosition = {
            x: ((hairBBox.width - faceBBox.width) / 2) + manualAdjustment.x,
            y: ((hairBBox.height - faceBBox.height) / 2) + FACE_Y_OFFSET + manualAdjustment.y
          };
          setFacePosition(newPosition);
        }

        // Update accessory position relative to current face position
        if (selectedAccessory) {
          const accessoryElement = document.querySelector('#accessory-component');
          if (accessoryElement) {
            const accessoryBBox = accessoryElement.getBoundingClientRect();
            const faceBBox = faceElement.getBoundingClientRect();
            
            setAccessoryPosition({
              x: confirmedFace ? savedFacePosition.x : facePosition.x,
              y: confirmedFace ? savedFacePosition.y : facePosition.y
            });
          }
        }
      }
    }
  }, [selectedHair, selectedFace, selectedAccessory, manualAdjustment, confirmedFace, savedFacePosition]);

  // Show confirm button when a component is selected
  useEffect(() => {
    if (selectedTab === 'hair' && selectedHair) {
      setShowConfirmButton(true);
    } else if (selectedTab === 'face' && selectedFace && confirmedHair) {
      setShowConfirmButton(true);
    } else {
      setShowConfirmButton(false);
    }
  }, [selectedTab, selectedHair, selectedFace, confirmedHair]);

  const saveAvatar = async () => {
    if (!viewShotRef.current) {
      Alert.alert("Error", "Cannot capture avatar");
      return;
    }
  
    try {
      // For web environments, use a different approach
      let avatarData;
      
      // Check if we're in a web environment
      if (Platform.OS === 'web') {
        // Get the SVG element directly
        const svgElement = ReactDOM.findDOMNode(viewShotRef.current)?.querySelector('svg');
        if (!svgElement) {
          throw new Error("Could not find SVG element");
        }
        
        // Convert SVG to a data URL
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        avatarData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(svgBlob);
        });
      } else {
        // For native platforms, use the original approach
        const base64Image = await viewShotRef.current.capture({
          format: "jpg",
          quality: 0.8,
          result: "base64"
        });
        avatarData = `data:image/jpeg;base64,${base64Image}`;
      }
      
      setAvatarUri(avatarData);
  
      // Get authentication token
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication required. Please log in.");
        return;
      }
  
      // Send the avatar data to the backend
      const response = await fetch(`http://localhost:5000/childauth/avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatar: avatarData
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save avatar");
      }
  
      // Success message
      Alert.alert("Success", "Avatar saved successfully!");
    } catch (error) {
      console.error("Error saving avatar:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save avatar");
    }
  };

  const confirmComponent = (component: 'hair' | 'face') => {
    if (component === 'hair') {
      setConfirmedHair(true);
      setSelectedTab('face');
    } else if (component === 'face') {
      setConfirmedFace(true);
      setSavedFacePosition(facePosition); // Save the final face position
      setSelectedTab('accessory');
    }
  };
  
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'hair':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Choose Hair Style</Text>
            <View style={styles.optionsGrid}>
              {hairs.map((hair) => (
                <TouchableOpacity
                  key={hair.id}
                  style={[styles.optionItem, selectedHair?.id === hair.id && styles.selectedOption]}
                  onPress={() => setSelectedHair(hair)}
                >
                  <View style={styles.optionPreview}>
                    <Svg width={40} height={40} viewBox="0 0 473 567">
                      {React.createElement(hair.component)}
                    </Svg>
                  </View>
                  <Text style={styles.optionText}>{hair.id}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {showConfirmButton && (
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => confirmComponent('hair')}
              >
                <Text style={styles.confirmButtonText}>Confirm Hair Style</Text>
              </TouchableOpacity>
            )}
          </View>
        );
        
      case 'face':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Choose Face Expression</Text>
            <Text style={styles.instruction}>Drag to position the face</Text>
            <View style={styles.optionsGrid}>
              {faces.map((face) => (
                <TouchableOpacity
                  key={face.id}
                  style={[styles.optionItem, selectedFace?.id === face.id && styles.selectedOption]}
                  onPress={() => setSelectedFace(face)}
                >
                  <View style={styles.faceOptionPreview}>
                    <Svg width={60} height={60} viewBox="0 0 473 567">
                      {React.createElement(face.component)}
                    </Svg>
                  </View>
                  <Text style={styles.optionText}>{face.id}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {confirmedHair && selectedFace && (
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => confirmComponent('face')}
              >
                <Text style={styles.confirmButtonText}>Confirm Face Position</Text>
              </TouchableOpacity>
            )}
          </View>
        );
        
      case 'accessory':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Choose Accessories</Text>
            <Text style={styles.instruction}>Drag to position accessories</Text>
            <View style={styles.optionsGrid}>
              {accessories.map((accessory) => (
                <TouchableOpacity
                  key={accessory.id}
                  style={[styles.optionItem, selectedAccessory?.id === accessory.id && styles.selectedOption]}
                  onPress={() => setSelectedAccessory(accessory)}
                >
                  <View style={styles.optionPreview}>
                    <Svg width={40} height={40} viewBox="0 0 473 567">
                      {accessory.id !== "None" && React.createElement(accessory.component)}
                    </Svg>
                  </View>
                  <Text style={styles.optionText}>{accessory.id}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={() => setSelectedTab('background')}
            >
              <Text style={styles.confirmButtonText}>Next: Choose Background</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'background':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Choose Background Color</Text>
            <View style={styles.colorGrid}>
              {backgroundColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption, 
                    { backgroundColor: color },
                    backgroundColor === color && styles.selectedColorOption
                  ]}
                  onPress={() => setBackgroundColor(color)}
                >
                  {backgroundColor === color && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveAvatar}
            >
              <Text style={styles.saveButtonText}>Save Avatar</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Avatar Preview Area */}
      <View style={[styles.previewContainer, { backgroundColor }]}>
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
          <View style={styles.avatarFrame}>
            <Svg width={avatarSize} height={avatarSize} viewBox="0 0 473 567">
              {/* Hair Component */}
              {selectedHair && (
                <G id="hair-component">
                  {React.createElement(selectedHair.component)}
                </G>
              )}

              {/* Face Component */}
              {selectedFace && (
                  <G 
                  id="face-component"
                  transform={`translate(${facePosition.x}, ${facePosition.y})`}
                  onMouseDown={(e: React.MouseEvent<SVGGElement, MouseEvent>) => handleMouseDown(e, 'face')}
                  style={{ cursor: confirmedFace ? 'default' : 'move' }}
                  {...(!confirmedFace && panResponder.panHandlers)}
                  >
                  <Rect
                    x="-50"
                    y="-50"
                    width="200"
                    height="200"
                    fill="transparent"
                  />
                  {React.createElement(selectedFace.component)}
                  </G>
              )}

              {/* Accessory Component */}
              {selectedAccessory && selectedAccessory.id !== "None" && confirmedFace && (
                  <G 
                  id="accessory-component"
                  transform={`translate(${accessoryPosition.x}, ${accessoryPosition.y})`}
                  onMouseDown={(e: React.MouseEvent<SVGGElement, MouseEvent>) => handleMouseDown(e, 'accessory')}
                  style={{ cursor: 'move' }}
                  >
                  <Rect
                    x="-50"
                    y="-50"
                    width="200"
                    height="200"
                    fill="transparent"
                  />
                  {React.createElement(selectedAccessory.component)}
                  </G>
              )}
            </Svg>
          </View>
        </ViewShot>
      </View>

      {/* Selection Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'hair' && styles.activeTab]}
          onPress={() => !confirmedHair && setSelectedTab('hair')}
        >
          <Text style={[styles.tabText, selectedTab === 'hair' && styles.activeTabText]}>Hair</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'face' && styles.activeTab, !confirmedHair && styles.disabledTab]}
          onPress={() => confirmedHair && !confirmedFace && setSelectedTab('face')}
        >
          <Text style={[styles.tabText, selectedTab === 'face' && styles.activeTabText]}>Face</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'accessory' && styles.activeTab, !confirmedFace && styles.disabledTab]}
          onPress={() => confirmedFace && setSelectedTab('accessory')}
        >
          <Text style={[styles.tabText, selectedTab === 'accessory' && styles.activeTabText]}>Accessories</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'background' && styles.activeTab, !confirmedFace && styles.disabledTab]}
          onPress={() => confirmedFace && setSelectedTab('background')}
        >
          <Text style={[styles.tabText, selectedTab === 'background' && styles.activeTabText]}>Background</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  previewContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    margin: 16,
    height: 400,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarFrame: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabText: {
    fontWeight: "500",
    fontSize: 14,
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  instruction: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  optionItem: {
    width: '5%',
    aspectRatio: 0.8,
    margin: '1.5%',
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedOption: {
    borderColor: "#007AFF",
    borderWidth: 2,
    backgroundColor: "#E3F2FD",
  },
  optionPreview: {
    width: 40,
    height: 40,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOptionPreview: {
    width: 60,
    height: 60,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 10,
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    margin: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorOption: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  checkmark: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AvatarCreator;