import Link from 'next/link';

export default function Menu() {
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">เมนูหลัก</h1>
      <div className="list-group">

        {/* ลิงก์ไปยังหน้าข้อมูลประสิทธิภาพไบโอแก๊ส */}
        <Link href="https://performance-git-master-jatuphong-s-projects.vercel.app/inputdata" legacyBehavior>
          <a className="list-group-item list-group-item-action">กรอกข้อมูลประสิทธิภาพไบโอแก๊ส</a>
        </Link>

        {/* ลิงก์ไปยังหน้ารายงานไบโอแก๊ส */}
        <Link href="https://performance-git-master-jatuphong-s-projects.vercel.app/report" legacyBehavior>
          <a className="list-group-item list-group-item-action">รายงานประสิทธิภาพไบโอแก๊ส</a>
        </Link>

        {/* ลิงก์ไปยังหน้ากรอกข้อมูลประสิทธิภาพคัดไข่ */}
        <Link href="https://performance-git-master-jatuphong-s-projects.vercel.app/inputGrading" legacyBehavior>
          <a className="list-group-item list-group-item-action">กรอกข้อมูลประสิทธิภาพเครื่องคัดไข่</a>
        </Link>

        {/* ลิงก์ไปยังหน้ารายงานประสิทธิภาพคัดไข่ */}
        <Link href="https://performance-git-master-jatuphong-s-projects.vercel.app/gradingReport" legacyBehavior>
          <a className="list-group-item list-group-item-action">รายงานประสิทธิภาพเครื่องคัดไข่</a>
        </Link>
        
      </div>
    </div>
  );
}
