import { getSession, useSession } from 'next-auth/react'
function Blog({ data }) {
    const {data: session} = useSession()
    console.log({ session})
    return (
        <h1>Blog Page - {data}</h1>
    );
}

export default Blog;

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx)

    if(!session) {
        return {
            redirect: {
                destination: `/api/auth/signin?callbackUrl=http://localhost:3000/blog`,
                permanent: false,
            },
        }
    }
    return {
        props: {
            session,
            data: session ? 'List of personalized blogs' : 'List of free blogs'
        }
    }
}