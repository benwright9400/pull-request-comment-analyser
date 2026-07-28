"use client"

import { signOut } from "next-auth/react";

export default function AccountPage() {

    return <div>
        Account
        <button className="shadow-md p-2 rounded-lg mx-4 cursor-pointer" onClick={() => signOut()}>
            Sign out
        </button>
    </div>;
}
