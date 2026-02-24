import React from 'react';
import { Play, BarChart2, Calendar } from 'lucide-react';

const App = () => {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>틀어봐(Teureobwa) 아티스트 관리 페이지</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
          <Play size={24} /> <h3>현재 송출 매장</h3> <p>1,284개</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
          <BarChart2 size={24} /> <h3>누적 재생 횟수</h3> <p>45,200회</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
          <Calendar size={24} /> <h3>남은 광고 기간</h3> <p>14일</p>
        </div>
      </div>
    </div>
  );
};

export default App;
