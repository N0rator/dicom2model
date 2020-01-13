import io from 'socket.io-client';
import React, {useState} from 'react';
import {Badge, Button, Card, Container, Form} from "react-bootstrap";
import FileInput from "./components/file-input.component";

let socketConnection = io('http://localhost:3000');
let fileReader = new FileReader();
fileReader.addEventListener('loadend', (e) => {
    socketConnection.emit('sendBlob.file', fileReader.result)
});

export default function MainPage() {
    let [isConnected, setIsConnected] = useState(null);
    let [latency, setLatency] = useState(null);
    let files: FileList;

    socketConnection.on('connect', () => {
        setIsConnected(true);
    });
    socketConnection.on('disconnect', () => {
        setIsConnected(false);
    });
    socketConnection.on('pong', (ms) => {
        setLatency(ms);
    });

    let handleSubmit = () => {
        if (!files || files.length === 0) throw Error('No files selected!');
        socketConnection.emit('sendBlob.blobInfo', {size: files.length});
        [...files].forEach(file => {
            fileReader.readAsArrayBuffer(file)
        });
    };

    let onFileSelection = (selectedFiles: FileList) => files = selectedFiles;

    return (<>
        <Container className={'pt-10'}>
            <Card className={'mb-10 footer'}>
                <Card.Body>
                    <span>
                        DICOM -> MODEL
                    </span>
                    <Badge className={'connected-status-badge'} pill
                           variant={isConnected === null? 'secondary' : isConnected ? 'success' : 'danger'}>
                        {isConnected === null? 'Pending' : isConnected ? 'Connected' : 'Disconnected'} {latency !== null && isConnected && `(${latency} ms)`}
                    </Badge>
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