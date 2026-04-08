import React, {useEffect, useMemo, useState} from 'react';
import "jspdf-autotable";
import {Checkbox} from "@/components/ui/checkbox.jsx";
import {Label} from "@radix-ui/react-label";
import {Button} from "@/components/ui/button.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Download, FileText, Loader2, Minus, Plus} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card.jsx";
import {useToast} from "@/hooks/use-toast.js";
import CryptoJS from 'crypto-js'; // Import crypto-js for encryption/decryption
import { v4 as uuidv4 } from 'uuid';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.jsx";
import Loader from "@/components/ui/Loader.jsx";
import {useQuery} from "@tanstack/react-query";
import {generateAnswersWord, generateTestWordDocs} from "@/hooks/test-word-generation.js";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.jsx";

const secretKey = `${import.meta.env.VITE_SECRET_KEY}`;

const encryptData = (data) => {
    return CryptoJS.AES.encrypt(data, secretKey).toString();
};

const decryptData = (encryptedData) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
};

function TestToPdf() {
    const [selectedSubtopics, setSelectedSubtopics] = useState([]);
    const [openTopics, setOpenTopics] = useState({})
    const [btnLoader, setBtnLoader] = useState(false)
    const [numQuestions, setNumQuestions] = useState(5);
    const [numVariations, setNumVariations] = useState(3);
    const [pdfUrls, setPdfUrls] = useState([]);
    const [answersUrl, setAnswersUrl] = useState(null);
    const [combinedUrl, setCombinedUrl] = useState(null);
    const [bValue, setBValue] = useState(0)
    const [qValue, setQValue] = useState(0)
    const [mValue, setMValue] = useState(0)
    const [zagolovokText, setZagolovokText] = useState("")
    const {toast} = useToast()

    const {isPending, error, data: database} = useQuery({
        queryKey: ['test/getfulltestdb'],
        queryFn: () =>
            fetch(`${import.meta.env.VITE_SERVER}/test/getfulltestdb`)
                .then((res) => res.json()),
    })
    const handleCheckboxChange = (value) => {
        setSelectedSubtopics((prevCheckedValues) => {

            if (prevCheckedValues.includes(value)) {
                return prevCheckedValues.filter((val) => val !== value);
            }
            return [...prevCheckedValues, value];
        });
    };

    const shuffleOptions = (options) => {
        const entries = Object.entries(options);
        const shuffledEntries = entries.sort(() => Math.random() - 0.5);
        return Object.fromEntries(shuffledEntries);
    };

    const shuffleOptions2 = (options) => {
        const entries = Object.entries(options);
        const shuffledEntries = entries.sort(() => Math.random() - 0.5);
        return shuffledEntries.map(([key, value]) => ({ [key]: value }));
    };

    const handleGenerateWordDocs = async () => {
        setBtnLoader(true)
        const uuid = uuidv4()
        const {generateTestWordDocs, generateAnswersWord, generateCombinedTestWord} = await import("../../hooks/test-word-generation.js")
        let selectedQuestions = [];

        selectedSubtopics.forEach((subtopic) => {
            const subtopicData = database.flatMap(topic => topic.subtopics).find(s => s.subtopicname === subtopic);
            if (subtopicData) {
                selectedQuestions.push(...subtopicData.questions);
            }
        });
        // console.log(selectedQuestions)

        if (selectedQuestions.length < numQuestions) {
            toast({
                title: "Tanlangan mavzulardagi savollar yetmaydi.",
                variant: "destructive",
            });
            setBtnLoader(false)
            return;
        }

        let testVariations = [];
        for (let i = 0; i < numVariations; i++) {
            let shuffledQuestions = [...selectedQuestions]
                .sort(() => 0.5 - Math.random())
                .slice(0, numQuestions)
                .map(q => ({...q, options: shuffleOptions(q.options)}));

            testVariations.push(shuffledQuestions);
        }
        generateTestWordDocs(testVariations, zagolovokText, setPdfUrls, setBtnLoader, setZagolovokText, encryptData, uuid);
        generateAnswersWord(testVariations, setAnswersUrl, encryptData, uuid);
        generateCombinedTestWord(testVariations, zagolovokText, setCombinedUrl, encryptData, uuid);
    };


    const handleGenerateStandart = async (numberOfQuestions) => {
        setBtnLoader(true);
        const uuid = uuidv4()
        const { generateTestWordDocs, generateAnswersWord, generateCombinedTestWord } = await import("../../hooks/test-word-generation.js");
        let selectedQuestions = [];

        // Iterate over the selected subtopics and fetch corresponding questions
        selectedSubtopics.forEach((subtopic) => {
            const subtopicData = database.flatMap(topic => topic.subtopics).find(s => s.subtopicname === subtopic);
            if (subtopicData) {
                selectedQuestions.push(...subtopicData.questions);
            }
        });

        // Check if there are enough questions
        if (selectedQuestions.length < numberOfQuestions) {
            toast({
                title: "Tanlangan mavzulardagi savollar yetmaydi.",
                variant: "destructive",
            });
            setBtnLoader(false);
            return;
        }

        let testVariations = [];

        // Generate variations
        for (let i = 0; i < numVariations; i++) {
            let questionsForVariation = [];

            // Filter questions by status
            const questionsByStatus = {
                b: selectedQuestions.filter(q => q.status === "b"),
                q: selectedQuestions.filter(q => q.status === "q"),
                m: selectedQuestions.filter(q => q.status === "m"),
            };

            // Function to fill missing questions
            const fillMissingQuestions = (currentStatus, requiredCount, alternativeStatus) => {
                let selectedQuestions = shuffleOptions2(questionsByStatus[currentStatus]).slice(0, requiredCount);
                const missingCount = requiredCount - selectedQuestions.length;

                if (missingCount > 0) {
                    // If there are not enough questions of the current status, fill with questions from the alternative status
                    const alternativeQuestions = shuffleOptions2(questionsByStatus[alternativeStatus]).slice(0, missingCount);
                    selectedQuestions = [...selectedQuestions, ...alternativeQuestions];
                }

                return selectedQuestions;
            };

            // Select 3 questions with status "b"
            if (numberOfQuestions === 15) {
                // Select questions
                let selectedBQuestions = fillMissingQuestions("b", 3, "q");  // Fill with "q" if not enough "b" questions
                let selectedQQuestions = fillMissingQuestions("q", 11, "q"); // Same for "q" if not enough
                let selectedMQuestion = fillMissingQuestions("m", 1, "q");   // Same for "m" if not enough

                questionsForVariation = [...selectedBQuestions, ...selectedQQuestions, ...selectedMQuestion];
            }

            if (numberOfQuestions === 30) {
                // Select questions
                let selectedBQuestions = fillMissingQuestions("b", 6, "q");
                let selectedQQuestions = fillMissingQuestions("q", 22, "q");
                let selectedMQuestion = fillMissingQuestions("m", 2, "q");

                questionsForVariation = [...selectedBQuestions, ...selectedQQuestions, ...selectedMQuestion];
            }

            testVariations.push(questionsForVariation);
        }

        testVariations.forEach((array, index) => {
            // Use map to modify the array and store the result
            testVariations[index] = array.map(item => {
                const key = Object.keys(item)[0];  // Get the first key
                return {...item[key]};  // Extract and merge the inner object directly
            });
        });

        generateTestWordDocs(testVariations, zagolovokText, setPdfUrls, setBtnLoader, setZagolovokText, encryptData, uuid);
        generateAnswersWord(testVariations, setAnswersUrl, encryptData, uuid);
        generateCombinedTestWord(testVariations, zagolovokText, setCombinedUrl, encryptData, uuid);
        setBtnLoader(false);
    };

    const handleGenerateStandartCustom = async (numberOfQuestions, b,q,m) => {
        setBtnLoader(true);
        const uuid = uuidv4()
        const { generateTestWordDocs, generateAnswersWord, generateCombinedTestWord } = await import("../../hooks/test-word-generation.js");
        let selectedQuestions = [];

        // Iterate over the selected subtopics and fetch corresponding questions
        selectedSubtopics.forEach((subtopic) => {
            const subtopicData = database.flatMap(topic => topic.subtopics).find(s => s.subtopicname === subtopic);
            if (subtopicData) {
                selectedQuestions.push(...subtopicData.questions);
            }
        });

        // Check if there are enough questions
        if (selectedQuestions.length < numberOfQuestions) {
            toast({
                title: "Tanlangan mavzulardagi savollar yetmaydi.",
                variant: "destructive",
            });
            setBtnLoader(false);
            return;
        }

        let testVariations = [];

        // Generate variations
        for (let i = 0; i < numVariations; i++) {
            let questionsForVariation = [];

            // Filter questions by status
            const questionsByStatus = {
                b: selectedQuestions.filter(q => q.status === "b"),
                q: selectedQuestions.filter(q => q.status === "q"),
                m: selectedQuestions.filter(q => q.status === "m"),
            };

            if (questionsByStatus.b.length < bValue) {
                toast({
                    title: "Bilish savollari yetarli emas",
                    variant: "destructive",
                });
                setBtnLoader(false);
                return;
            }

            if (questionsByStatus.m.length < mValue) {
                toast({
                    title: "Mulohaza savollari yetarli emas",
                    variant: "destructive",
                });
                setBtnLoader(false);
                return;
            }

            if (questionsByStatus.q.length < qValue) { // The remaining will be "q"
                toast({
                    title: "Qo'llash savollari yetarli emas",
                    variant: "destructive",
                });
                setBtnLoader(false);
                return;
            }

                // Select questions
            let selectedBQuestions = shuffleOptions2(questionsByStatus.b).slice(0, bValue);
            let selectedQQuestions = shuffleOptions2(questionsByStatus.q).slice(0, qValue);
            let selectedMQuestion = shuffleOptions2(questionsByStatus.m).slice(0, mValue);

            questionsForVariation = [...selectedBQuestions, ...selectedQQuestions, ...selectedMQuestion];


            testVariations.push(questionsForVariation);
        }

        testVariations.forEach((array, index) => {
            // Use map to modify the array and store the result
            testVariations[index] = array.map(item => {
                const key = Object.keys(item)[0];  // Get the first key
                return {...item[key]};  // Extract and merge the inner object directly
            });
        });

        generateTestWordDocs(testVariations, zagolovokText, setPdfUrls, setBtnLoader, setZagolovokText, encryptData, uuid);
        generateAnswersWord(testVariations, setAnswersUrl, encryptData, uuid);
        generateCombinedTestWord(testVariations, zagolovokText, setCombinedUrl, encryptData, uuid);
        setBtnLoader(false);
    };

    if (isPending) {
        return (
            <Loader variant={"big"}/>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Test - Word</h1>
                <Card className="bg-white shadow-lg rounded-lg overflow-hidden w-full">
                    <CardContent className="p-6">
                        <form className="space-y-6 w-full">
                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">Mavzular</Label>
                                <div className="w-full">
                                    <Accordion type="multiple" className="space-y-4 w-full">
                                        {database.map((topic) => (
                                            <AccordionItem key={topic._id} value={topic._id}
                                                           className="border rounded-lg overflow-hidden">
                                                <AccordionTrigger
                                                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 hover:no-underline">
                                                    {topic.maintopicname}
                                                </AccordionTrigger>
                                                <AccordionContent className="p-4 bg-white">
                                                    {topic.subtopics.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {topic.subtopics.map((sub) => (
                                                                <div key={sub._id} className="flex items-center">
                                                                    <Checkbox
                                                                        id={sub.subtopicname}
                                                                        checked={selectedSubtopics.includes(sub.subtopicname)}
                                                                        onCheckedChange={() => handleCheckboxChange(sub.subtopicname)}
                                                                    />
                                                                    <Label
                                                                        htmlFor={sub.subtopicname}
                                                                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                    >
                                                                        {sub.subtopicname}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">Mavzular topilmadi</p>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            </div>
                            <Tabs defaultValue={"custom"} className="w-full mb-4">
                                <TabsList  className="grid grid-cols-4">
                                    <TabsTrigger value={"custom"}>Aralash</TabsTrigger>
                                    <TabsTrigger value={"standart15"}>Standart</TabsTrigger>
                                    <TabsTrigger value={"standart30"}>Standart 2</TabsTrigger>
                                    <TabsTrigger value={"standartcustom"}>Standart(Maxsus)</TabsTrigger>
                                </TabsList>
                                <TabsContent value={"custom"} className={`space-y-6`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="numQuestions"
                                                   className="block text-sm font-medium text-gray-700">
                                                Har bir testdagi savollar soni
                                            </Label>
                                            <div className="flex items-center mt-1">
                                                <Button
                                                    type="button"
                                                    onClick={() => setNumQuestions(Math.max(1, numQuestions - 1))}
                                                    className="rounded-r-none"
                                                    variant="outline"
                                                >
                                                    <Minus className="h-4 w-4"/>
                                                </Button>
                                                <Input
                                                    type="number"
                                                    id="numQuestions"
                                                    value={numQuestions}
                                                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                                    className="rounded-none text-center"
                                                    min="1"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => setNumQuestions(numQuestions + 1)}
                                                    className="rounded-l-none"
                                                    variant="outline"
                                                >
                                                    <Plus className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="numTests" className="block text-sm font-medium text-gray-700">
                                                Variantlar soni
                                            </Label>
                                            <div className="flex items-center mt-1">
                                                <Button
                                                    type="button"
                                                    onClick={() => setNumVariations(Math.max(1, numVariations - 1))}
                                                    className="rounded-r-none"
                                                    variant="outline"
                                                >
                                                    <Minus className="h-4 w-4"/>
                                                </Button>
                                                <Input
                                                    type="number"
                                                    id="numTests"
                                                    value={numVariations}
                                                    onChange={(e) => setNumVariations(parseInt(e.target.value))}
                                                    className="rounded-none text-center"
                                                    min="1"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => setNumVariations(numVariations + 1)}
                                                    className="rounded-l-none"
                                                    variant="outline"
                                                >
                                                    <Plus className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`space-y-1`}>
                                        <Label htmlFor={`zagolovok`} className={`block text-sm font-medium text-gray-700`}>
                                            Sarlavha Uchun (Ixtiyoriy)
                                        </Label>
                                        <Input
                                            type={"text"}
                                            id={"zagolovok"}
                                            value={zagolovokText}
                                            placeholder={`Sarlavhani shu yerga kiriting`}
                                            onChange={e => setZagolovokText(e.target.value)}
                                            className={`rounded`}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleGenerateWordDocs}
                                        className="w-full"
                                        disabled={selectedSubtopics.length === 0 || btnLoader}
                                    >
                                        Test Yaratish (Word)

                                        {btnLoader && <Loader variant={`small`}/>}
                                    </Button>
                                </TabsContent>
                                <TabsContent value={"standart15"} className={`space-y-6 `}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                                        <div className="space-y-2">
                                            <Label className="block text-sm font-medium text-gray-700">Har bir testdagi savollar soni</Label>
                                            <div className="px-2 py-1.5 bg-gray-50 rounded border text-center">15</div>
                                        </div>
                                        <div>
                                            <Label htmlFor="numTests" className="block text-sm font-medium text-gray-700">
                                                Variantlar Soni
                                            </Label>
                                            <div className="flex items-center mt-1 ">
                                                <Button
                                                    type="button"
                                                    onClick={() => setNumVariations(Math.max(1, numVariations - 1))}
                                                    className="rounded-r-none"
                                                    variant="outline"
                                                >
                                                    <Minus className="h-4 w-4"/>
                                                </Button>
                                                <Input
                                                    type="number"
                                                    id="numTests"
                                                    value={numVariations}
                                                    onChange={(e) => setNumVariations(parseInt(e.target.value))}
                                                    className="rounded-none text-center"
                                                    min="1"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => setNumVariations(numVariations + 1)}
                                                    className="rounded-l-none"
                                                    variant="outline"
                                                >
                                                    <Plus className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`space-y-1`}>
                                        <Label htmlFor={`zagolovok`} className={`block text-sm font-medium text-gray-700`}>
                                            Sarlavha Uchun (Ixtiyoriy)
                                        </Label>
                                        <Input
                                            type={"text"}
                                            id={"zagolovok"}
                                            value={zagolovokText}
                                            placeholder={`Sarlavhani shu yerga kiriting`}
                                            onChange={e => setZagolovokText(e.target.value)}
                                            className={`rounded`}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={()=>handleGenerateStandart(15)}
                                        className="w-full"
                                        disabled={selectedSubtopics.length === 0 || btnLoader}
                                    >
                                        Test Yaratish (Word)

                                        {btnLoader && <Loader variant={`small`}/>}
                                    </Button>
                                </TabsContent>
                                <TabsContent value={"standart30"} className={`space-y-6 `}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                                        <div className="space-y-2">
                                            <Label className="block text-sm font-medium text-gray-700">Har bir testdagi savollar soni</Label>
                                            <div className="px-2 py-1.5 bg-gray-50 rounded border text-center">30</div>
                                        </div>
                                        <div>
                                            <Label htmlFor="numTests" className="block text-sm font-medium text-gray-700">
                                                Variantlar Soni
                                            </Label>
                                            <div className="flex items-center mt-1 ">
                                                <Button
                                                    type="button"
                                                    onClick={() => setNumVariations(Math.max(1, numVariations - 1))}
                                                    className="rounded-r-none"
                                                    variant="outline"
                                                >
                                                    <Minus className="h-4 w-4"/>
                                                </Button>
                                                <Input
                                                    type="number"
                                                    id="numTests"
                                                    value={numVariations}
                                                    onChange={(e) => setNumVariations(parseInt(e.target.value))}
                                                    className="rounded-none text-center"
                                                    min="1"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => setNumVariations(numVariations + 1)}
                                                    className="rounded-l-none"
                                                    variant="outline"
                                                >
                                                    <Plus className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`space-y-1`}>
                                        <Label htmlFor={`zagolovok`} className={`block text-sm font-medium text-gray-700`}>
                                            Sarlavha Uchun (Ixtiyoriy)
                                        </Label>
                                        <Input
                                            type={"text"}
                                            id={"zagolovok"}
                                            value={zagolovokText}
                                            placeholder={`Sarlavhani shu yerga kiriting`}
                                            onChange={e => setZagolovokText(e.target.value)}
                                            className={`rounded`}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={()=>handleGenerateStandart(30)}
                                        className="w-full"
                                        disabled={selectedSubtopics.length === 0 || btnLoader}
                                    >
                                        Test Yaratish (Word)

                                        {btnLoader && <Loader variant={`small`}/>}
                                    </Button>
                                </TabsContent>
                                <TabsContent value={"standartcustom"} className={`space-y-6 `}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Har bir testdagi savollar soni</label>
                                            <div className="grid grid-cols-3 gap-1">
                                                <div className="space-y-1">
                                                    <div className="border p-2 text-center font-medium bg-gray-50">Bilish</div>
                                                    <Input value={bValue} onChange={(e) => setBValue(e.target.value)} type={"number"}  className="text-center" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="border p-2 text-center font-medium bg-gray-50">Qo'llash</div>
                                                    <Input value={qValue} onChange={(e) => setQValue(e.target.value)} type={"number"} className="text-center" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="border p-2 text-center font-medium bg-gray-50">Mulohaza</div>
                                                    <Input value={mValue} onChange={(e) => setMValue(e.target.value)} type={"number"} className="text-center" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`numtests3`} className="block text-sm font-medium text-gray-700">Variantlar Soni</Label>
                                            <div className="flex items-center ">
                                                <Button
                                                    type="button"
                                                    onClick={() => setNumVariations(Math.max(1, numVariations - 1))}
                                                    className="rounded-r-none"
                                                    variant="outline"
                                                >
                                                    <Minus className="h-4 w-4"/>
                                                </Button>
                                                <Input
                                                    type="number"
                                                    id="numTests3"
                                                    value={numVariations}
                                                    onChange={(e) => setNumVariations(parseInt(e.target.value))}
                                                    className="rounded-none text-center"
                                                    min="1"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => setNumVariations(numVariations + 1)}
                                                    className="rounded-l-none"
                                                    variant="outline"
                                                >
                                                    <Plus className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`space-y-1`}>
                                        <Label htmlFor={`zagolovok`} className={`block text-sm font-medium text-gray-700`}>
                                            Sarlavha Uchun (Ixtiyoriy)
                                        </Label>
                                        <Input
                                            type={"text"}
                                            id={"zagolovok"}
                                            value={zagolovokText}
                                            placeholder={`Sarlavhani shu yerga kiriting`}
                                            onChange={e => setZagolovokText(e.target.value)}
                                            className={`rounded`}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={()=>handleGenerateStandartCustom((+bValue+ +qValue+ +mValue), +bValue, +qValue, +mValue)}
                                        className="w-full"
                                        disabled={selectedSubtopics.length === 0 || btnLoader}
                                    >
                                        Test Yaratish (Word)

                                        {btnLoader && <Loader variant={`small`}/>}
                                    </Button>
                                </TabsContent>
                            </Tabs>


                        </form>
                    </CardContent>
                </Card>

                {pdfUrls.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Yaratilgan Word lar</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {combinedUrl && (
                                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-8 w-8 text-gray-700 flex-shrink-0"/>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">Barcha Testlar
                                                </div>
                                                <p className="text-xs text-gray-500">Word Document</p>
                                            </div>
                                            <a href={combinedUrl}
                                               download="Barcha_Testlar.docx"
                                               target="_blank"
                                               rel="noopener noreferrer">
                                                <Button variant="ghost" className="flex-shrink-0 p-1">
                                                    <Download className="h-4 w-4"/>
                                                </Button>
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            {pdfUrls.map((docx, index) => (

                                <Card key={index}
                                    className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-8 w-8 text-gray-700 flex-shrink-0"/>
                                            <div className="flex-1 min-w-0">
                                                <div
                                                    className="text-sm font-medium text-gray-900 truncate">{docx.name}</div>
                                                <p className="text-xs text-gray-500">Word Document</p>
                                            </div>
                                            <a
                                                key={index}
                                                href={docx.url}
                                                download={docx.name}
                                                className="block"
                                            >
                                                <Button variant="ghost" className="flex-shrink-0 p-1">
                                                    <Download className="h-4 w-4 text-gray-700"/>
                                                </Button>
                                            </a>

                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {answersUrl && (
                                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-8 w-8 text-gray-700 flex-shrink-0"/>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">Test
                                                    Javoblari
                                                </div>
                                                <p className="text-xs text-gray-500">Word Document</p>
                                            </div>
                                            <a href={answersUrl} download="Test_Javoblari.docx" target="_blank"
                                               rel="noopener noreferrer">
                                                <Button variant="ghost" className="flex-shrink-0 p-1">
                                                    <Download className="h-4 w-4"/>
                                                </Button>
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TestToPdf;