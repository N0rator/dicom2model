import React from 'react';
import {Button, Card, Container, Form} from "react-bootstrap";
import FileInput from "./components/file-input.component";

export default function MainPage() {
    let files: FileList;

    let handleSubmit = () => {

    };

    let onFileSelection = (selectedFiles: FileList) => {
        files = selectedFiles;
    };

    return (<>
        <Container className={'pt-10'}>
            <Card className={'mb-10 footer'}>
                <Card.Body>
                    DICOM -> MODEL
                </Card.Body>
            </Card>
            <Card>
                <Card.Body>
                    <Form> {/* files form */}
                        <Form.Group controlId="filesForm.ControlName">
                            <Form.Control type="email" placeholder="Enter Your Name"/>
                        </Form.Group>
                        <Form.Group controlId="filesForm.ControlFiles">
                            <FileInput onFilesSelection={onFileSelection}/>
                        </Form.Group>
                        <Button variant="success" type="button" onClick={handleSubmit}>
                            Submit
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    </>);
}