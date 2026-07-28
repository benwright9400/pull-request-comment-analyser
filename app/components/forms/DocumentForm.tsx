"use client";

import { DocumentIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Alert from "../Alert";
import { useSession } from "next-auth/react";

export default function DocumentForm() {
    const [alert, setAlert] = useState<{ success: boolean, message: string } | null>(null);
    const session = useSession();

    async function logFileUpload(uri: string, fileName: string): Promise<boolean> {
        const upload = await fetch("/api/files", {
            method: "POST",
            body: JSON.stringify({ uri: uri, fileName: fileName }),
        });
        const uploadJSON = await upload.text();

        if (!upload.ok) {
            return false;
        }

        // use this to check recieved
        console.log(uploadJSON);

        return true;
    }

    async function onFileChange(file: File | undefined) {
        if (!file) {
            return;
        }

        const res = await fetch(`/api/file-upload?fileName=${session.data?.user.githubId}/${file.name}&fileType=${file.type}`);
        const { url } = await res.json();

        const upload = await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        setAlert({
            success: true,
            message: "Upload in progress - this may take a couple of minutes"
        })

        const successfullLoggedInDb = await logFileUpload(`${session.data?.user.githubId}/${file.name}`, file.name);

        if (upload.ok && successfullLoggedInDb) {
            console.log("Okay!");
            setAlert({
                success: true,
                message: `File ${file.name} successfully uploaded`
            })
        } else {
            if (upload.ok) {
                setAlert({
                    success: true,
                    message: `File ${file.name} successfully uploaded`
                })
                return;
            }

            let body = upload.json();
            let errorMessage = ": " + body?.error;
            console.log("Not okay!");
            setAlert({
                success: false,
                message: `There was an error${errorMessage}`
            })
        }

    }

    function dismissAlert() {
        setAlert(null);
    }

    return (
        <div className="space-y-8 border-b border-white/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-white/10 sm:border-t sm:border-t-white/10 sm:pb-0">
            <label htmlFor="cover-photo" className="block text-base font-semibold dark:text-gray-200 text-gray-900 pl-4 py-2 sm:pt-1.5">
                Add Document
            </label>
            <div className="mt-2 sm:col-span-2 sm:mt-0">
                <div className="flex max-w-2xl justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                        <DocumentIcon aria-hidden="true" className="mx-auto size-12 text-gray-300" />
                        <div className="mt-4 flex text-sm/6 text-gray-600">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 hover:text-indigo-500"
                            >
                                <span>Upload a file</span>
                                <input onChange={(e) => onFileChange(e.target.files?.[0])} id="file-upload" name="file-upload" accept="application/docx" type="file" className="sr-only" />
                            </label>
                            <p className="pl-1 dark:text-gray-200">or drag and drop</p>
                        </div>
                        <p className="text-xs/5 text-gray-600 dark:text-gray-200">DOCX up to 10MB</p>
                    </div>
                </div>
            </div>
            {alert && <Alert success={alert.success} message={alert.message} onDismiss={dismissAlert} />}
        </div>
    );
}