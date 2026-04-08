import React, {useEffect, useState} from 'react';
import CustomVideoPlayer from "@/components/layout/CustomVideoPlayer.jsx";
import { motion } from "framer-motion"
function GuidePage(props) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null
    return (
        <div className={`min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="container mx-auto h-[85vh] flex flex-col relative z-10">
            <motion.div
                className="flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="p-6 md:p-8 flex flex-col h-full">
                    {/* Title */}
                    <motion.h1
                        className="text-3xl md:text-4xl font-bold text-gray-700  mb-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Web-sahifani ishlatish uchun qo'llanma
                    </motion.h1>
                    {/* Video player - taking most of the space */}
                    <div className="flex-grow flex items-center justify-center">
                        <div className="w-full" style={{ height: "calc(85vh - 140px)" }}>
                            <CustomVideoPlayer src="/qo'llanma.mp4" title="" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    </div>
    );
}

export default GuidePage;