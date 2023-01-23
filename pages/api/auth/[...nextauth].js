import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import jwt from 'jsonwebtoken'
import NextAuth from 'next-auth'
import Github from 'next-auth/providers/github'
import Email from 'next-auth/providers/email'
import clientPromise from '../../../lib/mongodb'
import crypto from 'crypto'
const ENCRYPT_KEY = Buffer.concat([Buffer.from(process.env.NEXTAUTH_ENCRYPTION_SECRET), Buffer.alloc(32)], 32)
const ENCRYPT_IV = crypto.randomBytes(16)
const ENCRYPT_ALGO = 'aes-256-ctr'

// export const authOptions = 

function encrypt(text) {
    let cipher = crypto.createCipheriv(ENCRYPT_ALGO, ENCRYPT_KEY, ENCRYPT_IV);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return ENCRYPT_IV.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(ENCRYPT_ALGO, ENCRYPT_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// export default NextAuth(authOptions)
export default NextAuth({
    providers: [
        Github({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        Email({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                },
            },
            from: process.env.EMAIL_FROM
        }),
    ],
    adapter: MongoDBAdapter(clientPromise, {
        databaseName: "nextAuthDb"
    }),
    session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        encryption: true,
        secret: process.env.NEXTAUTH_URL,
        async encode({ secret, token }) {
            console.log('\n\n#################\njwt encode callback:')
            console.log('[+] Payload:')
            console.log(token)
            let jwt_res = jwt.sign(token, process.env.NEXTAUTH_SECRET, { algorithm: "HS256", })
            console.log("\n[+] New Token Generated:")
            console.log(jwt_res)
            jwt_res = encrypt(jwt_res)
            console.log("\n[+] Encrypted Token:")
            console.log(jwt_res)
            return jwt_res
        },
        async decode({ secret, token }) {
            console.log('\n\n#################\njwt decode callback:')
            console.log('[+] Encrypted Token:')
            console.log(token)
            token = decrypt(token)
            console.log('\n[+] Decrypted Token:')
            console.log(token)
            return jwt.verify(token, process.env.NEXTAUTH_SECRET)
        }
    },
    callbacks: {
        async jwt({ token, user }) {
            console.log('[+] jwt callback')
            console.log(token)
            if (user) {
                token.id = user.id
                token.verified = user.emailVerified
                console.log('user')
                console.log(user)
            }
            console.log('[+] jwt callback end')
            return token
        },
        async session({ session, token }) {
            console.log('[+] session callback')
            console.log(token)
            console.log('session')
            console.log(session)
            session.user.id = token.id
            session.user.emailVerified = token.verified
            console.log('[+] session callback end')
            return session
        },
    },
})