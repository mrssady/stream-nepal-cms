import api from "./api";

export async function getUsers() {
  try {
    const response = await api.get("/users");

    console.log("✅ Full Axios Response:", response);
    console.log("✅ Response Data:", response.data);

    return response.data.data;
  } catch (error: any) {
    console.error("❌ Users API Error:", error);

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response:", error.response.data);
    }

    throw error;
  }
}