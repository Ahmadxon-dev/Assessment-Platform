import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, MinusCircle, Loader2 } from "lucide-react"

function EachResultPage(props) {
    const params = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const totalQuestions = !loading && data?.questions.length
    const correctAnswers = !loading && data?.questions.filter((q) => q.selectedAnswer === q.correctAnswer).length

    const getTest = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER}/test/${params.testId}`)
            const result = await response.json()
            setData(result)
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
    }

    useEffect(() => {
        getTest()
    }, [params.testId])

    if (loading) {
        return (
            <div className="grid items-center justify-center m-auto h-screen">
                <Loader2 className="h-20 w-20 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">
                        {Array.isArray(data.subtopicname) ? data.subtopicname.join(", ") : data.subtopicname} - ko'rib chiqish
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg mb-2">Test boshlangan vaqti: {new Date(data.startTime).toLocaleString()}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-lg">
                            <p className="font-semibold">Savollar soni</p>
                            <p className="text-2xl font-bold">{totalQuestions}</p>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-800 p-4 rounded-lg">
                            <p className="font-semibold">To'g'ri javob berilganlar</p>
                            <p className="text-2xl font-bold">{correctAnswers}</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-800 p-4 rounded-lg">
                            <p className="font-semibold">Natija</p>
                            <p className="text-2xl font-bold">
                                {data.result} / {totalQuestions}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {data.questions.map((question, index) => (
                    <Card
                        key={index}
                        className={`border-l-4 ${
                            question.selectedAnswer === question.correctAnswer
                                ? "border-green-500"
                                : !question.selectedAnswer || question.selectedAnswer === ""
                                    ? "border-yellow-500"
                                    : "border-red-500"
                        }`}
                    >
                        <CardHeader>
                            <CardTitle className="text-xl flex items-start">
                <span
                    className={`text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0 ${
                        question.selectedAnswer === question.correctAnswer
                            ? "bg-green-500"
                            : !question.selectedAnswer || question.selectedAnswer === ""
                                ? "bg-yellow-500"
                                : "bg-red-500"
                    }`}
                >
                  {index + 1}
                </span>
                                <div className="flex flex-col">
                                    <span>{question.status==="b"?"Bilish: ":(question.status==="q")?"Qo'llash: ":(question.status==="m")?"Mulohaza: ":""}{question.questionText}</span>
                                    {question.questionImage && (
                                        <img
                                            src={question.questionImage || "/placeholder.svg"}
                                            alt="Question"
                                            className="mt-2 max-w-md rounded-md"
                                        />
                                    )}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {Object.entries(question.options).map(([optionKey, option]) => (
                                    <li
                                        key={optionKey}
                                        className={`p-3 rounded-lg flex items-center ${
                                            option.text === question.options[question.correctAnswer]?.text
                                                ? "bg-green-100 dark:bg-green-800 border-green-500"
                                                : optionKey === question.selectedAnswer && optionKey !== question.correctAnswer
                                                    ? "bg-red-100 dark:bg-red-800 border-red-500"
                                                    : "bg-gray-100 dark:bg-gray-700"
                                        } border-2`}
                                    >
                                        <div className="flex flex-1 items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span>{option.text}</span>
                                                {option.image && (
                                                    <img
                                                        src={option.image || "/placeholder.svg"}
                                                        alt={option.text}
                                                        className="w-16 h-16 object-contain rounded-md"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                {optionKey === question.correctAnswer && <CheckCircle className="text-green-500" size={24} />}
                                                {optionKey === question.selectedAnswer && optionKey !== question.correctAnswer && (
                                                    <XCircle className="text-red-500" size={24} />
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 space-y-2">
                                <div className="font-semibold">
                                    <span className="mr-2">Belgilangan javob:</span>
                                    {question.selectedAnswer && question.selectedAnswer !== "" ? (
                                        <div className="flex items-center gap-2 mt-1">
                      <span
                          className={
                              question.selectedAnswer === question.correctAnswer ? "text-green-500" : "text-red-500"
                          }
                      >
                        {question.options[question.selectedAnswer]?.text}
                      </span>
                                            {question.options[question.selectedAnswer]?.image && (
                                                <img
                                                    src={question.options[question.selectedAnswer].image || "/placeholder.svg"}
                                                    className="w-24 h-24 object-contain rounded-md"
                                                    alt="Selected answer"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-yellow-500 flex items-center">
                      <MinusCircle className="inline-block mr-1" size={20} />
                      Javob tanlanmagan
                    </span>
                                    )}
                                </div>

                                <div className="font-semibold">
                                    <span className="mr-2">To'g'ri javob:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-green-500">{question.options[question.correctAnswer]?.text}</span>
                                        {question.options[question.correctAnswer]?.image && (
                                            <img
                                                src={question.options[question.correctAnswer].image || "/placeholder.svg"}
                                                className="w-24 h-24 object-contain rounded-md"
                                                alt="Correct answer"
                                            />
                                        )}
                                    </div>
                                </div>
                                {
                                    question.solutionImage
                                    ?
                                        <div className={`font-semibold`}>
                                            <span className="mr-2">Yechim: </span>
                                            <img src={question.solutionImage} alt=""/>
                                        </div>
                                    :
                                        <span className="mr-2 font-semibold">Yechim: Yo'q</span>


                                }
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default EachResultPage;