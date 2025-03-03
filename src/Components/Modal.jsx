import React from 'react';
import { AiOutlineClose } from 'react-icons/ai'; // Close icon
import { BiExport } from 'react-icons/bi'; // Export icon
import { MdDelete, MdVisibility } from 'react-icons/md'; // View and delete icons
import './styling/Modal.css'; // Import the CSS file

const Modal = ({ isOpen, onClose, onView, onExportCSV, onExportPDF, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>
                    <AiOutlineClose />
                </button>
                <h2>Action Options</h2>
                <ul>
                    <li onClick={onView}>
                        <MdVisibility className="view-icon" />
                        <span>View</span>
                    </li>
                    <li onClick={onExportCSV}>
                        <BiExport className="export-csv-icon" />
                        <span>Export CSV</span>
                    </li>
                    <li onClick={onExportPDF}>
                        <BiExport className="export-pdf-icon" />
                        <span>Export PDF</span>
                    </li>
                    <li onClick={onDelete}>
                        <MdDelete className="delete-icon" />
                        <span>Delete User</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Modal;