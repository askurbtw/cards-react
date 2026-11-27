export type DomainErrorCode = 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'BAD_REQUEST' | 'INTERNAL_ERROR'

export class DomainError extends Error { 
    constructor(public readonly code: DomainErrorCode, message: string, public readonly details? : unknown){
        super(message)
        this.name = new.target.name
    }

}

export class ForbiddenDomainError extends DomainError{
    constructor(message: string = 'Access denied', details?:unknown){
        super('FORBIDDEN', message, details)
    }
}

export class NotFoundDomainError extends DomainError{
    constructor(message: string = 'Resource not found', details?:unknown){
        super('NOT_FOUND', message, details)
    }
}

export class ConflictDomainError extends DomainError{
    constructor(message: string = 'Conflict', details?:unknown){
        super('CONFLICT', message, details)
    }
}

export class BadRequestDomainError extends DomainError{
    constructor(message: string = 'Bad request', details?:unknown){
        super('BAD_REQUEST', message, details)
    }
}