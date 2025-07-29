import axios from "axios";
import { Platform } from "react-native";
import { API_URL } from "../config";

// Use the same API URL pattern as the auth endpoints

export const saveAvatarToBackend = async (imageUri: string) => {
  try {
    // Fetch the image and convert to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create FormData and append the blob
    const formData = new FormData();
    formData.append("avatar", blob, "avatar.png");

    // Send the image to the backend
    const uploadResponse = await axios.post(`${API_URL}/upload-avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return uploadResponse.data;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
};
