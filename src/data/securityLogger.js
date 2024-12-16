import axios from "axios";

const API_BASE_URL = "http://172.25.209.157:8000"; // Replace with the deployed backend URL

/**
 * Logs security events by writing them to the backend.
 * @param {string} eventType - The type of event (e.g., "signin", "auth_failure").
 * @param {string} email - The email associated with the event.
 * @param {string} details - Additional details about the event.
 * @returns {Promise<string>} - Success or error message.
 */
export const logSecurityEvent = async (eventType, email, details = "", ipAddress = "") => {
  try {
    const timestamp = new Date().toISOString(); // Add a timestamp
    const logData = {
        eventType: eventType,
        email: email,
        details: details,
        timestamp: timestamp,
        ipAddress: ipAddress,
      };

    const response = await axios.post(`${API_BASE_URL}/write-file`, logData, {
        headers: {
            'Content-Type': 'application/json'
        }
    }); 
    
    console.log("Response Sent", response.data);

    return response.data.message; // Return success message
  } catch (error) {
    console.error(`Error logging security event (${eventType}):`, error);
    throw new Error(`Failed to log security event. Please try again.`);
  }
};