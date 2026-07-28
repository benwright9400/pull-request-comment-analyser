"use client"

import { signIn, signOut, useSession } from "next-auth/react";

export default function AccountPage() {
    const session = useSession();
    const githubConnected = Boolean(session.data?.user?.githubAccessToken);

    return <div>
        Account
        <button className="shadow-md p-2 rounded-lg mx-4 cursor-pointer" onClick={() => signOut()}>
            Sign out
        </button>
        <button
            className="shadow-md p-2 rounded-lg mx-4 cursor-pointer"
            onClick={() => signIn('github')}
            disabled={githubConnected}
        >
            {githubConnected ? "GitHub connected" : "Connect GitHub"}
        </button>
    </div>;
}