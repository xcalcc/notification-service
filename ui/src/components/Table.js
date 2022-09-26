import React from 'react';
import {Table, Row, Col} from "react-bootstrap";
import Searcher from 'fuzzy-search';
import SearchBox from './SearchBox';

export default props => {
    const {
        headers,
        data,
        label,
    } = props;
    return (<div className="data-table">
        <Row>
            <Col>
                <h1>{label}</h1>
            </Col>
            <Col>
                <SearchBox />
            </Col>
        </Row>
        <Table striped bordered hover>
            <thead>
            <tr>
                {
                    headers &&
                    headers.map((header, idx) => <th key={idx}>{header}</th>)
                }
            </tr>
            </thead>
            <tbody>
            {
                data && data.map((row, idx) => {
                    return <tr key={idx}>
                        {
                            headers.map((header, idx) => <td key={idx}>{row[header]}</td>)
                        }
                    </tr>;
                })
            }
            </tbody>
        </Table>
    </div>);
}