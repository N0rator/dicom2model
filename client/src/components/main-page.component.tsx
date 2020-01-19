import io from 'socket.io-client';
import React, {useState} from 'react';
import {Badge, Button, Card, Container, Form, OverlayTrigger, Popover, Table} from "react-bootstrap";
import FileInput from "./file-input.component";
import ImageRow from "./image-row.component";

let socketConnection = io('http://localhost:3000');

export default function MainPage() {
    let [isConnected, setIsConnected]: [boolean, any] = useState(null);
    let [latency, setLatency]: [number, any] = useState(null);
    let [indexedFiles, setIndexedFiles]: [{file: File, index: number}[], any] = useState([]);

    socketConnection.on('connect', () => setIsConnected(true));
    socketConnection.on('disconnect', () => setIsConnected(false));
    socketConnection.on('pong', (ms) => setLatency(ms));

    let handleSubmit = () => {
        if (!indexedFiles || indexedFiles.length === 0) throw Error('No files selected!');
        socketConnection.emit('sendBlob.blobInfo', {size: indexedFiles.length});
        indexedFiles.forEach(indexedFile => {
            let fileReader = new FileReader();
            fileReader.addEventListener('loadend', (e) => {
                socketConnection.emit('sendBlob.file', {
                    index: indexedFile.index,
                    blob: fileReader.result,
                    filename: indexedFile.file.name,
                })
            });
            fileReader.readAsArrayBuffer(indexedFile.file);
        });
    };

    let onFileSelection = (selectedFiles: FileList) => {
        let index = 1;
        indexedFiles = setIndexedFiles([...selectedFiles].map(file => ({file, index: index++})));
    }

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
                        <Form.Group controlId="filesForm.ControlFiles">
                            <FileInput onFilesSelection={onFileSelection}/>
                        </Form.Group>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th>Preview</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {indexedFiles.map(indexedFile => <ImageRow indexedFile={indexedFile} key={indexedFile.index}></ImageRow>)}
                            </tbody>
                        </Table>
                        <Button variant="success" type="button" onClick={handleSubmit}>
                            Submit Files
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    </>);
}