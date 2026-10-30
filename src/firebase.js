// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";

// 본인의 Firebase Console 설정값으로 교체하세요.
const firebaseConfig = {
  apiKey: "AIzaSyDtp1Qb7usM9rGFzhUXiSA79VTL0VaJ2Fs",
  authDomain: "my-project-31cb5.firebaseapp.com",
  databaseURL: "https://my-project-31cb5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-project-31cb5",
  storageBucket: "my-project-31cb5.firebasestorage.app",
  messagingSenderId: "1065933543906",
  appId: "1:1065933543906:web:7a229f8fae757c5f2d81bb"
};


const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// 최근 선택 지역 코드 저장
export const saveLastSelectedArea = async (areaCode, areaName) => {
  try {
    await set(ref(db, "userActivity/lastSelectedArea"), {
      areaCode: areaCode,
      areaName: areaName,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Firebase 저장 실패:", error);
  }
};

// 최근 선택 지역 코드 조회
export const fetchLastSelectedArea = async () => {
  try {
    const snapshot = await get(ref(db, "userActivity/lastSelectedArea"));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Firebase 조회 실패:", error);
    return null;
  }
};