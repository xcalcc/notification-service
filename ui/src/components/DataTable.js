import React from 'react';
import {Container} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import Table from './Table';

export default props => {
    const tableData = useSelector(state => state.convertedExcel);

    return <div>
        {
            Object.keys(tableData).map((sheetName, idx) => {
                if(!tableData[sheetName].length) return;
                const headers = Object.keys(tableData[sheetName][0]);
                return <Table
                    key={idx}
                    headers={headers}
                    data={tableData[sheetName]}
                    label={sheetName}
                />;
            })
        }
    </div>
};
