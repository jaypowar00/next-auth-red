import { signIn, useSession } from "next-auth/react";

function Dashboard() {
    const { status } = useSession({
        required: true,
        onUnauthenticated() { signIn() },
    })
    if (status !== "authenticated") return <h1>Loading...</h1>;
    return (<h1>Authenticated Dashboard Page</h1>)
}

export default Dashboard;