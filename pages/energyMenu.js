import { useState } from "react";
import { FaBars } from "react-icons/fa";

export default function EnergyMenu() {
  const [iframeSrc, setIframeSrc] = useState("/energyDashboard");
  const [menuVisible, setMenuVisible] = useState(true);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuClick = (src) => {
    setIframeSrc(src);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        {menuVisible && (
          <div className="col-md-2 bg-dark text-light sidebar">
            <div className="d-flex align-items-center p-3">
              <button
                className="btn btn-light me-2"
                onClick={toggleMenu}
                style={{
                  border: "none",
                  background: "none",
                  fontSize: "20px",
                  
                }}
              >
                <FaBars color="white"/>
              </button>
              <h4 className="text-light mb-0">เมนู</h4>
            </div>
            <ul className="nav flex-column">
              <li className="nav-item">
                <button
                  className={`nav-link text-light ${
                    iframeSrc === "/energyDashboard" ? "active" : ""
                  }`}
                  onClick={() => handleMenuClick("/energyDashboard")}
                >
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link text-light ${
                    iframeSrc === "/totalUse" ? "active" : ""
                  }`}
                  onClick={() => handleMenuClick("/totalUse")}
                >
                  สัดส่วนการใช้พลังงาน
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link text-light ${
                    iframeSrc === "/farmEnergyReport" ? "active" : ""
                  }`}
                  onClick={() => handleMenuClick("/farmEnergyReport")}
                >
                  การใช้พลังงานรายฟาร์ม
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link text-light ${
                    iframeSrc === "/waterReport" ? "active" : ""
                  }`}
                  onClick={() => handleMenuClick("/waterReport")}
                >
                  รายงานคุณภาพน้ำ
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link text-light ${
                    iframeSrc === "/ghgReport" ? "active" : ""
                  }`}
                  onClick={() => handleMenuClick("/ghgReport")}
                >
                  รายงาน GHG
                </button>
              </li>
            </ul>
          </div>
        )}

        {!menuVisible && (
          <button
            className="d-flex align-items-center p-3"
            onClick={toggleMenu}
            style={{
                border: "none",
                background: "none",
                fontSize: "20px",
              }}
          >
            <FaBars />
          </button>
        )}

        {/* Main Content */}
        <div
          className={`${
            menuVisible ? "col-md-10" : "col-md-12"
          } transition-all`}
          style={{
            paddingLeft: menuVisible ? "0" : "10px",
          }}
        >
          <iframe
            src={iframeSrc}
            className="w-100"
            style={{
              height: "90vh",
              border: "none",
              transition: "margin-left 0.3s ease",
            }}
            title="Energy Content"
          ></iframe>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          height: 100vh;
          padding: 20px;
        }
        .nav-link {
          color: #ffffff;
          font-weight: bold;
          background: none;
          border: none;
          text-align: left;
          width: 100%;
        }
        .nav-link.active {
          background-color: #0d6efd;
          border-radius: 5px;
        }
        .nav-link:hover {
          color: #0d6efd;
        }
      `}</style>
    </div>
  );
}
