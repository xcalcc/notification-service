import React from 'react';
import {Container} from 'react-bootstrap';
import FileSelection from "./components/FileSelection";
import 'bootstrap/dist/css/bootstrap.min.css';
import DataTable from "./components/DataTable";

function App() {
    return (
        <Container className="app">
            <section>
                <h1>Rule Information Manager</h1>
                <p>
                    This is UI to manage rule information, which can upload the excel file by drag and drop.
                </p>
            </section>
            <section>
                <FileSelection />
            </section>
            <section>
                <DataTable />
            </section>
        </Container>
    );
}

export default App;
