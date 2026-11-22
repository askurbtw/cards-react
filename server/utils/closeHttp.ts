import http from 'node:http'
export default function closeHttp(httpServer:http.Server) : Promise<void> {
    return new Promise((res,rej)=>{
        httpServer.close((err)=>{
            if(err){
                rej(err)
            }
            res()
        })
    })
}