import React from 'react';
import {Download} from "lucide-react";
import {Button} from "@/components/ui/button.jsx";
import {Document, Packer, Paragraph, TextRun} from "docx";

function DownloadResult(props) {
    const {subTopicNames, time, result, email, userName, questionLength} = props
    const generateWordFile = () => {
        const children = []
        // Adding the title
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text:"Test Natijalari",
                        color:'#000000',
                        size:30
                    }),
                    new TextRun({
                        text: "\n\n",
                    }),
                ],
            }),
        )


            children.push(
                new Paragraph({
                    style: 'Heading1',
                    children:[
                        new TextRun({
                            text: `Mavzular: ${subTopicNames}`,
                            color: '#000000',
                            size:30
                        })
                    ]
                }),
            )

            // Adding Time Taken
            children.push(
                new Paragraph({
                    children:[
                        new TextRun({
                            text: `Ketgan vaqt: ${time} daqiqa`,
                            color: '#000000',
                            size:30
                        })
                    ]
                }),
            )

            children.push(
                new Paragraph({
                    children:[
                        new TextRun({
                            text: `Savollar soni: ${questionLength}ta`,
                            color: '#000000',
                            size:30
                        })
                    ]
                }),
            )
            children.push(
                new Paragraph({
                    children:[
                        new TextRun({
                            text: `Natija: ${result}%`,
                            color: '#000000',
                            size:30
                        })
                    ]
                }),
            )

            // Adding User Information
            children.push(
                new Paragraph({
                    children:[
                        new TextRun({
                            text: `Email: ${email}`,
                            color: '#000000',
                            size:30
                        })
                    ]
                }),
                new Paragraph({
                    children:[
                        new TextRun({
                            text: `Username: ${userName}`,
                            color: '#000000',
                            size:30
                        })
                    ]
                }),
            )
        const doc = new Document({
            sections: [
                {
                    children,

                }
            ]
        });
        // Generate the .docx file
        Packer.toBlob(doc).then((blob) => {
            // Use FileSaver to download the file
            saveAs(blob, 'Test Natijalari.docx');
        });
    };

    return (
        <Button variant="outline" size="sm" onClick={generateWordFile} >
            <Download className="w-4 h-4" />
            Yuklash
        </Button>
    );
}

export default DownloadResult;