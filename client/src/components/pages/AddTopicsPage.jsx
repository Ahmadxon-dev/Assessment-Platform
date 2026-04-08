import React, {useEffect} from 'react';
import {useState} from "react"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {Plus, Edit, Trash2, Loader2, X, Image} from "lucide-react"
import {useToast} from "@/hooks/use-toast.js";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.jsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.jsx";
import {Label} from "@/components/ui/label.jsx";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import Loader from "@/components/ui/Loader.jsx";
import {useQuery} from "@tanstack/react-query";


function AddTopicsPage() {
    const [database, setDatabase] = useState([])
    // const {toast} = useToast()
    const user = useSelector(state => state.user)
    const navigate = useNavigate()
    if (user.role === "user") {
        navigate("/")
    }
    const {isPending, error, data} = useQuery({
        queryKey: ['test/getfulltestdb'], queryFn: () => fetch(`${import.meta.env.VITE_SERVER}/test/getfulltestdb`)
            .then((res) => res.json())

            })

    useEffect(() => {
        if (data) {
            setDatabase(data);
        }
    }, [data]);
    if (isPending) {
        return (<div className={`grid items-center justify-center m-auto`}>
            <Loader2 className="mr-2 h-20 w-20 animate-spin"/>
        </div>);
    }
    return (<div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Bo'limlar, Mavzular va savollar qo'shish</h1>
        <Tabs defaultValue="main-topics">
            <TabsList>
                <TabsTrigger value="main-topics">Bo'limlar</TabsTrigger>
                <TabsTrigger value="subtopics">Mavzular</TabsTrigger>
                <TabsTrigger value="questions">Savollar</TabsTrigger>
            </TabsList>
            <TabsContent value="main-topics">
                <MainTopicsTab database={database} setDatabase={setDatabase}/>
            </TabsContent>
            <TabsContent value="subtopics">
                <SubtopicsTab database={database} setDatabase={setDatabase}/>
            </TabsContent>
            <TabsContent value="questions">
                <QuestionsTab database={database} setDatabase={setDatabase}/>
            </TabsContent>
        </Tabs>
    </div>);
}


function MainTopicsTab({database, setDatabase}) {
    const [newMainTopic, setNewMainTopic] = useState("")
    const [loadingforMainTopicAdd, setLoadingForMainTopicAdd] = useState(false)
    const [loadingforMainTopicDelete, setLoadingForMainTopicDelete] = useState({})
    const [editMainTopic, setEditMainTopic] = useState("")
    const [isEditForDialogMain, setIsEditForDialogMain] = useState(false)
    const [isLoadingForEdit, setIsLoadingForEdit] = useState(false)
    const [trash, setTrash] = useState(false)
    const {toast} = useToast()

    const createNewMaintopic = async () => {
        if (newMainTopic === "") {
            toast({
                title: "Maydonni to'ldiring", variant: "destructive", duration: 4000,
            })
            return
        }
        setLoadingForMainTopicAdd(true)
        await fetch(`${import.meta.env.VITE_SERVER}/test/topics/add`, {
            method: "put", headers: {
                "Content-Type": "application/json",
            }, body: JSON.stringify({
                newMainTopic
            })
        })
            .then(res => res.json())
            .then(data => {
                setDatabase(data.newData)
                toast({
                    title: data.msg, variant: "success", duration: 4000,
                })
                setNewMainTopic("")
                setLoadingForMainTopicAdd(false)
            })
    }

    const deleteMainTopic = async (mainTopicId) => {
        setLoadingForMainTopicDelete((prev) => ({...prev, [mainTopicId]: true}));
        await fetch(`${import.meta.env.VITE_SERVER}/test/topics/delete`, {
            method: "delete", headers: {
                "Content-Type": "application/json",
            }, body: JSON.stringify({
                mainTopicId
            })
        })
            .then(res => res.json())
            .then(data => {
                setDatabase(data.newData)
                toast({
                    title: data.msg, variant: "success", duration: 4000,
                })
                setLoadingForMainTopicDelete((prev) => ({...prev, [mainTopicId]: false}));
            })
    }

    const updateMainTopic = async (mainTopicId) => {
        if (editMainTopic === "") {
            toast({
                title: "Maydonni to'ldiring", variant: "destructive", duration: 4000,
            })

            return
        }
        setIsLoadingForEdit(true)
        await fetch(`${import.meta.env.VITE_SERVER}/test/topics/edit`, {
            method: "put", headers: {
                "Content-Type": "application/json",
            }, body: JSON.stringify({
                mainTopicId, newMainTopicName: editMainTopic
            })
        })
            .then(res => res.json())
            .then(data => {
                setDatabase(data.newData)
                toast({
                    title: data.msg, variant: "success", duration: 4000,
                })
                setEditMainTopic("")
                setIsEditForDialogMain(false)
                setIsLoadingForEdit(false)

            })
    }

    return (<div>
        <h2 className="text-2xl font-semibold mb-4">Bo'limlar</h2>
        <div className="flex gap-2 mb-4">
            <Input placeholder="Yangi bo'lim" value={newMainTopic}
                   onChange={(e) => setNewMainTopic(e.target.value)}/>
            <Button onClick={createNewMaintopic} disabled={loadingforMainTopicAdd}>
                {loadingforMainTopicAdd ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> :
                    <Plus className="mr-2 h-4 w-4"/>}
                Qo'shish
            </Button>
        </div>

        <ul className="space-y-2">
            {database.map((topic, index) => (
                <li key={topic._id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    {topic.maintopicname}
                    <div>

                        <Dialog open={isEditForDialogMain} onOpenChange={setIsEditForDialogMain}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon"
                                    onClick={()=>{
                                        setIsEditForDialogMain(true)
                                    }}
                                >
                                    <Edit className="h-4 w-4"/>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Bo'lim nomini o'zgartirish</DialogTitle>
                                </DialogHeader>
                                <Input placeholder="Mavzu nomi" defaultValue={topic.maintopicname}
                                       onChange={e => setEditMainTopic(e.target.value)}/>
                                <DialogFooter>
                                        <Button
                                            type="submit"
                                            onClick={() => updateMainTopic(topic._id)}
                                        >
                                            {isLoadingForEdit && <Loader variant={"small"} />}
                                            O'zgartirish
                                        </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="icon" onClick={() => deleteMainTopic(topic._id)}>
                            {loadingforMainTopicDelete[topic._id] ?
                                <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                        </Button>
                    </div>
                </li>))}
        </ul>
    </div>)
}

function SubtopicsTab({database, setDatabase}) {
    const [newSubTopic, setNewSubTopic] = useState("")
    const [loadingforSubtopicsAdd, setLoadingforSubtopicsAdd] = useState(false)
    const [loadingforSubtopicsDelete, setLoadingforSubtopicsDelete] = useState({})
    const [loadingforSubtopicsEdit, setLoadingforSubtopicsEdit] = useState({})
    const [isAddForDialog, setIsAddForDialog] = useState(false)
    const [isEditForDialog, setIsEditForDialog] = useState(false)
    const [editSubTopic, setEditSubTopic] = useState("")
    const [activeSubtopic, setActiveSubtopic] = useState(null);

    const {toast} = useToast()
    const addSubtopic = async (mainTopicId) => {
        setIsAddForDialog(true)
        if (newSubTopic === "") {
            toast({
                title: "Maydonni to'ldiring", variant: "destructive", duration: 4000,
            })
            return
        }
        setLoadingforSubtopicsAdd(true)
        await fetch(`${import.meta.env.VITE_SERVER}/test/subtopics/add`, {
            method: "post", headers: {
                "Content-Type": "application/json",
            }, body: JSON.stringify({
                newSubTopic, mainTopicId
            })
        })
            .then(res => res.json())
            .then(data => {
                setDatabase( data.newData)
                toast({
                    title: data.msg, variant: "success", duration: 4000,
                })
                setNewSubTopic("")
                setLoadingforSubtopicsAdd(false)
                setIsAddForDialog(false)
            })
    }

    const deleteSubtopic = async (mainTopicId, subTopicName) => {

        setLoadingforSubtopicsDelete((prev) => ({...prev, [subTopicName]: true}));
        await fetch(`${import.meta.env.VITE_SERVER}/test/subtopics/delete`, {
            method: "delete", headers: {
                "Content-Type": "application/json",
            }, body: JSON.stringify({
                mainTopicId, subTopicName
            })
        })
            .then(res => res.json())
            .then(data => {
                setDatabase(data.newData)
                toast({
                    title: data.msg, variant: "success", duration: 4000,
                })
                setLoadingforSubtopicsDelete((prev) => ({...prev, [subTopicName]: false}));
            })
    }

    const updateSubTopic = async (mainTopicId, oldSubTopicName) => {
        setIsEditForDialog(true)
        if (editSubTopic === "") {
            toast({
                title: "Maydonni to'ldiring", variant: "destructive", duration: 4000,
            })
            return
        }
        setLoadingforSubtopicsEdit((prev) => ({...prev, [oldSubTopicName]: true}));
        await fetch(`${import.meta.env.VITE_SERVER}/test/subtopics/edit`, {
            method: "put", headers: {
                "Content-Type": "application/json",
            }, body: JSON.stringify({
                mainTopicId,
                newSubTopicName: editSubTopic,
                oldSubTopicName
            })
        })
            .then(res => res.json())
            .then(data => {
                setDatabase(data.newData)
                toast({
                    title: data.msg, variant: "success", duration: 4000,
                })
                setEditSubTopic("")
                setLoadingforSubtopicsEdit((prev) => ({...prev, [oldSubTopicName]: false}));
                setIsEditForDialog(false)
            })
    }
    return (<div>
        <h2 className="text-2xl font-semibold mb-4">Mavzular</h2>
        <Accordion type="single" collapsible className="w-full">
            {database.map((topic, topicIndex) => (<AccordionItem key={topicIndex} value={`item-${topicIndex}`}>
                <AccordionTrigger>{topic.maintopicname}</AccordionTrigger>
                <AccordionContent>
                    <div className="mb-2 flex justify-end items-start">
                        <Dialog open={isAddForDialog} onOpenChange={setIsAddForDialog}>
                            <DialogTrigger asChild>
                                <Button variant="default" className={`flex `}>
                                    <Plus className="mr-2 h-4 w-4"/> Mavzu Qo'shish
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Yangi Mavzu Qo'shish</DialogTitle>
                                </DialogHeader>
                                <Input placeholder="Subtopic name" id={`new-subtopic-${topicIndex}`}
                                       value={newSubTopic} onChange={e => setNewSubTopic(e.target.value)}/>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        onClick={() => addSubtopic(topic._id)}
                                        disabled={loadingforSubtopicsAdd}
                                    >
                                        {loadingforSubtopicsAdd &&
                                            <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}
                                        Qo'shish
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <ul className="space-y-2">
                        {topic.subtopics.map((subtopic, subtopicIndex) => (<li key={subtopicIndex}
                                                                               className="flex items-center justify-between p-2 bg-gray-100 rounded">
                            {subtopic.subtopicname}
                            <div>

                                <Dialog open={isEditForDialog} onOpenChange={setIsEditForDialog}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Mavzu nomini o'zgartirish</DialogTitle>
                                            <DialogDescription></DialogDescription>
                                        </DialogHeader>
                                        <Input placeholder="Mavzu nomi"
                                               value={editSubTopic}
                                               onChange={e => setEditSubTopic(e.target.value)}
                                        />
                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                onClick={() => updateSubTopic(topic._id, activeSubtopic?.subtopicname)}
                                                disabled={loadingforSubtopicsEdit[activeSubtopic?.subtopicname]}
                                            >
                                                {loadingforSubtopicsEdit[activeSubtopic?.subtopicname] &&
                                                    <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}
                                                O'zgartirish

                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon"
                                        onClick={()=>{
                                            setEditSubTopic(subtopic.subtopicname)
                                            setActiveSubtopic(subtopic);
                                            setIsEditForDialog(true)
                                        }}
                                >
                                    <Edit className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon"
                                        onClick={() => deleteSubtopic(topic._id, subtopic.subtopicname)}>
                                    {loadingforSubtopicsDelete[subtopic.subtopicname] ?
                                        <Loader2 className="ml-2 h-4 w-4 animate-spin"/> :
                                        <Trash2 className="h-4 w-4"/>}
                                </Button>
                            </div>
                        </li>))}
                    </ul>
                </AccordionContent>
            </AccordionItem>))}
        </Accordion>
    </div>)
}

function MathSymbolsToolbar({onInsertSymbol}) {
    const symbols = {
        Asosiy: [{symbol: "π", label: "Pi"}, {symbol: "±", label: "Plus-minus"}, {
            symbol: "•",
            label: "Multiply"
        }, {symbol: "×", label: "Multiply2"}, {symbol: "÷", label: "Divide"}, {
            symbol: "=",
            label: "Equals"
        }, {symbol: "≠", label: "Not equals"}, {symbol: "≈", label: "Approximately"}, {
            symbol: "∞",
            label: "Infinity"
        },],
        Funksiyalar: [{symbol: "sin()", label: "Sine"}, {symbol: "cos()", label: "Cosine"}, {
            symbol: "tg()",
            label: "Tangent"
        }, {symbol: "log()", label: "Logarithm"}, {symbol: "ln()", label: "Natural log"}, {
            symbol: "√()",
            label: "Square root"
        }, {symbol: "∛()", label: "Cube root"},],
        Operatorlar: [{symbol: "^", label: "Power"}, {symbol: "∑", label: "Sum"}, {
            symbol: "∏",
            label: "Product"
        }, {symbol: "∫", label: "Integral"}, {symbol: "∂", label: "Partial"}, {
            symbol: "∇",
            label: "Nabla"
        }, {symbol: "Δ", label: "Delta"},],
        Taqqoslash: [{symbol: "<", label: "Less than"}, {symbol: ">", label: "Greater than"}, {
            symbol: "≤",
            label: "Less or equal"
        }, {symbol: "≥", label: "Greater or equal"}, {symbol: "∈", label: "Element of"}, {
            symbol: "⊂",
            label: "Subset"
        }, {symbol: "⊆", label: "Subset or equal"},],
        Kasrlar: [{symbol: "½", label: "1/2"}, {symbol: "⅓", label: "1/3"}, {symbol: "¼", label: "1/4"}, {
            symbol: "⅕",
            label: "1/5"
        }, {symbol: "⅙", label: "1/6"}, {symbol: "⅛", label: "1/8"}, {symbol: "a/b", label: "Ixtiyoriy kasr"},],
        Superscripts: [{symbol: "⁰", label: "⁰"}, {symbol: "¹", label: "¹"}, {symbol: "²", label: "²"}, {
            symbol: "³",
            label: "³"
        }, {symbol: "⁴", label: "⁴"}, {symbol: "⁵", label: "⁵"}, {symbol: "⁶", label: "⁶"}, {
            symbol: "⁷",
            label: "⁷"
        }, {symbol: "⁸", label: "⁸"}, {symbol: "⁹", label: "⁹"}, {symbol: "⁺", label: "plus"}, {
            symbol: "⁻",
            label: "minus"
        }, {symbol: "⁄", label: "slash"}, {symbol: "⁽", label: "left parenthesis"}, {
            symbol: "⁾",
            label: "right parenthesis"
        }, {symbol: "ᵃ", label: "a"}, {symbol: "ᵇ", label: "b"}, {symbol: "ᶜ", label: "c"}, {
            symbol: "ᵈ",
            label: "d"
        }, {symbol: "ᵉ", label: "e"}, {symbol: "ᶠ", label: "f"}, {symbol: "ᵍ", label: "g"}, {
            symbol: "ʰ",
            label: "h"
        }, {symbol: "ⁱ", label: "i"}, {symbol: "ʲ", label: "j"}, {symbol: "ᵏ", label: "k"}, {
            symbol: "ˡ",
            label: "l"
        }, {symbol: "ᵐ", label: "m"}, {symbol: "ⁿ", label: "n"}, {symbol: "ᵒ", label: "o"}, {
            symbol: "ᵖ",
            label: "p"
        }, {symbol: "ʳ", label: "r"}, {symbol: "ˢ", label: "s"}, {symbol: "ᵗ", label: "t"}, {
            symbol: "ᵘ",
            label: "u"
        }, {symbol: "ᵛ", label: "v"}, {symbol: "ʷ", label: "w"}, {symbol: "ˣ", label: "x"}, {
            symbol: "ʸ",
            label: "y"
        }, {symbol: "ᶻ", label: "z"}, {symbol: "ᴬ", label: "A"}, {symbol: "ᴮ", label: "B"}, {
            symbol: "ᴰ",
            label: "D"
        }, {symbol: "ᴱ", label: "E"}, {symbol: "ᴳ", label: "G"}, {symbol: "ᴴ", label: "H"}, {
            symbol: "ᴵ",
            label: "I"
        }, {symbol: "ᴶ", label: "J"}, {symbol: "ᴷ", label: "K"}, {symbol: "ᴸ", label: "L"}, {
            symbol: "ᴹ",
            label: "M"
        }, {symbol: "ᴺ", label: "N"}, {symbol: "ᴼ", label: "O"}, {symbol: "ᴾ", label: "P"}, {
            symbol: "ᴿ",
            label: "R"
        }, {symbol: "ᵀ", label: "T"}, {symbol: "ᵁ", label: "U"}, {symbol: "ⱽ", label: "V"}, {symbol: "ᵂ", label: "W"},],
        Subscripts: [{symbol: "₀", label: "0"}, {symbol: "₁", label: "1"}, {symbol: "₂", label: "2"}, {
            symbol: "₃",
            label: "3"
        }, {symbol: "₄", label: "4"}, {symbol: "₅", label: "5"}, {symbol: "₆", label: "6"}, {
            symbol: "₇",
            label: "7"
        }, {symbol: "₈", label: "8"}, {symbol: "₉", label: "9"}, {symbol: "₊", label: "plus"}, {
            symbol: "₋",
            label: "minus"
        }, {symbol: "₌", label: "equals"}, {symbol: "₍", label: "left parenthesis"}, {
            symbol: "₎",
            label: "right parenthesis"
        }, {symbol: "ₐ", label: "a"}, {symbol: "ₑ", label: "e"}, {symbol: "ₕ", label: "h"}, {
            symbol: "ᵢ",
            label: "i"
        }, {symbol: "ⱼ", label: "j"}, {symbol: "ₖ", label: "k"}, {symbol: "ₗ", label: "l"}, {
            symbol: "ₘ",
            label: "m"
        }, {symbol: "ₙ", label: "n"}, {symbol: "ₒ", label: "o"}, {symbol: "ₚ", label: "p"}, {
            symbol: "ᵣ",
            label: "r"
        }, {symbol: "ₛ", label: "s"}, {symbol: "ₜ", label: "t"}, {symbol: "ᵤ", label: "u"}, {
            symbol: "ᵥ",
            label: "v"
        }, {symbol: "ₓ", label: "x"},],
    }

    const [activeCategory, setActiveCategory] = useState("Asosiy")

    return (<div className="border rounded-md p-2 bg-gray-50">
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
            {Object.keys(symbols).map((category) => (<Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="whitespace-nowrap"
            >
                {category}
            </Button>))}
        </div>
        <div className="flex flex-wrap gap-1">
            {symbols[activeCategory].map((item) => (<Button
                key={item.symbol}
                variant="outline"
                size="sm"
                onClick={() => onInsertSymbol(item.symbol)}
                title={item.label}
                className="min-w-8 h-8 px-2"
            >
                {item.symbol}
            </Button>))}
        </div>
    </div>)
}

function QuestionsTab({database, setDatabase}) {
    //teeest for bilish qollash mulohaza will be deleted in future
    const [isClicked, setIsClicked] = useState("")

    // multer
    const [questionText, setQuestionText] = useState('');
    const [answer, setAnswerText] = useState('');
    const [optionsText, setOptionsText] = useState(['', '', '', '', '']);
    const [questionImage, setQuestionImage] = useState(null);
    const [optionImages, setOptionImages] = useState([null, null, null, null, null]);
    const [solutionImage, setSolutionImage] = useState(null)
    const [questionStatus, setQuestionStatus] = useState(null)
    const [questionId, setQuestionId] = useState('') // for edit  logic
    // multer
    const [isAddingQuestion, setIsAddingQuestion] = useState(false)
    const [isEditingQuestion, setIsEditingQuestion] = useState(false)
    const [loadingforQuestionDelete, setLoadingforQuestionDelete] = useState({})
    const [loadingForQuestionsAdd, setLoadingForQuestionsAdd] = useState(false)
    const [showPreview, setShowPreview] = useState(false); // for edit, when user wants to change image and it permits image to be showed
    const [showPreviewForOptions, setShowPreviewForOptions] = useState([false, false, false, false, false])
    const [showPreviewForSolution, setShowPreviewForSolution] = useState(false)
    const {toast} = useToast()
    const changeStatus = async (topicName, subtopicName, questionId, newStatus)=>{
        setIsClicked(questionId)
        await fetch(`${import.meta.env.VITE_SERVER}/test/questions/edit/status`,{
            method:"put",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                topicName,
                subtopicName,
                questionId,
                newStatus
            })
        })
            .then(res=>res.json())
            .then(data=>{
                setDatabase(data.newData)
                setIsClicked(false)
                toast({
                    title: data.msg, variant: "success", duration: 4000,
                })
            })
    }
    const handleSubmitWithImage = async (mainTopicId, subTopicName) => {
        setLoadingForQuestionsAdd(true)
        if (questionText === "" || answer === "") {
            toast({
                title: "Savol matni va javob maydonlarini to'ldiring", variant: "destructive", duration: 4000,
            })
            setLoadingForQuestionsAdd(false)
            return
        }
        for (let i =0; i<optionImages.length; i+=1){
            if (optionImages[i]===null && optionsText[i]===''){
                toast({
                    title: `${i + 1}-variant uchun rasm yoki matn kiriting`, variant: "destructive", duration: 4000,
                })
                setLoadingForQuestionsAdd(false)
                return
            }
        }
        const formData = new FormData();
        formData.append('questionText', questionText);
        formData.append('answer', answer);
        formData.append('mainTopicId', mainTopicId);
        formData.append('subTopicName', subTopicName);
        formData.append('questionStatus', questionStatus);
        optionsText.forEach((option, idx) => formData.append('optionsText[]', option));

        if (solutionImage) formData.append('solutionImage', solutionImage);
        if (questionImage) formData.append('questionImage', questionImage);
        optionImages.forEach((image, idx) => {
            if (image) formData.append(`optionImage${idx + 1}`, image);  // Unique key for each image
        });

        try {
            await fetch(`${import.meta.env.VITE_SERVER}/test/questions/add`, {
                method: "POST", body: formData,
            })
                .then(res => res.json())
                .then(data => {
                    setDatabase(data.newData)
                    setLoadingForQuestionsAdd(false)
                    setQuestionText('')
                    setAnswerText('')
                    setOptionsText(['', '', '', '', '']);
                    setSolutionImage(null)
                    setQuestionImage(null)
                    setOptionImages([null, null, null, null, null]);
                    setQuestionStatus(null)

                    setIsAddingQuestion(false)
                    toast({
                        title: data.msg, variant: "success", duration: 4000,
                    })

                })
        } catch (err) {
            console.error('Error adding question:', err);
        }
    };
    const deleteQuestion = async (mainTopicId, subTopicName, questionId) => {
        setLoadingforQuestionDelete((prev) => ({...prev, [questionId]: true}));
        await fetch(`${import.meta.env.VITE_SERVER}/test/questions/delete`, {
            method: "delete", headers: {
                "Content-Type": "application/json",
            }, body: JSON.stringify({
                mainTopicId, subTopicName, questionId
            })
        })
            .then(res => res.json())
            .then(data => {
                setDatabase(data.newData)
                toast({
                    title: data.msg, variant: "success", duration: 4000,
                })
                setLoadingforQuestionDelete((prev) => ({...prev, [questionId]: false}));
            })
    }
    const insertSymbolInQuestion = (symbol) => {
        const textarea = document.getElementById("questionTextArea")
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value
        const before = text.substring(0, start)
        const after = text.substring(end)

        // For functions that end with (), place the cursor inside the parentheses
        let cursorPosition = start + symbol.length
        if (symbol.endsWith("()")) {
            cursorPosition = start + symbol.length - 1
        }

        // Set the new text
        const newText = before + symbol + after
        setQuestionText(newText)

        // Need to wait for React to update the DOM before setting selection
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(cursorPosition, cursorPosition)
        }, 0)
    }

    const handleEditQuestion = async (subTopicName, questionId)=>{
        setLoadingForQuestionsAdd(true)
        if (questionText === "" || answer === "") {
            toast({
                title: "Savol matni va javob maydonlarini to'ldiring", variant: "destructive", duration: 4000,
            })
            setLoadingForQuestionsAdd(false)
            return
        }
        for (let i =0; i<optionImages.length; i+=1){
            if (optionImages[i]===null && optionsText[i]===''){
                toast({
                    title: `${i + 1}-variant uchun rasm yoki matn kiriting`, variant: "destructive", duration: 4000,
                })
                setLoadingForQuestionsAdd(false)
                return
            }
        }
        const formData =  new FormData()
        formData.append('questionText', questionText);
        formData.append('answer', answer);
        // formData.append('mainTopicId', mainTopicId);
        formData.append('subTopicName', subTopicName);
        formData.append('questionId', questionId);
        formData.append('questionStatus', questionStatus);
        optionsText.forEach((option, idx) => formData.append('optionsText[]', option));

        if (solutionImage) formData.append('solutionImage', solutionImage);
        if (questionImage) formData.append('questionImage', questionImage);
        // optionImages.forEach((image, idx) => {
        //     if (image) formData.append(`optionImage${idx + 1}`, image);  // Unique key for each image
        // });

        // Handle the image selection logic
        // Handle the image selection logic
        optionImages.forEach((image, idx) => {
            if (image && image instanceof File) {
                formData.append(`optionImage${idx + 1}`, image); // Only append new image file
            } else if (image === null) {
                formData.append(`optionImage${idx + 1}`, null); // Send actual null to the backend
            } else {
                // If it’s a URL or something else, append the URL as is (no need to upload)
                formData.append(`optionImage${idx + 1}`, image || "");  // Empty string if no image
            }
        });



        try {
            await fetch(`${import.meta.env.VITE_SERVER}/test/questions/edit`, {
                method: "PATCH", body: formData,
            })
                .then(res => res.json())
                .then(data => {
                    setDatabase(data.newData)
                    setLoadingForQuestionsAdd(false)
                    setQuestionText('')
                    setAnswerText('')
                    setOptionsText(['', '', '', '', '']);
                    setSolutionImage(null)
                    setQuestionImage(null)
                    setOptionImages([null, null, null, null, null]);
                    setQuestionStatus(null)

                    setIsEditingQuestion(false)
                    toast({
                        title: data.msg, variant: "success", duration: 4000,
                    })

                })
        } catch (err) {
            console.error('Error adding question:', err);
        }
    }

    const insertSymbolInOption = (symbol, index) => {
        const input = document.getElementById(`optionInput-${index}`)
        if (!input) return

        const start = input.selectionStart
        const end = input.selectionEnd
        const text = input.value
        const before = text.substring(0, start)
        const after = text.substring(end)

        // For functions that end with (), place the cursor inside the parentheses
        let cursorPosition = start + symbol.length
        if (symbol.endsWith("()")) {
            cursorPosition = start + symbol.length - 1
        }

        // Update the option text
        const newOptionsText = [...optionsText]
        newOptionsText[index] = before + symbol + after
        setOptionsText(newOptionsText)

        // Need to wait for React to update the DOM before setting selection
        setTimeout(() => {
            input.focus()
            input.setSelectionRange(cursorPosition, cursorPosition)
        }, 0)
    }
    return (<div>
        <h2 className="text-2xl font-semibold mb-4">Savollar</h2>
        <Accordion type="single" collapsible className="w-full">
            {database.map((topic, topicIndex) => (<AccordionItem key={topicIndex} value={`item-${topicIndex}`}>
                <AccordionTrigger>{topic.maintopicname}</AccordionTrigger>
                <AccordionContent>
                    <Accordion type="single" collapsible className="w-full">
                        {topic.subtopics.map((subtopic, subtopicIndex) => (
                            <AccordionItem key={subtopic.subtopicname}
                                           value={`subitem-${topicIndex}-${subtopicIndex}`}
                                           className={` px-2 mb-1 bg-gray-100 rounded`}
                            >
                                <AccordionTrigger>{subtopic.subtopicname}</AccordionTrigger>
                                <AccordionContent>


                                    <ul className="space-y-4">

                                        {subtopic.questions.map((question, questionIndex) => (
                                            <Card key={questionIndex}>
                                                <CardHeader>
                                                    <CardTitle className="flex justify-between">
                                                        <span>Savol {questionIndex + 1}: {question.status==="b"?"Bilish":(question.status==="q")?"Qo'llash":(question.status==="m")?"Mulohaza":"Savol turi kiritilmagan"}</span>
                                                        <div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setIsEditingQuestion(true)
                                                                    setQuestionText(question.questionText)
                                                                    setAnswerText(question.answer)
                                                                    setOptionsText([
                                                                        question.options.option1.text,
                                                                        question.options.option2.text,
                                                                        question.options.option3.text,
                                                                        question.options.option4.text,
                                                                        question.options.option5.text
                                                                    ])
                                                                    setQuestionImage(question.questionImage)
                                                                    setOptionImages([
                                                                        question.options.option1.image,
                                                                        question.options.option2.image,
                                                                        question.options.option3.image,
                                                                        question.options.option4.image,
                                                                        question.options.option5.image
                                                                    ])
                                                                    setSolutionImage(question.solutionImage)
                                                                    setQuestionStatus(question.status)
                                                                    setQuestionId(question.questionId)
                                                                    setShowPreview(true)
                                                                    setShowPreviewForOptions([true, true, true,true,true])
                                                                    setShowPreviewForSolution(true)
                                                                }}
                                                            >
                                                                <Edit className={`w-4 h-4`}/>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteQuestion(topic._id, subtopic.subtopicname, question.questionId)}
                                                                disabled={loadingforQuestionDelete[question.questionId]}
                                                            >
                                                                {loadingforQuestionDelete[question.questionId] ? (
                                                                    <Loader2
                                                                        className="ml-2 h-4 w-4 animate-spin"/>) : (
                                                                    <Trash2 className="h-4 w-4"/>)}
                                                            </Button>

                                                        </div>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="font-medium">Savol:</h4>
                                                            <p>{question.questionText}</p>
                                                            {question.questionImage && (<div className="mt-2">
                                                                <img
                                                                    src={question.questionImage || "/placeholder.svg"}
                                                                    alt="Question"
                                                                    className="max-h-40 rounded-md border"
                                                                />
                                                            </div>)}
                                                        </div>

                                                        <div>
                                                            <h4 className="font-medium mb-2">Variantlar:</h4>
                                                            <div
                                                                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {Object.entries(question.options).map(([key, option]) => (
                                                                    <div
                                                                        key={key}
                                                                        className={`p-2 rounded-md border ${question.answer === key ? "border-green-500 bg-green-50" : ""}`}
                                                                    >
                                                                        <div
                                                                            className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {key === "option1" ? "A" : key === "option2" ? "B" : key === "option3" ? "C" : key === "option4" ? "D" : "E"}
                                              :
                                          </span>
                                                                            <span>{option.text}</span>
                                                                        </div>
                                                                        {option.image && (<div className="mt-2">
                                                                            <img
                                                                                src={option.image || "/placeholder.svg"}
                                                                                alt={`Option ${key}`}
                                                                                className="max-h-24 rounded-md border"
                                                                            />
                                                                        </div>)}
                                                                    </div>))}
                                                            </div>
                                                        </div>

                                                        <div className={`flex gap-3`}>
                                                            <h4 className="font-medium">To'g'ri Javob:</h4>
                                                            <p>
                                                                {question.answer === "option1" ? "A" : question.answer === "option2" ? "B" : question.answer === "option3" ? "C" : question.answer === "option4" ? "D" : "E"}
                                                            </p>
                                                        </div>

                                                        <div className="">
                                                            {
                                                                question.solutionImage
                                                                ?
                                                                    <>
                                                                        <h4 className="font-medium">Yechim:</h4>
                                                                        <img src={question.solutionImage} alt="yechim..."/>
                                                                    </>
                                                                :
                                                                    <>
                                                                        <h4 className="font-medium">Yechim yo'q</h4>
                                                                    </>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className={`flex gap-2  items-center`}>
                                                        <Button disabled={isClicked===question.questionId}
                                                                onClick={()=>changeStatus(topic.maintopicname, subtopic.subtopicname,question.questionId, "b")}
                                                        >Bilish</Button>
                                                        <Button disabled={isClicked===question.questionId}
                                                            onClick={()=>changeStatus(topic.maintopicname, subtopic.subtopicname,question.questionId, "q")}
                                                        >Qo'llash</Button>
                                                        <Button disabled={isClicked===question.questionId}
                                                                onClick={()=>changeStatus(topic.maintopicname, subtopic.subtopicname,question.questionId, "m")}
                                                        >Mulohaza</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>))}
                                    </ul>
                                    <div className="mt-2 flex justify-end items-start">
                                        <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="default"
                                                    onClick={() => {
                                                        setQuestionText("")
                                                        setAnswerText("")
                                                        setOptionsText(["", "", "", "", ""])
                                                        setQuestionImage(null)
                                                        setOptionImages([null, null, null, null, null])
                                                        setQuestionStatus(null)
                                                        setSolutionImage(null)

                                                    }}
                                                    className={`flex`}
                                                >
                                                    <Plus className="mr-2 h-4 w-4 text-white"/> Savol Qo'shish
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl  max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Yangi Savol Qo'shish</DialogTitle>
                                                    <DialogDescription></DialogDescription>
                                                </DialogHeader>

                                                <div className="grid gap-6 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="questionTextArea">Savol Matni</Label>
                                                        <MathSymbolsToolbar
                                                            onInsertSymbol={insertSymbolInQuestion}/>
                                                        <Textarea
                                                            id="questionTextArea"
                                                            placeholder="Matn kiriting"
                                                            value={questionText}
                                                            onChange={(e) => setQuestionText(e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Savol uchun Rasm (Ixtiyoriy)</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input type="file"
                                                                   onChange={(e) => setQuestionImage(e.target.files[0])}/>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label>Variantlar</Label>
                                                        {optionsText.map((option, idx) => (<div key={idx}
                                                                                                className="space-y-2 p-3 border rounded-md">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                            <span
                                                                                className="font-medium">{String.fromCharCode(65 + idx)}:</span>
                                                            </div>
                                                            <MathSymbolsToolbar
                                                                onInsertSymbol={(symbol) => insertSymbolInOption(symbol, idx)}
                                                            />
                                                            <Input
                                                                id={`optionInput-${idx}`}
                                                                type="text"
                                                                placeholder={`Variant ${idx + 1}`}
                                                                value={option}
                                                                onChange={(e) => {
                                                                    const newOptions = [...optionsText]
                                                                    newOptions[idx] = e.target.value
                                                                    setOptionsText(newOptions)
                                                                }}
                                                            />

                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Label>Variant {idx + 1} uchun rasm
                                                                    (Ixtiyoriy)</Label>
                                                                <Input
                                                                    type="file"
                                                                    onChange={(e) => {
                                                                        const newOptionImages = [...optionImages]
                                                                        newOptionImages[idx] = e.target.files[0]
                                                                        setOptionImages(newOptionImages)
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>))}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="correctAnswer">To'g'ri Javob</Label>
                                                        <Select value={answer}
                                                                onValueChange={(value) => setAnswerText(value)}>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder="To'g'ri javobli variantni belgilang"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="option1">A</SelectItem>
                                                                <SelectItem value="option2">B</SelectItem>
                                                                <SelectItem value="option3">C</SelectItem>
                                                                <SelectItem value="option4">D</SelectItem>
                                                                <SelectItem value="option5">E</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Yechim uchun rasm (Ixtiyoriy)</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input type="file"
                                                                   onChange={(e) => setSolutionImage(e.target.files[0])}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="questionStatus">Savol turi (Ixtiyoriy)</Label>
                                                        <Select id={`questionStatus`} value={questionStatus}
                                                                onValueChange={(value) => setQuestionStatus(value)}>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder="Savol turini tanlang"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="b">Bilish</SelectItem>
                                                                <SelectItem value="q">Qo'llash</SelectItem>
                                                                <SelectItem value="m">Mulohaza</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <DialogFooter>
                                                    <DialogClose>
                                                        <Button variant="outline"
                                                                onClick={() => setIsAddingQuestion(false)}>
                                                            Chiqish
                                                        </Button>
                                                    </DialogClose>
                                                    {/*<DialogClose>*/}
                                                    <Button
                                                        onClick={() => handleSubmitWithImage(topic._id, subtopic.subtopicname)}
                                                        disabled={loadingForQuestionsAdd}

                                                    >
                                                        Savol qo'shish
                                                        {loadingForQuestionsAdd && <Loader variant={"small"}/>}
                                                    </Button>
                                                    {/*</DialogClose>*/}
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <Dialog open={isEditingQuestion} onOpenChange={setIsEditingQuestion}>
                                            <DialogContent className="max-w-3xl  max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Savolni O'zgartirish</DialogTitle>
                                                    <DialogDescription></DialogDescription>
                                                </DialogHeader>

                                                <div className="grid gap-6 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="questionTextArea">Savol Matni</Label>
                                                        <MathSymbolsToolbar
                                                            onInsertSymbol={insertSymbolInQuestion}/>
                                                        <Textarea
                                                            id="questionTextArea"
                                                            placeholder="Matn kiriting"
                                                            value={questionText}
                                                            onChange={(e) => setQuestionText(e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        {
                                                            questionImage && showPreview
                                                                ?
                                                                <>
                                                                    <Label>Savol Rasmi</Label>
                                                                    <img src={questionImage} fetchPriority={`high`}
                                                                         alt="Savol_rasmi"
                                                                         className={`max-h-40 rounded-md border`}
                                                                    />
                                                                    <Button
                                                                        onClick={() => {
                                                                            setShowPreview(false)
                                                                            setQuestionImage(null)
                                                                        }}
                                                                    >
                                                                        Rasmni o'zgartirish
                                                                    </Button>
                                                                </>
                                                                :
                                                                <>
                                                                    <Label>Savol uchun Rasm Joylash</Label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Input type="file"
                                                                               onChange={(e) => {
                                                                                   setQuestionImage(e.target.files[0])
                                                                                   setShowPreview(false)
                                                                               }}
                                                                               className={``}
                                                                        />
                                                                    </div>
                                                                </>
                                                        }

                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label>Variantlar</Label>
                                                        {optionsText.map((option, idx) => (<div key={idx}
                                                                                                className="space-y-2 p-3 border rounded-md">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                            <span
                                                                                className="font-medium">{String.fromCharCode(65 + idx)}:</span>
                                                            </div>
                                                            <MathSymbolsToolbar
                                                                onInsertSymbol={(symbol) => insertSymbolInOption(symbol, idx)}
                                                            />
                                                            <Input
                                                                id={`optionInput-${idx}`}
                                                                type="text"
                                                                placeholder={`Variant ${idx + 1}`}
                                                                value={option}
                                                                onChange={(e) => {
                                                                    const newOptions = [...optionsText]
                                                                    newOptions[idx] = e.target.value
                                                                    setOptionsText(newOptions)
                                                                }}
                                                            />
                                                            {
                                                                optionImages[idx] && showPreviewForOptions[idx] && optionImages[idx] !== 'null'
                                                                    ?
                                                                    <>
                                                                        <Label>Variant {idx + 1} Rasmi</Label>
                                                                        <img src={optionImages[idx]}
                                                                             fetchPriority={`high`}
                                                                             alt="variant_rasmi"
                                                                             className={`max-h-40 rounded-md border`}
                                                                        />
                                                                        <Button
                                                                            onClick={() => {
                                                                                const newOptionImages = [...optionImages]
                                                                                newOptionImages[idx] = null
                                                                                setOptionImages(newOptionImages)
                                                                                const newPreviews = [...showPreviewForOptions]
                                                                                newPreviews[idx] = false
                                                                                setShowPreviewForOptions(newPreviews)
                                                                            }}
                                                                        >
                                                                            Rasmni o'zgartirish
                                                                        </Button>
                                                                    </>
                                                                    :
                                                                    <>
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <Label>Variant {idx + 1} uchun rasm
                                                                                (Ixtiyoriy)</Label>
                                                                            <Input
                                                                                type="file"
                                                                                onChange={(e) => {
                                                                                    const newOptionImages = [...optionImages]
                                                                                    newOptionImages[idx] = e.target.files[0]
                                                                                    setOptionImages(newOptionImages)
                                                                                    const newPreviews = [...showPreviewForOptions]
                                                                                    newPreviews[idx] = false
                                                                                    setShowPreviewForOptions(newPreviews)
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </>
                                                            }
                                                        </div>))}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="correctAnswer">To'g'ri Javob</Label>
                                                        <Select value={answer}
                                                                onValueChange={(value) => setAnswerText(value)}>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder="To'g'ri javobli variantni belgilang"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="option1">A</SelectItem>
                                                                <SelectItem value="option2">B</SelectItem>
                                                                <SelectItem value="option3">C</SelectItem>
                                                                <SelectItem value="option4">D</SelectItem>
                                                                <SelectItem value="option5">E</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {
                                                            solutionImage && showPreviewForSolution
                                                                ?
                                                                <>
                                                                    <Label>Yechim Rasmi</Label>
                                                                    <img src={solutionImage}
                                                                         alt="Yechim_rasmi"
                                                                         className={`max-h-40 rounded-md border`}
                                                                    />
                                                                    <Button
                                                                        onClick={() => {
                                                                            setSolutionImage(null)
                                                                            setShowPreviewForSolution(false)
                                                                        }}
                                                                    >
                                                                        Rasmni o'zgartirish
                                                                    </Button>
                                                                </>
                                                                :
                                                                <>
                                                                    <Label>Yechim uchun rasm (Ixtiyoriy)</Label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Input type="file"
                                                                               onChange={(e) => {
                                                                                   setSolutionImage(e.target.files[0])
                                                                                   setShowPreviewForSolution(false)
                                                                               }}
                                                                        />
                                                                    </div>
                                                                </>
                                                        }
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="questionStatus">Savol turi</Label>
                                                        <Select id={`questionStatus`}
                                                                defaultValue={questionStatus ?? undefined}
                                                                onValueChange={(value) => setQuestionStatus(value)}>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder="Savol turi tanlanmagan"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="b">Bilish</SelectItem>
                                                                <SelectItem value="q">Qo'llash</SelectItem>
                                                                <SelectItem value="m">Mulohaza</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <DialogFooter>
                                                    <Button variant="outline"
                                                            onClick={() => setIsEditingQuestion(false)}>
                                                        Chiqish
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleEditQuestion(subtopic.subtopicname, questionId)}
                                                        disabled={loadingForQuestionsAdd}
                                                    >
                                                        Savolni O'zgartirish
                                                        {loadingForQuestionsAdd && <Loader variant={"small"}/>}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>))}
                    </Accordion>
                </AccordionContent>
            </AccordionItem>))}
        </Accordion>
    </div>)
}

export default AddTopicsPage;