import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Menu() {
  const [currentUrl, setCurrentUrl] = useState("https://performance-git-master-jatuphong-s-projects.vercel.app/report");
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  const handleMenuClick = (url) => {
    setCurrentUrl(url);
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const menuItems = [
    { name: "กรอกข้อมูลไบโอแก๊ส", url: "https://performance-git-master-jatuphong-s-projects.vercel.app/inputdata" },
    { name: "รายงานไบโอแก๊ส", url: "https://performance-git-master-jatuphong-s-projects.vercel.app/report" },
    { name: "กรอกข้อมูลเครื่องคัดไข่", url: "https://performance-git-master-jatuphong-s-projects.vercel.app/inputGrading" },
    { name: "ตรวจสอบข้อมูลการคัด", url: "https://performance-git-master-jatuphong-s-projects.vercel.app/gradingCheck" },
    { name: "รายงานเครื่องคัดไข่", url: "https://performance-git-master-jatuphong-s-projects.vercel.app/gradingReport" },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div
        style={{
          width: isMenuVisible ? '250px' : '0',
          transition: 'width 0.3s',
          backgroundColor: '#d4edda', // สีพื้นหลังตรงกับหน้าหลัก
          borderRight: isMenuVisible ? '1px solid #dee2e6' : 'none',
          overflow: 'hidden',
        }}
      >
        {isMenuVisible && (
          <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
            <h4 className="text-center">Main Menu</h4>
            <div className="list-group">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className={`list-group-item list-group-item-action ${currentUrl === item.url ? "active" : ""}`}
                  onClick={() => handleMenuClick(item.url)}
                  style={{
                    backgroundColor: currentUrl === item.url ? "#c3e6cb" : "transparent",
                    color: currentUrl === item.url ? "#155724" : "black",
                    fontWeight: currentUrl === item.url ? "bold" : "normal",
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: isMenuVisible ? '260px' : '10px',
          transition: 'left 0.3s',
          zIndex: 1000,
        }}
      >
        <button
          onClick={toggleMenu}
          style={{
            border: 'none',
            background: 'none',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          {isMenuVisible ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <iframe
          src={currentUrl}
          loading="lazy" // Lazy loading สำหรับ iframe
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </div>
    </div>
  );
}
