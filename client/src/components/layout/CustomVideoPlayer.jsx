import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function CustomVideoPlayer({ src, title }) {
    const videoRef = useRef(null)
    const progressRef = useRef(null)
    const containerRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isHovering, setIsHovering] = useState(false)
    const controlsTimeoutRef = useRef(null)

    useEffect(() => {
        const video = videoRef.current

        if (!video) return

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime)
            setProgress((video.currentTime / video.duration) * 100)
        }

        const handleLoadedMetadata = () => {
            setDuration(video.duration)
        }

        const handleEnded = () => {
            setIsPlaying(false)
        }

        video.addEventListener("timeupdate", handleTimeUpdate)
        video.addEventListener("loadedmetadata", handleLoadedMetadata)
        video.addEventListener("ended", handleEnded)

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate)
            video.removeEventListener("loadedmetadata", handleLoadedMetadata)
            video.removeEventListener("ended", handleEnded)
        }
    }, [])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.play().catch((error) => {
                console.error("Error playing video:", error)
                setIsPlaying(false)
            })
        } else {
            video.pause()
        }
    }, [isPlaying])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        video.volume = volume
        video.muted = isMuted
    }, [volume, isMuted])

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying)
    }

    const handleProgressClick = (e) => {
        const progressBar = progressRef.current
        const rect = progressBar.getBoundingClientRect()
        const pos = (e.clientX - rect.left) / rect.width
        const video = videoRef.current

        video.currentTime = pos * video.duration
    }

    const handleVolumeToggle = () => {
        setIsMuted(!isMuted)
    }

    const handleVolumeChange = (e) => {
        const newVolume = Number.parseFloat(e.target.value)
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
    }

    const handleFullscreen = () => {
        const videoContainer = containerRef.current

        if (!document.fullscreenElement) {
            videoContainer
                .requestFullscreen()
                .then(() => {
                    setIsFullscreen(true)
                })
                .catch((err) => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`)
                })
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    const handleSkipBackward = () => {
        const video = videoRef.current
        video.currentTime = Math.max(0, video.currentTime - 5)
    }

    const handleSkipForward = () => {
        const video = videoRef.current
        video.currentTime = Math.min(video.duration, video.currentTime + 5)
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`
    }

    const handleMouseMove = () => {
        setShowControls(true)
        setIsHovering(true)

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }

        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false)
                setIsHovering(false)
            }
        }, 3000)
    }

    const handleMouseEnter = () => {
        setIsHovering(true)
        setShowControls(true)
    }

    const handleMouseLeave = () => {
        setIsHovering(false)
        if (isPlaying) {
            setShowControls(false)
        }
    }

    return (
        <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden bg-black shadow-xl group h-full w-full"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Video element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain max-h-full"
                poster="/placeholder.svg?height=480&width=854"
                onClick={handlePlayPause}
            >
                <source src={src} type="video/mp4" />
                Brauzeringizda video ishlamaydi
            </video>

            {/* Video overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Custom Controls */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-0 left-0 right-0 p-6"
                    >
                        {/* Progress Bar */}
                        <div
                            ref={progressRef}
                            className="w-full h-2 bg-gray-600/50 rounded-full mb-6 cursor-pointer relative overflow-hidden"
                            onClick={handleProgressClick}
                        >
                            <div
                                className="absolute top-0 left-0 h-full bg-gray-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                            <div
                                className={`absolute top-0 h-4 w-4 bg-white rounded-full -mt-1 shadow-md transform -translate-x-1/2 transition-transform duration-100 ${isHovering ? "scale-125" : "scale-100"}`}
                                style={{ left: `${progress}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <button
                                    onClick={handlePlayPause}
                                    className="text-white hover:text-gray-400 transition-colors"
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? <Pause size={26} /> : <Play size={26} />}
                                </button>

                                <button
                                    onClick={handleSkipBackward}
                                    className="text-white hover:text-gray-400 transition-colors"
                                    aria-label="Skip backward 5 seconds"
                                >
                                    <SkipBack size={22} />
                                </button>

                                <button
                                    onClick={handleSkipForward}
                                    className="text-white hover:text-gray-400 transition-colors"
                                    aria-label="Skip forward 5 seconds"
                                >
                                    <SkipForward size={22} />
                                </button>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleVolumeToggle}
                                        className="text-white hover:text-gray-400 transition-colors"
                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                                    </button>

                                    <div className="relative w-20 h-1 bg-white/30 rounded-full overflow-hidden">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={isMuted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            aria-label="Volume"
                                        />
                                        <div
                                            className="h-full bg-white rounded-full"
                                            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="text-white text-sm font-medium">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                <button
                                    onClick={handleFullscreen}
                                    className="text-white hover:text-gray-400 transition-colors"
                                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                >
                                    <Maximize size={22} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Play/Pause Overlay */}
            <AnimatePresence>
                {!isPlaying && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.button
                            onClick={handlePlayPause}
                            className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Play"
                        >
                            <Play size={36} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Title */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="text-white font-medium text-lg">{title}</h3>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

