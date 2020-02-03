import React, {useState} from "react";
import {OverlayTrigger, Popover, Image} from "react-bootstrap";

/**
 * Class that represents image row in files table.
 */
export default function ImageRow(props: {
    indexedFile: {file: File, index: number},
    key: number,    // prop for react lists, don't access
}) {
    let file = props.indexedFile.file;
    let [previewImage, setPreviewImage] = useState();

    let generateNotes = () => {
        let notes = [];
        file.size > 1000000 && notes.push('⚠️ File is very big');
        'image/jpeg image/jpg dcm image/png'.indexOf(file.type) === -1 && notes.push('(?) File has unsupported type (jpeg, jpg, dcm, png)');
        return notes.join(', ');
    }

    let generateSize = () =>
        file.size > 1000000 ? Math.trunc(file.size / 1000000) + ' MB'
            : file.size > 1000 ? Math.trunc(file.size / 1000) + ' KB'
            : file.size + ' B';

    let renderPreview = () => {
        let fileReader = new FileReader();
        fileReader.addEventListener("load", function () {
            // convert image file to base64 string
            setPreviewImage(fileReader.result);
        }, false);
        fileReader.readAsDataURL(file);
        return <Popover id="popover-image-preview">
            <Popover.Title as="h3">{file.name}</Popover.Title>
            <Popover.Content>
                <Image src={previewImage} rounded height={250} width={250}/>
            </Popover.Content>
        </Popover>
    }


    return (<tr>
        <td>{props.indexedFile.index}</td>
        <td>{file.name}</td>
        <td>{generateSize()}</td>
        <td>
            <OverlayTrigger
                trigger={"hover"}
                placement="left"
                delay={{ show: 250, hide: 0 }}
                overlay={renderPreview()}
            >
                <span role="img" aria-label="preview-file">🔍</span>
            </OverlayTrigger>
        </td>
        <td>{generateNotes()}</td>
    </tr>)
}