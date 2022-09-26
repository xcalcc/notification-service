import React, {useCallback, useState} from 'react';
import {useDispatch} from "react-redux";
import {Row, Col, Button, ProgressBar, Form} from 'react-bootstrap';
import {useDropzone} from 'react-dropzone';
import {Upload, ExclamationTriangleFill} from "react-bootstrap-icons";
import prettyBytes from 'pretty-bytes';
import api from '../apis';
import actions from '../redux/actions';
import './drag-n-drop.scss';

const ALLOWED_MIME_TYPES = [
    'application/vnd.ms-excel', //.xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', //.xlsx
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; //5 MB
const DragNDrop = props => {
    const dispatch = useDispatch();
    const [isValidFile, setIsValidFile] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const onDrop = useCallback(acceptedFiles => {
        setUploadSuccess(false);
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = () => {
                // Do whatever you want with the file contents
                // const binaryStr = reader.result
                // console.log(binaryStr);
            }
            reader.readAsArrayBuffer(file);
        });
        if (acceptedFiles &&
            acceptedFiles.length &&
            acceptedFiles[0].size <= MAX_FILE_SIZE) {
            setIsValidFile(true);
        } else {
            setIsValidFile(false);
        }
    }, []);

    const {
        acceptedFiles,
        fileRejections,
        getRootProps,
        getInputProps
    } = useDropzone({
        accept: ALLOWED_MIME_TYPES.join(','),
        onDrop,
    });

    const acceptedFileItems = acceptedFiles.map(file => (
        <span key={file.path}>
            {file.path} - {prettyBytes(file.size)}
        </span>
    ));

    const handleUpload = async e => {
        e.stopPropagation();
        setUploadSuccess(false);
        if (isValidFile) {
            const result = await api.uploadFile(acceptedFiles[0], setUploadProgress);
            setUploadProgress(0);
            if (result.data) {
                setUploadSuccess(true);
                dispatch(actions.setConvertedData(result.data));
            }
        }
    }

    return <div className="drag-n-drop">
        <Row>
            <Col className="drop-area align-content-center">
                <div {...getRootProps({className: 'dropzone'})}>
                    <Upload/>
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop your file here, or click to select files</p>
                </div>
            </Col>
            <Col>
                <Button variant="primary" onClick={handleUpload}>
                    Upload
                </Button>
                <div>
                    {
                        !!fileRejections &&
                        <ul className="text-danger">
                            {
                                fileRejections.length ? fileRejections.map((file, idx) => {
                                        const filePath = file.file;
                                        return <li key={idx}>
                                            {filePath.path}
                                        </li>
                                    }
                                ) : ''
                            }
                        </ul>
                    }
                    {
                        !isValidFile && <div className="text-danger">

                            <p><ExclamationTriangleFill/></p>
                            <p>
                                File type is not supported or file size is too large,
                                Only microsoft *.xls and *.xlsx will be accepted
                            </p>
                        </div>
                    }

                    {
                        uploadSuccess ? <div className="text-success">
                                <p>File(s) uploaded successfully.</p>
                                <p>{acceptedFileItems}</p>
                            </div> :
                            <span>{acceptedFileItems}</span>
                    }
                </div>
            </Col>
        </Row>
        {
            uploadProgress ? <Row>
                <Col>
                    <ProgressBar
                        animated
                        now={uploadProgress}
                        label="Uploading"
                    />
                </Col>
            </Row> : null
        }
    </div>;
}

export default DragNDrop;
