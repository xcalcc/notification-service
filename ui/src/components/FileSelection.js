import React from 'react';
import DragNDrop from './DragNDrop';

const FileSelection = props => {

    return <div className="file-selection">
        <DragNDrop
            text="Drag your file here"
        />
    </div>;
}
export default FileSelection;

