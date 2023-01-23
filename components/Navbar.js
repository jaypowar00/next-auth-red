import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react'

function Navbar() {
    const { data: session, status } = useSession()
    // console.log({ session, status })
    return (
        <nav className='header'>
            <h1 className='logo'>
                <Link href='/'>NextAuth</Link>
            </h1>
            <ul className={`main-nav ${status === "loading" ? 'loading' : 'loaded'}`}>
                <li>
                    <Link href='/'>
                        Home
                    </Link>
                </li>
                {
                    status === "authenticated" && session !== null && (
                        <li>
                            <Link href='/dashboard'>
                                Dashboard
                            </Link>
                        </li>
                    )
                }
                <li>
                    <Link href='/blog'>
                        Blog
                    </Link>
                </li>
                {
                    status === "unauthenticated" && session === null && (
                        <li>
                            <Link href='#' onClick={e => { e.preventDefault(); signIn("github", { redirect: false }) }}>
                                Sign In
                            </Link>
                        </li>
                    )
                }
                {
                    status === "authenticated" && session !== null && (
                        <li>
                            <Link href='#' onClick={e => { e.preventDefault(); signOut({ redirect: false }) }}>
                                Sign Out
                            </Link>
                        </li>
                    )
                }
            </ul>
        </nav>
    );
}

export default Navbar;