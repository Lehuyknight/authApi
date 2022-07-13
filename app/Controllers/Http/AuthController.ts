import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import {rules, schema as Schema } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
    public async login({request, response, auth}:HttpContextContract){
        const phone = request.input('phone')
        const password = request.input('password')
        try{
            const bearerToken = await auth.use('api').attempt(phone, password)
            const userData = await User.findBy('phone', phone)
            return response.status(200).json({token: bearerToken, user: userData})
        }
        catch(err){
            return response.json('Invalid credentials')
        }   
    }
    public async signup({request, response}:HttpContextContract){
        const validator = await Schema.create({
            email: Schema.string([
                rules.trim(),
                rules.normalizeEmail({
                    allLowercase: true,
                    gmailRemoveDots: true,
                    gmailRemoveSubaddress: true,
                }),
                rules.unique({table:'users',column:'email'})
            ]),
            password: Schema.string([
                rules.trim(),
                rules.minLength(6),
                rules.confirmed(),
                rules.required()
            ])
        })
        try{
            const userData = await request.validate({schema: validator})
            const createData = await User.create(userData)
            return response.json(createData)
        }
        catch(err){
            return response.json(err)
        }
    }
}
