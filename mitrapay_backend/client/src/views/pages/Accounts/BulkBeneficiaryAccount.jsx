import React, { useEffect, useState } from 'react'
import { FaSearch, FaPlus, FaEdit, FaEllipsisV, FaDownload, FaEye } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Pagination from '../../../components/Pagination' // use shared component
import { useSelector } from 'react-redux'
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
} from '@coreui/react'
import { Modal, Button } from 'react-bootstrap'
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import pdf from '.././../../assets/BENEUPLOD.xlsx'
function BulkBeneficiaryAccount() {
    const { user, error, isAuthenticated } = useSelector((state) => state.user)

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newStatus, setNewStatus] = useState("");

    const handleFileChange = (event) => {
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

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage("No file selected");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            setUploading(true);
            const res = await axios.post(
                "/api/auth/UploadBUlkBenificieryaccount",
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

            setUploading(false);
        }
    };

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFiles = async () => {
        try {
            const res = await axios.get(
                "/api/auth/ViewBUlkBenificieryaccount",
                { withCredentials: true } // if you use JWT cookie auth
            );
            setFiles(res.data.data);
        } catch (err) {
            console.error(err);
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
                `/api/auth/downloadBUlkBenificieryaccount/${id}`,
                {
                    responseType: "blob", // important for file download
                    withCredentials: true,
                }
            );

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename); // use backend filename
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    const handleChangeStatus = async () => {
        if (!selectedFile) return;

        try {
            await axios.put(
                `/api/auth/bulk-beneficiary/${selectedFile._id}/status`,
                { status: newStatus },
                { withCredentials: true }
            );
            setModalVisible(false);
            fetchFiles(); // refresh
        } catch (err) {
            console.error("Status update failed", err);
        }
    };
    const openStatusModal = (file) => {
        setSelectedFile(file);
        setNewStatus(file.status);
        console.log(file, "file in open status modal");
        setModalVisible(true);
    };

    const handleProcess = async (fileId) => {
        if (!fileId) {
            setMessage("Upload a file first.");
            return;
        }

        setUploading(true);
        try {
            const res = await axios.post(`/api/auth/bulk-beneficiaries/process/${fileId}`);
            // setInsertedCount(res.data.inserted);
            toast.success(`✅ ${res.data.inserted} beneficiaries inserted successfully.`);
            fetchFiles();
            if(res.data.skiped && res.data.skiped > 0){
                toast.info(`⚠️ ${res.data.skiped} beneficiaries were skipped as they already exist.`);
            }
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.error || "Processing failed");
        } finally {
            setUploading(false);
        }
    };
    console.log(user)
    return (
        <div>
            <CForm onSubmit={handleUpload} className="mb-3">
                <CFormLabel htmlFor="csvFile">Upload CSV File</CFormLabel>

                <CFormInput
                    type="file"
                    id="csvFile"
                    accept=" application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                />
                <CButton type="submit" className="mt-2 btn-primary">
                    Submit
                </CButton>
                <br />
                <CButton type="Button" className="ml-2 mt-2 btn-primary" href={pdf} download="sample.xlsx" >
                    Download Sample file
                </CButton>
                <br />

                <CFormLabel>Before the beneficiary account number, you must put this ( ' ) sign. It is compulsory.</CFormLabel>
                <br />
                <CFormLabel>*Beneficiary code(Beneficiary Nick Name) should not contain any space.</CFormLabel>
            </CForm>
            <CCard className="mt-4 shadow-sm">
                <CCardHeader>
                    <h5>Uploaded Beneficiary Files</h5>
                </CCardHeader>
                <CCardBody>
                    {loading ? (
                        <CSpinner color="primary" />
                    ) : (
                        <CTable striped hover responsive bordered>
                            <CTableHead color="dark">
                                <CTableRow>
                                    <CTableHeaderCell scope="col">File Name</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Uploaded By</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Uploaded At</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {files.toReversed().map((file) => (
                                    <CTableRow key={file._id}>
                                        <CTableDataCell>{file.filename}</CTableDataCell>
                                        <CTableDataCell>{file.uploadedBy?.email}</CTableDataCell>
                                        <CTableDataCell>{file.uploadedBy?.role}</CTableDataCell>
                                        <CTableDataCell>{file.status}</CTableDataCell>
                                        <CTableDataCell>
                                            {new Date(file.createdAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' })}
                                        </CTableDataCell>

                                        <CTableDataCell>
                                            <div className="d-flex gap-2">
                                                <CButton
                                                    color="primary"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(file._id, file.filename)}
                                                >
                                                    Download
                                                </CButton>

                                                {(user.role === 'Super_Admin' || user.role === 'Sub_Admin') && (
                                                    <>
                                                        <CButton
                                                            color="warning"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openStatusModal(file)}
                                                        >
                                                            Change Status
                                                        </CButton>

                                                        {uploading ?
                                                            <CSpinner size="sm" /> : 
                                                                file.status != "approved" && <CButton
                                                                    color="success"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleProcess(file._id)}
                                                                >
                                                                    Process
                                                                </CButton>
                                                            }

                                                    </>
                                                )}
                                            </div>
                                        </CTableDataCell>

                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    )}
                </CCardBody>
            </CCard>
            {/* Change Status Modal */}
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Change File Status</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CFormSelect
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </CFormSelect>
                </CModalBody>
                <CModalFooter>

                    <> <CButton color="secondary" onClick={() => setModalVisible(false)}>
                        Cancel
                    </CButton>
                        <CButton color="primary" onClick={handleChangeStatus}>
                            Save
                        </CButton></>
                </CModalFooter>
            </CModal>
        </div>
    )
}

export default BulkBeneficiaryAccount
