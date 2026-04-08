import React, {useState} from 'react';
import { jsPDF } from 'jspdf';
import {Button} from "@/components/ui/button.jsx";
import {GraduationCap} from "lucide-react";
function Sertificate(props) {
    const certificateTemplateUrl = '/sertificate.png';
    const {userName, result, subtopics} = props


    const generatePDF = () => {
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const finalTextMavzular= "Mavzu(lar): " + subtopics
        // Load the image (template) into the PDF
        pdf.addImage(certificateTemplateUrl, 'JPEG', 0, 0, 297, 210);


        pdf.setFont('helvetica', "normal");
        pdf.setFontSize(34);
        pdf.setTextColor('#1a355d');
        const y = 75;
        const x = 21;
        pdf.text(userName, x, y);

        pdf.setFontSize(16)
        pdf.setTextColor('#666668')
        pdf.text(`Natija: ${result}%`, x, 105.5)
        const pageWidth = pdf.internal.pageSize.getWidth() // full page width
        const maxLineWidth = pageWidth*60/100
        const textWithLimits = pdf.splitTextToSize(finalTextMavzular, maxLineWidth)
        pdf.text(textWithLimits, x, 112)


        pdf.save('certificate.pdf');
    };
    return (
            <Button variant={`outline`} size={'sm'} onClick={generatePDF}>
                <GraduationCap className={`w-4 h-4 `} />
                Sertifikat
            </Button>
    );
}

export default Sertificate;