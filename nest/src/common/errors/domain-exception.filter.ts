import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { DomainError, DomainErrorCode } from "./domain.error.js";
import {Response} from 'express'
import { Socket } from "socket.io-client";

const HTTP_STATUS_MAP: Record<DomainErrorCode, HttpStatus> = {
    'BAD_REQUEST' : HttpStatus.BAD_REQUEST,
    'CONFLICT': HttpStatus.CONFLICT,
    'FORBIDDEN' : HttpStatus.FORBIDDEN,
    'INTERNAL_ERROR': HttpStatus.INTERNAL_SERVER_ERROR,
    'NOT_FOUND' : HttpStatus.NOT_FOUND
}

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter{
    catch(exception: DomainError, host: ArgumentsHost) {
        if(host.getType()==='http'){
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const statusCode = HTTP_STATUS_MAP[exception.code]
        response.status(statusCode).json({
            statusCode,
            code:exception.code,
            message:exception.message
        })
        console.log(exception.details ?? '')
    }
    if(host.getType()==='ws'){
        const client = host.switchToWs().getClient<Socket>()
        const payload = {
            code:exception.code,
            message:exception.message,
        }
        client.emit("exception", payload)
        console.log(exception.details ?? '')
    }

    }
}
