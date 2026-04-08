import ParticleAnimation from "@/components/layout/ParticleAnimation.jsx";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {useEffect, useState} from "react"
import {motion} from "framer-motion"

const colorPalettes = [
    'from-blue-900 via-purple-900 to-indigo-900',
    'from-yellow-800 via-orange-800 to-red-800',
    'from-green-700 via-emerald-600 to-teal-600',
    'from-teal-700 via-cyan-700 to-blue-900',
    'from-[#B30219] via-[#851316] to-[#591511]',
    'from-pink-800 via-red-800 to-yellow-800',
];

const PhysicsHero = () => {
    const user = useSelector(state => state.user)
    const token = localStorage.getItem("token")
    const [gradientClasses, setGradientClasses] = useState('');

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * colorPalettes.length);
        setGradientClasses(colorPalettes[randomIndex]);
    }, [])
    return (
        <div className={`hero_section relative min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br
            ${gradientClasses}
         `}
        >
            {/*from-blue-900 via-purple-900 to-indigo-900,*/}
            {/*from-yellow-800 via-orange-800 to-red-800,*/}
            {/*from-teal-700 via-lavender-600 to-sky-700,*/}
            {/*from-lime-900 via-emerald-900 to-cyan-900,*/}
            {/*from-green-900 via-yellow-900 to-lime-900,*/}
            <ParticleAnimation/>
            <div className="relative z-10 text-center text-white px-4">
                <motion.h1
                    className="text-5xl md:text-7xl font-bold mb-6"
                    initial={{opacity: 0, y: -50}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.8}}
                >
                    Fizika olamini kashf qiling
                </motion.h1>
                {
                    token ?
                        <>
                            <motion.p
                                className="text-xl md:text-2xl mb-8"
                                initial={{opacity: 0, y: 50}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.8, delay: 0.2}}
                            >
                                {/*Kosmosning kvant olamidan tortib galaktik miqyosgacha bo'lgan sirlarini oching.*/}
                                Hush kelibsiz {user.name}
                            </motion.p>
                            <motion.div
                                initial={{opacity: 0, scale: 0.5}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{duration: 0.8, delay: 0.4}}
                            >
                                <Link
                                    to="/definetest"
                                    className="bg-white text-gray-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-300 transition duration-300"
                                >
                                    Test Yechish
                                </Link>
                            </motion.div>
                        </>
                        :
                        <motion.div
                            initial={{opacity: 0, scale: 0.5}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.6, delay: 0.4}}
                            className={"mt-16"}
                        >
                            <Link
                                to="/signup"
                                className="bg-white text-gray-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-300 transition duration-300"
                            >
                                Ro'yxatdan O'tish
                            </Link>
                        </motion.div>

                }


            </div>
            <div
                className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent z-10"></div>

        </div>
    )
}
export default PhysicsHero