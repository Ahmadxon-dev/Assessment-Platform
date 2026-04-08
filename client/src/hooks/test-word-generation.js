import {
    AlignmentType,
    Document,
    HeadingLevel,
    ImageRun,
    Packer, PageOrientation,
    Paragraph, SectionType,
    Table, TableCell,
    TableRow,
    TextRun,
    WidthType,
} from "docx";
import QRCode from "qrcode";

export const generateTestWordDocs = async (variations, zagolovokText, setPdfUrls, setBtnLoader, setZagolovokText, encryptData,uuid) => {
    const urls = [];

    for (const [index, questions] of variations.entries()) {
        const children = [
            new Paragraph({
                children: [new TextRun({text: `${uuid}`, color: '#000000'})],
                heading: HeadingLevel.HEADING_6,
                alignment: AlignmentType.LEFT
            }),
            new Paragraph({
                children: [new TextRun({text: `${zagolovokText}`, color: '#000000', bold: true})],
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER
            }),
            new Paragraph({
                children: [new TextRun({text: `Test Variant-${index + 1}`, color: '#000000', bold: true})],
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER
            }),
            new Paragraph({
                children: [new TextRun({
                    text: "F.I.SH: __________________________________________________",
                    color: '#000000',
                    bold: true
                })], // Reduced size
            }),
            new Paragraph({
                children: [new TextRun({
                    text: "Sinf: ____________________________________________________",
                    color: '#000000',
                    bold: true
                })], // Reduced size
            }),
            new Paragraph({
                children: [new TextRun({
                    text: "Sana: ____________________________________________________",
                    color: '#000000',
                    bold: true
                })], // Reduced size
            }),
            new Paragraph({
                children: [new TextRun({
                    text: "",
                    color: '#000000',
                    bold: true
                })], // Reduced size
            }),
        ];
        const childrenForColumn = []
        for (const [i, q] of questions.entries()) {
            childrenForColumn.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${i + 1}.(${q.status==="b"?"Bilish":""}${q.status==="q"?"Qo'llash":""}${q.status==="m"?"Mulohaza":""}) ${q.questionText}`,
                            font: "Cambria Math",
                            color: '#000000',
                            size: 24
                        }),
                    ],
                    alignment: AlignmentType.JUSTIFIED
                })
            )


            // Add question image if available
            if (q.questionImage && typeof q.questionImage === 'string' && q.questionImage.startsWith('https://')) {
                try {
                    const imageResponse = await fetch(q.questionImage);
                    const imageBuffer = await imageResponse.arrayBuffer();

                    childrenForColumn.push(
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    type: "png",
                                    data: imageBuffer,
                                    transformation: {
                                        width: 300,
                                        height: 200,
                                    },
                                }),
                            ],
                            alignment: AlignmentType.JUSTIFIED
                        })
                    );
                } catch (error) {
                    console.error('Error fetching image:', error);
                }
            }

            // Add options
            let optionsText = '';  // Initialize a string to store all options

            Object.keys(q.options).forEach((key, j) => {
                optionsText += `${String.fromCharCode(65 + j)}) ${q.options[key].text} `;
            });

// Now, create a single paragraph with all options in one line
            childrenForColumn.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: optionsText.trim(),  // Remove any extra space at the end
                            font: "Cambria Math",
                            color: '#000000',
                            size: 24,
                        }),
                    ],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: {
                        after: 200,
                    }
                })
            );
        }
        const chunkSize = 10; // Adjust chunk size as needed
        const questionChunks = [];
        for (let i = 0; i < questions.length; i += chunkSize) {
            questionChunks.push(questions.slice(i, i + chunkSize));
        }

        const answerTableRows = [];
        questionChunks.forEach((chunk, chunkIndex) => {
            const questionNumbersRow = new TableRow({
                children: chunk.map((_, questionIndex) => {
                    return new TableCell({
                        children: [
                            new Paragraph({
                                children: [new TextRun({
                                    text: `${questionIndex + (chunkIndex * chunkSize) + 1}`,
                                    size: 25,
                                    color: '#000000'
                                })], // Increased size to 14
                            }),
                        ],
                    });
                }),
            });

            const answerKeysRow = new TableRow({
                children: chunk.map(() => {
                    return new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "________",
                                        size: 10,
                                        color: "#FFFFFF",
                                    }),
                                ],
                            }),
                        ],
                    });
                }),
                height: {value: 500, rule: "atLeast"},
            });
            answerTableRows.push(questionNumbersRow, answerKeysRow);
        });

        const answerTable = new Table({
            rows: answerTableRows,
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
        });
        const childrenForFooter = []
        childrenForFooter.push(new Paragraph({children: [new TextRun({text: "", color: '#000000'})]}));
        childrenForFooter.push(new Paragraph({
            children: [new TextRun({
                text: "Javoblar:",
                color: '#000000',
                size: 24
            })]
        }));
        childrenForFooter.push(answerTable);
        // Create the answers string as letters (A, B, C, D, or E)
        let answersString = `Test Variant ${index + 1} Javoblar:\n`;
        questions.forEach((q, idx) => {
            // Map answer key to A, B, C, D, or E
            const answerLetter = String.fromCharCode(65 + Object.keys(q.options).indexOf(q.answer));
            answersString += `${idx + 1}: ${answerLetter}\n`; // Show the letter (A, B, C, D, E)
        });

        // Encrypt the answer string
        const encryptedAnswerText = encryptData(answersString);

        // Generate QR code with encrypted answer data
        const qrCodeDataUrl = await QRCode.toDataURL(encryptedAnswerText);
        const qrCodeImage = await fetch(qrCodeDataUrl);
        const qrCodeBuffer = await qrCodeImage.arrayBuffer();

        // Add QR code to the document
        childrenForFooter.push(
            new Paragraph({
                children: [
                    new ImageRun({
                        type: "png",
                        data: qrCodeBuffer,
                        transformation: {
                            width: 150,
                            height: 150,
                        },
                    }),
                ],
                alignment: AlignmentType.RIGHT,
                position: {
                    x: 5000, // Distance from the left edge (in twips)
                    y: 0,    // Distance from the top edge (in twips)
                    width: 100,  // Width of the image (in twips)
                    height: 100, // Height of the image (in twips)
                }
            })
        );

        const doc = new Document({
            sections: [
                {
                    children,
                    properties: {
                        page: {
                            margin: {
                                top: 320,
                                bottom: 250,
                            },
                        },
                    },
                },
                {
                    children: childrenForColumn,
                    properties: {
                        type: SectionType.CONTINUOUS,
                        column: {
                            count: 2,
                            space: 708,
                        },
                        margin: {
                            top: 320,
                            bottom: 250,
                        },
                    }
                },
                {
                    children: childrenForFooter,
                    properties: {
                        type: SectionType.CONTINUOUS,
                        margin: {
                            top: 320,
                            bottom: 250,
                        },
                    }
                }
            ],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        urls.push({url, name: `${index + 1}.docx`});
    }

    setPdfUrls(urls);
    setBtnLoader(false);
    setZagolovokText("");
};

export const generateAnswersWord = async (variations, setAnswersUrl, encryptData, uuid) => {
    const children = [];
    children.push(
        new Paragraph({
        children: [new TextRun({text: `${uuid}`, color: '#000000'})],
        heading: HeadingLevel.HEADING_6,
        alignment: AlignmentType.LEFT
    }),)
    children.push(new Paragraph({ text: "Test Javoblari", heading: "Heading1" }));

    for (const [index, variant] of variations.entries()) {
        children.push(new Paragraph({ text: `Test Variant-${index + 1}`, heading: "Heading2" }));
        let answersString = `Test Variant ${index + 1} Javoblar: `;
        const answerLettersRow = []; // Array to hold answer letters for the current variant

        variant.forEach((q, i) => {
            const questionIndex = Object.keys(q.options).indexOf(q.answer);
            const answerLetter = ["A", "B", "C", "D", "E"][questionIndex] || "?";
            answersString += `${i + 1}. (${answerLetter}) `; // Keep adding to the string for QR code
            answerLettersRow.push(`${i + 1}. (${answerLetter})`); // Add to the array for the row
        });

        // Push the entire row of answer letters as a single paragraph
        children.push(new Paragraph(answerLettersRow.join('   '))); // Adjust spacing as needed

        const encryptedAnswerText = encryptData(answersString);
        const qrCodeDataUrl = await QRCode.toDataURL(encryptedAnswerText);
        const qrCodeImage = await fetch(qrCodeDataUrl);
        const qrCodeBuffer = await qrCodeImage.arrayBuffer();
        children.push(
            new Paragraph({
                children: [
                    new ImageRun({
                        type: "png",
                        data: qrCodeBuffer,
                        transformation: {
                            width: 150,
                            height: 150,
                        },
                    }),
                ],
                // alignment: AlignmentType.RIGHT,
            })
        );
        children.push(new Paragraph("")); // spacing
    }

    const doc = new Document({
        sections: [
            {
                children,
                properties: {
                    type: SectionType.CONTINUOUS,
                    // Removed the column properties
                    page: {
                        margin: {
                            top: 320,
                            bottom: 250,
                        },
                    },
                }
            }
        ]
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    setAnswersUrl(url);
};



export const generateCombinedTestWord = async (variations, zagolovokText, setCombinedUrl, encryptData, uuid) => {
    const allSections = [];

    for (const [index, questions] of variations.entries()) {
        const sectionsForVariation = [];

        if (index > 0) {
            sectionsForVariation.push({
                children: [new Paragraph({})],
                properties: {
                    pageBreakBefore: true,
                },
            });
        }

        // Header Section
        const headerSection = {
            children: [
                new Paragraph({
                    children: [new TextRun({text: `${uuid}`, color: '#000000'})],
                    heading: HeadingLevel.HEADING_6,
                    alignment: AlignmentType.LEFT
                }),
                new Paragraph({
                    children: [new TextRun({ text: `${zagolovokText}`, color: '#000000', bold: true })],
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [new TextRun({ text: `Test Variant-${index + 1}`, color: '#000000', bold: true })],
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [new TextRun({
                        text: "F.I.SH: __________________________________________________",
                        color: '#000000',
                        bold: true
                    })],
                }),
                new Paragraph({
                    children: [new TextRun({
                        text: "Sinf: ____________________________________________________",
                        color: '#000000',
                        bold: true
                    })],
                }),
                new Paragraph({
                    children: [new TextRun({
                        text: "Sana: ____________________________________________________",
                        color: '#000000',
                        bold: true
                    })],
                }),
                new Paragraph({
                    children: [new TextRun({ text: "", color: '#000000', bold: true })],
                }),
            ],
            properties: {
                page: {
                    margin: {
                        top: 320,
                        bottom: 250,
                    },
                },
            },
        };
        sectionsForVariation.push(headerSection);

        // Questions Section (Two Columns)
        const questionParagraphs = [];
        for (const [i, q] of questions.entries()) {
            questionParagraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${i + 1}.(${q.status==="b"?"Bilish":""}${q.status==="q"?"Qo'llash":""}${q.status==="m"?"Mulohaza":""}) ${q.questionText}`,
                            font: "Cambria Math",
                            size: 24
                        })
                    ],
                    alignment: AlignmentType.JUSTIFIED
                })
            );

            if (q.questionImage && typeof q.questionImage === 'string' && q.questionImage.startsWith('https://')) {
                try {
                    const response = await fetch(q.questionImage);
                    const buffer = await response.arrayBuffer();
                    questionParagraphs.push(
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    type: "png",
                                    data: buffer,
                                    transformation: { width: 300, height: 200 },
                                })
                            ],
                            alignment: AlignmentType.CENTER
                        })
                    );
                } catch (error) {
                    console.error("Failed to load image:", error);
                }
            }

            const optionsLine = Object.keys(q.options).map((key, j) =>
                `${String.fromCharCode(65 + j)}) ${q.options[key].text}`
            ).join("    ");

            questionParagraphs.push(
                new Paragraph({
                    children: [new TextRun({ text: optionsLine, size: 24, font: "Cambria Math" })],
                    spacing: { after: 200 },
                    alignment: AlignmentType.JUSTIFIED
                })
            );
        }

        const questionsSection = {
            children: questionParagraphs,
            properties: {
                type: SectionType.CONTINUOUS,
                column: {
                    count: 2,
                    space: 708,
                },
                margin: {
                    top: 320,
                    bottom: 250,
                },
            }
        };
        sectionsForVariation.push(questionsSection);

        // Generate Answer Table
        const answerRows = [];
        const chunkSize = 10;
        for (let i = 0; i < questions.length; i += chunkSize) {
            const chunk = questions.slice(i, i + chunkSize);
            const questionNumbersRow = new TableRow({
                children: chunk.map((_, j) => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: `${i + j + 1}`, size: 25, color: '#000000' })]
                    })]
                }))
            });

            const answersRow = new TableRow({
                children: chunk.map(() => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: "________", size: 10, color: "#FFFFFF" })]
                    })]
                })),
                height: { value: 500, rule: "atLeast" },
            });

            answerRows.push(questionNumbersRow, answersRow);
        }

        const answerTable = new Table({
            rows: answerRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
        });

        // Generate QR Code
        let answersString = `Test Variant ${index + 1} Javoblar:\n`;
        questions.forEach((q, i) => {
            const letter = String.fromCharCode(65 + Object.keys(q.options).indexOf(q.answer));
            answersString += `${i + 1}: ${letter}\n`;
        });

        const encrypted = encryptData(answersString);
        const qrCodeDataUrl = await QRCode.toDataURL(encrypted);
        const qrResponse = await fetch(qrCodeDataUrl);
        const qrBuffer = await qrResponse.arrayBuffer();

        // Split Footer into 3 parts

        // Part 1: Javoblar header
        sectionsForVariation.push({
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Javoblar:",
                            size: 25,
                            color: "#000000",
                        }),
                    ],
                    spacing: { before: 300 },
                }),
            ],
            properties: {
                type: SectionType.CONTINUOUS,
                margin: {
                    top: 320,
                    bottom: 100,
                },
            }
        });

        // Part 2: Answer Table (flexible for page breaking)
        sectionsForVariation.push({
            children: [answerTable],
            properties: {
                type: SectionType.CONTINUOUS,
                margin: {
                    top: 100,
                    bottom: 100,
                },
            }
        });

        // Part 3: QR Code image
        sectionsForVariation.push({
            children: [
                new Paragraph({
                    children: [
                        new ImageRun({
                            type: "png",
                            data: qrBuffer,
                            transformation: { width: 150, height: 150 }
                        })
                    ],
                    alignment: AlignmentType.RIGHT
                }),
                new Paragraph({ text: "", spacing: { after: 300 } }),
            ],
            properties: {
                type: SectionType.CONTINUOUS,
                margin: {
                    top: 100,
                    bottom: 250,
                },
            }
        });

        allSections.push(...sectionsForVariation);
    }

    const doc = new Document({
        sections: allSections,
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    setCombinedUrl(url);
};

