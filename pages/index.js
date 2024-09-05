import { useState, useEffect } from 'react';

export async function getServerSideProps() {
    const res = await fetch('http://localhost:3000/api/getDropdownData');
    const data = await res.json();

    if (!data) {
        return {
            props: {
                farms: [],
                machines: []
            }
        };
    }

    const { farms, machines } = data;

    return {
        props: {
            farms: farms || [],
            machines: machines || []
        }
    };
}

export default function Home({ farms, machines }) {
    const [formData, setFormData] = useState({
        saveDate: '',
        farm: '',
        machineType: '',
        hrBefore: 0,
        hrAfter: 0,
        productHr: 0,
        kwBefore: 0,
        kwAfter: 0,
        productKw: 0,
        kwSTD: 0,
        peaUnit: 0,
        productValue: 0
    });

    useEffect(() => {
        const productHr = formData.hrAfter - formData.hrBefore;
        const productKw = formData.kwAfter - formData.kwBefore;
        const productValue = (productKw * formData.peaUnit).toFixed(2);
        setFormData({
            ...formData,
            productHr,
            productKw,
            productValue
        });
    }, [formData.hrAfter, formData.hrBefore, formData.kwAfter, formData.kwBefore, formData.peaUnit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch('/api/saveData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await res.json();
        alert(result.message);
    };

    const handleClear = () => {
        setFormData({
            saveDate: '',
            farm: '',
            machineType: '',
            hrBefore: 0,
            hrAfter: 0,
            productHr: 0,
            kwBefore: 0,
            kwAfter: 0,
            productKw: 0,
            kwSTD: 0,
            peaUnit: 0,
            productValue: 0
        });
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">Biogas Production Data Entry</h1>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="saveDate" className="form-label">Date</label>
                        <input type="date" className="form-control" id="saveDate" name="saveDate" value={formData.saveDate} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="farm" className="form-label">Farm</label>
                        <select className="form-select" id="farm" name="farm" value={formData.farm} onChange={handleChange} required>
                            {farms.map((farm, index) => (
                                <option key={index} value={farm.farmShort}>{farm.farmShort}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="machineType" className="form-label">Machine Type</label>
                        <select className="form-select" id="machineType" name="machineType" value={formData.machineType} onChange={handleChange} required>
                            {machines.map((machine, index) => (
                                <option key={index} value={machine.machineType}>{machine.machineType}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="hrBefore" className="form-label">Previous Running Hours</label>
                        <input type="number" className="form-control" id="hrBefore" name="hrBefore" value={formData.hrBefore} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="hrAfter" className="form-label">Current Running Hours</label>
                        <input type="number" className="form-control" id="hrAfter" name="hrAfter" value={formData.hrAfter} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="productHr" className="form-label">Running Hours</label>
                        <input type="number" className="form-control" id="productHr" name="productHr" value={formData.productHr} readOnly />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="kwBefore" className="form-label">Previous Power Production</label>
                        <input type="number" className="form-control" id="kwBefore" name="kwBefore" value={formData.kwBefore} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="kwAfter" className="form-label">Current Power Production</label>
                        <input type="number" className="form-control" id="kwAfter" name="kwAfter" value={formData.kwAfter} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="productKw" className="form-label">Power Produced</label>
                        <input type="number" className="form-control" id="productKw" name="productKw" value={formData.productKw} readOnly />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="kwSTD" className="form-label">Standard Power Production</label>
                        <input type="number" className="form-control" id="kwSTD" name="kwSTD" value={formData.kwSTD} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="peaUnit" className="form-label">PEA Unit</label>
                        <input type="number" step="0.01" className="form-control" id="peaUnit" name="peaUnit" value={formData.peaUnit} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="productValue" className="form-label">Power Value</label>
                        <input type="number" className="form-control" id="productValue" name="productValue" value={formData.productValue} readOnly />
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <button type="button" className="btn btn-secondary me-2" onClick={handleClear}>Clear</button>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
