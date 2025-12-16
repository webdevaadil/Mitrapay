import React, { useEffect, useState } from 'react'
import { FaDownload, FaEye, FaUpload, FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Pagination from '../../../components/Pagination' // use shared component
import { useSelector } from 'react-redux'
import pdf from '.././../../assets/Bulkpayout.xlsx'
import {
    CButton, CForm, CFormInput, CFormLabel, CCard,
    CCardBody,
    CCardHeader,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CSpinner,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormSelect,
    CBadge,
    CCardFooter,
} from '@coreui/react'

// 🎨 DARK MODE COLOR PALETTE
const CUSTOM_PRIMARY = "#ff66b2"; // Vibrant Pink (Updated from orange)
const DARK_BG = "#1e1e1e"; // Main background
const CARD_BG = "#2c2c2c"; // Card/Container background
const LIGHT_BG = "#383838"; // Lighter dark for subtle contrast/input
const TEXT_COLOR_LIGHT = "#ffffff"; // Light text for readability
const TEXT_COLOR_MUTED = "#b3b3b3"; // Muted text
const INPUT_BORDER_COLOR = "#555555"; // Input border in dark mode
const ACCENT_SUBTLE_DARK = "rgba(255, 102, 178, 0.2)"; // Light pink tint for dark mode headers/modals

function BulkPayout() {

    const { user } = useSelector((state) => state.user)
    const [loading, setLoading] = useState(true);

    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newStatus, setNewStatus] = useState("");

    // --- Handlers (Logic kept unchanged) ---

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (
            selectedFile && (
                selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                selectedFile.type === "application/vnd.ms-excel")
        ) {
            setFile(selectedFile);
            setMessage("");
        } else {
            setMessage("Please upload a valid Excel file (.xlsx or .xls).");
            setFile(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage("No file selected");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await axios.post(
                "/api/auth/UploadBUlkPayoutfile",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );
            toast.success(res.data);
        } catch (err) {
            toast.error(err.response?.data?.error || "Upload failed");
        } finally {
            fetchFiles();
            setFile(null);
            document.getElementById("csvFile").value = "";
        }
    };

    const [files, setFiles] = useState([]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                "/api/auth/ViewBUlkPayoutfiles",
                { withCredentials: true }
            );
            setFiles(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch files.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDownload = async (id, filename) => {
        try {
            const res = await axios.get(
                `/api/auth/downloadBUlkPayoutfile/${id}`,
                {
                    responseType: "blob",
                    withCredentials: true,
                }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
            toast.error("Download failed.");
        }
    };

    const handleChangeStatus = async () => {
        if (!selectedFile) return;

        try {
            await axios.put(
                `/api/auth/Bulk-Payout/${selectedFile._id}/status`,
                { status: newStatus },
                { withCredentials: true }
            );
            toast.success(`Status updated to ${newStatus}`);
            setModalVisible(false);
            fetchFiles();
        } catch (err) {
            console.error("Status update failed", err);
            toast.error("Status update failed.");
        }
    };

    const handleBankUpload = async (id, bankFile) => {
        if (!bankFile) return;
        const formData = new FormData();
        formData.append("file", bankFile);
        try {
            await axios.post(`/api/auth/upload-bank-file/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            toast.success("Bank file uploaded successfully!");
            fetchFiles();
        } catch (err) {
            console.log(err);
            toast.error("Bank file upload failed.");
        }
    };

    const handleProcessBank = async (id) => {
        try {
            setLoading(true);
            const res = await axios.post(`/api/auth/bulk-Payout/process/${id}`, {}, { withCredentials: true });
            toast.success(`✅ ${res.data.inserted} Payouts processed.`);
            fetchFiles();
        } catch (err) {
            console.log(err)
            toast.error(err.response?.data?.message || "Processing failed.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusText = status.toLowerCase();
        switch (statusText) {
            case "processed": return { color: "success", text: "Processed" };
            case "pending": return { color: "warning", text: "Pending" };
            case "failed": return { color: "danger", text: "Failed" };
            default: return { color: "secondary", text: status };
        }
    }

    const handleOpenStatusModal = (file) => {
        setSelectedFile(file);
        setNewStatus(file.status); // Use file.status directly as CFormSelect options are capitalized
        setModalVisible(true);
    }
    const handleFileChangeutr = (event) => {
        const selectedFile = event.target.files[0];
        if (
            selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            selectedFile.type === "application/vnd.ms-excel") {
            setFile(selectedFile);
            setMessage("");
        } else {
            setMessage("Please upload a valid CSV file.");
            setFile(null);
        }
    };

    const handleUploadutr = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage("No file selected");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await axios.post(
                "/api/auth/add_Bulk_utr_Payout",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );
            console.log(res.data)
            toast.success(
                <div>
                    <strong>Bulk Payouts Summary: ✅</strong>
                    <br />✔️ <b>Success:</b> {res.data.success ? "true" : "false"}
                    <br />📌 <b>Message:</b> {res.data.message}
                    <br />📊 <b>Total Rows:</b> {res.data.totalRows}
                    <br />➕ <b>Inserted:</b> {res.data.inserted}
                    <br />⏭️ <b>Skipped:</b> {res.data.skipped}
                    <br />❌ <b>Failed:</b> {res.data.failed}
                </div>,
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                }
            );
        } catch (err) {
            toast.error(err.response?.data?.error || "Upload failed");
        } finally {
            fetchFiles();
            setFile(null);

        }
    };

    return (
        <div className='container-fluid py-4' style={{ backgroundColor: DARK_BG, minHeight: '90vh', color: TEXT_COLOR_LIGHT }}>
            {user.role !== "User" && <CForm onSubmit={handleUploadutr} className="mb-3">
                <CCard
                    className="mb-4 shadow-lg"
                    style={{
                        backgroundColor: CARD_BG,
                        color: TEXT_COLOR_LIGHT,
                        borderColor: INPUT_BORDER_COLOR,
                        borderTop: `4px solid ${CUSTOM_PRIMARY}`
                    }}> <CCardHeader style={{ backgroundColor: CUSTOM_PRIMARY, color: 'white' }}>
                        <h5 className="mb-0 fw-bold">Bulk Set UTR</h5>
                    </CCardHeader>
                    <CFormInput
                        type="file"
                        id="csvFile"
                        accept=" application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleFileChangeutr}
                    />
                    
                    <br />
                </CCard>
                    <CButton    type="submit"
                                style={{ backgroundColor: CUSTOM_PRIMARY, borderColor: CUSTOM_PRIMARY }}
                                className='text-white' 
                                >
                        Submit
                    </CButton>
            </CForm>
            }
            {/* File Upload Card */}
            <CCard
                className="mb-4 shadow-lg"
                style={{
                    backgroundColor: CARD_BG,
                    color: TEXT_COLOR_LIGHT,
                    borderColor: INPUT_BORDER_COLOR,
                    borderTop: `4px solid ${CUSTOM_PRIMARY}`
                }}>
                {/* Card Header: Use orange background */}
                <CCardHeader style={{ backgroundColor: CUSTOM_PRIMARY, color: 'white' }}>
                    <h5 className="mb-0 fw-bold">Multiple Payments File Upload 📤</h5>
                </CCardHeader>
                <CCardBody>
                    <CForm onSubmit={handleUpload}>
                        <div className="mb-3">
                            <CFormLabel
                                htmlFor="csvFile"
                                className="fw-bold"
                                style={{ color: TEXT_COLOR_LIGHT }} // Light text color
                            >
                                Select Excel File for Multiple Payments (<span style={{ color: CUSTOM_PRIMARY }}>.xlsx or .xls</span>)
                            </CFormLabel>
                            <CFormInput
                                type="file"
                                id="csvFile"
                                accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                onChange={handleFileChange}
                                className={message ? "is-invalid" : ""}
                                // Dark Mode Input Styling
                                style={{
                                    '--cui-focus-ring-color': ACCENT_SUBTLE_DARK,
                                    '--cui-active-border-color': CUSTOM_PRIMARY,
                                    backgroundColor: LIGHT_BG,
                                    color: TEXT_COLOR_LIGHT,
                                    borderColor: INPUT_BORDER_COLOR
                                }}
                            />
                            {message && <div className="invalid-feedback">{message}</div>}
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            {/* Primary Upload Button: Orange fill */}
                            <CButton
                                type="submit"
                                style={{ backgroundColor: CUSTOM_PRIMARY, borderColor: CUSTOM_PRIMARY }}
                                className='text-white'
                                disabled={!file || loading}>
                                <FaUpload className="me-1" /> {loading ? <CSpinner size="sm" /> : 'Submit Upload'}
                            </CButton>
                            {/* Secondary Download Button: Orange outline */}
                            <CButton
                                variant="outline"
                                href={pdf}
                                download="sample.xlsx"
                                style={{ color: CUSTOM_PRIMARY, borderColor: CUSTOM_PRIMARY }}
                                className="fw-medium">
                                <FaDownload className="me-1" /> Download Sample File
                            </CButton>
                        </div>
                    </CForm>
                </CCardBody>
                {/* Card Footer: Subtle dark background, emphasized text */}
                <CCardFooter style={{ backgroundColor: ACCENT_SUBTLE_DARK, borderTop: `1px solid ${INPUT_BORDER_COLOR}` }}>
                    <p className="mb-1" style={{ color: CUSTOM_PRIMARY }}>
                        <small className="fw-bold">Instructions:</small>
                    </p>
                    <ul className="list-unstyled mb-0 ms-3">
                        <li style={{ color: TEXT_COLOR_LIGHT }}><small>Before the beneficiary account number, you **must** put this (<code style={{ color: CUSTOM_PRIMARY }}>'</code>) sign. It is compulsory.</small></li>
                        <li style={{ color: TEXT_COLOR_LIGHT }}><small>*Beneficiary code (Beneficiary Nick Name) should not contain any spaces.</small></li>
                    </ul>
                </CCardFooter>
            </CCard>

            {/* Uploaded Files Table Card */}
            <CCard className="mt-4 shadow-lg" style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}>
                {/* Card Header: Subtle dark background with orange text */}
                <CCardHeader className="fw-bold" style={{ backgroundColor: ACCENT_SUBTLE_DARK, color: CUSTOM_PRIMARY, borderBottom: `1px solid ${INPUT_BORDER_COLOR}` }}>
                    <h5>Uploaded Multiple Payments Files History 📋</h5>
                </CCardHeader>
                <CCardBody>
                    {loading && !files.length ? (
                        <div className="text-center py-5">
                            <CSpinner style={{ color: CUSTOM_PRIMARY, width: '4rem', height: '4rem' }} />
                            <p className="mt-2" style={{ color: TEXT_COLOR_MUTED }}>Loading files...</p>
                        </div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="lead" style={{ color: TEXT_COLOR_MUTED }}>No files uploaded yet. Start by uploading a file above. ⬆️</p>
                        </div>
                    ) : (
                        <CTable striped hover responsive className="align-middle" style={{ color: TEXT_COLOR_LIGHT, border: `1px solid ${INPUT_BORDER_COLOR}` }}>
                            {/* Table Head: Darker background for header */}
                            <CTableHead style={{ backgroundColor: LIGHT_BG, color: TEXT_COLOR_LIGHT }}>
                                <CTableRow>
                                    <CTableHeaderCell style={{ color: TEXT_COLOR_LIGHT }}>File Name</CTableHeaderCell>
                                    <CTableHeaderCell style={{ color: TEXT_COLOR_LIGHT }}>Uploaded By</CTableHeaderCell>
                                    <CTableHeaderCell style={{ color: TEXT_COLOR_LIGHT }}>Role</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center" style={{ color: TEXT_COLOR_LIGHT }}>Status</CTableHeaderCell>
                                    <CTableHeaderCell style={{ color: TEXT_COLOR_LIGHT }}>Uploaded At (IST)</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center" style={{ color: TEXT_COLOR_LIGHT }}>Actions</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {files.toReversed().map((file, index) => {
                                    const badge = getStatusBadge(file.status);
                                    const isProcessed = file.status.toLowerCase() === "processed";

                                    return (
                                        <CTableRow
                                            key={file._id}
                                            // Custom dark stripe styling (CoreUI's built-in striped is light-mode focused)
                                            style={{ backgroundColor: index % 2 === 0 ? CARD_BG : LIGHT_BG }}
                                        >
                                            <CTableDataCell className="fw-semibold" style={{ color: CUSTOM_PRIMARY }}>{file.filename}</CTableDataCell>
                                            <CTableDataCell style={{ color: TEXT_COLOR_MUTED }}>{file.uploadedBy?.email || "N/A"}</CTableDataCell>
                                            <CTableDataCell style={{ color: TEXT_COLOR_MUTED }}>{file.uploadedBy?.role || "User"}</CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                <CBadge color={badge.color} shape="rounded-pill" className="px-3 py-2 fw-bold">
                                                    {badge.text}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell className='small text-nowrap' style={{ color: TEXT_COLOR_MUTED }}>
                                                {new Date(file.createdAt).toLocaleString("en-US", {
                                                    timeZone: 'Asia/Kolkata',
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit', hour12: true
                                                })}
                                            </CTableDataCell>

                                            <CTableDataCell>
                                                <div className="d-flex flex-wrap justify-content-center gap-2">
                                                    {/* Download Button: Orange outline */}
                                                    <CButton
                                                        color="primary"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDownload(file._id, file.filename)}
                                                        title="Download Uploaded File"
                                                        style={{ color: CUSTOM_PRIMARY, borderColor: CUSTOM_PRIMARY }}
                                                    >
                                                        <FaDownload />
                                                    </CButton>

                                                    {/* Admin/Sub_Admin extra actions */}
                                                    {(user.role === "Super_Admin" || user.role === "Sub_Admin") && !isProcessed && (
                                                        <>
                                                            {/* Upload Bank File Button (Gold outline for dark mode warning) */}
                                                            {!file.bankFile ? (
                                                                <CButton
                                                                    color="warning"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => document.getElementById(`bankFile-${file._id}`).click()}
                                                                    title="Upload Bank Response File"
                                                                    style={{ borderColor: 'gold', color: 'gold' }} // Gold outline
                                                                >
                                                                    <FaUpload /> Bank
                                                                    <input
                                                                        id={`bankFile-${file._id}`}
                                                                        type="file"
                                                                        style={{ display: "none" }}
                                                                        accept=".xlsx, .xls, .csv"
                                                                        onChange={(e) => handleBankUpload(file._id, e.target.files[0])}
                                                                        onClick={(e) => e.target.value = null}
                                                                    />
                                                                </CButton>
                                                            ) : (
                                                                // Process Bank Button (Success green)
                                                                <CButton
                                                                    color="success"
                                                                    size="sm"
                                                                    onClick={() => handleProcessBank(file._id)}
                                                                    disabled={loading}
                                                                    title="Process Multiple Payments from Bank File"
                                                                >
                                                                    {loading ? <FaSpinner className="spin" /> : <FaCheckCircle />} Process
                                                                </CButton>
                                                            )}

                                                            {/* Change Status Button (Muted outline) */}
                                                            <CButton
                                                                color="secondary" // Changed to secondary for dark mode aesthetic
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleOpenStatusModal(file)}
                                                                title="Manually Change File Status"
                                                                style={{ color: TEXT_COLOR_MUTED, borderColor: INPUT_BORDER_COLOR }}
                                                            >
                                                                <FaEye /> Status
                                                            </CButton>
                                                        </>
                                                    )}
                                                </div>
                                            </CTableDataCell>

                                        </CTableRow>
                                    );
                                })}
                            </CTableBody>
                        </CTable>
                    )}
                </CCardBody>
                {/* Pagination component placeholder */}
                <CCardFooter style={{ backgroundColor: CARD_BG, borderTop: `1px solid ${INPUT_BORDER_COLOR}` }}>
                    {/* <Pagination /> */}
                </CCardFooter>
            </CCard>

            {/* Change Status Modal */}
            <CModal
                alignment="center"
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                // Custom Dark Modal Styling
                className="dark-modal-custom"
                style={{
                    '--cui-modal-bg': CARD_BG,
                    '--cui-modal-color': TEXT_COLOR_LIGHT
                }}
            >
                {/* Modal Header: Light orange background */}
                <CModalHeader style={{ backgroundColor: ACCENT_SUBTLE_DARK, borderBottom: `1px solid ${INPUT_BORDER_COLOR}` }}>
                    <CModalTitle className='fw-bold' style={{ color: CUSTOM_PRIMARY }}>Change File Status</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <p className='mb-3'>Current File: <span className="fw-semibold" style={{ color: TEXT_COLOR_LIGHT }}>{selectedFile?.filename}</span></p>
                    <CFormLabel htmlFor="statusSelect" className="fw-medium" style={{ color: TEXT_COLOR_MUTED }}>Select New Status</CFormLabel>
                    <CFormSelect
                        id="statusSelect"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        // Dark Mode Select Styling
                        style={{
                            backgroundColor: LIGHT_BG,
                            color: TEXT_COLOR_LIGHT,
                            borderColor: INPUT_BORDER_COLOR,
                            // Fix for select arrow on dark background
                            filter: 'invert(0.8) grayscale(1) brightness(1.5)'
                        }}
                    >
                        <option value="Pending" style={{ backgroundColor: CARD_BG }}>Pending</option>
                        <option value="Processed" style={{ backgroundColor: CARD_BG }}>Processed</option>
                        <option value="Failed" style={{ backgroundColor: CARD_BG }}>Failed</option>
                    </CFormSelect>
                </CModalBody>
                <CModalFooter style={{ borderTop: `1px solid ${INPUT_BORDER_COLOR}` }}>
                    <CButton
                        variant="outline"
                        onClick={() => setModalVisible(false)}
                        style={{ color: TEXT_COLOR_MUTED, borderColor: INPUT_BORDER_COLOR }}
                    >
                        Cancel
                    </CButton>
                    {/* Orange primary button */}
                    <CButton
                        style={{ backgroundColor: CUSTOM_PRIMARY, borderColor: CUSTOM_PRIMARY }}
                        className='text-white'
                        onClick={handleChangeStatus}
                        disabled={!newStatus}>
                        Save Changes
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    )
}

export default BulkPayout












