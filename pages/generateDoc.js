import React, { useState } from "react";
import axios from "axios";
import { PDFDocument, rgb } from "pdf-lib";

export default function GenerateDocument() {
  const [formData, setFormData] = useState({
    farm: "",
    documentNo: "",
    subject: "",
    to: "",
    date: "",
    from: "",
    content: "",
    proposedBy: "",
    checkedBy: "",
    approvedBy: "",
    cc: "",
  });

  const [farms, setFarms] = useState([]);
  const [approvers, setApprovers] = useState([]);

  React.useEffect(() => {
    // Fetch dropdown data
    const fetchDropdownData = async () => {
      try {
        const farmRes = await axios.get("/api/getFarms");
        setFarms(farmRes.data);

        const approverRes = await axios.get("/api/getApprovers");
        setApprovers(approverRes.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 Size: 595 x 842 pt

    const { farm, documentNo, subject, to, date, from, content, proposedBy, checkedBy, approvedBy, cc } = formData;

    page.drawText("บริษัท ซีพีเอฟ (ประเทศไทย) จำกัด (มหาชน)", { x: 50, y: 800, size: 16, color: rgb(0, 0, 0) });
    page.drawText(farm, { x: 50, y: 780, size: 12 });
    page.drawText(`เลขที่: ${documentNo}`, { x: 50, y: 760, size: 12 });
    page.drawText(`เรื่อง: ${subject}`, { x: 50, y: 740, size: 12 });
    page.drawText(`เรียน: ${to}`, { x: 50, y: 720, size: 12 });
    page.drawText(`วันที่: ${date}`, { x: 450, y: 720, size: 12 });
    page.drawText(`จาก: ${from}`, { x: 50, y: 700, size: 12 });

    page.drawText("เนื้อหา:", { x: 50, y: 680, size: 12 });
    page.drawText(content, { x: 50, y: 660, size: 12, maxWidth: 500, lineHeight: 16 });

    page.drawText("เสนอ:", { x: 50, y: 600, size: 12 });
    page.drawText(proposedBy, { x: 100, y: 600, size: 12 });

    page.drawText("เห็นชอบ:", { x: 50, y: 580, size: 12 });
    page.drawText(checkedBy, { x: 100, y: 580, size: 12 });

    page.drawText("อนุมัติ:", { x: 50, y: 560, size: 12 });
    page.drawText(approvedBy, { x: 100, y: 560, size: 12 });

    page.drawText(`สำเนาเรียน: ${cc}`, { x: 50, y: 520, size: 12 });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `document_${documentNo}.pdf`;
    link.click();
  };

  return (
    <div className="container mt-5">
      <h1>Generate Document</h1>
      <form>
        <div className="mb-3">
          <label>ฟาร์ม</label>
          <select name="farm" value={formData.farm} onChange={handleChange} className="form-control">
            <option value="">-- เลือกฟาร์ม --</option>
            {farms.map((farm) => (
              <option key={farm.apfType} value={`${farm.apfAddress}, ${farm.apfTel}`}>
                {farm.apfAddress}, {farm.apfTel}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label>เลขที่</label>
          <input type="text" name="documentNo" value={formData.documentNo} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>เรื่อง</label>
          <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>เรียน</label>
          <select name="to" value={formData.to} onChange={handleChange} className="form-control">
            <option value="">-- เลือกผู้รับ --</option>
            {approvers.map((approver) => (
              <option key={approver.apvName} value={`${approver.apvTitle} ${approver.apvName}, ${approver.apvPosition}`}>
                {approver.apvTitle} {approver.apvName}, {approver.apvPosition}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label>วันที่</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>จาก</label>
          <select name="from" value={formData.from} onChange={handleChange} className="form-control">
            <option value="">-- เลือกผู้ส่ง --</option>
            {approvers.map((approver) => (
              <option key={approver.apvName} value={`${approver.apvTitle} ${approver.apvName}, ${approver.apvPosition}`}>
                {approver.apvTitle} {approver.apvName}, {approver.apvPosition}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label>เนื้อความ</label>
          <textarea name="content" value={formData.content} onChange={handleChange} className="form-control" rows="5"></textarea>
        </div>
        <div className="mb-3">
          <label>เสนอ</label>
          <input type="text" name="proposedBy" value={formData.proposedBy} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>เห็นชอบ</label>
          <input type="text" name="checkedBy" value={formData.checkedBy} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>อนุมัติ</label>
          <input type="text" name="approvedBy" value={formData.approvedBy} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>สำเนาเรียน</label>
          <input type="text" name="cc" value={formData.cc} onChange={handleChange} className="form-control" />
        </div>
        <button type="button" onClick={generatePDF} className="btn btn-primary">
          Generate PDF
        </button>
      </form>
    </div>
  );
}
