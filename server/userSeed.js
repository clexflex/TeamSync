import User from './models/User.js'
import bcrypt from 'bcrypt'
import connectToDatabase from './db/db.js'

const userRegister = async ()=> {
    connectToDatabase()
    try {
        const hashPassword = await bcrypt.hash("clexflex", 10)
        const newUser = new User({
            name: "ClexFlex",
            email: "clexflex@gmail.com",
            password: hashPassword,
            role: "admin"
        })
        await newUser.save()
    } catch(error){
        console.log(error)
    }
}

userRegister();