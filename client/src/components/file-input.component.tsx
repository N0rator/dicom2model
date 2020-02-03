import React  from 'react';
import {Button} from "react-bootstrap";
import {IndexGenerator} from "../utils/index-generator.util";

export default function FileInput(props: {
    onFilesSelection: any; // callback
}) {

    let fileSelectorId = 'file-selector-' + IndexGenerator.getIndex();

    let selectFile = () => document.getElementById(fileSelectorId).click();

    let handleFileSelection = (event) => {
        props.onFilesSelection(event.target.files);
    }


    return (<>
        <Button onClick={selectFile}>Select Files</Button>
        <input className={'file-input-tag'} type={'file'} id={`${fileSelectorId}`} onChange={handleFileSelection} multiple />
    </>);
}