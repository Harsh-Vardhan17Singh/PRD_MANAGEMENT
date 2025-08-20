import  {ApiResponse} from "../utils/api-response.js"
import { asynchandler } from "../utils/async-handlers.js"

// const healthcheck = async (req, res)=>{
//     try {

//         const user = await getUserFromDB()
//         res
//         res.status(200).json(
//             new ApiResponse(200, {message:"SERVER IS RUNNING"})
//         )
//     } catch (error) {
//         next(err)
//     }
// }




const healthcheck = asynchandler(async (req,res)=>{
    res.status(200).json(
        new ApiResponse(200, {message :"SERVER IS RUNNING"})

    )
})
export { healthcheck }