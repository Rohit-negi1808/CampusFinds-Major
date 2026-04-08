import React, { useState } from 'react';
import SuccessModal from '../../components/SuccessModal';

const INITIAL_FORM = {
    title: '', category: '', location: '', date: '',
    description: '', image: null, contact: ''
};

const FIELD_RULES = {
    title: { min: 3, label: 'Item Title' },
    location: { min: 3, label: 'Location' },
    description: { min: 10, label: 'Description' },
    contact: { min: 5, label: 'Contact Info' },
};

const ReportItemPage = ({ showPage, currentUser, toast }) => {
    const [reportType, setReportType] = useState('lost');
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const getValidity = (field) => {
        const value = formData[field];
        if (!touched[field]) return null;
        const rule = FIELD_RULES[field];
        if (!rule) return null;
        if (!value || value.trim().length < rule.min) return false;
        return true;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        setTouched(prev => ({ ...prev, [id]: true }));
    };

    const handleBlur = (e) => {
        setTouched(prev => ({ ...prev, [e.target.id]: true }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, image: file }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviewUrl(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreviewUrl('');
        }
    };

    const removeImage = () => {
        setImagePreviewUrl('');
        setFormData(prev => ({ ...prev, image: null }));
    };

    const isFormValid = () => {
        return formData.title.trim().length >= 3 &&
            formData.category &&
            formData.location.trim().length >= 3 &&
            formData.date &&
            formData.description.trim().length >= 10 &&
            formData.contact.trim().length >= 5;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Mark all fields touched
        setTouched({ title: true, category: true, location: true, date: true, description: true, contact: true });
        if (!isFormValid()) return;

        setSubmitting(true);
        const newItem = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            location: formData.location,
            contact: formData.contact,
            imageUrl: imagePreviewUrl || ""
        };
        if (reportType === "lost") { newItem.dateLost = formData.date; }
        else { newItem.dateFound = formData.date; }

        try {
            const baseUrl = process.env.REACT_APP_API_URL || '';
            const endpoint = reportType === "lost"
                ? `${baseUrl}/api/lost-items`
                : `${baseUrl}/api/found-items`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem),
            });

            if (!response.ok) throw new Error("Failed to submit item");

            const data = await response.json();
            

            setShowSuccess(true);

            setFormData(INITIAL_FORM);
            setImagePreviewUrl('');
            setTouched({});
        } catch (err) {
            console.error("Error submitting item:", err);
            alert("Something went wrong while submitting the item!");
        } finally {
            setSubmitting(false);
        }
    };

    const fieldClass = (field) => {
        const v = getValidity(field);
        if (v === true) return 'form-control is-valid';
        if (v === false) return 'form-control is-invalid';
        return 'form-control';
    };

    const ValidationMsg = ({ field }) => {
        const v = getValidity(field);
        if (v === null) return null;
        if (v === true) return <div className="validation-msg valid">✓ Looks good!</div>;
        const rule = FIELD_RULES[field];
        return <div className="validation-msg invalid">✗ {rule.label} must be at least {rule.min} characters.</div>;
    };

    return (
        <div id="report-page" className="page">
            {/* Header */}
            <div style={{ background:'linear-gradient(135deg,#312e81 0%,#3730a3 40%,#4f46e5 70%,#818cf8 100%)', color:'#fff', padding:'3.5rem 0 5rem', position:'relative', overflow:'hidden', marginBottom:0 }}>
                <div style={{ position:'absolute', top:'-30%', right:'-5%', width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,.1)', filter:'blur(60px)' }}/>
                <div className="container" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)', borderRadius:50, padding:'0.35rem 1rem', marginBottom:'1rem', fontSize:'0.8rem', fontWeight:600 }}>
                        <span style={{ width:7, height:7, borderRadius:'50%', background:'#c7d2fe', display:'inline-block' }}/>
                        Submit a Report
                    </div>
                    <h1 style={{ fontSize:'2.4rem', fontWeight:900, letterSpacing:'-0.5px', marginBottom:'0.5rem' }}>📝 Report an Item</h1>
                    <p style={{ opacity:.85, maxWidth:500, margin:'0 auto' }}>Lost something? Found something? Let the campus know!</p>
                </div>
                <div style={{ position:'absolute', bottom:0, left:0, right:0 }}>
                    <svg viewBox="0 0 1440 56" fill="none" style={{ display:'block' }}><path d="M0,40 C360,0 1080,56 1440,16 L1440,56 L0,56 Z" fill="var(--bg,#f8fafc)"/></svg>
                </div>
            </div>

            <div className="container pb-5">
                <div className="row justify-content-center">
                    <div className="col-lg-7">
                        <div className="form-section">

                            {/* Report Type Toggle */}
                            <div className="report-type-toggle mb-4">
                                <button
                                    type="button"
                                    className={`report-type-btn ${reportType === 'lost' ? 'active-lost' : ''}`}
                                    onClick={() => setReportType('lost')}
                                >
                                    🚨 I Lost Something
                                </button>
                                <button
                                    type="button"
                                    className={`report-type-btn ${reportType === 'found' ? 'active-found' : ''}`}
                                    onClick={() => setReportType('found')}
                                >
                                    🌟 I Found Something
                                </button>
                            </div>

                            {/* Context banner */}
                            <div className="p-3 rounded mb-4" style={{
                                background: reportType === 'lost' ? '#fee2e2' : '#d1fae5',
                                border: `1px solid ${reportType === 'lost' ? '#fca5a5' : '#6ee7b7'}`,
                                borderRadius: '10px',
                                fontSize: '0.88rem',
                                color: reportType === 'lost' ? '#991b1b' : '#065f46'
                            }}>
                                {reportType === 'lost'
                                    ? '🔴 Fill in as much detail as possible. Others will see this and can contact you if they find your item.'
                                    : '🟢 Describe where you found it so the owner can verify. Be specific about the location and item details.'}
                            </div>

                            <form onSubmit={handleSubmit} noValidate>

                                {/* Title */}
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Item Title *</label>
                                    <input type="text" className={fieldClass('title')} id="title" placeholder="e.g. Blue Jansport Backpack" value={formData.title} onChange={handleChange} onBlur={handleBlur} />
                                    <ValidationMsg field="title" />
                                </div>

                                {/* Category */}
                                <div className="mb-3">
                                    <label htmlFor="category" className="form-label">Category *</label>
                                    <select
                                        className={`form-select ${touched.category && !formData.category ? 'is-invalid' : touched.category && formData.category ? 'is-valid' : ''}`}
                                        id="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="electronics">💻 Electronics</option>
                                        <option value="books">📚 Books & Notes</option>
                                        <option value="clothing">👕 Clothing</option>
                                        <option value="accessories">👜 Accessories</option>
                                        <option value="keys">🔑 Keys</option>
                                        <option value="wallet">👛 Wallet</option>
                                        <option value="phone">📱 Phone</option>
                                        <option value="id">🪪 ID Cards</option>
                                        <option value="sports">⚽ Sports</option>
                                        <option value="other">📦 Other</option>
                                    </select>
                                    {touched.category && !formData.category && <div className="validation-msg invalid">✗ Please select a category.</div>}
                                </div>

                                {/* Location */}
                                <div className="mb-3">
                                    <label htmlFor="location" className="form-label">
                                        {reportType === 'lost' ? '📍 Where did you lose it? *' : '📍 Where did you find it? *'}
                                    </label>
                                    <input type="text" className={fieldClass('location')} id="location" placeholder="e.g. Main Library, 2nd Floor" value={formData.location} onChange={handleChange} onBlur={handleBlur} />
                                    <ValidationMsg field="location" />
                                </div>

                                {/* Date */}
                                <div className="mb-3">
                                    <label htmlFor="date" className="form-label">
                                        {reportType === 'lost' ? '📅 When did you lose it? *' : '📅 When did you find it? *'}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className={`form-control ${touched.date && !formData.date ? 'is-invalid' : touched.date && formData.date ? 'is-valid' : ''}`}
                                        id="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </div>

                                {/* Description */}
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description *</label>
                                    <textarea
                                        className={fieldClass('description')}
                                        id="description"
                                        rows="4"
                                        placeholder="Describe the item in detail — color, brand, any markings, what was inside, etc."
                                        value={formData.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                                        {formData.description.length} / 500 chars
                                    </div>
                                    <ValidationMsg field="description" />
                                </div>

                                {/* Image Upload */}
                                <div className="mb-3">
                                    <label className="form-label">📷 Upload Image (optional)</label>
                                    {!imagePreviewUrl ? (
                                        <div className="image-upload-zone">
                                            <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
                                            <div style={{ pointerEvents: 'none' }}>
                                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.3rem' }}>Click or drag to upload</div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>JPG, PNG, GIF up to 5MB</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="image-preview-wrap">
                                            <img src={imagePreviewUrl} alt="Preview" />
                                            <button type="button" className="image-preview-remove" onClick={removeImage} title="Remove image">×</button>
                                        </div>
                                    )}
                                </div>

                                {/* Contact */}
                                <div className="mb-4">
                                    <label htmlFor="contact" className="form-label">📧 Your Contact Info *</label>
                                    <input type="text" className={fieldClass('contact')} id="contact" placeholder="Email or phone number" value={formData.contact} onChange={handleChange} onBlur={handleBlur} />
                                    <div className="form-text" style={{ color: 'var(--text-muted)' }}>
                                        {reportType === 'lost' ? '🔒 Visible to potential finders so they can return your item.' : '🔒 Visible to potential owners to verify and claim their item.'}
                                    </div>
                                    <ValidationMsg field="contact" />
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`btn w-100 py-3 fw-bold ${reportType === 'lost' ? 'btn-danger' : 'btn-success'}`}
                                    style={{ borderRadius: '12px', fontSize: '1rem' }}
                                >
                                    {submitting ? (
                                        <span><span className="spinner-border spinner-border-sm me-2" />Submitting...</span>
                                    ) : (
                                        <span>{reportType === 'lost' ? '🚨 Submit Lost Item Report' : '✅ Submit Found Item Report'}</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <SuccessModal show={showSuccess} onClose={() => { setShowSuccess(false); showPage && showPage("foundItems"); }} reportType={reportType} />
        </div>
    );
};

export default ReportItemPage;
