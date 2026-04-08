import React, {useEffect, useState} from 'react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {Button} from "@/components/ui/button.jsx";
import {Link, useNavigate} from "react-router-dom";
import {Label} from "@/components/ui/label.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Loader2, Minus, Plus} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {setTest} from "@/features/test/testSlice.js";
import {Checkbox} from "@/components/ui/checkbox.jsx";
import {Card} from "@/components/ui/card.jsx";
import {useToast} from "@/hooks/use-toast.js";
import {useQuery} from "@tanstack/react-query";
import Loader from "@/components/ui/Loader.jsx";


function DefiningTestPage() {
    const [selectedMaintopic, setSelectedMaintopic] = useState('');
    const [selectedSubtopics, setSelectedSubtopics] = useState([]);
    const [loadingforBtn, setLoadingforBtn] = useState(false)
    const [topicsData, setTopicsData] = useState([])
    const [numQuestions, setNumQuestions] = useState({b: 0, q: 0, m: 0})
    const {toast} = useToast()
    const dispatch = useDispatch()
    const user = useSelector(state => state.user);
    const navigate = useNavigate()
    const selectedTopicData = topicsData.find(topic => topic.maintopicname === selectedMaintopic);
    const subtopics = selectedTopicData ? selectedTopicData.subtopics : [];
    const [time, setTime] = useState({soat: "00", daqiqa: "00", soniya: "00"})
    let timeSeconds = +time.soat * 60 * 60 + +time.daqiqa * 60 + +time.soniya
    let selectedSubTopicNames = []
    selectedSubtopics.forEach(subtopic => {
        selectedSubTopicNames.push(subtopic.subtopicname)
    })
    const {isPending, error, data} = useQuery({
        queryKey: ['test/getfulltestdb'], queryFn: () => fetch(`${import.meta.env.VITE_SERVER}/test/getfulltestdb`)
            .then((res) => res.json())
    })
    useEffect(() => {
        if (data) {
            setTopicsData(data);
        }
    }, [data]);
    const handleInputChange = (e, unit) => {
        let value = e.target.value
        value = value.replace(/^0+/, "")
        const max = unit === "soat" ? 23 : 59
        const numValue = Number.parseInt(value || "0", 10)
        const validValue = Math.min(Math.max(numValue, 0), max)
        const formattedValue = validValue.toString().padStart(2, "0")

        setTime((prevTime) => ({...prevTime, [unit]: formattedValue}))
    }
    const handleStart = async () => {
        let timeSeconds = +time.soat * 60 * 60 + +time.daqiqa * 60 + +time.soniya
        setLoadingforBtn(true)
        sessionStorage.removeItem("timer");
        sessionStorage.removeItem("currentIndex");
        if (timeSeconds === 0 || selectedSubTopicNames.length === 0 || (numQuestions.b === 0 && numQuestions.q === 0 && numQuestions.m === 0)) {
            toast({
                title: "Mavzuni tanlang, savollar sonini kiriting vs vaqtni belgilang",
                duration: 4000,
                variant: "destructive"
            })
            setLoadingforBtn(false)
            return
        }
        await fetch(`${import.meta.env.VITE_SERVER}/test/start`, {
            method: "post", headers: {
                "Content-Type": "application/json"
            }, body: JSON.stringify({
                time: timeSeconds, subtopicnamesArray: selectedSubTopicNames, //selected subtopic with questions,
                userEmail: user.email, numberOfQuestions: numQuestions, userId: user._id
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setLoadingforBtn(false)
                    toast({
                        title: data.error, variant: "destructive", description: data.additional, duration: 4000,
                    })
                    return
                }
                setLoadingforBtn(false)
                dispatch(setTest(data.newTest))
                navigate(`/test/${data.testId}`)
            })
    }
    const handleItemToggle = (item) => {
        setSelectedSubtopics((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
    }

    if (isPending) {
        return (<Loader variant={"big"}/>)
    }

    return (<div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex">
        <div className="mx-auto w-full">
            <Card className="bg-white max-w-6xl mx-auto shadow-lg rounded-lg overflow-hidden">
                <div className={` mx-auto mt-8 p-6 bg-white rounded-lg shadow-md`}>
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Test yechish uchun bo'lim,
                        mavzu va vaqtni kiriting</h2>
                    {selectedSubTopicNames.length > 0 && (<div className="mb-3 p-2 bg-muted rounded-md">
                        <p className="font-medium mb-1">Tanlangan mavzular:</p>
                        <div className="flex flex-wrap gap-1">
                            {selectedSubTopicNames.map((topic) => (<span key={topic}
                                                                         className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      {topic}
                    </span>))}
                        </div>
                    </div>)}
                    <div className="grid grid-cols-2 gap-4 pb-7 mb-4 border-b-2 border-gray-200">
                        <div>
                            <div className={`mb-3`}>
                                <Label htmlFor="maintopic">Bo'limni tanlang </Label>
                                {/*onSelect={(event)=>event.preventDefault()}*/}
                                <Select className={`z-50`} id="maintopic" value={selectedMaintopic}
                                        onValueChange={(value) => {
                                            setSelectedMaintopic(value);
                                        }}>
                                    <SelectTrigger className="min-w-full outline-none">
                                        <SelectValue placeholder="Bo'limlar"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {topicsData.map((topic, index) => (<SelectItem key={index}
                                                                                       value={topic.maintopicname}>{topic.maintopicname}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex mx-auto justify-center mb-3">
                                <div className="flex items-center mt-1">
                                    {/*b q m*/}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Savollar soni</label>
                                        <div className="grid grid-cols-3 gap-1">
                                            <div className="space-y-1">
                                                <div className="border p-2 text-center font-medium bg-gray-50">Bilish
                                                </div>
                                                <Input value={numQuestions.b} type={"number"} className="text-center"
                                                       onChange={(e) => setNumQuestions(prevState => ({
                                                           ...prevState,
                                                           b: e.target.value
                                                       }))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div
                                                    className="border p-2 text-center font-medium bg-gray-50">Qo'llash
                                                </div>
                                                <Input value={numQuestions.q} type={"number"} className="text-center"
                                                       onChange={(e) => setNumQuestions(prevState => ({
                                                           ...prevState,
                                                           q: e.target.value
                                                       }))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div
                                                    className="border p-2 text-center font-medium bg-gray-50">Mulohaza
                                                </div>
                                                <Input value={numQuestions.m} type={"number"} className="text-center"
                                                       onChange={(e) => setNumQuestions(prevState => ({
                                                           ...prevState,
                                                           m: e.target.value
                                                       }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3 grid grid-cols-3 gap-4">
                                {(["soat", "daqiqa", "soniya"]).map((unit) => (<div key={unit} className="space-y-2">
                                    <Label htmlFor={unit} className="text-sm font-medium text-gray-700 capitalize">
                                        {unit}
                                    </Label>
                                    <Input
                                        type="number"
                                        id={unit}
                                        name={unit}
                                        value={time[unit]}
                                        onChange={(e) => handleInputChange(e, unit)}
                                        min={0}
                                        placeholder={"00"}
                                        max={unit === "soat" ? 23 : 59}
                                        className="w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>))}
                            </div>
                        </div>
                        <div>
                            <Label>Mavzularni tanlang</Label>
                            <div className={`max-h-64 overflow-y-auto`}>
                                {selectedMaintopic && subtopics.length > 0 ? (<div className="space-y-2">
                                    {subtopics.map(subtopic => (
                                        <div key={subtopic.subtopicname} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={subtopic.subtopicname}
                                                checked={selectedSubtopics.includes(subtopic)}
                                                onCheckedChange={() => handleItemToggle(subtopic)}
                                            />
                                            <label
                                                htmlFor={subtopic.subtopicname}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {subtopic.subtopicname}
                                            </label>
                                        </div>))}


                                </div>) : <Label className={`text-gray-700 font-medium text-sm`}>Bu bo'limda mavzular
                                    yo'q</Label>}
                            </div>
                        </div>
                    </div>
                    {/*<form className={`space-y-4 flex flex-col mx-auto justify-center items-center`}></form>*/}


                    <div>
                        <Button disabled={loadingforBtn && true} className={`w-full`} onClick={handleStart}>
                            Testni boshlash
                            {loadingforBtn ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : ""}
                        </Button>

                    </div>
                    {/*)}*/}
                </div>
            </Card>
        </div>
    </div>);
}

export default DefiningTestPage;