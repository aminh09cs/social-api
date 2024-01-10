import crypto from 'node:crypto'
export const hashPassword = (password: string) => crypto.createHash('sha256').update(password).digest('hex')
