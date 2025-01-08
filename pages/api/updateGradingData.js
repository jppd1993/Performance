import { pool } from "../../lib/dbt";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    try {
      const {
        inputId,
        inputDate,
        shortArea,
        workTime,
        product,
        breakdownList,
        fixCourse,
        fixTime,
        lostTime,
        fixLocation,
      } = req.body;

      // แปลงวันที่เป็น Local Time ก่อนบันทึก
      const adjustedDate = new Date(inputDate);
      adjustedDate.setMinutes(adjustedDate.getMinutes() - adjustedDate.getTimezoneOffset());
      const localDate = adjustedDate.toISOString().split("T")[0];

      // คำนวณค่า machineCap และ productPerformance
      const machineCap =
        shortArea === "BN"
          ? workTime * 2000
          : shortArea === "CHN"
          ? workTime * 2400
          : workTime * 1000;

      const productPerformance = machineCap
        ? ((product * 100) / machineCap).toFixed(2)
        : 0;

      // SQL Query สำหรับอัปเดตข้อมูล
      const sql = `
        UPDATE grading.production
        SET 
          inputDate = ?,
          shortArea = ?,
          workTime = ?,
          product = ?,
          machineCap = ?,
          productPerformance = ?,
          breakdownList = ?,
          fixCourse = ?,
          fixTime = ?,
          lostTime = ?,
          fixLocation = ?
        WHERE inputId = ?
      `;
      const parameters = [
        localDate,
        shortArea,
        workTime,
        product,
        machineCap,
        productPerformance,
        breakdownList || null,
        fixCourse || null,
        fixTime || 0,
        lostTime || 0,
        fixLocation || null,
        inputId,
      ];

      console.log("Executing Query:", sql);
      console.log("With Parameters:", parameters);

      await pool.query(sql, parameters);

      res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ" });
    } catch (error) {
      console.error("Error updating grading data:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).json({ message: "Method not allowed" });
  }
}
