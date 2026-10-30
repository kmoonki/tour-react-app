// src/App.jsx
import React, { useState, useEffect } from "react";
import { saveLastSelectedArea, fetchLastSelectedArea } from "./firebase";
import "./App.css";

// 주요 광역시/도 지역코드 매핑
const AREA_CODES = [
  { code: "1", name: "서울" },
  { code: "2", name: "인천" },
  { code: "3", name: "대전" },
  { code: "4", name: "대구" },
  { code: "5", name: "광주" },
  { code: "6", name: "부산" },
  { code: "7", name: "울산" },
  { code: "8", name: "세종" },
  { code: "31", name: "경기" },
  { code: "32", name: "강원" },
  { code: "39", name: "제주" }
];

const TOUR_API_KEY = "YOUR_PUBLIC_DATA_PORTAL_DECODING_KEY";

export default function App() {
  const [selectedArea, setSelectedArea] = useState("");
  const [tourList, setTourList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialChecked, setInitialChecked] = useState(false);

  // TourAPI 지역기반 관광정보 조회 함수
  const fetchTourData = async (areaCode) => {
    setLoading(true);
    const endpoint = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${encodeURIComponent(
      TOUR_API_KEY
    )}&numOfRows=12&pageNo=1&MobileOS=ETC&MobileApp=TourApp&_type=json&arrange=O&areaCode=${areaCode}`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const items = data.response?.body?.items?.item || [];
      // 유효한 이미지가 있는 항목 위주로 상태 업데이트
      setTourList(Array.isArray(items) ? items : [items]);
    } catch (err) {
      console.error("관광데이터 호출 실패:", err);
      setTourList([]);
    } finally {
      setLoading(false);
    }
  };

  // 1. 첫 마운트 시 Firebase에 저장된 지역 정보 조회
  useEffect(() => {
    const initApp = async () => {
      const savedData = await fetchLastSelectedArea();
      if (savedData && savedData.areaCode) {
        setSelectedArea(savedData.areaCode);
        await fetchTourData(savedData.areaCode);
      }
      setInitialChecked(true);
    };

    initApp();
  }, []);

  // 2. 사용자가 드롭다운에서 지역을 선택했을 때 실행
  const handleAreaChange = async (e) => {
    const targetCode = e.target.value;
    if (!targetCode) {
      setSelectedArea("");
      setTourList([]);
      return;
    }

    const areaObj = AREA_CODES.find((item) => item.code === targetCode);
    const targetName = areaObj ? areaObj.name : "";

    setSelectedArea(targetCode);

    // 공공데이터 API 조회 및 Firebase 동기 업데이트
    await fetchTourData(targetCode);
    await saveLastSelectedArea(targetCode, targetName);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>대한민국 구석구석 관광 갤러리</h1>
        <p>선택한 지역 정보는 Firebase에 자동 기록되어 재방문 시 유지됩니다.</p>
        
        <div className="select-box">
          <label htmlFor="area-select">지역 선택: </label>
          <select id="area-select" value={selectedArea} dangerouslySetInnerHTML={undefined} onChange={handleAreaChange}>
            <option value="">-- 지역을 선택하세요 --</option>
            {AREA_CODES.map((area) => (
              <option key={area.code} value={area.code}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="content">
        {loading && <div className="status-msg">관광 데이터를 불러오는 중입니다...</div>}

        {/* Firebase에 저장된 기록이 없고, 현재 선택도 없는 초기 상태에서는 목록 영역 숨김 */}
        {!loading && initialChecked && selectedArea && tourList.length > 0 && (
          <div className="card-grid">
            {tourList.map((item, idx) => (
              <div key={item.contentid || idx} className="card">
                <div className="img-wrapper">
                  <img
                    src={item.firstimage || item.firstimage2 || "https://placehold.co/400x300?text=No+Image"}
                    alt={item.title}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/400x300?text=No+Image";
                    }}
                  />
                </div>
                <div className="card-body">
                  <h3>{item.title}</h3>
                  <p className="addr">{item.addr1 || "주소 정보 없음"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && initialChecked && selectedArea && tourList.length === 0 && (
          <div className="status-msg">해당 지역의 관광 정보가 없습니다.</div>
        )}
      </main>
    </div>
  );
}