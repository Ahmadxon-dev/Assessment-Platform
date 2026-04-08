const {Router} = require('express')
const router = Router()
const Person = require("../models/Person")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
router.post("/signup", async (req,res)=>{
    const {email, password, name} = req.body
    if (!email || !password || !name){
        return res.status(400).json({error: "Hamma maydonlarni to'ldiring"})
    }
    await Person.findOne({email})
        .then(savedUser=>{
            if (savedUser){
                return res.status(400).json({error: "Foydalanuvchi avval qo'shilgan"})
            }
            bcrypt.hash(password, 10)
                .then(hashedPass=>{
                    const user = new Person({
                        email,
                        password: hashedPass,
                        name,
                    })
                    user.save()
                    return res.json({msg: "Foydalanuvchi muvaffaqiyatli yaratildi", user})
                })
                .catch(error=>{
                    return res.status(401).json({error:"Foydalanuvchi yaratilmadi"})
                })
        })
        .catch(error=>{
            return res.status(401).json({error: "Foydalanuvchi yaratilmadi"})
        })
})

router.post("/signin", async (req,res)=>{
    const {email, password} = req.body
    if (!email || !password){
        return res.status(400).json({error: "Hamma maydonlarni to'ldiring"})
    }
    await Person.findOne({email})
        .then(savedUser=>{
            if (!savedUser){
                return res.status(400).json({error: "Bunday foydalanuvchi topilmadi"})
            }
            bcrypt.compare(password, savedUser.password)
                .then(doMatch=>{
                    if (doMatch){
                        const token = jwt.sign({_id:savedUser._id}, process.env.JWT_SECRET)
                        const {email, role, name, _id} = savedUser
                        return res.json({
                            msg: "Muvaffaqiyatli kirildi",
                            token,
                            user:{email, role, name, _id}
                        })
                    }else{
                        return res.status(400).json({error:"Parol xato"})
                    }
                })
                .catch(error=>{
                    return res.status(500).json({error: "Internal server error hash error"})
                })
        })
        .catch(error=>{
            return res.status(500).json({error: "Internal server error findone error"})
        })
})

router.get("/getuser/:token", async (req,res)=>{
    const {token} = req.params
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await Person.findById(decoded._id)
        .then(user=>{
            const {email, name, role, _id} = user
            return res.status(200).json({email, name, role, _id})
        })
})
module.exports = router