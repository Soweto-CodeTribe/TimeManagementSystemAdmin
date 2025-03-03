import React from 'react';
import { AiOutlineClose } from 'react-icons/ai'; // Close icon
import { BiExport } from 'react-icons/bi'; // Export icon
import { MdDelete, MdVisibility } from 'react-icons/md'; // View and delete icons

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
                        <MdVisibility />
                        <span>View</span>
                    </li>
                    <li onClick={onExportCSV}>
                        <BiExport />
                        <span>Export CSV</span>
                    </li>
                    <li onClick={onExportPDF}>
                        <BiExport />
                        <span>Export PDF</span>
                    </li>
                    <li onClick={onDelete}>
                        <MdDelete />
                        <span>Delete User</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Modal;