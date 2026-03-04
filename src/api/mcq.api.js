import { getToken } from '../utils/auth.js';

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/mcqs`;
// change to Render URL later

export const createMCQ = async (data) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/createmcq`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getAllMCQs = async () => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/getallmcq`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};

export const getAllMCQForAdmin = async () => {
  try {
    const token = getToken();
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getAllMCQForAdmin`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch MCQs");
    }

    const data = await res.json(); // ✅ IMPORTANT
    console.log("MCQs:", data);

    return data;
  } catch (err) {
    console.error("Error fetching MCQs:", err);
  }
};


export const getMCQsByCategory = async (category) => {
  const res = await fetch(`${BASE_URL}/category?category=${category}`);
  return res.json();
};

export const getMCQsByTopic = async (topic) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/topic?topic=${topic}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};

export const deleteMCQ = async (id) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};
